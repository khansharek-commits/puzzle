/* Lanterns of Lore — game state, exploration, dialogue, battles, puzzles, menus. */
(function () {
  'use strict';
  const LL = window.LL, R = LL.R;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pad2 = (n) => String(n).padStart(2, '0');
  const today = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const addDays = (k, n) => { const [y, m, d] = k.split('-').map(Number); return today(new Date(y, m - 1, d + n)); };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const QBY = Object.fromEntries(LL.QUESTIONS.map((q) => [q.id, q]));
  const SUBJ = LL.SUBJECTS;
  const LEITNER = [0, 1, 2, 4, 8, 16];
  const LANTERN_SUBJ = ['sci', 'his', 'geo', 'phi'];

  /* ───────── state ───────── */
  const KEY = 'lanterns-of-lore-v1';
  const fresh = () => ({
    v: 2, hero: { lv: 1, xp: 0, hp: 48, mp: 10, tonics: 2 }, map: 'tavern', pos: null, introDone: false,
    lanterns: {}, seals: {}, chests: {}, riddles: {}, codex: {}, stats: {}, gym: { math: 0, pattern: 0, span: 0 }, ended: false
  });
  let S = fresh();
  const maxHP = () => 40 + S.hero.lv * 8, maxMP = () => 8 + S.hero.lv * 2, xpNext = () => 30 + S.hero.lv * 25;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } };
  const hasSave = () => { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } };
  const loadSave = () => { try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(fresh(), JSON.parse(r)); } catch (e) { /* ignore */ } };
  const litCount = () => LANTERN_SUBJ.filter((s) => S.lanterns[s]).length;
  const stat = (s) => (S.stats[s] = S.stats[s] || { r: 0, w: 0 });

  /* ───────── runtime ───────── */
  const G = { mode: 'title', map: null, hero: { x: 0, y: 0, dir: 1, moving: false, inv: 0, path: null, pending: null }, actors: [], keys: {}, armed: false, pip: { x: 0, y: 0 } };
  const cv = $('#world');

  /* ───────── map entry ───────── */
  function enterMap(id, spawn, quiet) {
    const m = LL.buildMap(id);
    G.map = m; S.map = id;
    let p;
    if (spawn && spawn.x !== undefined) p = spawn;
    else if (spawn && Array.isArray(spawn)) p = m.toWorld(spawn[0], spawn[1]);
    else if (m.kind === 'image') p = m.def.start;
    else p = m.toWorld(7, 10);
    Object.assign(G.hero, { x: p.x, y: p.y, path: null, pending: null, inv: 1.5, blink: false });
    G.pip = { x: p.x - 40, y: p.y - 90 };
    G.armed = false;
    buildActors();
    R.follow(m, G.hero.x, G.hero.y, true);
    if (!quiet) { banner(m.name); save(); }
  }

  function buildActors() {
    const m = G.map, d = m.def;
    G.actors = [];
    if (m.kind === 'image') return;
    const at = (tx, ty) => m.toWorld(tx, ty);
    (d.monsters || []).forEach(([eid, tx, ty], i) => { const p = at(tx, ty); G.actors.push({ type: 'monster', eid, x: p.x, y: p.y, hx: p.x, hy: p.y, tx: p.x, ty: p.y, stun: 0, seed: i }); });
    if (d.boss && !(d.lantern ? S.lanterns[d.lantern] : S.ended)) { const p = at(d.boss.tx, d.boss.ty); G.actors.push({ type: 'boss', eid: d.boss.enemy, x: p.x, y: p.y, block: [d.boss.tx, d.boss.ty] }); }
    if (d.lanternAt) { const p = at(d.lanternAt.tx, d.lanternAt.ty); G.actors.push({ type: 'lantern', x: p.x, y: p.y, block: [d.lanternAt.tx, d.lanternAt.ty] }); }
    const seals = d.seals || (d.seal ? [Object.assign({ id: m.id }, d.seal)] : []);
    seals.forEach((s) => { if (!S.seals[s.id]) { const p = at(s.tx, s.ty); G.actors.push({ type: 'seal', seal: s, x: p.x, y: p.y, block: [s.tx, s.ty] }); } });
    (d.chests || []).forEach((c) => { const p = at(c.tx, c.ty); G.actors.push({ type: 'chest', chest: c, x: p.x, y: p.y, block: [c.tx, c.ty] }); });
    if (d.gate) { const p = at(d.gate.tx, d.gate.ty); G.actors.push({ type: 'gate', x: p.x, y: p.y, block: [d.gate.tx, d.gate.ty] }); }
  }

  function walkable(x, y, ignoreNpc) {
    const m = G.map;
    if (!m.walkStatic(x, y)) return false;
    if (m.kind !== 'image') {
      const { tx, ty } = m.toTile(x, y);
      if (G.actors.some((a) => a.block && a.block[0] === tx && a.block[1] === ty && a.type !== 'boss')) return false;
    }
    if (!ignoreNpc && m.npcs.some((n) => Math.hypot(n.x - x, (n.y - y) * 1.6) < (n.painted ? 24 : 30))) return false;
    return true;
  }
  const heroFits = (x, y) => walkable(x, y) && walkable(x - 12, y) && walkable(x + 12, y) && walkable(x, y - 6);

  /* ───────── interactions ───────── */
  function interactables() {
    const list = [];
    G.map.npcs.forEach((n) => list.push({ kind: 'npc', n, x: n.talkX, y: n.talkY, r: n.r || 80, label: n.name, tagX: n.x, tagY: n.y - (n.painted ? 110 : 100) }));
    G.actors.forEach((a) => {
      if (a.type === 'seal') list.push({ kind: 'seal', a, x: a.x, y: a.y, r: 90, label: a.seal.name, tagX: a.x, tagY: a.y - 80 });
      if (a.type === 'chest' && !S.chests[a.chest.id]) list.push({ kind: 'chest', a, x: a.x, y: a.y, r: 85, label: 'Chest', tagX: a.x, tagY: a.y - 50 });
      if (a.type === 'gate') list.push({ kind: 'gate', a, x: a.x, y: a.y, r: 100, label: 'Black Gate', tagX: a.x, tagY: a.y - 100 });
      if (a.type === 'lantern') list.push({ kind: 'lantern', a, x: a.x, y: a.y, r: 90, label: 'Great Lantern', tagX: a.x, tagY: a.y - 90 });
    });
    return list;
  }
  function nearest() {
    let best = null, bd = Infinity;
    interactables().forEach((it) => { const d = dist(G.hero, it); if (d < it.r && d < bd) { bd = d; best = it; } });
    return best;
  }

  function interact(it) {
    if (!it) return;
    G.hero.path = null;
    if (it.kind === 'npc') return talkTo(it.n);
    if (it.kind === 'seal') return openPuzzle(it.a.seal);
    if (it.kind === 'chest') {
      S.chests[it.a.chest.id] = true; S.hero.tonics++; save(); hud();
      return say([[null, 'You open the chest and find a Tonic. (Tonics restore HP in battle.)']]);
    }
    if (it.kind === 'gate') {
      if (litCount() < 4) return say([[null, `The black gate is sealed. ${litCount()} of 4 Great Lanterns burn.`]]);
      return transition('spire', LL.MAPS.village.gate.spawn);
    }
    if (it.kind === 'lantern') {
      const s = G.map.def.lantern;
      return say([[null, S.lanterns[s] ? `The ${SUBJ[s].lantern} burns bright. Here, the Murk cannot reach.` : `The ${SUBJ[s].lantern} is cold and dark. Something guards it.`]]);
    }
  }

  function talkTo(n) {
    if (n.action === 'inn') return innMenu();
    if (n.gateKeeper) return say(litCount() >= 4 ? LL.STORY.gateOpen : LL.STORY.gateClosed);
    if (n.story) return say(litCount() >= 4 ? LL.STORY.sableAfter : LL.STORY.sable);
    const lines = (n.lines || []).map((l) => [n.name, l]);
    if (n.riddle && !S.riddles[n.riddle]) {
      lines.push([n.name, 'Now, a riddle for you. Solve it and I’ll give you a Tonic.']);
      return say(lines, () => openRiddle(n));
    }
    if (n.riddle) lines.push([n.name, 'Thanks again for solving my riddle.']);
    say(lines);
  }

  /* ───────── dialogue ───────── */
  let dq = [], dqDone = null, typing = null;
  function say(lines, done) {
    dq = lines.slice(); dqDone = done || null; G.mode = 'dialog';
    $('#dialog').hidden = false; nextLine();
  }
  function portraitFor(speaker) {
    if (speaker === 'Wren') return `<img src="${LL.ASSET_URLS.heroPortrait}" alt="">`;
    if (!speaker) return '';
    const map = { Marla: 'marla', Sable: 'villager1', 'Vesper Null': 'null', 'Old Oma': 'hermit' };
    const npc = G.map && G.map.npcs.find((n) => n.name === speaker);
    const pal = map[speaker] || (npc && (npc.portrait || npc.pal));
    const boss = Object.values(LL.ENEMIES).find((e) => e.name === speaker);
    const c = boss ? LL.sprite(boss.sprite, boss.pal) : pal ? LL.sprite(pal === 'null' ? 'robed' : 'person', pal) : null;
    if (!c) return '';
    const crop = document.createElement('canvas'); crop.width = 64; crop.height = 64;
    const g = crop.getContext('2d'); g.imageSmoothingEnabled = false;
    const sw = c.width, sh = boss ? c.height : Math.min(c.height, sw);
    g.drawImage(c, 0, 0, sw, sh, (64 - sw * (64 / Math.max(sw, sh))) / 2, 0, sw * (64 / Math.max(sw, sh)), sh * (64 / Math.max(sw, sh)));
    return `<img src="${crop.toDataURL()}" alt="">`;
  }
  function nextLine() {
    if (!dq.length) { $('#dialog').hidden = true; G.mode = 'explore'; const f = dqDone; dqDone = null; if (f) f(); return; }
    const [who, text] = dq.shift();
    $('#d-portrait').innerHTML = portraitFor(who); $('#d-portrait').hidden = !who;
    $('#d-name').textContent = who || ''; $('#d-name').hidden = !who;
    const el = $('#d-text'); el.textContent = ''; el.classList.toggle('narration', !who);
    let i = 0; clearInterval(typing);
    typing = setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(typing); typing = null; } }, 18);
    el.dataset.full = text;
  }
  function advance() {
    if (typing) { clearInterval(typing); typing = null; $('#d-text').textContent = $('#d-text').dataset.full; return; }
    nextLine();
  }
  $('#dialog').addEventListener('click', advance);

  function choice(title, options) {
    G.mode = 'menu';
    openWin(`<div class="win choice-win"><h2>${esc(title)}</h2><div class="choice-list">
      ${options.map((o, i) => `<button class="cmd" data-i="${i}" ${o.disabled ? 'disabled' : ''}><span>${esc(o.label)}</span>${o.note ? `<small>${esc(o.note)}</small>` : ''}</button>`).join('')}
      </div></div>`);
    $$('.choice-list .cmd').forEach((b) => b.onclick = () => { const o = options[+b.dataset.i]; closeWin(); o.fn(); });
    $('.choice-list .cmd:not(:disabled)')?.focus();
  }

  /* ───────── overlay windows ───────── */
  function openWin(html) { const o = $('#overlay'); o.innerHTML = html; o.hidden = false; o.scrollTop = 0; document.body.classList.add('modal'); }
  function closeWin() { const o = $('#overlay'); o.hidden = true; o.innerHTML = ''; document.body.classList.remove('modal'); if (G.mode !== 'dialog') G.mode = 'explore'; hud(); }

  function banner(text) { const b = $('#banner'); b.textContent = text; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }
  function toast(text) { const t = $('#toast'); t.textContent = text; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show'); }

  function transition(to, spawn) {
    G.mode = 'fade';
    const f = $('#fade'); f.classList.add('on');
    setTimeout(() => { enterMap(to, spawn); f.classList.remove('on'); setTimeout(() => { if (G.mode === 'fade') G.mode = 'explore'; }, 250); }, 320);
  }

  /* ───────── HUD ───────── */
  function hud() {
    const h = S.hero;
    $('#hud').innerHTML = `
      <div class="hud-hero win">
        <img class="hud-face" src="${LL.ASSET_URLS.heroPortrait}" alt="">
        <div class="hud-stats">
          <div class="hud-name">Wren <span>Lv ${h.lv}</span></div>
          <div class="bar hp" title="Health"><i style="width:${(h.hp / maxHP()) * 100}%"></i><b>HP ${h.hp}/${maxHP()}</b></div>
          <div class="bar mp" title="Magic"><i style="width:${(h.mp / maxMP()) * 100}%"></i><b>MP ${h.mp}/${maxMP()}</b></div>
        </div>
      </div>
      <div class="hud-right">
        <div class="lanterns win" aria-label="${litCount()} of 4 Great Lanterns lit">
          ${LANTERN_SUBJ.map((s) => `<span class="lan ${S.lanterns[s] ? 'lit' : ''}" style="--c:${SUBJ[s].color}" title="${SUBJ[s].lantern}${S.lanterns[s] ? ' (lit)' : ''}"></span>`).join('')}
        </div>
        <button class="win menu-btn" id="menu-btn" aria-label="Open menu">Menu</button>
      </div>`;
    $('#menu-btn').onclick = () => { if (G.mode === 'explore') openMenu('status'); };
  }

  /* ───────── main loop ───────── */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (G.map) {
      if (G.mode === 'explore') update(dt);
      render();
    }
    requestAnimationFrame(frame);
  }

  function update(dt) {
    const h = G.hero, sp = 230;
    h.inv = Math.max(0, h.inv - dt);
    let dx = 0, dy = 0;
    if (G.keys.ArrowLeft || G.keys.a) dx -= 1; if (G.keys.ArrowRight || G.keys.d) dx += 1;
    if (G.keys.ArrowUp || G.keys.w) dy -= 1; if (G.keys.ArrowDown || G.keys.s) dy += 1;
    if (dx || dy) { h.path = null; h.pending = null; const l = Math.hypot(dx, dy); dx /= l; dy /= l; }
    else if (h.path && h.path.length) {
      const t = h.path[0], vx = t.x - h.x, vy = t.y - h.y, l = Math.hypot(vx, vy);
      if (l < 6) h.path.shift(); else { dx = vx / l; dy = vy / l; }
      if (!h.path.length) { h.path = null; if (h.pending) { const p = h.pending; h.pending = null; if (dist(h, p) < p.r + 10) interact(p); } }
    }
    h.moving = !!(dx || dy);
    if (h.moving) {
      if (dx) h.dir = dx < 0 ? -1 : 1;
      const nx = h.x + dx * sp * dt, ny = h.y + dy * sp * dt * 0.75;
      if (heroFits(nx, ny)) { h.x = nx; h.y = ny; }
      else if (heroFits(nx, h.y)) h.x = nx;
      else if (heroFits(h.x, ny)) h.y = ny;
      else if (h.path) h.path.shift();
    }
    // Pip follows
    G.pip.x += (h.x - 44 * h.dir - G.pip.x) * 0.06; G.pip.y += (h.y - 96 - G.pip.y) * 0.06;
    // exits
    const inExit = G.map.exits.find((e) => Math.hypot(e.x - h.x, (e.y - h.y) * 1.5) < e.r);
    if (!inExit) G.armed = true;
    else if (G.armed) {
      const target = LL.MAPS[inExit.to];
      const spawn = target.kind === 'image' ? (inExit.spawnPx || { x: 170, y: 768 }) : (inExit.spawn || [inExit.tx, inExit.ty]);
      return transition(inExit.to, spawn);
    }
    // monsters
    G.actors.forEach((a) => {
      if (a.type !== 'monster' || a.dead || G.mode !== 'explore') return;
      a.stun = Math.max(0, a.stun - dt);
      const d = dist(a, h);
      let tx = a.tx, ty = a.ty, spd = 45;
      if (d < 230 && !a.stun && h.inv <= 0) { tx = h.x; ty = h.y; spd = 80; }
      else if (Math.hypot(a.tx - a.x, a.ty - a.y) < 8 || Math.random() < 0.004) { a.tx = a.hx + rand(-110, 110); a.ty = a.hy + rand(-60, 60); }
      const vx = tx - a.x, vy = ty - a.y, l = Math.hypot(vx, vy) || 1;
      const nx = a.x + (vx / l) * spd * dt, ny = a.y + (vy / l) * spd * dt * 0.75;
      if (walkable(nx, ny, true)) { a.x = nx; a.y = ny; } else { a.tx = a.hx; a.ty = a.hy; }
      a.flip = vx < 0;
      if (d < 46 && !a.stun && h.inv <= 0) startBattle(a);
    });
    G.actors.forEach((a) => { if (a.type === 'boss' && dist(a, h) < 70 && G.mode === 'explore') startBattle(a); });
    R.follow(G.map, h.x, h.y);
  }

  function render() {
    const m = G.map, h = G.hero, t = R.t;
    const acts = [];
    const near = G.mode === 'explore' ? nearest() : null;
    // hero
    acts.push({ y: h.y, draw: (g) => {
      R.shadow(g, h.x, h.y, 26);
      if (h.inv > 0 && h.blink && Math.floor(t * 12) % 2) g.globalAlpha = 0.5;
      R.spriteAt(g, LL.IMG.hero, h.x, h.y + 4, 2, h.dir < 0, h.moving ? -Math.abs(Math.sin(t * 12)) * 5 : Math.sin(t * 2) * 1.2);
      g.globalAlpha = 1;
    } });
    // pip
    acts.push({ y: G.pip.y + 120, draw: (g) => {
      const x = G.pip.x, y = G.pip.y + Math.sin(t * 3) * 6;
      const gr = g.createRadialGradient(x, y, 0, x, y, 22); gr.addColorStop(0, 'rgba(255,240,180,1)'); gr.addColorStop(0.3, 'rgba(255,200,90,.8)'); gr.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = gr; g.fillRect(x - 22, y - 22, 44, 44); g.fillStyle = '#fff8e0'; g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    } });
    // npcs (tiled maps)
    m.npcs.forEach((n) => {
      if (n.painted) return;
      acts.push({ y: n.y, draw: (g) => { R.shadow(g, n.x, n.y, 22); R.spriteAt(g, LL.sprite('person', n.pal), n.x, n.y + 2, 5, n.x > h.x, Math.sin(t * 2 + n.x) * 1.5); } });
    });
    // riddle markers on npcs
    m.npcs.forEach((n) => {
      if (n.riddle && !S.riddles[n.riddle]) acts.push({ y: 99999, draw: (g) => { const y = n.y - (n.painted ? 120 : 110) + Math.sin(t * 4) * 4; g.fillStyle = '#ffd36a'; g.font = '700 26px "Pixelify Sans", sans-serif'; g.textAlign = 'center'; g.fillText('?', n.x, y); } });
    });
    G.actors.forEach((a) => {
      if (a.dead) return;
      if (a.type === 'monster') {
        const e = LL.ENEMIES[a.eid];
        acts.push({ y: a.y, draw: (g) => { R.shadow(g, a.x, a.y, 22); if (a.stun) g.globalAlpha = 0.45; R.spriteAt(g, LL.sprite(e.sprite, e.pal), a.x, a.y + 2, 5, a.flip, -Math.abs(Math.sin(t * 5 + a.seed)) * 6); g.globalAlpha = 1; } });
      }
      if (a.type === 'boss') {
        const e = LL.ENEMIES[a.eid];
        acts.push({ y: a.y, draw: (g) => { R.shadow(g, a.x, a.y, 40); R.spriteAt(g, LL.sprite(e.sprite, e.pal), a.x, a.y + 4, 8, false, Math.sin(t * 2) * 4); } });
      }
      if (a.type === 'lantern') {
        const lit = S.lanterns[m.def.lantern];
        acts.push({ y: a.y, draw: (g) => R.spriteAt(g, LL.sprite('lantern', lit ? 'lanternOn' : 'lanternOff'), a.x, a.y + 4, 6, false) });
      }
      if (a.type === 'seal') acts.push({ y: a.y, draw: (g) => { g.globalAlpha = 0.8 + Math.sin(t * 3) * 0.2; R.spriteAt(g, LL.sprite('seal', 'seal'), a.x, a.y - 4, 5, false, Math.sin(t * 2) * 3); g.globalAlpha = 1; } });
      if (a.type === 'chest') acts.push({ y: a.y, draw: (g) => R.spriteAt(g, LL.sprite('chest', S.chests[a.chest.id] ? 'chestOpen' : 'chest'), a.x, a.y + 4, 4, false) });
      if (a.type === 'gate') acts.push({ y: a.y, draw: (g) => R.spriteAt(g, LL.sprite('gate', litCount() >= 4 ? 'gateOpen' : 'gate'), a.x, a.y + 6, 7, false) });
    });
    if (near) acts.push({ y: 100000, draw: (g) => R.label(g, `${near.label} · ${near.kind === 'npc' ? 'Talk' : 'Examine'}`, near.tagX, near.tagY) });

    // lights
    const lights = m.lights.slice();
    lights.push({ x: G.pip.x, y: G.pip.y + 40, r: 260, col: '255,210,120', flick: true });
    G.actors.forEach((a) => {
      if (a.type === 'lantern' && S.lanterns[m.def.lantern]) lights.push({ x: a.x, y: a.y - 60, r: 520, col: '255,210,110', flick: true });
      if (a.type === 'seal') lights.push({ x: a.x, y: a.y - 40, r: 140, col: '177,140,255' });
      if (a.type === 'gate' && litCount() >= 4) lights.push({ x: a.x, y: a.y - 60, r: 180, col: '177,140,255' });
      if (a.type === 'monster' && !a.dead && LL.ENEMIES[a.eid].sprite === 'wisp') lights.push({ x: a.x, y: a.y - 30, r: 110, col: '255,150,80' });
    });
    let dark = m.def.dark || 0;
    const lantern = m.def.lantern;
    if (lantern && S.lanterns[lantern]) dark *= 0.45;
    if (m.id === 'village') dark = Math.max(0.2, dark - litCount() * 0.07) * (S.ended ? 0.5 : 1);
    if (m.id === 'spire' && S.ended) dark *= 0.5;
    const murk = (lantern && !S.lanterns[lantern]) || (m.id === 'spire' && !S.ended);
    R.draw(cv, m, acts, { dark, lights, murk });
  }

  /* ───────── input ───────── */
  const ARROWS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  window.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (e.target.matches && e.target.matches('input')) { if (k === 'Escape') e.target.blur(); return; }
    if (G.mode === 'explore') {
      if (ARROWS.includes(k) || 'wasd'.includes(k) && k.length === 1) { G.keys[k] = true; e.preventDefault(); }
      if (k === 'Enter' || k === ' ') { e.preventDefault(); interact(nearest()); }
      if (k === 'Escape' || k === 'm') openMenu('status');
    } else if (G.mode === 'dialog') {
      if (k === 'Enter' || k === ' ') { e.preventDefault(); advance(); }
    } else if (G.mode === 'battle') battleKey(k, e);
    else if (G.mode === 'menu' && k === 'Escape') { const c = $('#overlay [data-close]'); if (c) c.click(); }
  });
  window.addEventListener('keyup', (e) => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; G.keys[k] = false; });
  window.addEventListener('blur', () => { G.keys = {}; });

  cv.addEventListener('pointerdown', (e) => {
    if (G.mode !== 'explore') return;
    const r = cv.getBoundingClientRect();
    const w = R.screenToWorld(e.clientX - r.left, e.clientY - r.top);
    // clicked an interactable?
    const hit = interactables().find((it) => {
      const tx = it.kind === 'npc' ? it.n.x : it.x, ty = it.kind === 'npc' ? it.n.y : it.y;
      return Math.abs(w.x - tx) < 45 && w.y < ty + 20 && w.y > ty - 120;
    });
    const target = hit ? { x: hit.x, y: hit.y } : w;
    if (hit && dist(G.hero, hit) < hit.r) return interact(hit);
    const path = LL.findPath((x, y) => walkable(x, y), G.hero, target, G.map.w, G.map.h);
    if (path) { G.hero.path = path; G.hero.pending = hit || null; }
  });

  $('#act-btn').addEventListener('click', () => {
    if (G.mode === 'explore') interact(nearest()); else if (G.mode === 'dialog') advance();
  });

  /* ───────── battle ───────── */
  let B = null;
  function pickQuestion(s, used) {
    let pool = LL.QUESTIONS.filter((q) => (s === 'mix' ? true : q.s === s) && !used.has(q.id));
    if (!pool.length) pool = LL.QUESTIONS.filter((q) => s === 'mix' || q.s === s);
    const fresh = pool.filter((q) => !S.codex[q.id] || S.codex[q.id].box === 0);
    return pick(fresh.length && Math.random() < 0.75 ? fresh : pool);
  }

  function startBattle(actor) {
    const e = LL.ENEMIES[actor.eid];
    G.keys = {}; G.hero.path = null;
    const begin = () => {
      const base = 20 + S.hero.lv * 5;
      B = { actor, e, base, max: e.hits * base, hp: e.hits * base, used: new Set(), q: null, phase: 'ask', t0: 0, anim: { shake: 0, flash: 0, lunge: 0, hurt: 0 }, raf: 0 };
      G.mode = 'battle';
      openWin(battleHTML());
      bindBattle();
      battleLoop();
      ask();
    };
    if (e.boss) say(e.intro.map((l) => [e.name, l]), begin); else begin();
  }

  function battleHTML() {
    const e = B.e;
    return `<div class="battle" style="--sc:${SUBJ[e.s] ? SUBJ[e.s].color : '#b18cff'}">
      <div class="stage">
        <canvas id="bstage" width="480" height="220"></canvas>
        <div class="enemy-plate win"><span class="ename">${esc(e.name)}</span><span class="subj">${e.s === 'mix' ? 'All subjects' : SUBJ[e.s].name}</span>
          <div class="bar ehp"><i id="ehp" style="width:100%"></i></div></div>
        <div id="fx" aria-hidden="true"></div>
      </div>
      <div class="bwin win">
        <div class="q-top"><span id="q-subj" class="q-subj"></span><span class="swift" title="Answer before this runs out for a swift strike"><i id="swift"></i></span></div>
        <p id="q-text" class="q-text" aria-live="polite"></p>
        <div id="q-opts" class="q-opts"></div>
        <div id="q-after" class="q-after"></div>
      </div>
      <div class="bfoot">
        <div class="party win">
          <img src="${LL.ASSET_URLS.heroPortrait}" alt="">
          <div class="hud-stats"><div class="hud-name">Wren <span>Lv ${S.hero.lv}</span></div>
            <div class="bar hp"><i id="bhp"></i><b id="bhp-t"></b></div><div class="bar mp"><i id="bmp"></i><b id="bmp-t"></b></div></div>
        </div>
        <div class="cmds">
          <button class="cmd" id="c-clarity">Clarity <small>3 MP · remove wrong answers</small></button>
          <button class="cmd" id="c-mend">Mend <small>4 MP · heal</small></button>
          <button class="cmd" id="c-tonic">Tonic <small id="tonic-n"></small></button>
          <button class="cmd" id="c-flee" ${B.e.boss ? 'disabled' : ''}>Flee</button>
        </div>
      </div>
    </div>`;
  }

  function partyBars() {
    const h = S.hero;
    $('#bhp').style.width = (h.hp / maxHP()) * 100 + '%'; $('#bhp-t').textContent = `HP ${h.hp}/${maxHP()}`;
    $('#bmp').style.width = (h.mp / maxMP()) * 100 + '%'; $('#bmp-t').textContent = `MP ${h.mp}/${maxMP()}`;
    $('#tonic-n').textContent = `×${h.tonics} · heal 60%`;
    $('#ehp').style.width = Math.max(0, (B.hp / B.max) * 100) + '%';
    const asking = B.phase === 'ask';
    $('#c-clarity').disabled = !asking || h.mp < 3 || B.clarity || (B.q && B.q.o && B.q.o.length < 3);
    $('#c-mend').disabled = !asking || h.mp < 4 || h.hp >= maxHP();
    $('#c-tonic').disabled = !asking || h.tonics < 1 || h.hp >= maxHP();
  }

  function bindBattle() {
    $('#c-clarity').onclick = () => {
      if (S.hero.mp < 3) return; S.hero.mp -= 3; B.clarity = true;
      if (B.q.o) {
        const wrong = shuffle($$('#q-opts .opt').filter((b) => +b.dataset.i !== B.q.a && !b.disabled));
        wrong.slice(0, B.q.o.length > 3 ? 2 : 1).forEach((b) => { b.disabled = true; b.classList.add('struck'); });
      } else {
        const a = B.q.a, lo = Math.max(0, Math.floor(a * 0.5)), hi = Math.ceil(a * 1.6) + 2;
        $('#q-after').innerHTML = `<p class="hint">Clarity: the answer is between ${lo} and ${hi}.</p>`;
      }
      fxText('Clarity!', 'heal', 70, 40); partyBars();
    };
    $('#c-mend').onclick = () => { S.hero.mp -= 4; heal(Math.round(maxHP() * 0.4)); };
    $('#c-tonic').onclick = () => { S.hero.tonics--; heal(Math.round(maxHP() * 0.6)); };
    $('#c-flee').onclick = () => endBattle('flee');
    partyBars();
  }
  function heal(n) { const h = S.hero, before = h.hp; h.hp = Math.min(maxHP(), h.hp + n); fxText(`+${h.hp - before}`, 'heal', 78, 45); partyBars(); hud(); save(); }

  function ask() {
    const q = pickQuestion(B.e.s, B.used); B.used.add(q.id);
    B.q = q; B.phase = 'ask'; B.clarity = false; B.t0 = performance.now();
    $('#q-subj').textContent = SUBJ[q.s].name; $('#q-subj').style.color = SUBJ[q.s].color;
    $('#q-text').textContent = q.q;
    $('#q-after').innerHTML = '';
    if (q.o) {
      const order = shuffle(q.o.map((_, i) => i));
      $('#q-opts').innerHTML = order.map((i, k) => `<button class="opt" data-i="${i}"><kbd>${k + 1}</kbd>${esc(q.o[i])}</button>`).join('');
      $$('#q-opts .opt').forEach((b) => b.onclick = () => answer(+b.dataset.i === q.a, b));
    } else {
      $('#q-opts').innerHTML = `<form id="num-form" class="num-form" autocomplete="off"><input id="num-in" inputmode="decimal" aria-label="Your answer" spellcheck="false"><button class="opt" type="submit">Answer</button></form>`;
      $('#num-form').onsubmit = (ev) => { ev.preventDefault(); const v = parseFloat($('#num-in').value.replace(/,/g, '').replace(/[^\d.\-]/g, '')); if (isNaN(v)) return; answer(Math.abs(v - q.a) < 0.01); };
      setTimeout(() => $('#num-in')?.focus({ preventScroll: true }), 30);
    }
    partyBars();
  }

  function answer(ok, btn) {
    if (B.phase !== 'ask') return;
    B.phase = 'after';
    const q = B.q, secs = (performance.now() - B.t0) / 1000, h = S.hero;
    $$('#q-opts button, #q-opts input').forEach((b) => (b.disabled = true));
    if (q.o) $$('#q-opts .opt').forEach((b) => { if (+b.dataset.i === q.a) b.classList.add('right'); });
    if (btn && !ok) btn.classList.add('wrong');
    const st = stat(q.s), entry = S.codex[q.id], firstTime = !entry;
    let msg;
    if (ok) {
      st.r++;
      const crit = secs < 12 && !B.clarity;
      const dmg = Math.round(B.base * (crit ? 1.5 : 1));
      B.hp -= dmg; B.anim.lunge = 1; B.anim.flash = 1; B.anim.shake = 0.6;
      fxText(crit ? `${dmg}!` : `${dmg}`, crit ? 'crit' : 'dmg', 28, 40);
      if (!entry) S.codex[q.id] = { box: 1, due: addDays(today(), 1) };
      msg = `<p class="verdict good">${crit ? 'Swift strike!' : 'Correct!'} Wren deals ${dmg} damage.</p>`;
    } else {
      st.w++;
      const dmg = B.e.atk + rand(-1, 3);
      h.hp = Math.max(0, h.hp - dmg); B.anim.hurt = 1; B.anim.shake = 1;
      fxText(`-${dmg}`, 'hurt', 78, 45);
      S.codex[q.id] = { box: 0, due: today() };
      const right = q.o ? q.o[q.a] : q.a;
      msg = `<p class="verdict bad">Not quite. The answer is <b>${esc(right)}</b>. ${esc(B.e.name)} hits you for ${dmg}.</p>`;
    }
    $('#q-after').innerHTML = `${msg}<div class="lore"><span>${firstTime ? 'New Codex entry' : 'Codex'}</span><p>${esc(q.lore)}</p></div>
      <button class="cmd go" id="b-next">${B.hp <= 0 ? 'Victory!' : h.hp <= 0 ? '…' : 'Continue'} <small>Enter</small></button>`;
    $('#b-next').onclick = () => { if (B.hp <= 0) endBattle('win'); else if (h.hp <= 0) endBattle('lose'); else ask(); };
    $('#b-next').focus({ preventScroll: true });
    partyBars(); hud(); save();
  }

  function battleKey(k, e) {
    if (!B) return;
    if (B.phase === 'ask' && /^[1-4]$/.test(k)) { const b = $$('#q-opts .opt')[+k - 1]; if (b && !b.disabled) b.click(); }
    if (B.phase === 'after' && (k === 'Enter' || k === ' ')) { e.preventDefault(); $('#b-next')?.click(); }
    if (B.phase === 'result' && (k === 'Enter' || k === ' ')) { e.preventDefault(); $('#b-done')?.click(); }
  }

  function fxText(t, cls, xPct, yPct) {
    const fx = $('#fx'); if (!fx) return;
    const s = document.createElement('span'); s.className = 'fx ' + cls; s.textContent = t;
    s.style.left = xPct + '%'; s.style.top = yPct + '%'; fx.appendChild(s); setTimeout(() => s.remove(), 1100);
  }

  function battleLoop() {
    const c = $('#bstage'); if (!c || !B) return;
    const g = c.getContext('2d'), e = B.e, an = B.anim, t = performance.now() / 1000;
    g.imageSmoothingEnabled = false;
    const col = SUBJ[e.s] ? SUBJ[e.s].color : '#b18cff';
    const bg = g.createLinearGradient(0, 0, 0, 220); bg.addColorStop(0, '#0b0f1c'); bg.addColorStop(1, LL.shade(col, -0.78));
    g.fillStyle = bg; g.fillRect(0, 0, 480, 220);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + 0.15 * Math.sin(t * 2 + i)})`; g.fillRect((i * 97) % 480, (i * 53) % 120, 2, 2); }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(240, 188, 230, 30, 0, 0, 7); g.fill();
    const sx = (Math.random() - 0.5) * 10 * an.shake;
    // enemy
    const spr = LL.sprite(e.sprite, e.pal), sc = e.boss ? 9 : 7;
    const ex = 150 + sx - an.hurt * 0 + (an.hurt > 0.5 ? (1 - an.hurt) * 60 : an.hurt * 60) * 0, ey = 190 + Math.sin(t * 2.5) * 4;
    const lungeE = an.hurt > 0 ? Math.sin(an.hurt * Math.PI) * 60 : 0;
    g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(150 + lungeE, 190, 50, 10, 0, 0, 7); g.fill();
    if (B.hp <= 0 && B.phase !== 'ask') g.globalAlpha = Math.max(0, 1 - (B.fade = (B.fade || 0) + 0.03));
    if (an.flash > 0.5) g.filter = 'brightness(3)';
    g.drawImage(spr, ex + lungeE - spr.width * sc / 2, ey - spr.height * sc, spr.width * sc, spr.height * sc);
    g.filter = 'none'; g.globalAlpha = 1;
    // hero
    const hi = LL.IMG.heroBattle, hs = 1.5;
    const lunge = an.lunge > 0 ? Math.sin(an.lunge * Math.PI) * 90 : 0;
    const hx = 360 - lunge, hy = 196 + Math.sin(t * 2) * 2;
    if (an.hurt > 0.5) g.filter = 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)';
    g.save(); g.translate(hx + (an.hurt > 0 ? sx : 0), hy); g.scale(-1, 1);
    g.drawImage(hi, -hi.width * hs / 2, -hi.height * hs, hi.width * hs, hi.height * hs); g.restore(); g.filter = 'none';
    // swift bar
    const sw = $('#swift');
    if (sw) sw.style.width = B.phase === 'ask' && !B.clarity ? Math.max(0, 100 - ((performance.now() - B.t0) / 12000) * 100) + '%' : '0%';
    ['shake', 'flash', 'lunge', 'hurt'].forEach((k) => (an[k] = Math.max(0, an[k] - 0.035)));
    B.raf = requestAnimationFrame(battleLoop);
  }

  function endBattle(result) {
    cancelAnimationFrame(B.raf);
    const { actor, e } = B; const h = S.hero;
    if (result === 'flee') { actor.stun = 3; G.hero.inv = 2; G.hero.blink = true; B = null; closeWin(); toast('You slip away.'); return; }
    if (result === 'lose') {
      B = null; closeWin();
      h.hp = maxHP(); h.mp = maxMP();
      say([[null, 'The Murk swallows your thoughts…'], ['Marla', 'Easy now, Wren. You’re safe at the Gilded Lantern. Rest, then try again. Every wrong answer teaches you something.']], () => {});
      enterMap('tavern'); G.mode = 'dialog';
      return;
    }
    // win
    B.phase = 'result';
    actor.dead = true;
    let lines = [`Gained ${e.xp} experience.`];
    h.xp += e.xp;
    const drop = !e.boss && Math.random() < 0.25;
    if (drop) { h.tonics++; lines.push('Found a Tonic!'); }
    while (h.xp >= xpNext()) { h.xp -= xpNext(); h.lv++; h.hp = maxHP(); h.mp = maxMP(); lines.push(`Wren reached level ${h.lv}! HP and MP fully restored.`); }
    save(); hud();
    $('.bwin').innerHTML = `<h2 class="victory">Victory</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}<button class="cmd go" id="b-done">Continue <small>Enter</small></button>`;
    $('#b-done').focus({ preventScroll: true });
    $('#b-done').onclick = () => {
      B = null; closeWin(); G.hero.inv = 1; G.hero.blink = true;
      if (e.boss) afterBoss(actor, e);
    };
  }

  function afterBoss(actor, e) {
    G.actors = G.actors.filter((a) => a !== actor);
    if (e.final) {
      S.ended = true; save(); hud();
      return say([[e.name, e.defeat], ...LL.STORY.ending], () => banner('The End'));
    }
    const s = G.map.def.lantern;
    S.lanterns[s] = true; save(); hud();
    const lines = [[e.name, e.defeat], ...LL.STORY.lanternLit(SUBJ[s].lantern)];
    if (litCount() === 4) lines.push(...LL.STORY.allLit);
    say(lines);
  }

  /* ───────── seals (mechanism puzzles) ───────── */
  const PUZZLES = {
    jugs: { title: 'Alchemical Lock', prompt: 'The lock wants exactly 4 measures of quicksilver in the large flask. You have a 5-measure flask and a 3-measure flask, with no markings.',
      hints: ['Fill the 5 and pour into the 3. What is left in the 5?', 'Keep that 2 in the 3-flask, then fill the 5 again.', 'Top up the 3-flask from the full 5. It only takes 1.'] },
    hanoi: { title: 'Tower Seal', prompt: 'Move the whole tower of 4 disks from the left post to the right post. Only the top disk can move, and a disk may never sit on a smaller one.',
      hints: ['To move the biggest disk, the other three must be on the middle post.', 'Moving 3 disks works the same way: first move the top 2 aside.', 'The smallest disk moves every other turn, always in the same direction around the posts.'] },
    river: { title: 'Ferry Post', prompt: 'Ferry a fox, a goose and a sack of grain across the river. The boat holds you and one passenger. Left alone, the fox eats the goose, and the goose eats the grain.',
      hints: ['There is only one safe first move.', 'Nothing stops you bringing a passenger back again.', 'Take the goose first. Later, bring the goose back to swap it for something else.'] },
    lights: { title: 'Lantern Ring', prompt: 'Light every lantern in the ring. Touching a lantern switches it and the lanterns directly above, below, left and right of it.',
      hints: ['Pressing a lantern twice undoes it, so each needs pressing at most once.', 'The order of presses doesn’t matter, only which ones you press.', 'Press the top-left, centre and bottom-right lanterns once each.'] },
    magic: { title: 'Square of Fifteen', prompt: 'Fill the grid with the numbers 1 to 9, each used once, so every row, column and diagonal adds to 15.',
      hints: ['Opposite cells through the centre must add to 10.', 'Even numbers go in the corners, odd numbers on the edges.', 'One answer: 4 9 2 / 3 5 7 / 8 1 6.'] },
    lock: { title: 'Null’s Lock', prompt: 'A 3-digit lock. Scratched beside it:\n\n6 8 2   one digit right, in the right place\n6 1 4   one digit right, wrong place\n2 0 6   two digits right, wrong places\n7 3 8   nothing is right\n7 8 0   one digit right, wrong place',
      hints: ['7, 3 and 8 are not in the code.', 'From 7 8 0, the 0 is in the code but not last. From 6 8 2, either 6 or 2 is right and in place.', '6 cannot be first (614 says wrong place), so 2 is last. Then 0 is first, and 4 fills the middle.'] }
  };

  function openPuzzle(seal) {
    const P = PUZZLES[seal.puzzle];
    G.mode = 'menu';
    let hints = 0;
    openWin(`<div class="win puzzle-win"><div class="pw-head"><h2>${esc(P.title)}</h2><button class="cmd small" data-close>Leave</button></div>
      <p class="pw-prompt">${esc(P.prompt)}</p><div id="play" class="play"></div><p id="pfb" class="pfb" role="status"></p>
      <div class="pw-foot"><button class="cmd small" id="phint">Ask Pip for a hint</button></div><div id="phints"></div></div>`);
    $('[data-close]').onclick = closeWin;
    $('#phint').onclick = () => {
      if (hints >= 3) return; hints++;
      $('#phints').innerHTML = P.hints.slice(0, hints).map((h, i) => `<p class="hint"><b>Pip:</b> ${esc(h)}</p>`).join('');
      if (hints >= 3) $('#phint').disabled = true;
    };
    const ctx = {
      play: $('#play'),
      feedback: (t, cls = '') => { $('#pfb').textContent = t; $('#pfb').className = 'pfb ' + cls; },
      solve: (msg) => {
        S.seals[seal.id || G.map.id] = true; S.hero.xp += 30;
        while (S.hero.xp >= xpNext()) { S.hero.xp -= xpNext(); S.hero.lv++; S.hero.hp = maxHP(); S.hero.mp = maxMP(); }
        save();
        setTimeout(() => { closeWin(); buildActors(); say([[null, `${msg ? msg + ' ' : ''}The ${P.title} dissolves into light. (+30 XP)`]]); }, 700);
      }
    };
    ({ jugs: playJugs, hanoi: playHanoi, river: playRiver, lights: playLights, magic: playMagic, lock: playLock })[seal.puzzle](ctx);
  }

  function playHanoi({ play, solve, feedback }) {
    const n = 4, min = 15; let pegs, sel, moves;
    const reset = () => { pegs = [[4, 3, 2, 1], [], []]; sel = null; moves = 0; draw(); };
    const draw = () => {
      play.innerHTML = `<div class="hanoi">${pegs.map((p, i) => `<button class="peg ${sel === i ? 'sel' : ''}" data-p="${i}" aria-label="Post ${i + 1}, ${p.length} disks"><span class="pole"></span>${p.map((d) => `<span class="disk" style="width:${28 + d * 16}%;--h:${d}"></span>`).reverse().join('')}<span class="base"></span></button>`).join('')}</div>
        <div class="pbar"><span>Moves: ${moves} · Best possible: ${min}</span><button class="cmd small" id="reset">Start over</button></div>`;
      $$('.peg', play).forEach((b) => b.onclick = () => click(+b.dataset.p)); $('#reset').onclick = reset;
    };
    const click = (i) => {
      if (sel === null) { if (pegs[i].length) sel = i; return draw(); }
      if (sel === i) { sel = null; return draw(); }
      const d = pegs[sel].at(-1), top = pegs[i].at(-1);
      if (top !== undefined && top < d) { feedback('A disk can’t sit on a smaller one.', 'bad'); sel = null; return draw(); }
      feedback(''); pegs[i].push(pegs[sel].pop()); sel = null; moves++; draw();
      if (pegs[2].length === n) solve(moves === min ? 'A perfect 15 moves!' : `Done in ${moves} moves.`);
    };
    reset();
  }
  function playLights({ play, solve }) {
    const N = 3, presses = [0, 4, 8]; let grid, count;
    const tog = (gr, i) => { const r = Math.floor(i / N), c = i % N; [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const rr = r + a, cc = c + b; if (rr >= 0 && rr < N && cc >= 0 && cc < N) gr[rr * N + cc] = !gr[rr * N + cc]; }); };
    const reset = () => { grid = Array(9).fill(true); presses.forEach((i) => tog(grid, i)); count = 0; draw(); };
    const draw = () => {
      play.innerHTML = `<div class="lights">${grid.map((on, i) => `<button class="lamp ${on ? 'on' : ''}" data-i="${i}" aria-label="Lantern ${i + 1}, ${on ? 'lit' : 'dark'}"></button>`).join('')}</div>
        <div class="pbar"><span>Touches: ${count} · Lit ${grid.filter(Boolean).length}/9</span><button class="cmd small" id="reset">Start over</button></div>`;
      $$('.lamp', play).forEach((b) => b.onclick = () => { tog(grid, +b.dataset.i); count++; draw(); if (grid.every(Boolean)) solve(); });
      $('#reset').onclick = reset;
    };
    reset();
  }
  function playRiver({ play, solve, feedback }) {
    const N = { fox: 'Fox', goose: 'Goose', grain: 'Grain' };
    let side, pas, trips;
    const reset = () => { side = { you: 'L', fox: 'L', goose: 'L', grain: 'L' }; pas = null; trips = 0; draw(); };
    const tok = (k) => `<button class="tok ${pas === k ? 'sel' : ''}" data-k="${k}" ${side[k] !== side.you ? 'disabled' : ''}>${N[k]}</button>`;
    const bank = (s) => ['fox', 'goose', 'grain'].filter((k) => side[k] === s && pas !== k).map(tok).join('');
    const draw = () => {
      play.innerHTML = `<div class="river"><div class="bank"><small>Near bank</small>${bank('L')}</div>
        <div class="water"><div class="boat ${side.you === 'L' ? 'l' : 'r'}"><span class="tok you">Wren</span>${pas ? tok(pas) : '<span class="tok empty">empty</span>'}</div></div>
        <div class="bank"><small>Far bank</small>${bank('R')}</div></div>
        <div class="pbar"><span>Crossings: ${trips}</span><span class="row"><button class="cmd small go" id="cross">Cross</button><button class="cmd small" id="reset">Start over</button></span></div>`;
      $$('.tok[data-k]', play).forEach((b) => b.onclick = () => { pas = pas === b.dataset.k ? null : b.dataset.k; draw(); });
      $('#cross').onclick = cross; $('#reset').onclick = reset;
    };
    const cross = () => {
      const to = side.you === 'L' ? 'R' : 'L'; side.you = to; if (pas) side[pas] = to; pas = null; trips++;
      const left = to === 'L' ? 'R' : 'L', alone = (k) => side[k] === left;
      if (alone('fox') && alone('goose')) { feedback('The fox ate the goose! Everyone is back at the start.', 'bad'); return reset(); }
      if (alone('goose') && alone('grain')) { feedback('The goose ate the grain! Everyone is back at the start.', 'bad'); return reset(); }
      feedback(''); draw();
      if (['you', 'fox', 'goose', 'grain'].every((k) => side[k] === 'R')) solve(trips === 7 ? 'Seven crossings, the minimum.' : '');
    };
    reset();
  }
  function playJugs({ play, solve }) {
    let A = 0, Bq = 0, steps = 0;
    const jug = (v, cap, name) => `<div class="jug"><div class="flask" style="--h:${cap * 26}px"><div class="liquid" style="height:${(v / cap) * 100}%"></div></div><span>${name}: ${v}/${cap}</span></div>`;
    const draw = () => {
      play.innerHTML = `<div class="jugs">${jug(A, 5, 'Large')}${jug(Bq, 3, 'Small')}</div>
        <div class="jug-acts">${[['fa', 'Fill large'], ['fb', 'Fill small'], ['ea', 'Empty large'], ['eb', 'Empty small'], ['ab', 'Pour large → small'], ['ba', 'Pour small → large']].map(([k, l]) => `<button class="cmd small" data-a="${k}">${l}</button>`).join('')}</div>
        <div class="pbar"><span>Steps: ${steps} · Goal: exactly 4 in the large flask</span></div>`;
      $$('[data-a]', play).forEach((b) => b.onclick = () => act(b.dataset.a));
    };
    const act = (a) => {
      if (a === 'fa') A = 5; if (a === 'fb') Bq = 3; if (a === 'ea') A = 0; if (a === 'eb') Bq = 0;
      if (a === 'ab') { const t = Math.min(A, 3 - Bq); A -= t; Bq += t; } if (a === 'ba') { const t = Math.min(Bq, 5 - A); Bq -= t; A += t; }
      steps++; draw(); if (A === 4) solve(steps <= 6 ? 'Six steps, the fewest possible.' : '');
    };
    draw();
  }
  function playMagic({ play, solve, feedback }) {
    const given = [0, 0, 0, 0, 5, 0, 0, 0, 0];
    play.innerHTML = `<div class="magic">${given.map((v, i) => v ? `<span class="cell given">${v}</span>` : `<input class="cell" id="mc${i}" inputmode="numeric" maxlength="1" aria-label="Row ${Math.floor(i / 3) + 1}, column ${i % 3 + 1}">`).join('')}</div>
      <div class="pbar"><span>Every line must total 15</span><button class="cmd small go" id="check">Check</button></div>`;
    $$('input.cell', play).forEach((i) => i.oninput = () => { i.value = i.value.replace(/[^1-9]/g, '').slice(0, 1); });
    const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    $('#check').onclick = () => {
      const v = given.map((g, i) => g || parseInt($('#mc' + i).value, 10) || 0);
      if (v.includes(0)) return feedback('Fill every square first.', 'bad');
      if (new Set(v).size !== 9) return feedback('Each number 1 to 9 must appear exactly once.', 'bad');
      const good = L.filter((l) => l.reduce((s, i) => s + v[i], 0) === 15).length;
      good === 8 ? solve() : feedback(`${good} of 8 lines total 15.`, 'bad');
    };
  }
  function playLock({ play, solve, feedback }) {
    play.innerHTML = `<form class="num-form" id="lockf" autocomplete="off"><input id="lock-in" inputmode="numeric" maxlength="3" aria-label="Code" spellcheck="false"><button class="cmd go" type="submit">Try the code</button></form>`;
    $('#lockf').onsubmit = (e) => { e.preventDefault(); const v = $('#lock-in').value.replace(/\D/g, ''); v === '042' ? solve() : feedback('The lock doesn’t budge.', 'bad'); };
    setTimeout(() => $('#lock-in').focus(), 30);
  }

  /* ───────── riddles ───────── */
  function openRiddle(n) {
    const r = LL.RIDDLES[n.riddle];
    G.mode = 'menu';
    openWin(`<div class="win puzzle-win"><div class="pw-head"><h2>${esc(n.name)}’s riddle</h2><button class="cmd small" data-close>Maybe later</button></div>
      <p class="pw-prompt">${esc(r.q)}</p>
      <form class="num-form" id="rf" autocomplete="off"><input id="r-in" aria-label="Your answer" spellcheck="false"><button class="cmd go" type="submit">Answer</button></form>
      <p id="pfb" class="pfb" role="status"></p><div class="pw-foot"><button class="cmd small" id="rhint">Ask Pip for a hint</button></div><div id="phints"></div></div>`);
    $('[data-close]').onclick = closeWin;
    $('#rhint').onclick = () => { $('#phints').innerHTML = `<p class="hint"><b>Pip:</b> ${esc(r.hint)}</p>`; };
    $('#rf').onsubmit = (e) => {
      e.preventDefault();
      const v = $('#r-in').value.toLowerCase().replace(/[\s.,'"!?-]/g, '').replace(/^(the|a)/, '');
      if (r.a.includes(v)) {
        S.riddles[n.riddle] = true; S.hero.tonics++; S.hero.xp += 20;
        while (S.hero.xp >= xpNext()) { S.hero.xp -= xpNext(); S.hero.lv++; S.hero.hp = maxHP(); S.hero.mp = maxMP(); }
        save(); closeWin(); say([[n.name, `Well done! ${r.lore}`], [null, 'Received a Tonic and 20 experience.']]);
      } else { $('#pfb').textContent = 'Not quite. Think it over.'; $('#pfb').className = 'pfb bad'; $('#r-in').select(); }
    };
    setTimeout(() => $('#r-in').focus(), 30);
  }

  /* ───────── inn ───────── */
  function dueEntries() { const t = today(); return Object.keys(S.codex).filter((id) => QBY[id] && S.codex[id].due <= t); }
  function innMenu() {
    const due = dueEntries().length;
    choice('Marla · The Gilded Lantern', [
      { label: 'Rest', note: 'Restore HP and MP', fn: () => { S.hero.hp = maxHP(); S.hero.mp = maxMP(); save(); hud(); say([['Marla', 'A warm bowl of stew and a soft bed. You feel restored.']]); } },
      { label: 'Recall', note: due ? `${due} Codex entries ready for review` : 'Practise what you have learned', disabled: !Object.keys(S.codex).length, fn: () => review(due > 0) },
      { label: 'Training', note: 'Quick mind drills', fn: trainingMenu },
      { label: 'Ask about the journey', fn: () => say(journeyHint()) },
      { label: 'Leave', fn: () => {} }
    ]);
  }
  function journeyHint() {
    const left = LANTERN_SUBJ.filter((s) => !S.lanterns[s]);
    if (S.ended) return [['Marla', 'Every lantern burns. Keep your Codex fresh with Recall, and come and train anytime.']];
    if (!left.length) return [['Marla', 'All four Lanterns are lit! The black gate in the north-east of the village is open. Null is waiting.']];
    const where = { sci: 'the Brass Observatory, north', his: 'the Sunken Archive, east', geo: 'the Wayfarer Wilds, west', phi: 'the Grove of Whys, south' };
    return [['Marla', `${4 - left.length} of 4 Lanterns are lit. Still dark: ${left.map((s) => where[s]).join('; ')}.`], ['Marla', 'If the creatures there are too much, come back, rest, and try again. You learn a little every time.']];
  }

  function review(due) {
    const ids = due ? shuffle(dueEntries()).slice(0, 8) : shuffle(Object.keys(S.codex).filter((id) => QBY[id])).slice(0, 5);
    let i = 0, right = 0;
    G.mode = 'menu';
    const step = () => {
      if (i >= ids.length) {
        S.hero.xp += right * 4; while (S.hero.xp >= xpNext()) { S.hero.xp -= xpNext(); S.hero.lv++; S.hero.hp = maxHP(); S.hero.mp = maxMP(); }
        save(); hud();
        openWin(`<div class="win puzzle-win"><h2>Recall complete</h2><p>${right} of ${ids.length} remembered. +${right * 4} XP.</p>
          <p class="muted">${due ? 'Entries you got right will come back after a longer gap. Missed ones return tomorrow.' : 'Practice rounds don’t change your review schedule.'}</p>
          <div class="pw-foot"><button class="cmd go" data-close>Done</button></div></div>`);
        $('[data-close]').onclick = closeWin; $('[data-close]').focus();
        return;
      }
      const q = QBY[ids[i]];
      openWin(`<div class="win puzzle-win"><div class="pw-head"><h2>Recall ${i + 1} / ${ids.length}</h2><button class="cmd small" data-close>Stop</button></div>
        <span class="q-subj" style="color:${SUBJ[q.s].color}">${SUBJ[q.s].name}</span><p class="pw-prompt">${esc(q.q)}</p><div id="q-opts" class="q-opts"></div><div id="q-after" class="q-after"></div></div>`);
      $('[data-close]').onclick = closeWin;
      const done = (ok, btn) => {
        $$('#q-opts button, #q-opts input').forEach((b) => (b.disabled = true));
        if (q.o) $$('#q-opts .opt').forEach((b) => { if (+b.dataset.i === q.a) b.classList.add('right'); });
        if (btn && !ok) btn.classList.add('wrong');
        if (ok) right++;
        if (due) { const e = S.codex[q.id]; e.box = ok ? Math.min(5, e.box + 1) : 0; e.due = addDays(today(), ok ? LEITNER[e.box] : 1); save(); }
        $('#q-after').innerHTML = `<p class="verdict ${ok ? 'good' : 'bad'}">${ok ? 'Remembered!' : `The answer is ${esc(q.o ? q.o[q.a] : q.a)}.`}</p><div class="lore"><p>${esc(q.lore)}</p></div><button class="cmd go" id="rn">Next</button>`;
        $('#rn').onclick = () => { i++; step(); }; $('#rn').focus();
      };
      if (q.o) {
        $('#q-opts').innerHTML = shuffle(q.o.map((_, k) => k)).map((k, j) => `<button class="opt" data-i="${k}"><kbd>${j + 1}</kbd>${esc(q.o[k])}</button>`).join('');
        $$('#q-opts .opt').forEach((b) => b.onclick = () => done(+b.dataset.i === q.a, b));
      } else {
        $('#q-opts').innerHTML = `<form id="nf" class="num-form" autocomplete="off"><input id="nin" inputmode="decimal" aria-label="Answer"><button class="opt" type="submit">Answer</button></form>`;
        $('#nf').onsubmit = (e) => { e.preventDefault(); const v = parseFloat($('#nin').value.replace(/[^\d.\-]/g, '')); if (!isNaN(v)) done(Math.abs(v - q.a) < 0.01); };
        $('#nin').focus();
      }
    };
    step();
  }

  /* ───────── training drills ───────── */
  function trainingMenu() {
    choice('Training', [
      { label: 'Quick Maths', note: `60 seconds of mental arithmetic · best ${S.gym.math}`, fn: drillMath },
      { label: 'Number Patterns', note: `Find the rule in 6 sequences · best ${S.gym.pattern}/6`, fn: drillPattern },
      { label: 'Digit Span', note: `Working memory · best ${S.gym.span} digits`, fn: drillSpan },
      { label: 'Back', fn: innMenu }
    ]);
  }
  function drillDone(key, score, text) {
    const rec = score > S.gym[key]; if (rec) S.gym[key] = score;
    S.hero.xp += score * 2; while (S.hero.xp >= xpNext()) { S.hero.xp -= xpNext(); S.hero.lv++; S.hero.hp = maxHP(); S.hero.mp = maxMP(); }
    save(); hud();
    openWin(`<div class="win puzzle-win"><h2>${esc(text)}</h2><p>${rec && score ? 'A new personal best!' : `Your best is ${S.gym[key]}.`} +${score * 2} XP.</p>
      <div class="pw-foot"><button class="cmd go" id="again">Again</button><button class="cmd" data-close>Done</button></div></div>`);
    $('[data-close]').onclick = closeWin; $('#again').onclick = () => ({ math: drillMath, pattern: drillPattern, span: drillSpan })[key]();
  }
  function mathQ(L) {
    const ops = [
      () => { const a = rand(2, 20), b = rand(2, 20); return pick([[`${a} + ${b}`, a + b], [`${a + b} − ${b}`, a]]); },
      () => { const a = rand(12, 99), b = rand(12, 99), x = rand(2, 10), y = rand(2, 10); return pick([[`${a} + ${b}`, a + b], [`${Math.max(a, b)} − ${Math.min(a, b)}`, Math.abs(a - b)], [`${x} × ${y}`, x * y]]); },
      () => { const a = rand(12, 40), b = rand(3, 9), q = rand(3, 12); return pick([[`${a} × ${b}`, a * b], [`${q * b} ÷ ${b}`, q]]); },
      () => { const a = rand(3, 12), b = rand(3, 12), c = rand(5, 40), n = rand(11, 25), base = rand(2, 20) * 20; return pick([[`${a} × ${b} + ${c}`, a * b + c], [`${n}²`, n * n], [`25% of ${base}`, base / 4]]); }
    ];
    const [q, a] = ops[Math.min(L, 4) - 1](); return { q, a };
  }
  function drillMath() {
    let L = 1, run = 0, score = 0, left = 60, p = mathQ(1);
    openWin(`<div class="win puzzle-win drill"><div class="pw-head"><h2>Quick Maths</h2><span class="muted">Time <b id="dt">60</b> · Correct <b id="ds">0</b></span></div>
      <div class="big" id="dq">${p.q} = ?</div><form class="num-form" id="df" autocomplete="off"><input id="din" inputmode="numeric" aria-label="Answer"><button class="cmd go" type="submit">Enter</button></form><p id="pfb" class="pfb"></p></div>`);
    $('#din').focus();
    $('#df').onsubmit = (e) => {
      e.preventDefault(); if (!$('#din').value) return;
      const ok = parseFloat($('#din').value) === p.a;
      if (ok) { score++; if (++run >= 3) { L = Math.min(4, L + 1); run = 0; } } else { run = 0; L = Math.max(1, L - 1); }
      $('#pfb').textContent = ok ? 'Correct' : `It was ${p.a}`; $('#pfb').className = 'pfb ' + (ok ? 'good' : 'bad');
      p = mathQ(L); $('#dq').textContent = `${p.q} = ?`; $('#ds').textContent = score; $('#din').value = '';
    };
    const timer = setInterval(() => { left--; if ($('#dt')) $('#dt').textContent = left; else return clearInterval(timer); if (left <= 0) { clearInterval(timer); drillDone('math', score, `${score} correct in 60 seconds`); } }, 1000);
  }
  function drillPattern() {
    const gens = [
      () => { const a = rand(1, 30) + 70, d = rand(2, 13) * pick([1, -1]); return { s: [0, 1, 2, 3, 4, 5].map((i) => a + d * i), rule: `add ${d}` }; },
      () => { const a = rand(1, 5), r = pick([2, 3]); return { s: [0, 1, 2, 3, 4, 5].map((i) => a * r ** i), rule: `multiply by ${r}` }; },
      () => { const c = rand(0, 5), o = rand(1, 4); return { s: [0, 1, 2, 3, 4, 5].map((i) => (i + o) ** 2 + c), rule: c ? `square numbers plus ${c}` : 'square numbers' }; },
      () => { const s = [rand(1, 4), rand(2, 6)]; while (s.length < 6) s.push(s.at(-1) + s.at(-2)); return { s, rule: 'add the two numbers before' }; },
      () => { const a = rand(1, 10), b = rand(20, 40), d1 = rand(2, 5), d2 = rand(1, 3); return { s: [a, b, a + d1, b - d2, a + 2 * d1, b - 2 * d2], rule: `two sequences interleaved: +${d1} and −${d2}` }; },
      () => { const s = [rand(1, 10)], d = rand(1, 3); for (let i = 1; i < 6; i++) s.push(s[i - 1] + d * i); return { s, rule: `the gap grows by ${d} each time` }; },
      () => { const s = [rand(2, 6)]; for (let i = 1; i < 6; i++) s.push(i % 2 ? s[i - 1] * 2 : s[i - 1] + 3); return { s, rule: 'double, then add 3, alternately' }; }
    ];
    const seqs = shuffle(gens).slice(0, 6).map((f) => f()); let i = 0, score = 0;
    const step = () => {
      if (i >= 6) return drillDone('pattern', score, `${score} of 6 patterns found`);
      const { s, rule } = seqs[i];
      openWin(`<div class="win puzzle-win drill"><div class="pw-head"><h2>Pattern ${i + 1} / 6</h2><span class="muted">Found <b>${score}</b></span></div>
        <div class="big mono">${s.slice(0, 5).join(', ')}, <span class="q-mark">?</span></div>
        <form class="num-form" id="df" autocomplete="off"><input id="din" inputmode="numeric" aria-label="Next number"><button class="cmd go" type="submit">Answer</button><button class="cmd" type="button" id="skip">Give up</button></form><div id="pa"></div></div>`);
      $('#din').focus();
      const reveal = (ok) => { if (ok) score++; $$('#df input, #df button').forEach((b) => (b.disabled = true)); $('#pa').innerHTML = `<p class="verdict ${ok ? 'good' : 'bad'}">${ok ? 'Correct' : `It was ${s[5]}`}: ${esc(rule)}.</p><button class="cmd go" id="pn">Next</button>`; $('#pn').onclick = () => { i++; step(); }; $('#pn').focus(); };
      $('#df').onsubmit = (e) => { e.preventDefault(); if ($('#din').value) reveal(parseInt($('#din').value, 10) === s[5]); };
      $('#skip').onclick = () => reveal(false);
    };
    step();
  }
  function drillSpan() {
    let len = 3, best = 0;
    const round = () => {
      const d = Array.from({ length: len }, () => rand(0, 9));
      openWin(`<div class="win puzzle-win drill"><div class="pw-head"><h2>Digit Span</h2><span class="muted">Length <b>${len}</b></span></div><div class="big mono" id="dd">Watch…</div><div id="da"></div></div>`);
      let k = 0;
      const show = () => {
        const el = $('#dd'); if (!el) return;
        if (k >= d.length) { el.textContent = 'Type the digits in order'; $('#da').innerHTML = `<form class="num-form" id="df" autocomplete="off"><input id="din" inputmode="numeric" aria-label="Digits"><button class="cmd go" type="submit">Submit</button></form>`; $('#din').focus();
          $('#df').onsubmit = (e) => { e.preventDefault(); if ($('#din').value.replace(/\D/g, '') === d.join('')) { best = len; len++; round(); } else drillDone('span', best, `Longest span: ${best} digits (last was ${d.join(' ')})`); }; return; }
        el.textContent = d[k++]; setTimeout(() => { if ($('#dd')) $('#dd').textContent = ''; setTimeout(show, 200); }, 800);
      };
      setTimeout(show, 700);
    };
    round();
  }

  /* ───────── menu: status / codex / help ───────── */
  function openMenu(tab) {
    G.mode = 'menu'; G.keys = {};
    const h = S.hero;
    const tabs = [['status', 'Status'], ['codex', 'Codex'], ['help', 'How to play']];
    let body = '';
    if (tab === 'status') {
      const subj = Object.keys(SUBJ).map((s) => {
        const all = LL.QUESTIONS.filter((q) => q.s === s), known = all.filter((q) => S.codex[q.id] && S.codex[q.id].box > 0).length, st = stat(s);
        return `<div class="skill"><div class="skill-top"><span style="color:${SUBJ[s].color}">${SUBJ[s].name}</span><small>${known}/${all.length} learned · ${st.r + st.w ? Math.round((st.r / (st.r + st.w)) * 100) + '% accuracy' : 'no battles yet'}</small></div>
          <div class="bar"><i style="width:${(known / all.length) * 100}%;background:${SUBJ[s].color}"></i></div></div>`;
      }).join('');
      body = `<div class="status">
        <img class="status-art" src="${LL.ASSET_URLS.heroBattle}" alt="Wren, the lamplighter">
        <div class="status-info">
          <h3>Wren <span>Level ${h.lv} Lamplighter</span></h3>
          <div class="bar hp"><i style="width:${(h.hp / maxHP()) * 100}%"></i><b>HP ${h.hp}/${maxHP()}</b></div>
          <div class="bar mp"><i style="width:${(h.mp / maxMP()) * 100}%"></i><b>MP ${h.mp}/${maxMP()}</b></div>
          <div class="bar xp"><i style="width:${(h.xp / xpNext()) * 100}%"></i><b>XP ${h.xp}/${xpNext()}</b></div>
          <p class="muted">Tonics: ${h.tonics} · Riddles solved: ${Object.keys(S.riddles).length}/8 · Lanterns: ${litCount()}/4</p>
          <h4>Knowledge</h4>${subj}
        </div></div>`;
    } else if (tab === 'codex') {
      const ids = Object.keys(S.codex).filter((id) => QBY[id]);
      const bySub = Object.keys(SUBJ).map((s) => ({ s, items: ids.filter((id) => QBY[id].s === s) })).filter((x) => x.items.length);
      body = ids.length ? `<p class="muted">${ids.length} of ${LL.QUESTIONS.length} entries. Each entry is a true fact from a question you have faced. Review them with Marla’s Recall so they stick.</p>
        ${bySub.map(({ s, items }) => `<h4 style="color:${SUBJ[s].color}">${SUBJ[s].name}</h4><div class="codex">${items.map((id) => { const q = QBY[id], e = S.codex[id]; return `<article class="entry"><p>${esc(q.lore)}</p><span class="pips" aria-label="Memory ${e.box} of 5">${[1, 2, 3, 4, 5].map((b) => `<i class="${b <= e.box ? 'on' : ''}"></i>`).join('')}</span></article>`; }).join('')}</div>`).join('')}`
        : '<p class="muted">The Codex is empty. Every question you face in battle writes a true fact here.</p>';
    } else {
      body = `<div class="help">
        <h4>Moving</h4><p>Arrow keys or WASD to walk. On a touchscreen, tap where you want to go. Tap a person or object to walk over and interact.</p>
        <h4>Talking</h4><p>Enter or Space (or the A button) talks to whoever is nearby. A gold <b>?</b> means they have a riddle for you.</p>
        <h4>Battles</h4><p>Murk creatures attack with questions. A right answer hits them; answer within the gold bar’s time for a <b>swift strike</b> worth 50% more. A wrong answer lets them hit you, and you still learn the right answer.</p>
        <p><b>Clarity</b> (3 MP) removes wrong choices. <b>Mend</b> (4 MP) and <b>Tonics</b> restore HP. You can flee from ordinary monsters.</p>
        <h4>Seals</h4><p>Glowing violet seals are mechanism puzzles. Solve them to reach each Great Lantern.</p>
        <h4>Learning</h4><p>Every question adds a fact to your Codex. Marla’s <b>Recall</b> asks them again after 1, 2, 4, 8 and 16 days: spaced repetition, one of the best-tested ways to remember. <b>Training</b> has quick daily mind drills.</p>
        <h4>Saving</h4><p>The game saves automatically in this browser.</p>
        <div class="danger" id="dz"><button class="cmd small" id="reset-ask">Start a new game</button></div></div>`;
    }
    openWin(`<div class="win menu-win"><div class="pw-head"><nav class="tabs">${tabs.map(([k, l]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</nav><button class="cmd small" data-close>Close</button></div><div class="menu-body">${body}</div></div>`);
    $$('[data-tab]').forEach((b) => b.onclick = () => openMenu(b.dataset.tab));
    $('[data-close]').onclick = closeWin;
    const ra = $('#reset-ask');
    if (ra) ra.onclick = () => {
      $('#dz').innerHTML = '<p>This erases your progress in this browser. It can’t be undone.</p><button class="cmd small danger-btn" id="reset-yes">Erase and restart</button> <button class="cmd small" id="reset-no">Keep playing</button>';
      $('#reset-yes').onclick = () => { S = fresh(); save(); closeWin(); enterMap('tavern'); hud(); say(LL.STORY.intro, () => { S.introDone = true; save(); }); };
      $('#reset-no').onclick = () => openMenu('help');
    };
  }

  /* ───────── title & boot ───────── */
  function title() {
    G.mode = 'title';
    const t = $('#title'); t.hidden = false;
    $('#continue').hidden = !hasSave();
    $('#newgame').onclick = () => start(true);
    $('#continue').onclick = () => start(false);
    ($('#continue').hidden ? $('#newgame') : $('#continue')).focus();
  }
  function start(isNew) {
    $('#title').hidden = true;
    if (isNew) S = fresh(); else loadSave();
    enterMap(S.map || 'tavern', S.pos || undefined);
    hud(); $('#hud').hidden = false;
    G.mode = 'explore';
    if (!S.introDone) say(LL.STORY.intro, () => { S.introDone = true; save(); });
  }
  // remember position periodically
  setInterval(() => { if (G.map && G.mode === 'explore') { S.pos = { x: G.hero.x, y: G.hero.y }; save(); } }, 4000);

  function boot() {
    R.resize(cv);
    window.addEventListener('resize', () => R.resize(cv));
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
    LL.loadAssets().then(() => {
      // title backdrop: the tavern
      enterMap('tavern', null, true);
      $('#hud').hidden = true;
      G.mode = 'title';
      $('#banner').classList.remove('show');
      title();
      requestAnimationFrame(frame);
    });
    window.claude?.hot?.snapshot?.(() => ({ state: S }));
  }
  const hot = window.claude?.hot;
  if (hot?.ready) hot.ready((d) => { if (d && d.state) { try { localStorage.setItem(KEY, JSON.stringify(d.state)); } catch (e) { S = Object.assign(fresh(), d.state); } } boot(); });
  else boot();

  LL.debug = { G, get S() { return S; }, enterMap, startBattle, openPuzzle };
})();
