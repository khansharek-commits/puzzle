/* Lanterns of Lore — the Gilded Lantern study: lessons, puzzles, trials, recall, training. */
(function () {
  'use strict';
  const LL = window.LL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pad2 = (n) => String(n).padStart(2, '0');
  const today = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const addDays = (k, n) => { const [y, m, d] = k.split('-').map(Number); return today(new Date(y, m - 1, d + n)); };

  const QBY = Object.fromEntries(LL.QUESTIONS.map((q) => [q.id, q]));
  const SUBJ = LL.SUBJECTS;
  const ORDER = ['sci', 'his', 'geo', 'phi', 'log'];
  const LANTERN_SUBJ = ['sci', 'his', 'geo', 'phi'];
  const LEITNER = [0, 1, 2, 4, 8, 16];
  const lessonsOf = (s) => LL.LESSONS.filter((l) => l.s === s);
  const WIZ = () => LL.spriteURL('wizard', 'wizard', 96);
  const HERO = () => LL.ASSET_URLS.heroPortrait;

  /* ───────── state ───────── */
  const KEY = 'lanterns-of-lore-v2';
  const fresh = () => ({ v: 3, hero: { lv: 1, xp: 0, hp: 48, mp: 10, tonics: 2 }, lessons: {}, puzzles: {}, lanterns: {}, riddles: {}, codex: {}, stats: {}, gym: { math: 0, pattern: 0, span: 0 }, introDone: false, ended: false });
  let S = fresh();
  const maxHP = () => 40 + S.hero.lv * 8, maxMP = () => 8 + S.hero.lv * 2, xpNext = () => 30 + S.hero.lv * 25;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } };
  const hasSave = () => { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } };
  const loadSave = () => { try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(fresh(), JSON.parse(r)); } catch (e) { /* ignore */ } };
  const litCount = () => LANTERN_SUBJ.filter((s) => S.lanterns[s]).length;
  const stat = (s) => (S.stats[s] = S.stats[s] || { r: 0, w: 0 });
  function gainXP(n) {
    const h = S.hero; let up = false;
    h.xp += n;
    while (h.xp >= xpNext()) { h.xp -= xpNext(); h.lv++; up = true; }
    if (up) { h.hp = maxHP(); h.mp = maxMP(); }
    save(); hud();
    return up ? `Wren reached level ${h.lv}!` : '';
  }
  const learn = (qid, ok) => {
    const e = S.codex[qid];
    if (!e) S.codex[qid] = { box: ok ? 1 : 0, due: addDays(today(), ok ? 1 : 0) };
    else if (!ok) { e.box = 0; e.due = today(); }
  };

  /* progress helpers */
  const lessonDone = (id) => !!S.lessons[id];
  const lessonOpen = (l) => { const ls = lessonsOf(l.s), i = ls.indexOf(l); return i === 0 || lessonDone(ls[i - 1].id); };
  const puzzleOpen = (s) => lessonsOf(s).filter((l) => lessonDone(l.id)).length >= 2;
  const allLessons = (s) => lessonsOf(s).every((l) => lessonDone(l.id));
  const allPuzzles = (s) => LL.TRACKS[s].puzzles.every((p) => S.puzzles[p]);
  const trialOpen = (s) => allLessons(s) && allPuzzles(s);
  const finalOpen = () => litCount() === 4 && allLessons('log') && allPuzzles('log');
  const trackDone = (s) => (s === 'log' ? allLessons('log') && allPuzzles('log') : !!S.lanterns[s]);
  const dueEntries = () => { const t = today(); return Object.keys(S.codex).filter((id) => QBY[id] && S.codex[id].due <= t); };

  /* ───────── shell ───────── */
  let view = null, mode = 'title';
  const app = $('#app');
  function go(fn, ...args) { view = fn; fn.args = args; mode = 'app'; app.innerHTML = ''; fn(...args); window.scrollTo(0, 0); }
  function refresh() { if (view && !view.noRefresh) { const y = window.scrollY; app.innerHTML = ''; view(...(view.args || [])); window.scrollTo(0, y); } }

  function hud() {
    const h = S.hero;
    $('#hud').innerHTML = `
      <button class="hud-hero win" id="hud-status" aria-label="Open Wren’s status">
        <img class="hud-face" src="${HERO()}" alt="">
        <span class="hud-stats">
          <span class="hud-name">Wren <span>Lv ${h.lv}</span></span>
          <span class="bar xp"><i style="width:${(h.xp / xpNext()) * 100}%"></i><b>XP ${h.xp}/${xpNext()}</b></span>
          <span class="hud-sub">Tonics ×${h.tonics}</span>
        </span>
      </button>
      <div class="hud-right">
        <div class="lanterns win" aria-label="${litCount()} of 4 Lanterns of Lore lit">
          ${LANTERN_SUBJ.map((s) => `<span class="lan ${S.lanterns[s] ? 'lit' : ''}" style="--c:${SUBJ[s].color}" title="${SUBJ[s].lantern}${S.lanterns[s] ? ' (lit)' : ''}"></span>`).join('')}
        </div>
        <button class="win menu-btn" id="menu-btn">Menu</button>
      </div>`;
    $('#menu-btn').onclick = () => openMenu('status');
    $('#hud-status').onclick = () => openMenu('status');
  }

  /* ───────── dialogue (story scenes) ───────── */
  let dq = [], dqDone = null, typing = null;
  const PORTRAITS = { Hedda: () => WIZ(), Wren: () => HERO(), Marla: () => LL.spriteURL('person', 'marla', 96, true), 'Vesper Null': () => LL.spriteURL('robed', 'null', 96, true) };
  function say(lines, done) {
    dq = lines.slice(); dqDone = done || null; mode = 'dialog';
    $('#dialog').hidden = false; nextLine();
  }
  function nextLine() {
    if (!dq.length) { $('#dialog').hidden = true; mode = $('#overlay').hidden ? 'app' : 'modal'; const f = dqDone; dqDone = null; if (f) f(); return; }
    const [who, text] = dq.shift();
    const boss = Object.values(LL.ENEMIES).find((e) => e.name === who);
    const src = PORTRAITS[who] ? PORTRAITS[who]() : boss ? LL.spriteURL(boss.sprite, boss.pal, 96) : null;
    $('#d-portrait').innerHTML = src ? `<img src="${src}" alt="">` : ''; $('#d-portrait').hidden = !src;
    $('#d-name').textContent = who || ''; $('#d-name').hidden = !who;
    const el = $('#d-text'); el.textContent = ''; el.classList.toggle('narration', !who); el.dataset.full = text;
    let i = 0; clearInterval(typing);
    typing = setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(typing); typing = null; } }, 16);
  }
  function advance() { if (typing) { clearInterval(typing); typing = null; $('#d-text').textContent = $('#d-text').dataset.full; return; } nextLine(); }
  $('#dialog').addEventListener('click', advance);

  /* ───────── modal windows ───────── */
  function openWin(html) { const o = $('#overlay'); o.innerHTML = html; o.hidden = false; o.scrollTop = 0; mode = 'modal'; }
  function closeWin() { const o = $('#overlay'); o.hidden = true; o.innerHTML = ''; mode = 'app'; hud(); refresh(); }
  function choice(title, options) {
    openWin(`<div class="win small-win"><h2>${esc(title)}</h2><div class="choice-list">
      ${options.map((o, i) => `<button class="cmd" data-i="${i}" ${o.disabled ? 'disabled' : ''}><span>${esc(o.label)}</span>${o.note ? `<small>${esc(o.note)}</small>` : ''}</button>`).join('')}</div></div>`);
    $$('.choice-list .cmd').forEach((b) => b.onclick = () => { const o = options[+b.dataset.i]; closeWin(); o.fn(); });
    $('.choice-list .cmd:not(:disabled)')?.focus();
  }

  /* ───────── Hedda's advice ───────── */
  function nextStep() {
    const due = dueEntries().length;
    if (S.ended) return { text: 'Every Lantern burns. Keep your memory sharp with Recall, and try the Riddle Board if you have not finished it.', act: due ? { label: `Recall ${due} facts`, fn: () => review(true) } : null };
    if (due >= 6) return { text: `${due} facts are ready for Recall. Reviewing them now, just as you start to forget, is what makes them stick.`, act: { label: 'Start Recall', fn: () => review(true) } };
    if (finalOpen()) return { text: 'All four Lanterns burn and your logic is sharp. Vesper Null is at the door. Are you ready for the Final Trial?', act: { label: 'Begin the Final Trial', fn: () => trial('null') } };
    const prog = (s) => lessonsOf(s).filter((l) => lessonDone(l.id)).length + (allPuzzles(s) ? 1 : 0) + (S.lanterns[s] ? 1 : 0);
    const subs = litCount() === 4 ? ['log'] : LANTERN_SUBJ.filter((s) => !S.lanterns[s]);
    const s = subs.sort((a, b) => prog(a) - prog(b) || ORDER.indexOf(a) - ORDER.indexOf(b))[0];
    const l = lessonsOf(s).find((x) => !lessonDone(x.id));
    if (l) return { text: `${l === lessonsOf(s)[0] ? 'Let us begin' : 'Let us continue'} with ${SUBJ[s].name}. Today’s lesson: “${l.title}”.`, act: { label: `${SUBJ[s].name}: ${l.title}`, fn: () => lesson(l) } };
    const p = LL.TRACKS[s].puzzles.find((k) => !S.puzzles[k]);
    if (p) return { text: `You know the ${SUBJ[s].name} lessons. Now show me you can think: solve my ${PUZZLES[p].title}.`, act: { label: `Puzzle: ${PUZZLES[p].title}`, fn: () => openPuzzle(p) } };
    const t = LL.TRACKS[s].trial;
    return { text: `It is time for the ${SUBJ[s].name} Trial. I will summon ${LL.ENEMIES[t].name}. Beat it, and the ${SUBJ[s].lantern} will burn again.`, act: { label: `Trial: ${LL.ENEMIES[t].name}`, fn: () => trial(t) } };
  }

  function wizardBox(text, act, extra = '') {
    return `<section class="wizard win">
      <img class="wiz-face" src="${WIZ()}" alt="Hedda the wizard">
      <div class="wiz-body"><span class="wiz-name">Hedda</span><p>${esc(text)}</p>
      ${act || extra ? `<div class="wiz-acts">${act ? `<button class="cmd go" id="wiz-act">${esc(act.label)}</button>` : ''}${extra}</div>` : ''}</div>
    </section>`;
  }
  const ICONS = {
    sci: '<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/></svg>',
    his: '<svg viewBox="0 0 24 24"><path d="M4 21h16M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6z"/></svg>',
    geo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    phi: '<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 1 4 10.5V16H8v-2.5A6 6 0 0 1 12 3zM9 19h6M10 22h4"/></svg>',
    log: '<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v2"/></svg>'
  };

  /* ───────── HUB ───────── */
  function hub() {
    const ns = nextStep(), due = dueEntries().length;
    const tool = (id, name, note, disabled) => `<button class="tool win" id="t-${id}" ${disabled ? 'disabled' : ''}><span class="tool-name">${name}</span><small>${esc(note)}</small></button>`;
    app.innerHTML = `
      <div class="screen hub">
        <div class="scene"><canvas id="scene" width="700" height="300" role="img" aria-label="Wren and Hedda in the Gilded Lantern, ${litCount()} of 4 Lanterns lit"></canvas></div>
        ${wizardBox(ns.text, ns.act)}
        <section>
          <h2 class="sec-title">Subjects</h2>
          <div class="subjects">
            ${ORDER.map((s) => {
              const ls = lessonsOf(s), done = ls.filter((l) => lessonDone(l.id)).length;
              const state = s === 'log' ? (trackDone('log') ? 'Mastered' : '') : S.lanterns[s] ? 'Lantern lit' : trialOpen(s) ? 'Trial ready' : '';
              return `<button class="subject win ${trackDone(s) ? 'is-done' : ''}" data-s="${s}" style="--c:${SUBJ[s].color}">
                <span class="sub-icon" aria-hidden="true">${ICONS[s]}</span>
                <span class="sub-name">${SUBJ[s].name}</span>
                <span class="sub-blurb">${LL.TRACKS[s].blurb}</span>
                <span class="steps" aria-label="${done} of ${ls.length} lessons done">
                  ${ls.map((l) => `<i class="${lessonDone(l.id) ? 'on' : ''}"></i>`).join('')}
                  ${LL.TRACKS[s].puzzles.map((p) => `<i class="dia ${S.puzzles[p] ? 'on' : ''}"></i>`).join('')}
                  ${s !== 'log' ? `<i class="lamp ${S.lanterns[s] ? 'on' : ''}"></i>` : ''}
                </span>
                <span class="sub-state">${state || `${done} of ${ls.length} lessons`}</span>
              </button>`;
            }).join('')}
          </div>
        </section>
        <section>
          <h2 class="sec-title">Around the tavern</h2>
          <div class="tools">
            ${tool('recall', 'Recall', due ? `${due} facts ready to review` : `${Object.keys(S.codex).length} facts learned`, !Object.keys(S.codex).length)}
            ${tool('riddles', 'Riddle Board', `${Object.keys(S.riddles).length} of 8 solved`)}
            ${tool('training', 'Training', 'Daily mind drills')}
            ${tool('codex', 'Codex', 'Everything you have learned')}
            ${tool('final', 'Final Trial', S.ended ? 'Null is at peace' : finalOpen() ? 'Face Vesper Null' : 'Light all four Lanterns first', !finalOpen() && !S.ended)}
          </div>
        </section>
      </div>`;
    if (ns.act) $('#wiz-act').onclick = ns.act.fn;
    drawScene();
    $$('.subject').forEach((b) => b.onclick = () => go(subject, b.dataset.s));
    $('#t-recall').onclick = () => review(due > 0);
    $('#t-riddles').onclick = () => go(riddleBoard);
    $('#t-training').onclick = trainingMenu;
    $('#t-codex').onclick = () => openMenu('codex');
    $('#t-final').onclick = () => (S.ended ? say([['Vesper Null', 'Thank you, Wren. I am learning again, one lesson at a time.']]) : trial('null'));
  }

  /* the study scene: a crop of the tavern painting, with Wren beside Hedda and the four Lanterns */
  let sceneRaf = 0;
  window.addEventListener('resize', () => { if ($('#scene')) drawScene(); });
  function drawScene() {
    cancelAnimationFrame(sceneRaf);
    const c = $('#scene'); if (!c || !LL.IMG.tavern) return;
    c.width = 700; c.height = Math.max(150, Math.round(700 * c.clientHeight / Math.max(1, c.clientWidth)));
    const H = c.height, sy = 915 - H;          // keep the rug (image y≈880) near the bottom of the frame
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    const frameFn = (now) => {
      if (!document.body.contains(c)) return;
      const t = now / 1000;
      g.drawImage(LL.IMG.tavern, 100, sy, 700, H, 0, 0, 700, H);
      // warm vignette
      const v = g.createRadialGradient(350, H * 0.6, 80, 350, H * 0.6, 420); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,6,10,.55)');
      g.fillStyle = v; g.fillRect(0, 0, 700, H);
      // glow under Hedda (painted on the rug at x≈165)
      const hy = 830 - sy, wy = 882 - sy;
      const hg = g.createRadialGradient(165, hy, 4, 165, hy, 70); hg.addColorStop(0, `rgba(177,140,255,${0.28 + Math.sin(t * 2) * 0.06})`); hg.addColorStop(1, 'rgba(177,140,255,0)');
      g.fillStyle = hg; g.fillRect(90, hy - 75, 150, 150);
      // Wren
      const hero = LL.IMG.hero;
      if (hero) {
        g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(255, wy - 2, 26, 7, 0, 0, 7); g.fill();
        g.save(); g.translate(255, wy + Math.sin(t * 2) * 1.5); g.scale(-2, 2); g.drawImage(hero, -hero.width / 2, -hero.height); g.restore();
      }
      // the four Lanterns of Lore, hanging over the bar
      LANTERN_SUBJ.forEach((s, i) => {
        const x = 380 + i * 62, y = 10 + Math.sin(t * 1.5 + i) * 1.5, lit = S.lanterns[s];
        g.fillStyle = '#2a1e14'; g.fillRect(x - 1, 0, 2, y + 6);
        if (lit) { const gl = g.createRadialGradient(x, y + 34, 2, x, y + 34, 46); gl.addColorStop(0, SUBJ[s].color + 'aa'); gl.addColorStop(1, SUBJ[s].color + '00'); g.fillStyle = gl; g.fillRect(x - 46, y - 12, 92, 92); }
        const spr = LL.sprite('lantern', lit ? 'lanternOn' : 'lanternOff');
        g.drawImage(spr, x - spr.width * 2, y + 6, spr.width * 4, spr.height * 4);
        if (lit) { g.fillStyle = SUBJ[s].color; g.fillRect(x - 6, y + 22, 12, 14); }
      });
      sceneRaf = requestAnimationFrame(frameFn);
    };
    sceneRaf = requestAnimationFrame(frameFn);
  }

  /* ───────── SUBJECT ───────── */
  const SUB_INTRO = {
    sci: 'Science is a way of asking nature questions and listening carefully to the answers.',
    his: 'History is the memory of the whole human family. Null would love for us to lose it.',
    geo: 'Geography is knowing where you are: on a map, on a moving planet, among other people.',
    phi: 'Philosophy is thinking about thinking. It is the best armour against clever nonsense.',
    log: 'Logic is the sword that cuts through every trick. Even Null’s own lock yields to it.'
  };
  function subject(s) {
    const ls = lessonsOf(s), tr = LL.TRACKS[s];
    const steps = [];
    ls.forEach((l, i) => {
      const st = S.lessons[l.id];
      steps.push({ id: 'l-' + l.id, kind: `Lesson ${i + 1}`, title: l.title, state: st ? 'done' : lessonOpen(l) ? 'open' : 'locked',
        note: st ? `${'★'.repeat(st.stars)}${'☆'.repeat(3 - st.stars)} · retake any time` : lessonOpen(l) ? `${l.qs.length} facts, then a short test` : 'Finish the lesson before this one' });
    });
    tr.puzzles.forEach((p) => steps.push({ id: 'p-' + p, kind: 'Puzzle', title: PUZZLES[p].title, state: S.puzzles[p] ? 'done' : puzzleOpen(s) ? 'open' : 'locked',
      note: S.puzzles[p] ? 'Solved · play again any time' : puzzleOpen(s) ? PUZZLES[p].tag : 'Unlocks after lesson 2' }));
    if (tr.trial) {
      const e = LL.ENEMIES[tr.trial];
      steps.push({ id: 't-trial', kind: 'Trial', title: e.name, state: S.lanterns[s] ? 'done' : trialOpen(s) ? 'open' : 'locked',
        note: S.lanterns[s] ? `${SUBJ[s].lantern} lit · fight again for practice` : trialOpen(s) ? `Win to relight the ${SUBJ[s].lantern}` : 'Finish every lesson and the puzzle first' });
    }
    const anyDone = ls.some((l) => lessonDone(l.id));
    app.innerHTML = `<div class="screen" style="--c:${SUBJ[s].color}">
      <button class="back" id="back">← The study</button>
      <header class="sub-head"><span class="sub-icon big" aria-hidden="true">${ICONS[s]}</span><div><p class="eyebrow">${s === 'log' ? 'The key to the Final Trial' : SUBJ[s].lantern}</p><h1>${SUBJ[s].name}</h1></div></header>
      ${wizardBox(SUB_INTRO[s], null, `<button class="cmd" id="revise" ${anyDone ? '' : 'disabled'}>Revision quiz</button><button class="cmd" id="spar" ${anyDone ? '' : 'disabled'}>Spar with an illusion</button>`)}
      <ol class="path">${steps.map((o) => `<li><button class="step win is-${o.state}" ${o.state === 'locked' ? 'disabled' : ''} id="${o.id}">
        <span class="step-kind">${o.kind}</span><span class="step-title">${esc(o.title)}</span><span class="step-note">${esc(o.note)}</span></button></li>`).join('')}</ol>
    </div>`;
    $('#back').onclick = () => go(hub);
    ls.forEach((l) => { $('#l-' + l.id).onclick = () => lesson(l); });
    tr.puzzles.forEach((p) => { $('#p-' + p).onclick = () => openPuzzle(p); });
    if (tr.trial) $('#t-trial').onclick = () => trial(tr.trial);
    $('#spar').onclick = () => spar(s);
    $('#revise').onclick = () => reviseQuiz(s);
  }

  /* ───────── LESSON: teach, then test ───────── */
  function frame(s, label, progress, inner, backFn) {
    app.innerHTML = `<div class="screen lesson" style="--c:${SUBJ[s].color}">
      <div class="lesson-top"><button class="back" id="back">← ${SUBJ[s].name}</button><span class="eyebrow">${esc(label)}</span></div>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress * 100)}"><i style="width:${progress * 100}%"></i></div>
      ${inner}</div>`;
    $('#back').onclick = backFn || (() => go(subject, s));
    window.scrollTo(0, 0);
  }
  function lesson(l) {
    view = lesson; lesson.noRefresh = true; mode = 'app';
    const qs = l.qs.map((id) => QBY[id]), s = l.s, idx = lessonsOf(s).indexOf(l) + 1;
    const total = qs.length * 2 + 1, label = `Lesson ${idx} · ${l.title}`;
    let card = -1;
    const teach = () => {
      const intro = card < 0, q = intro ? null : qs[card];
      frame(s, label, (card + 1) / total, `<article class="teach win">
          <img class="teach-face" src="${WIZ()}" alt="">
          <div class="teach-body">
            <span class="wiz-name">Hedda ${intro ? 'begins' : `· card ${card + 1} of ${qs.length}`}</span>
            ${intro ? `<p class="teach-text">${esc(l.intro)}</p><p class="muted">Read each card carefully. At the end I will test you on every one.</p>`
              : `<p class="teach-text">${esc(q.lore)}</p>`}
          </div>
        </article>
        <div class="lesson-nav">
          <button class="cmd" id="prev" ${intro ? 'disabled' : ''}>Back</button>
          <button class="cmd go" id="next">${card === qs.length - 1 ? 'I’m ready for the test' : intro ? 'Begin' : 'Next card'} <small>Enter</small></button>
        </div>`);
      $('#prev').onclick = () => { card--; teach(); };
      $('#next').onclick = () => { if (card === qs.length - 1) test(); else { card++; teach(); } };
      $('#next').focus({ preventScroll: true });
    };
    const test = () => {
      const queue = shuffle(qs), missed = new Set(); let done = 0;
      const ask = () => {
        if (!queue.length) return finish();
        const q = queue[0], retry = missed.has(q.id);
        frame(s, label, (qs.length + 1 + done) / total, `<article class="quiz win">
            <span class="wiz-name">Hedda asks${retry ? ' again' : ''} · ${done + 1} of ${qs.length}</span>
            <p class="q-text">${esc(q.q)}</p>
            <div id="q-opts" class="q-opts"></div><div id="q-after" class="q-after"></div>
          </article>`);
        answerUI(q, (ok) => {
          learn(q.id, ok); const st = stat(q.s); ok ? st.r++ : st.w++;
          queue.shift();
          if (ok) done++; else { missed.add(q.id); queue.push(q); }
          save();
          $('#q-after').insertAdjacentHTML('beforeend', `<button class="cmd go" id="qn">${ok ? (queue.length ? 'Next question' : 'Finish') : 'Continue'} <small>Enter</small></button>`);
          $('#qn').onclick = ask; $('#qn').focus({ preventScroll: true });
        }, (ok) => ok ? pick(['Exactly right.', 'Yes! You were listening.', 'Correct. Well remembered.']) : 'Not quite. Read this again: I will ask you once more before we finish.');
      };
      const finish = () => {
        const wrong = missed.size, stars = wrong === 0 ? 3 : wrong === 1 ? 2 : 1;
        const prev = S.lessons[l.id], first = !prev;
        S.lessons[l.id] = { stars: Math.max(stars, prev ? prev.stars : 0) };
        const xp = first ? 10 + (qs.length - wrong) * 6 : 5;
        const lvl = gainXP(xp);
        const next = lessonsOf(s)[idx];
        const extras = [];
        if (first && idx === 2) extras.push(`New puzzle: ${PUZZLES[LL.TRACKS[s].puzzles[0]].title}`);
        if (first && !next && trialOpen(s) && LL.TRACKS[s].trial) extras.push('The Trial is ready');
        frame(s, label, 1, `<article class="result win">
            <div class="stars" aria-label="${stars} of 3 stars">${[1, 2, 3].map((i) => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
            <h2>Lesson complete</h2>
            <div class="pw-intro"><img src="${WIZ()}" alt=""><p>${wrong === 0 ? 'Every answer right first time. Splendid work, Wren.' : `${qs.length - wrong} of ${qs.length} right first time. The ones you missed go into Recall, so you will meet them again tomorrow.`}</p></div>
            <p class="muted">+${xp} XP${lvl ? ` · ${lvl}` : ''}${extras.length ? ' · ' + extras.join(' · ') : ''}</p>
            <div class="lesson-nav">
              ${next ? `<button class="cmd go" id="nx">Next lesson: ${esc(next.title)}</button>` : ''}
              <button class="cmd ${next ? '' : 'go'}" id="bk">Back to ${SUBJ[s].name}</button>
            </div>
          </article>`);
        $('#bk').onclick = () => go(subject, s);
        if (next) $('#nx').onclick = () => lesson(next);
        ($('#nx') || $('#bk')).focus({ preventScroll: true });
      };
      ask();
    };
    teach();
  }

  /* shared answer widget: options or a number input, then the verdict and the fact */
  function answerUI(q, onDone, verdictText) {
    const finish = (ok, btn) => {
      $$('#q-opts button, #q-opts input').forEach((b) => (b.disabled = true));
      if (q.o) $$('#q-opts .opt').forEach((b) => { if (+b.dataset.i === q.a) b.classList.add('right'); });
      if (btn && !ok) btn.classList.add('wrong');
      const v = verdictText(ok);
      $('#q-after').innerHTML = `${v ? `<p class="verdict ${ok ? 'good' : 'bad'}">${esc(v)}${ok ? '' : ` The answer is <b>${esc(q.o ? q.o[q.a] : q.a)}</b>.`}</p>` : ''}<div class="lore"><p>${esc(q.lore)}</p></div>`;
      onDone(ok);
    };
    if (q.o) {
      $('#q-opts').innerHTML = shuffle(q.o.map((_, i) => i)).map((i, k) => `<button class="opt" data-i="${i}"><kbd>${k + 1}</kbd>${esc(q.o[i])}</button>`).join('');
      $$('#q-opts .opt').forEach((b) => b.onclick = () => finish(+b.dataset.i === q.a, b));
    } else {
      $('#q-opts').innerHTML = `<form class="num-form" id="nf" autocomplete="off"><input id="nin" inputmode="decimal" aria-label="Your answer" spellcheck="false"><button class="opt" type="submit">Answer</button></form>`;
      $('#nf').onsubmit = (e) => { e.preventDefault(); const v = parseFloat($('#nin').value.replace(/,/g, '').replace(/[^\d.\-]/g, '')); if (!isNaN(v)) finish(Math.abs(v - q.a) < 0.01); };
      setTimeout(() => $('#nin')?.focus({ preventScroll: true }), 30);
    }
  }

  /* revision quiz: 6 questions from this subject's finished lessons */
  function reviseQuiz(s) {
    view = reviseQuiz; reviseQuiz.noRefresh = true; mode = 'app';
    const ids = shuffle(lessonsOf(s).filter((l) => lessonDone(l.id)).flatMap((l) => l.qs)).slice(0, 6);
    let i = 0, right = 0;
    const step = () => {
      if (i >= ids.length) {
        const lvl = gainXP(right * 3);
        frame(s, 'Revision', 1, `<article class="result win"><h2>${right} of ${ids.length}</h2>
          <div class="pw-intro"><img src="${WIZ()}" alt=""><p>${right === ids.length ? 'Flawless. That knowledge is yours now.' : 'The ones you missed are back in Recall for tomorrow.'}</p></div>
          <p class="muted">+${right * 3} XP${lvl ? ' · ' + lvl : ''}</p>
          <div class="lesson-nav"><button class="cmd go" id="again">Another round</button><button class="cmd" id="bk">Back to ${SUBJ[s].name}</button></div></article>`);
        $('#again').onclick = () => reviseQuiz(s); $('#bk').onclick = () => go(subject, s); $('#again').focus();
        return;
      }
      const q = QBY[ids[i]];
      frame(s, `Revision · ${i + 1} of ${ids.length}`, i / ids.length, `<article class="quiz win"><span class="wiz-name">Hedda asks</span><p class="q-text">${esc(q.q)}</p><div id="q-opts" class="q-opts"></div><div id="q-after" class="q-after"></div></article>`);
      answerUI(q, (ok) => {
        if (ok) right++; learn(q.id, ok); const st = stat(q.s); ok ? st.r++ : st.w++; save();
        $('#q-after').insertAdjacentHTML('beforeend', `<button class="cmd go" id="qn">${i === ids.length - 1 ? 'Finish' : 'Next'} <small>Enter</small></button>`);
        $('#qn').onclick = () => { i++; step(); }; $('#qn').focus({ preventScroll: true });
      }, (ok) => ok ? 'Correct.' : 'Not this time.');
    };
    step();
  }

  /* ───────── BATTLES: trials and sparring ───────── */
  let B = null;
  function spar(s) {
    const pool = Object.keys(LL.ENEMIES).filter((k) => !LL.ENEMIES[k].boss && LL.ENEMIES[k].s === s);
    const eid = pick(pool.length ? pool : ['murkSlime']);
    say([['Hedda', `I will conjure an illusion: a ${LL.ENEMIES[eid].name}. It cannot truly hurt you, but answer well!`]], () => battle(eid, false));
  }
  function trial(eid) {
    const e = LL.ENEMIES[eid];
    const pre = e.final ? [['Hedda', 'The door… it is Vesper Null. Stand beside me, Wren. Answer true, and the Murk cannot hold you.']]
      : [['Hedda', `Your Trial. I call forth ${e.name}, a shadow of forgotten ${SUBJ[e.s].name.toLowerCase()}. Defeat it with what you have learned.`]];
    say([...pre, ...e.intro.map((t) => [e.name, t])], () => battle(eid, true));
  }
  function pickQuestion(s, used) {
    const ok = (q) => s === 'mix' || q.s === s;
    let pool = LL.QUESTIONS.filter((q) => ok(q) && !used.has(q.id));
    if (!pool.length) pool = LL.QUESTIONS.filter(ok);
    const weak = pool.filter((q) => !S.codex[q.id] || S.codex[q.id].box <= 1);
    return pick(weak.length && Math.random() < 0.6 ? weak : pool);
  }
  function battle(eid, isTrial) {
    const e = LL.ENEMIES[eid], base = 20 + S.hero.lv * 5;
    S.hero.hp = maxHP(); S.hero.mp = maxMP();
    B = { e, isTrial, base, max: e.hits * base, hp: e.hits * base, used: new Set(), q: null, phase: 'ask', t0: 0, anim: { shake: 0, flash: 0, lunge: 0, hurt: 0 }, raf: 0, clarity: false };
    openWin(`<div class="battle" style="--sc:${SUBJ[e.s] ? SUBJ[e.s].color : '#b18cff'}">
      <div class="stage">
        <canvas id="bstage" width="480" height="220"></canvas>
        <div class="enemy-plate win"><span class="ename">${esc(e.name)}</span><span class="subj">${e.s === 'mix' ? 'Every subject' : SUBJ[e.s].name} · ${isTrial ? 'Trial' : 'Illusion'}</span>
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
        <div class="party win"><img src="${HERO()}" alt="">
          <div class="hud-stats"><div class="hud-name">Wren <span>Lv ${S.hero.lv}</span></div>
            <div class="bar hp"><i id="bhp"></i><b id="bhp-t"></b></div><div class="bar mp"><i id="bmp"></i><b id="bmp-t"></b></div></div></div>
        <div class="cmds">
          <button class="cmd" id="c-clarity">Clarity <small>3 MP · remove wrong answers</small></button>
          <button class="cmd" id="c-mend">Mend <small>4 MP · heal 40%</small></button>
          <button class="cmd" id="c-tonic">Tonic <small id="tonic-n"></small></button>
          <button class="cmd" id="c-flee">${isTrial ? 'Withdraw' : 'End spar'} <small>leave the fight</small></button>
        </div>
      </div></div>`);
    mode = 'battle';
    $('#c-clarity').onclick = () => {
      if (S.hero.mp < 3) return; S.hero.mp -= 3; B.clarity = true;
      if (B.q.o) shuffle($$('#q-opts .opt').filter((b) => +b.dataset.i !== B.q.a && !b.disabled)).slice(0, B.q.o.length > 3 ? 2 : 1).forEach((b) => { b.disabled = true; b.classList.add('struck'); });
      else $('#q-after').innerHTML = `<p class="hint">Clarity: the answer is between ${Math.max(0, Math.floor(B.q.a * 0.5))} and ${Math.ceil(B.q.a * 1.6) + 2}.</p>`;
      fx('Clarity!', 'heal', 75, 40); bars();
    };
    $('#c-mend').onclick = () => { S.hero.mp -= 4; heal(Math.round(maxHP() * 0.4)); };
    $('#c-tonic').onclick = () => { S.hero.tonics--; heal(Math.round(maxHP() * 0.6)); hud(); };
    $('#c-flee').onclick = () => endBattle('flee');
    loop(); ask();
  }
  function heal(n) { const h = S.hero, b = h.hp; h.hp = Math.min(maxHP(), h.hp + n); fx(`+${h.hp - b}`, 'heal', 78, 45); bars(); save(); }
  function bars() {
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
  function ask() {
    const q = pickQuestion(B.e.s, B.used); B.used.add(q.id);
    Object.assign(B, { q, phase: 'ask', clarity: false, t0: performance.now() });
    $('#q-subj').textContent = SUBJ[q.s].name; $('#q-subj').style.color = SUBJ[q.s].color;
    $('#q-text').textContent = q.q; $('#q-after').innerHTML = '';
    answerUI(q, resolve, () => '');
    bars();
  }
  function resolve(ok) {
    B.phase = 'after';
    const q = B.q, secs = (performance.now() - B.t0) / 1000, h = S.hero, st = stat(q.s), firstTime = !S.codex[q.id];
    learn(q.id, ok);
    let msg;
    if (ok) {
      st.r++;
      const crit = secs < 12 && !B.clarity, dmg = Math.round(B.base * (crit ? 1.5 : 1));
      B.hp -= dmg; Object.assign(B.anim, { lunge: 1, flash: 1, shake: 0.6 });
      fx(crit ? `${dmg}!` : `${dmg}`, crit ? 'crit' : 'dmg', 30, 40);
      msg = `<p class="verdict good">${crit ? 'Swift strike!' : 'Correct!'} Wren deals ${dmg} damage.</p>`;
    } else {
      st.w++;
      const dmg = B.e.atk + rand(-1, 3);
      h.hp = Math.max(0, h.hp - dmg); Object.assign(B.anim, { hurt: 1, shake: 1 });
      fx(`-${dmg}`, 'hurt', 78, 45);
      msg = `<p class="verdict bad">Not quite. The answer is <b>${esc(q.o ? q.o[q.a] : q.a)}</b>. ${esc(B.e.name)} strikes for ${dmg}.</p>`;
    }
    $('#q-after').innerHTML = `${msg}<div class="lore">${firstTime ? '<span>New Codex entry</span>' : ''}<p>${esc(q.lore)}</p></div>
      <button class="cmd go" id="b-next">${B.hp <= 0 ? 'Victory!' : h.hp <= 0 ? 'Continue' : 'Next question'} <small>Enter</small></button>`;
    $('#b-next').onclick = () => (B.hp <= 0 ? endBattle('win') : h.hp <= 0 ? endBattle('lose') : ask());
    $('#b-next').focus({ preventScroll: true });
    bars(); save();
  }
  function fx(t, cls, x, y) { const f = $('#fx'); if (!f) return; const el = document.createElement('span'); el.className = 'fx ' + cls; el.textContent = t; el.style.left = x + '%'; el.style.top = y + '%'; f.appendChild(el); setTimeout(() => el.remove(), 1100); }
  function loop() {
    const c = $('#bstage'); if (!c || !B) return;
    const g = c.getContext('2d'), e = B.e, an = B.anim, t = performance.now() / 1000;
    g.imageSmoothingEnabled = false;
    const col = SUBJ[e.s] ? SUBJ[e.s].color : '#b18cff';
    const bg = g.createLinearGradient(0, 0, 0, 220); bg.addColorStop(0, '#120c0a'); bg.addColorStop(1, LL.shade(col, -0.75));
    g.fillStyle = bg; g.fillRect(0, 0, 480, 220);
    if (LL.IMG.tavern) { g.globalAlpha = 0.25; g.drawImage(LL.IMG.tavern, 120, 420, 800, 380, 0, 0, 480, 228); g.globalAlpha = 1; }
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,220,160,${0.12 + 0.12 * Math.sin(t * 2 + i)})`; g.fillRect((i * 97) % 480, (i * 53) % 140, 2, 2); }
    g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(240, 190, 230, 28, 0, 0, 7); g.fill();
    const sx = (Math.random() - 0.5) * 10 * an.shake;
    const spr = LL.sprite(e.sprite, e.pal), sc = e.boss ? 9 : 7;
    const lungeE = an.hurt > 0 ? Math.sin(an.hurt * Math.PI) * 60 : 0;
    g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(140 + lungeE, 192, 50, 10, 0, 0, 7); g.fill();
    if (B.hp <= 0 && B.phase !== 'ask') g.globalAlpha = Math.max(0, 1 - (B.fade = (B.fade || 0) + 0.03));
    if (an.flash > 0.5) g.filter = 'brightness(3)';
    g.drawImage(spr, 140 + lungeE + sx - spr.width * sc / 2, 192 + Math.sin(t * 2.5) * 4 - spr.height * sc, spr.width * sc, spr.height * sc);
    g.filter = 'none'; g.globalAlpha = 1;
    const hi = LL.IMG.heroBattle, hs = 1.5, lunge = an.lunge > 0 ? Math.sin(an.lunge * Math.PI) * 90 : 0;
    if (hi) {
      if (an.hurt > 0.5) g.filter = 'brightness(0.6) sepia(1) hue-rotate(-50deg) saturate(5)';
      g.save(); g.translate(370 - lunge + (an.hurt > 0 ? sx : 0), 196 + Math.sin(t * 2) * 2); g.scale(-1, 1);
      g.drawImage(hi, -hi.width * hs / 2, -hi.height * hs, hi.width * hs, hi.height * hs); g.restore(); g.filter = 'none';
    }
    const sw = $('#swift'); if (sw) sw.style.width = B.phase === 'ask' && !B.clarity ? Math.max(0, 100 - ((performance.now() - B.t0) / 12000) * 100) + '%' : '0%';
    ['shake', 'flash', 'lunge', 'hurt'].forEach((k) => (an[k] = Math.max(0, an[k] - 0.035)));
    B.raf = requestAnimationFrame(loop);
  }
  function endBattle(result) {
    cancelAnimationFrame(B.raf);
    const { e, isTrial } = B, h = S.hero;
    if (result !== 'win') {
      B = null; h.hp = maxHP(); h.mp = maxMP(); save(); closeWin();
      return say(result === 'lose'
        ? [['Hedda', 'Enough. The shadow fades. Do not hang your head, Wren: every answer you missed is now in your Codex, waiting for Recall.'], ['Hedda', 'Revise, then try again. You may retake a Trial as often as you need.']]
        : [['Hedda', 'Wise to step back and regroup. Come back when you are ready.']]);
    }
    B.phase = 'result';
    const lines = [`Gained ${e.xp} experience.`];
    if (!e.boss && Math.random() < 0.3) { h.tonics++; lines.push('Hedda hands you a Tonic.'); }
    const lvl = gainXP(e.xp); if (lvl) lines.push(lvl);
    $('.bwin').innerHTML = `<h2 class="victory">Victory</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}<button class="cmd go" id="b-done">Continue <small>Enter</small></button>`;
    $('#b-done').focus({ preventScroll: true });
    $('#b-done').onclick = () => {
      B = null; h.hp = maxHP(); h.mp = maxMP(); save(); closeWin();
      if (!isTrial) return;
      if (e.final) { S.ended = true; save(); hud(); return say([[e.name, e.defeat], ...LL.STORY.ending], () => go(hub)); }
      const s = e.s, first = !S.lanterns[s];
      S.lanterns[s] = true; save(); hud();
      const after = [[e.name, e.defeat]];
      if (first) { after.push(...LL.STORY.lanternLit(SUBJ[s].lantern)); if (litCount() === 4) after.push(...LL.STORY.allLit); }
      say(after, () => go(hub));
    };
  }

  /* ───────── PUZZLES ───────── */
  const PUZZLES = {
    jugs: { title: 'The Alchemist’s Flasks', tag: 'Measure exactly 4 with a 5 and a 3', prompt: 'Hedda sets two empty flasks on the bar: one holds 5 measures, the other 3. Neither has markings. “Pour me exactly 4 measures in the large flask.”',
      hints: ['Fill the 5 and pour into the 3. What is left in the 5?', 'Keep that 2 in the small flask, then fill the 5 again.', 'Top up the small flask from the full 5. It only takes 1.'],
      lesson: 'Reusing what is left over, and working backwards from the goal, solves many measuring and planning problems.' },
    hanoi: { title: 'The Tower of Ages', tag: 'Move a 4-disk tower in 15 moves', prompt: '“Move the whole tower from the left post to the right post. Only the top disk may move, and a disk may never sit on a smaller one.”',
      hints: ['To move the biggest disk, the other three must be on the middle post.', 'Moving 3 disks works the same way: first move the top 2 aside.', 'The smallest disk moves every other turn, always in the same direction around the posts.'],
      lesson: 'This is recursion: solve a big problem by solving a smaller copy of it. A tower of n disks needs 2ⁿ − 1 moves. Édouard Lucas invented the puzzle in 1883.' },
    river: { title: 'The Ferry Problem', tag: 'Fox, goose and grain across a river', prompt: '“Ferry a fox, a goose and a sack of grain across the river. The boat holds you and one passenger. Left alone, the fox eats the goose, and the goose eats the grain.”',
      hints: ['There is only one safe first move.', 'Nothing stops you bringing a passenger back again.', 'Take the goose first. Later, bring the goose back to swap it for something else.'],
      lesson: 'Sometimes progress means stepping backwards. This puzzle appears in a collection from around 800 CE attributed to Alcuin of York.' },
    lights: { title: 'The Lantern Ring', tag: 'Light all nine lanterns', prompt: '“Light every lantern. Touching one switches it and the lanterns directly above, below, left and right of it.”',
      hints: ['Pressing a lantern twice undoes it, so each needs pressing at most once.', 'The order of presses doesn’t matter, only which ones you press.', 'Press the top-left, centre and bottom-right lanterns once each.'],
      lesson: 'When order does not matter and doing something twice undoes it, the only question is which moves to make.' },
    magic: { title: 'The Square of Fifteen', tag: 'Every line adds to 15', prompt: '“Fill the grid with the numbers 1 to 9, each used once, so that every row, column and diagonal adds to 15.”',
      hints: ['Opposite cells through the centre must add to 10.', 'Even numbers go in the corners, odd numbers on the edges.', 'One answer: 4 9 2 / 3 5 7 / 8 1 6.'],
      lesson: 'This is the Lo Shu square of ancient Chinese legend. Every 3×3 magic square is a rotation or reflection of it.' },
    lock: { title: 'Null’s Lock', tag: 'Crack a 3-digit code from clues', prompt: 'A 3-digit lock taken from Null’s tower. Scratched beside it:\n\n6 8 2   one digit right, in the right place\n6 1 4   one digit right, wrong place\n2 0 6   two digits right, wrong places\n7 3 8   nothing is right\n7 8 0   one digit right, wrong place',
      hints: ['7, 3 and 8 are not in the code.', 'From 7 8 0, the 0 is in the code but not last. From 6 8 2, either 6 or 2 is right and in place.', '6 cannot be first (614 says wrong place), so 2 is last. Then 0 is first, and 4 fills the middle.'],
      lesson: 'Start with the clue that rules out the most. Each elimination shrinks the search far faster than guessing.' }
  };

  function openPuzzle(key) {
    const P = PUZZLES[key]; let hints = 0;
    openWin(`<div class="win puzzle-win"><div class="pw-head"><h2>${esc(P.title)}</h2><button class="cmd small" data-close>Leave</button></div>
      <div class="pw-intro"><img src="${WIZ()}" alt=""><p class="pw-prompt">${esc(P.prompt)}</p></div>
      <div id="play" class="play"></div><p id="pfb" class="pfb" role="status"></p>
      <div class="pw-foot"><button class="cmd small" id="phint">Ask Hedda for a hint (3 left)</button></div><div id="phints"></div></div>`);
    $('[data-close]').onclick = closeWin;
    $('#phint').onclick = () => {
      if (hints >= 3) return; hints++;
      $('#phints').innerHTML = P.hints.slice(0, hints).map((h) => `<p class="hint"><b>Hedda:</b> ${esc(h)}</p>`).join('');
      $('#phint').textContent = hints >= 3 ? 'No more hints' : `Ask Hedda for a hint (${3 - hints} left)`; $('#phint').disabled = hints >= 3;
    };
    const ctx = {
      play: $('#play'),
      feedback: (t, cls = '') => { $('#pfb').textContent = t; $('#pfb').className = 'pfb ' + cls; },
      solve: (msg) => {
        const first = !S.puzzles[key]; S.puzzles[key] = true;
        let lvl = ''; if (first) { S.hero.tonics++; lvl = gainXP(30); }
        save();
        setTimeout(() => {
          openWin(`<div class="win puzzle-win"><h2>Solved!</h2>${msg ? `<p><b>${esc(msg)}</b></p>` : ''}
            <div class="pw-intro"><img src="${WIZ()}" alt=""><p>${esc(P.lesson)}</p></div>
            <p class="muted">${first ? `+30 XP and a Tonic${lvl ? ' · ' + lvl : ''}` : 'Solved again, for the joy of it.'}</p>
            <div class="pw-foot"><button class="cmd go" data-close>Continue</button></div></div>`);
          $('[data-close]').onclick = closeWin; $('[data-close]').focus();
        }, 600);
      }
    };
    ({ jugs: playJugs, hanoi: playHanoi, river: playRiver, lights: playLights, magic: playMagic, lock: playLock })[key](ctx);
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
      if (pegs[2].length === n) solve(moves === min ? 'A perfect 15 moves!' : `Done in ${moves} moves. The minimum is 15.`);
    };
    reset();
  }
  function playLights({ play, solve }) {
    const N = 3; let grid, count;
    const tog = (gr, i) => { const r = Math.floor(i / N), c = i % N; [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const rr = r + a, cc = c + b; if (rr >= 0 && rr < N && cc >= 0 && cc < N) gr[rr * N + cc] = !gr[rr * N + cc]; }); };
    const reset = () => { grid = Array(9).fill(true); [0, 4, 8].forEach((i) => tog(grid, i)); count = 0; draw(); };
    const draw = () => {
      play.innerHTML = `<div class="lights">${grid.map((on, i) => `<button class="lamp ${on ? 'on' : ''}" data-i="${i}" aria-label="Lantern ${i + 1}, ${on ? 'lit' : 'dark'}"></button>`).join('')}</div>
        <div class="pbar"><span>Touches: ${count} · Lit ${grid.filter(Boolean).length}/9</span><button class="cmd small" id="reset">Start over</button></div>`;
      $$('.lamp', play).forEach((b) => b.onclick = () => { tog(grid, +b.dataset.i); count++; draw(); if (grid.every(Boolean)) solve(count <= 3 ? 'Lit in 3 touches, the fewest possible.' : `Lit in ${count} touches. It can be done in 3.`); });
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
        <div class="pbar"><span>Crossings: ${trips} · Tap a passenger, then Cross</span><span class="row"><button class="cmd small go" id="cross">Cross</button><button class="cmd small" id="reset">Start over</button></span></div>`;
      $$('.tok[data-k]', play).forEach((b) => b.onclick = () => { pas = pas === b.dataset.k ? null : b.dataset.k; draw(); });
      $('#cross').onclick = cross; $('#reset').onclick = reset;
    };
    const cross = () => {
      const to = side.you === 'L' ? 'R' : 'L'; side.you = to; if (pas) side[pas] = to; pas = null; trips++;
      const left = to === 'L' ? 'R' : 'L', alone = (k) => side[k] === left;
      if (alone('fox') && alone('goose')) { feedback('The fox ate the goose! Everyone is back at the start.', 'bad'); return reset(); }
      if (alone('goose') && alone('grain')) { feedback('The goose ate the grain! Everyone is back at the start.', 'bad'); return reset(); }
      feedback(''); draw();
      if (['you', 'fox', 'goose', 'grain'].every((k) => side[k] === 'R')) solve(trips === 7 ? 'Seven crossings, the minimum.' : `Done in ${trips} crossings. The minimum is 7.`);
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
      steps++; draw(); if (A === 4) solve(steps <= 6 ? 'Six steps, the fewest possible.' : `Done in ${steps} steps. It can be done in 6.`);
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
    $('#lockf').onsubmit = (e) => { e.preventDefault(); $('#lock-in').value.replace(/\D/g, '') === '042' ? solve() : feedback('The lock doesn’t budge.', 'bad'); };
    setTimeout(() => $('#lock-in').focus(), 30);
  }

  /* ───────── RIDDLE BOARD ───────── */
  function riddleBoard() {
    const keys = Object.keys(LL.RIDDLES);
    app.innerHTML = `<div class="screen" style="--c:#f0b44c">
      <button class="back" id="back">← The study</button>
      <header class="sub-head"><div><p class="eyebrow">Pinned up by the tavern regulars</p><h1>Riddle Board</h1></div></header>
      ${wizardBox('The regulars pin riddles here to test each other. They look simple. They are not. Each one you crack earns a Tonic.', null)}
      <div class="riddles">${keys.map((k, i) => `<button class="riddle win ${S.riddles[k] ? 'is-done' : ''}" data-k="${k}">
          <span class="step-kind">No. ${i + 1} · from ${LL.RIDDLE_GIVERS[k]}</span><span class="riddle-q">${esc(LL.RIDDLES[k].q)}</span><span class="step-note">${S.riddles[k] ? 'Solved' : 'Unsolved'}</span></button>`).join('')}</div></div>`;
    $('#back').onclick = () => go(hub);
    $$('.riddle').forEach((b) => b.onclick = () => openRiddle(b.dataset.k));
  }
  function openRiddle(k) {
    const r = LL.RIDDLES[k], who = LL.RIDDLE_GIVERS[k];
    openWin(`<div class="win puzzle-win"><div class="pw-head"><h2>${esc(who)}’s riddle</h2><button class="cmd small" data-close>Back</button></div>
      <p class="pw-prompt">${esc(r.q)}</p>
      <form class="num-form" id="rf" autocomplete="off"><input id="r-in" aria-label="Your answer" spellcheck="false"><button class="cmd go" type="submit">Answer</button></form>
      <p id="pfb" class="pfb" role="status"></p><div class="pw-foot"><button class="cmd small" id="rhint">Ask Hedda for a hint</button></div><div id="phints"></div></div>`);
    $('[data-close]').onclick = closeWin;
    $('#rhint').onclick = () => { $('#phints').innerHTML = `<p class="hint"><b>Hedda:</b> ${esc(r.hint)}</p>`; };
    $('#rf').onsubmit = (e) => {
      e.preventDefault();
      const v = $('#r-in').value.toLowerCase().replace(/[\s.,'"!?-]/g, '').replace(/^(the|a)/, '');
      if (r.a.includes(v)) {
        const first = !S.riddles[k]; S.riddles[k] = true;
        let lvl = ''; if (first) { S.hero.tonics++; lvl = gainXP(20); }
        save();
        openWin(`<div class="win puzzle-win"><h2>Solved!</h2><div class="pw-intro"><img src="${WIZ()}" alt=""><p>${esc(r.lore)}</p></div>
          <p class="muted">${first ? `+20 XP and a Tonic${lvl ? ' · ' + lvl : ''}` : 'Solved again.'}</p><div class="pw-foot"><button class="cmd go" data-close>Continue</button></div></div>`);
        $('[data-close]').onclick = closeWin; $('[data-close]').focus();
      } else { $('#pfb').textContent = 'Not quite. Think it over.'; $('#pfb').className = 'pfb bad'; $('#r-in').select(); }
    };
    setTimeout(() => $('#r-in').focus(), 30);
  }

  /* ───────── RECALL (spaced repetition) ───────── */
  function review(due) {
    const ids = due ? shuffle(dueEntries()).slice(0, 8) : shuffle(Object.keys(S.codex).filter((id) => QBY[id])).slice(0, 5);
    if (!ids.length) return say([['Hedda', 'Nothing to recall yet. Take a lesson first.']]);
    let i = 0, right = 0;
    const step = () => {
      if (i >= ids.length) {
        const lvl = gainXP(right * 4);
        openWin(`<div class="win puzzle-win"><h2>Recall complete</h2><div class="pw-intro"><img src="${WIZ()}" alt=""><p>${right} of ${ids.length} remembered. ${due ? 'Facts you remembered come back after a longer gap: 1, 2, 4, 8, then 16 days. Missed ones return tomorrow.' : 'Practice rounds don’t change your review schedule.'}</p></div>
          <p class="muted">+${right * 4} XP${lvl ? ' · ' + lvl : ''}</p><div class="pw-foot"><button class="cmd go" data-close>Done</button></div></div>`);
        $('[data-close]').onclick = closeWin; $('[data-close]').focus();
        return;
      }
      const q = QBY[ids[i]];
      openWin(`<div class="win puzzle-win"><div class="pw-head"><h2>Recall · ${i + 1} of ${ids.length}</h2><button class="cmd small" data-close>Stop</button></div>
        <span class="q-subj" style="color:${SUBJ[q.s].color}">${SUBJ[q.s].name}</span><p class="q-text">${esc(q.q)}</p><div id="q-opts" class="q-opts"></div><div id="q-after" class="q-after"></div></div>`);
      $('[data-close]').onclick = closeWin;
      answerUI(q, (ok) => {
        if (ok) right++;
        if (due) { const e = S.codex[q.id]; e.box = ok ? Math.min(5, e.box + 1) : 0; e.due = addDays(today(), ok ? LEITNER[e.box] : 1); save(); }
        $('#q-after').insertAdjacentHTML('beforeend', `<button class="cmd go" id="rn">${i === ids.length - 1 ? 'Finish' : 'Next'} <small>Enter</small></button>`);
        $('#rn').onclick = () => { i++; step(); }; $('#rn').focus();
      }, (ok) => ok ? 'Remembered!' : 'Forgotten. It will come back tomorrow.');
    };
    step();
  }

  /* ───────── TRAINING ───────── */
  function trainingMenu() {
    choice('Training', [
      { label: 'Quick Maths', note: `60 seconds of mental arithmetic · best ${S.gym.math}`, fn: drillMath },
      { label: 'Number Patterns', note: `Find the rule in 6 sequences · best ${S.gym.pattern}/6`, fn: drillPattern },
      { label: 'Digit Span', note: `Working memory · best ${S.gym.span} digits`, fn: drillSpan },
      { label: 'Back', fn: () => {} }
    ]);
  }
  function drillDone(key, score, text) {
    const rec = score > S.gym[key]; if (rec) S.gym[key] = score;
    const lvl = gainXP(score * 2);
    openWin(`<div class="win puzzle-win"><h2>${esc(text)}</h2><p>${rec && score ? 'A new personal best!' : `Your best is ${S.gym[key]}.`} +${score * 2} XP${lvl ? ' · ' + lvl : ''}</p>
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
    const timer = setInterval(() => { left--; if (!$('#dt')) return clearInterval(timer); $('#dt').textContent = left; if (left <= 0) { clearInterval(timer); drillDone('math', score, `${score} correct in 60 seconds`); } }, 1000);
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
      const showD = () => {
        const el = $('#dd'); if (!el) return;
        if (k >= d.length) {
          el.textContent = 'Type the digits in order';
          $('#da').innerHTML = `<form class="num-form" id="df" autocomplete="off"><input id="din" inputmode="numeric" aria-label="Digits"><button class="cmd go" type="submit">Submit</button></form>`; $('#din').focus();
          $('#df').onsubmit = (e) => { e.preventDefault(); if ($('#din').value.replace(/\D/g, '') === d.join('')) { best = len; len++; round(); } else drillDone('span', best, `Longest span: ${best} digits (the last was ${d.join(' ')})`); };
          return;
        }
        el.textContent = d[k++]; setTimeout(() => { if ($('#dd')) $('#dd').textContent = ''; setTimeout(showD, 200); }, 800);
      };
      setTimeout(showD, 700);
    };
    round();
  }

  /* ───────── MENU: status / codex / help ───────── */
  function openMenu(tab) {
    const h = S.hero, tabs = [['status', 'Status'], ['codex', 'Codex'], ['help', 'How to play']];
    let body = '';
    if (tab === 'status') {
      const subj = ORDER.map((s) => {
        const all = LL.QUESTIONS.filter((q) => q.s === s), known = all.filter((q) => S.codex[q.id] && S.codex[q.id].box > 0).length, st = stat(s);
        return `<div class="skill"><div class="skill-top"><span style="color:${SUBJ[s].color}">${SUBJ[s].name}</span><small>${known}/${all.length} learned · ${st.r + st.w ? Math.round((st.r / (st.r + st.w)) * 100) + '% accuracy' : 'not started'}</small></div>
          <div class="bar"><i style="width:${(known / all.length) * 100}%;background:${SUBJ[s].color}"></i></div></div>`;
      }).join('');
      body = `<div class="status"><img class="status-art" src="${LL.ASSET_URLS.heroBattle}" alt="Wren, Hedda’s apprentice">
        <div class="status-info"><h3>Wren <span>Level ${h.lv} Apprentice</span></h3>
          <div class="bar hp"><i style="width:100%"></i><b>HP ${maxHP()}</b></div><div class="bar mp"><i style="width:100%"></i><b>MP ${maxMP()}</b></div>
          <div class="bar xp"><i style="width:${(h.xp / xpNext()) * 100}%"></i><b>XP ${h.xp}/${xpNext()}</b></div>
          <p class="muted">Tonics ${h.tonics} · Lessons ${Object.keys(S.lessons).length}/${LL.LESSONS.length} · Puzzles ${Object.keys(S.puzzles).length}/6 · Riddles ${Object.keys(S.riddles).length}/8 · Lanterns ${litCount()}/4</p>
          <h4>Knowledge</h4>${subj}</div></div>`;
    } else if (tab === 'codex') {
      const ids = Object.keys(S.codex).filter((id) => QBY[id]);
      body = ids.length ? `<p class="muted">${ids.length} of ${LL.QUESTIONS.length} facts. The bars show how firmly each one is remembered; Recall strengthens them.</p>
        ${ORDER.map((s) => ({ s, items: ids.filter((id) => QBY[id].s === s) })).filter((x) => x.items.length).map(({ s, items }) => `<h4 style="color:${SUBJ[s].color}">${SUBJ[s].name}</h4><div class="codex">${items.map((id) => { const e = S.codex[id]; return `<article class="entry"><p>${esc(QBY[id].lore)}</p><span class="pips" aria-label="Memory ${e.box} of 5">${[1, 2, 3, 4, 5].map((b) => `<i class="${b <= e.box ? 'on' : ''}"></i>`).join('')}</span></article>`; }).join('')}</div>`).join('')}`
        : '<p class="muted">The Codex is empty. Every fact Hedda teaches you is written here.</p>';
    } else {
      body = `<div class="help">
        <h4>Lessons</h4><p>Hedda teaches each subject in four short lessons. Read the cards, then answer her questions. Anything you miss comes back before the lesson ends.</p>
        <h4>Puzzles</h4><p>Each subject has a puzzle that unlocks after lesson 2. Logic has two. Ask Hedda for hints if you’re stuck.</p>
        <h4>Trials</h4><p>Finish a subject’s lessons and puzzle, then win its Trial to relight its Lantern. In battle, a right answer strikes; answer before the gold bar runs out for a <b>swift strike</b> worth 50% more. A wrong answer lets the shadow hit you. <b>Clarity</b> removes wrong choices, and <b>Mend</b> and <b>Tonics</b> heal. You can retake a Trial as often as you like.</p>
        <h4>Recall</h4><p>Everything you learn goes into your Codex. Recall asks it again after 1, 2, 4, 8 and 16 days. This is spaced repetition, one of the best-tested ways to remember.</p>
        <h4>Keys</h4><p>1–4 choose an answer. Enter continues. M opens this menu. Esc closes windows.</p>
        <div class="danger" id="dz"><button class="cmd small" id="reset-ask">Start a new game</button></div></div>`;
    }
    openWin(`<div class="win menu-win"><div class="pw-head"><nav class="tabs">${tabs.map(([k, l]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</nav><button class="cmd small" data-close>Close</button></div><div class="menu-body">${body}</div></div>`);
    $$('[data-tab]').forEach((b) => b.onclick = () => openMenu(b.dataset.tab));
    $('[data-close]').onclick = closeWin;
    const ra = $('#reset-ask');
    if (ra) ra.onclick = () => {
      $('#dz').innerHTML = '<p>This erases your progress in this browser. It can’t be undone.</p><button class="cmd small danger-btn" id="reset-yes">Erase and restart</button> <button class="cmd small" id="reset-no">Keep playing</button>';
      $('#reset-yes').onclick = () => { S = fresh(); save(); closeWin(); go(hub); say(LL.STORY.intro, () => { S.introDone = true; save(); go(hub); }); };
      $('#reset-no').onclick = () => openMenu('help');
    };
  }

  /* ───────── keyboard ───────── */
  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (mode === 'dialog') { if (k === 'Enter' || k === ' ') { e.preventDefault(); advance(); } return; }
    if (e.target.matches && e.target.matches('input')) return;
    if (/^[1-4]$/.test(k)) { const b = $$('#q-opts .opt')[+k - 1]; if (b && !b.disabled) { b.click(); e.preventDefault(); } return; }
    if (k === 'Enter') {
      const btn = $('#b-done') || $('#b-next') || $('#qn') || $('#rn') || $('#pn') || $('#next');
      if (btn && document.activeElement !== btn) { e.preventDefault(); btn.click(); }
    }
    if (k === 'Escape' && mode === 'modal') { const c = $('#overlay [data-close]'); if (c) c.click(); }
    if ((k === 'm' || k === 'M') && mode === 'app') openMenu('status');
  });

  /* ───────── title & boot ───────── */
  function start(isNew) {
    $('#title').hidden = true;
    if (isNew) S = fresh(); else loadSave();
    document.body.classList.add('playing');
    hud(); $('#hud').hidden = false;
    go(hub);
    if (!S.introDone) say(LL.STORY.intro, () => { S.introDone = true; save(); go(hub); });
  }
  function boot() {
    LL.loadAssets().then(() => {
      document.body.style.setProperty('--tavern', `url("${new URL(LL.ASSET_URLS.tavern, location.href).href}")`);
      $('#title').hidden = false;
      $('#continue').hidden = !hasSave();
      $('#newgame').onclick = () => start(true);
      $('#continue').onclick = () => start(false);
      ($('#continue').hidden ? $('#newgame') : $('#continue')).focus();
    });
    window.claude?.hot?.snapshot?.(() => ({ state: S }));
  }
  const hot = window.claude?.hot;
  if (hot?.ready) hot.ready((d) => { if (d && d.state) { try { localStorage.setItem(KEY, JSON.stringify(d.state)); } catch (e) { S = Object.assign(fresh(), d.state); } } boot(); });
  else boot();

  LL.debug = { get S() { return S; }, go, hub, subject, lesson, openPuzzle, trial, battle, review, riddleBoard, PUZZLES };
})();
