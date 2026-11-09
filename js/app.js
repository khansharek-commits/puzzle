/* Atlas of Riddles — game engine and UI (vanilla JS, no build step). */
(function () {
  'use strict';

  const { CHAPTERS, PUZZLES, CATEGORIES, RANKS } = window.ATLAS;
  const STORE_KEY = 'atlas-of-riddles-v1';
  const UNLOCK_NEEDED = 4;           // puzzles solved in a chapter to open the next
  const START_TOKENS = 5;
  const LEITNER_DAYS = [1, 2, 4, 8, 16];

  /* ───────── utilities ───────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pad2 = (n) => String(n).padStart(2, '0');
  const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return todayKey(new Date(y, m - 1, d + n)); };
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const byId = (id) => PUZZLES.find((p) => p.id === id);
  const chapterOf = (id) => CHAPTERS.find((c) => c.id === id);
  const puzzlesIn = (chId) => PUZZLES.filter((p) => p.chapter === chId);
  const fmtCoord = (lat, lon) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

  /* ───────── state ───────── */
  const freshState = () => ({
    v: 1, tokens: START_TOKENS, solved: {}, attempts: {}, introSeen: {}, notes: {},
    gym: { math: 0, pattern: 0, span: 0 }, days: []
  });
  let S = freshState();

  function load(hotData) {
    if (hotData && hotData.state) { S = Object.assign(freshState(), hotData.state); return; }
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) S = Object.assign(freshState(), JSON.parse(raw));
    } catch (e) { /* storage unavailable: play in memory */ }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }
  function markActive() {
    const t = todayKey();
    if (!S.days.includes(t)) { S.days.push(t); S.days = S.days.slice(-400); }
  }
  function streak() {
    const set = new Set(S.days);
    let d = todayKey();
    if (!set.has(d)) d = addDays(d, -1);
    let n = 0;
    while (set.has(d)) { n++; d = addDays(d, -1); }
    return n;
  }
  const insight = () => Object.values(S.solved).reduce((s, r) => s + r.score, 0);
  const solvedCount = (chId) => puzzlesIn(chId).filter((p) => S.solved[p.id]).length;
  const isUnlocked = (idx) => idx === 0 || solvedCount(CHAPTERS[idx - 1].id) >= UNLOCK_NEEDED;
  const rankFor = (pts) => RANKS.filter((r) => pts >= r.at).pop();
  const nextRank = (pts) => RANKS.find((r) => r.at > pts);
  const attempt = (id) => (S.attempts[id] = S.attempts[id] || { wrong: 0, hints: 0 });
  const currentValue = (p) => {
    const a = S.attempts[p.id] || { wrong: 0 };
    return Math.max(Math.round(p.value * 0.4), p.value - a.wrong * Math.round(p.value * 0.15));
  };
  const dueNotes = () => { const t = todayKey(); return Object.keys(S.notes).filter((id) => S.notes[id].due <= t); };

  /* ───────── shell ───────── */
  const app = () => $('#app');
  let view = { name: 'atlas' };
  let cleanup = null;              // timers etc. of the current view

  function go(name, params = {}) {
    if (cleanup) { cleanup(); cleanup = null; }
    view = Object.assign({ name }, params);
    render();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function renderHeader() {
    const pts = insight();
    const due = dueNotes().length;
    const tab = (name, label, extra = '') =>
      `<button class="tab ${view.name === name || (name === 'atlas' && ['chapter', 'puzzle'].includes(view.name)) ? 'is-active' : ''}" data-go="${name}">${label}${extra}</button>`;
    $('#topbar').innerHTML = `
      <div class="topbar-inner">
        <button class="brand" data-go="atlas" aria-label="Atlas of Riddles home">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 3v26M3 16h26" stroke="currentColor" stroke-width="1.2" opacity=".5"/><path d="M16 7l3.2 9L16 25l-3.2-9z" fill="var(--accent)"/></svg>
          </span>
          <span class="brand-name">Atlas of Riddles</span>
        </button>
        <nav class="tabs" aria-label="Sections">
          ${tab('atlas', 'Atlas')}
          ${tab('notes', 'Field Notes', due ? ` <span class="pip" title="${due} due for review">${due}</span>` : '')}
          ${tab('gym', 'Mental Gym')}
          ${tab('profile', 'Profile')}
        </nav>
        <div class="meters" aria-label="Your progress">
          <span class="meter" title="Insight earned"><b>${pts}</b> insight</span>
          <span class="meter" title="Hint tokens"><b>${S.tokens}</b> hints</span>
          <span class="meter" title="Days in a row"><b>${streak()}</b> day streak</span>
        </div>
      </div>`;
  }

  function render() {
    renderHeader();
    const v = view.name;
    if (v === 'atlas') renderAtlas();
    else if (v === 'chapter') renderChapter(view.id);
    else if (v === 'puzzle') renderPuzzle(view.id);
    else if (v === 'notes') renderNotes();
    else if (v === 'review') renderReview(view.practice);
    else if (v === 'gym') renderGym();
    else if (v === 'gym-math') gymMath();
    else if (v === 'gym-pattern') gymPattern();
    else if (v === 'gym-span') gymSpan();
    else if (v === 'profile') renderProfile();
  }

  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go, g.dataset.id ? { id: g.dataset.id } : {}); }
  });

  /* ───────── atlas (home) ───────── */
  function mapSVG() {
    // equirectangular crop around the route: lon 90°W … 160°E, lat 75°N … 20°S
    const LON0 = -90, LON1 = 160, LAT0 = 75, LAT1 = -20, K = 2;
    const W = (LON1 - LON0) * K, H = (LAT0 - LAT1) * K;
    const x = (lon) => (lon - LON0) * K;
    const y = (lat) => (LAT0 - lat) * K;
    let g = '';
    for (let lon = -60; lon <= 150; lon += 30) g += `<line x1="${x(lon)}" y1="0" x2="${x(lon)}" y2="${H}" class="grat ${lon === 0 ? 'grat-zero' : ''}"/>`;
    for (let lat = 60; lat >= -15; lat -= 15) g += `<line x1="0" y1="${y(lat)}" x2="${W}" y2="${y(lat)}" class="grat ${lat === 0 ? 'grat-zero' : ''}"/>`;
    const labels = `<text x="${x(0) + 4}" y="${H - 6}" class="grat-label">0°</text><text x="4" y="${y(0) - 4}" class="grat-label">Equator</text>`;
    const pts = CHAPTERS.map((c) => `${x(c.lon).toFixed(1)},${y(c.lat).toFixed(1)}`).join(' ');
    const anchors = { cairo: 'r', kyoto: 'l', reykjavik: 'l', manaus: 'r', istanbul: 'r', greenwich: 'l' };
    const dots = CHAPTERS.map((c, i) => {
      const open = isUnlocked(i), done = solvedCount(c.id) === puzzlesIn(c.id).length;
      const cx = x(c.lon), cy = y(c.lat), right = anchors[c.id] === 'r';
      return `<g class="stop ${open ? 'open' : 'locked'} ${done ? 'done' : ''}" ${open ? `data-go="chapter" data-id="${c.id}" tabindex="0" role="button" aria-label="${esc(c.name)}"` : ''}>
        <circle cx="${cx}" cy="${cy}" r="14" class="stop-hit"/>
        <circle cx="${cx}" cy="${cy}" r="6" class="stop-dot"/>
        <text x="${right ? cx + 11 : cx - 11}" y="${cy + 4}" text-anchor="${right ? 'start' : 'end'}" class="stop-label">${i + 1} ${esc(c.name)}</text>
      </g>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" class="map" role="img" aria-label="Route map of the six cities">
      <rect width="${W}" height="${H}" class="map-bg"/>${g}${labels}
      <polyline points="${pts}" class="route"/>${dots}</svg>`;
  }

  function renderAtlas() {
    const pts = insight();
    const total = PUZZLES.length, solved = Object.keys(S.solved).length;
    const next = CHAPTERS.findIndex((c, i) => isUnlocked(i) && solvedCount(c.id) < puzzlesIn(c.id).length);
    const greeting = solved === 0
      ? 'Our journey covers six cities and 36 puzzles. Each one trains a way of thinking, and each answer teaches something true about the world.'
      : solved === total
        ? 'Every riddle in the atlas is solved. Keep your mind sharp in the Mental Gym, and review your Field Notes so the facts stay with you.'
        : `You have solved ${solved} of ${total} puzzles. ${dueNotes().length ? `${dueNotes().length} field notes are ready for review, which helps you remember them.` : 'Onward to the next stop.'}`;
    app().innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">Expedition log · ${esc(rankFor(pts).name)}</p>
          <h1>Six cities. Thirty-six riddles. One sharper mind.</h1>
          ${dialogue(greeting)}
          ${next >= 0 ? `<button class="btn btn-primary" data-go="chapter" data-id="${CHAPTERS[next].id}">${solved ? 'Continue in' : 'Begin in'} ${esc(CHAPTERS[next].name)}</button>` : ''}
        </div>
        <div class="map-wrap">${mapSVG()}</div>
      </section>
      <section>
        <h2 class="section-title">The route</h2>
        <div class="chapters">
          ${CHAPTERS.map((c, i) => {
            const open = isUnlocked(i), n = solvedCount(c.id), t = puzzlesIn(c.id).length;
            return `<button class="chapter-card ${open ? '' : 'is-locked'}" ${open ? `data-go="chapter" data-id="${c.id}"` : 'disabled'}>
              <span class="chapter-num">Stop ${i + 1}</span>
              <span class="chapter-name">${esc(c.name)}</span>
              <span class="chapter-sub">${esc(c.title)}</span>
              <span class="coord">${fmtCoord(c.lat, c.lon)}</span>
              <span class="progress" aria-label="${n} of ${t} solved"><span style="width:${(n / t) * 100}%"></span></span>
              <span class="chapter-foot">${open ? `${n} / ${t} solved` : `Solve ${UNLOCK_NEEDED} in ${esc(CHAPTERS[i - 1].name)} to unlock`}</span>
            </button>`;
          }).join('')}
        </div>
      </section>`;
  }

  function dialogue(text, extra = '') {
    return `<div class="dialogue">
      <div class="avatar" aria-hidden="true">AQ</div>
      <div class="bubble"><span class="speaker">Professor Quill</span><p>${esc(text)}</p>${extra}</div>
    </div>`;
  }

  /* ───────── chapter ───────── */
  function renderChapter(id) {
    const c = chapterOf(id), idx = CHAPTERS.indexOf(c);
    if (!c || !isUnlocked(idx)) return go('atlas');
    const list = puzzlesIn(id);
    const showIntro = !S.introSeen[id];
    let line = 0;
    app().innerHTML = `
      <button class="back" data-go="atlas">← Atlas</button>
      <header class="chapter-head">
        <p class="eyebrow">Stop ${idx + 1} · ${esc(c.country)} · <span class="coord">${fmtCoord(c.lat, c.lon)}</span></p>
        <h1>${esc(c.name)}: ${esc(c.title)}</h1>
      </header>
      <div id="intro"></div>
      <div class="puzzle-list">
        ${list.map((p, i) => {
          const r = S.solved[p.id];
          return `<button class="puzzle-card ${r ? 'is-solved' : ''}" data-go="puzzle" data-id="${p.id}">
            <span class="pnum">No. ${pad2(PUZZLES.indexOf(p) + 1)}</span>
            <span class="ptitle">${esc(p.title)}</span>
            <span class="chip chip-${p.category}">${CATEGORIES[p.category].name}</span>
            <span class="pval">${r ? `Solved · ${r.score}` : `${currentValue(p)} insight`}</span>
          </button>`;
        }).join('')}
      </div>`;
    const intro = $('#intro');
    const drawIntro = () => {
      const last = line >= c.intro.length - 1;
      intro.innerHTML = dialogue(c.intro[line], `<button class="btn btn-small" id="intro-next">${last ? 'Let’s begin' : 'Continue'}</button>`);
      $('#intro-next').onclick = () => {
        if (last) { S.introSeen[id] = true; save(); intro.innerHTML = ''; }
        else { line++; drawIntro(); }
      };
    };
    if (showIntro) drawIntro();
  }

  /* ───────── puzzle ───────── */
  function renderPuzzle(id) {
    const p = byId(id);
    const c = chapterOf(p.chapter);
    if (!isUnlocked(CHAPTERS.indexOf(c))) return go('atlas');
    const a = attempt(id);
    const prior = S.solved[id];
    app().innerHTML = `
      <button class="back" data-go="chapter" data-id="${c.id}">← ${esc(c.name)}</button>
      <article class="puzzle">
        <header class="puzzle-head">
          <span class="pnum">No. ${pad2(PUZZLES.indexOf(p) + 1)}</span>
          <h1>${esc(p.title)}</h1>
          <div class="puzzle-meta">
            <span class="chip chip-${p.category}">${CATEGORIES[p.category].name}</span>
            <span class="value" id="value">${prior ? `Solved · ${prior.score} insight` : `Worth ${currentValue(p)} insight`}</span>
          </div>
        </header>
        <div class="prompt">${esc(p.prompt)}</div>
        <div class="play" id="play"></div>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
        <div class="puzzle-actions">
          <button class="btn" id="hint-btn"></button>
        </div>
        <div class="hints" id="hints"></div>
      </article>
      <div id="result"></div>`;

    const feedback = (msg, kind = '') => { const f = $('#feedback'); f.textContent = msg; f.className = 'feedback ' + kind; };
    const updateValue = () => { if (!prior) $('#value').textContent = `Worth ${currentValue(p)} insight`; };

    const wrong = (msg) => {
      if (!prior) { a.wrong++; save(); }
      updateValue();
      const art = $('.puzzle'); art.classList.remove('shake'); void art.offsetWidth; art.classList.add('shake');
      feedback(`${msg || 'Not quite.'} ${prior ? 'Try again.' : `This puzzle is now worth ${currentValue(p)}.`}`, 'bad');
    };
    const solve = (extraMsg) => {
      let gained = 0, firstTime = !prior;
      if (firstTime) {
        gained = currentValue(p);
        S.solved[id] = { score: gained, at: todayKey() };
        S.tokens += 1;
        if (!S.notes[id]) S.notes[id] = { box: 1, due: addDays(todayKey(), 1) };
        delete S.attempts[id];
      }
      markActive(); save(); renderHeader();
      $('#play').classList.add('is-done');
      $$('#play button, #play input').forEach((el) => (el.disabled = true));
      $('.puzzle-actions').hidden = true;
      $('#value').textContent = `Solved · ${S.solved[id].score} insight`;
      feedback('');
      showResult(p, gained, firstTime, extraMsg);
    };

    // hints
    const drawHints = () => {
      const free = !!prior;
      const shown = free ? Math.max(a.hints, 0) : a.hints;
      $('#hints').innerHTML = p.hints.slice(0, shown).map((h, i) => `<div class="hint"><span class="hint-n">Hint ${i + 1}</span><p>${esc(h)}</p></div>`).join('');
      const btn = $('#hint-btn');
      if (shown >= p.hints.length) { btn.textContent = 'All hints shown'; btn.disabled = true; }
      else if (!free && S.tokens <= 0) { btn.textContent = 'No hint tokens left'; btn.disabled = true; }
      else { btn.textContent = free ? `Show hint ${shown + 1}` : `Use a hint token (${S.tokens} left)`; btn.disabled = false; }
    };
    $('#hint-btn').onclick = () => {
      if (!prior) { if (S.tokens <= 0) return; S.tokens--; }
      a.hints++; save(); renderHeader(); drawHints();
    };
    drawHints();

    const ctx = { p, play: $('#play'), wrong, solve, feedback };
    const kinds = { choice: playChoice, number: playNumber, text: playText, order: playOrder, hanoi: playHanoi, lights: playLights, river: playRiver, jugs: playJugs, magic: playMagic };
    kinds[p.type](ctx);
  }

  function showResult(p, gained, firstTime, extraMsg) {
    const list = puzzlesIn(p.chapter);
    const idx = list.indexOf(p);
    const nextUnsolved = list.slice(idx + 1).concat(list.slice(0, idx)).find((q) => !S.solved[q.id]);
    const chIdx = CHAPTERS.findIndex((c) => c.id === p.chapter);
    const justUnlocked = firstTime && chIdx < CHAPTERS.length - 1 && solvedCount(p.chapter) === UNLOCK_NEEDED;
    const n = p.note;
    $('#result').innerHTML = `
      <section class="result">
        <div class="stamp" aria-hidden="true">Solved</div>
        <h2>${firstTime ? `+${gained} insight` : 'Solved again'}</h2>
        ${extraMsg ? `<p class="extra">${esc(extraMsg)}</p>` : ''}
        <p class="explain">${esc(p.explain)}</p>
        <div class="note-card">
          <span class="note-kind">${n.kind === 'fact' ? 'Field note · Fact' : 'Field note · Thinking tool'}</span>
          <h3>${esc(n.title)}</h3>
          <p>${esc(n.text)}</p>
          ${firstTime ? '<p class="note-foot">Added to your Field Notes. You will be asked about it again tomorrow.</p>' : ''}
        </div>
        ${justUnlocked ? `<p class="unlock">New stop unlocked: ${esc(CHAPTERS[chIdx + 1].name)}.</p>` : ''}
        <div class="result-actions">
          ${nextUnsolved ? `<button class="btn btn-primary" data-go="puzzle" data-id="${nextUnsolved.id}">Next puzzle: ${esc(nextUnsolved.title)}</button>` : ''}
          ${justUnlocked ? `<button class="btn ${nextUnsolved ? '' : 'btn-primary'}" data-go="chapter" data-id="${CHAPTERS[chIdx + 1].id}">Travel to ${esc(CHAPTERS[chIdx + 1].name)}</button>` : ''}
          <button class="btn" data-go="chapter" data-id="${p.chapter}">Back to ${esc(chapterOf(p.chapter).name)}</button>
        </div>
      </section>`;
    $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── puzzle types ── */
  function playChoice({ p, play, wrong, solve }) {
    play.innerHTML = `<div class="choices">${p.options.map((o, i) => `<button class="choice" data-i="${i}"><span class="choice-key">${'ABCD'[i]}</span>${esc(o)}</button>`).join('')}</div>`;
    $$('.choice', play).forEach((b) => b.onclick = () => {
      const i = +b.dataset.i;
      if (i === p.answer) { b.classList.add('is-right'); solve(); }
      else { b.classList.add('is-wrong'); b.disabled = true; wrong(); }
    });
  }

  function answerForm(play, { label, mode = 'decimal', unit = '' }, onSubmit) {
    play.innerHTML = `<form class="answer-form" id="answer-form" autocomplete="off">
      <label for="answer-input">${esc(label)}</label>
      <div class="answer-row">
        <input id="answer-input" inputmode="${mode}" spellcheck="false" autocapitalize="off" required>
        ${unit ? `<span class="unit">${esc(unit)}</span>` : ''}
        <button class="btn btn-primary" type="submit">Submit</button>
      </div></form>`;
    const input = $('#answer-input');
    $('#answer-form').onsubmit = (e) => { e.preventDefault(); if (input.value.trim()) onSubmit(input.value.trim(), input); };
    setTimeout(() => input.focus({ preventScroll: true }), 50);
  }

  function playNumber({ p, play, wrong, solve }) {
    answerForm(play, { label: 'Your answer', unit: p.unit }, (val, input) => {
      const n = parseFloat(val.replace(/,/g, '').replace(/[^\d.\-]/g, ''));
      if (!isNaN(n) && Math.abs(n - p.answer) <= (p.tolerance || 0)) solve();
      else { wrong(); input.select(); }
    });
  }

  function playText({ p, play, wrong, solve }) {
    answerForm(play, { label: 'Your answer', mode: p.inputMode || 'text' }, (val, input) => {
      const norm = val.toLowerCase().replace(/[\s.,'"!?-]/g, '');
      if (p.accept.includes(norm)) solve();
      else { wrong(); input.select(); }
    });
  }

  function playOrder({ p, play, wrong, solve }) {
    let order = shuffle(p.items);
    while (order.join('|') === p.answer.join('|')) order = shuffle(p.items);
    const draw = () => {
      play.innerHTML = `<ol class="order-list">${order.map((it, i) => `
        <li class="order-item"><span class="order-n">${i + 1}</span><span class="order-text">${esc(it)}</span>
          <span class="order-btns">
            <button class="icon-btn" data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move ${esc(it)} up">↑</button>
            <button class="icon-btn" data-down="${i}" ${i === order.length - 1 ? 'disabled' : ''} aria-label="Move ${esc(it)} down">↓</button>
          </span></li>`).join('')}</ol>
        <button class="btn btn-primary" id="order-submit">Check order</button>`;
      $$('[data-up]', play).forEach((b) => b.onclick = () => { const i = +b.dataset.up; [order[i - 1], order[i]] = [order[i], order[i - 1]]; draw(); $(`[data-up="${i - 1}"]`, play)?.focus() || $(`[data-down="${i - 1}"]`, play)?.focus(); });
      $$('[data-down]', play).forEach((b) => b.onclick = () => { const i = +b.dataset.down; [order[i + 1], order[i]] = [order[i], order[i + 1]]; draw(); $(`[data-down="${i + 1}"]`, play)?.focus() || $(`[data-up="${i + 1}"]`, play)?.focus(); });
      $('#order-submit').onclick = () => {
        const right = order.filter((it, i) => p.answer[i] === it).length;
        if (right === order.length) solve();
        else wrong(`${right} of ${order.length} are in the right place.`);
      };
    };
    draw();
  }

  function playHanoi({ p, play, solve, feedback }) {
    const n = p.disks, min = 2 ** n - 1;
    let pegs, sel, moves;
    const reset = () => { pegs = [Array.from({ length: n }, (_, i) => n - i), [], []]; sel = null; moves = 0; draw(); };
    const draw = () => {
      play.innerHTML = `<div class="hanoi">${pegs.map((peg, i) => `
          <button class="peg ${sel === i ? 'is-sel' : ''}" data-peg="${i}" aria-label="Post ${i + 1}, ${peg.length} disks">
            <span class="pole"></span>
            ${peg.map((d) => `<span class="disk" style="width:${30 + d * 15}%; --hue:${d}"></span>`).reverse().join('')}
            <span class="base"></span>
          </button>`).join('')}</div>
        <div class="play-bar"><span class="counter">Moves: <b>${moves}</b> · Best possible: ${min}</span><button class="btn btn-small" id="reset">Start over</button></div>`;
      $$('.peg', play).forEach((b) => b.onclick = () => click(+b.dataset.peg));
      $('#reset').onclick = reset;
    };
    const click = (i) => {
      if (sel === null) { if (pegs[i].length) sel = i; draw(); return; }
      if (sel === i) { sel = null; draw(); return; }
      const d = pegs[sel][pegs[sel].length - 1], top = pegs[i][pegs[i].length - 1];
      if (top !== undefined && top < d) { feedback('A disk can’t go on a smaller one.', 'bad'); sel = null; draw(); return; }
      feedback('');
      pegs[i].push(pegs[sel].pop()); sel = null; moves++; draw();
      if (pegs[2].length === n) solve(moves === min ? `Perfect: ${moves} moves, the minimum possible.` : `Solved in ${moves} moves. The minimum is ${min}; try it again sometime for a perfect run.`);
    };
    reset();
  }

  function playLights({ p, play, solve }) {
    const N = p.size;
    let grid, presses;
    const toggle = (g, i) => {
      const r = Math.floor(i / N), c = i % N;
      [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < N && cc >= 0 && cc < N) g[rr * N + cc] = !g[rr * N + cc];
      });
    };
    const reset = () => { grid = Array(N * N).fill(true); p.presses.forEach((i) => toggle(grid, i)); presses = 0; draw(); };
    const draw = () => {
      play.innerHTML = `<div class="lights" style="--n:${N}">${grid.map((on, i) => `<button class="lantern ${on ? 'is-on' : ''}" data-i="${i}" aria-label="Lantern ${i + 1}, ${on ? 'lit' : 'dark'}"></button>`).join('')}</div>
        <div class="play-bar"><span class="counter">Touches: <b>${presses}</b> · Lit: ${grid.filter(Boolean).length}/${N * N}</span><button class="btn btn-small" id="reset">Start over</button></div>`;
      $$('.lantern', play).forEach((b) => b.onclick = () => {
        toggle(grid, +b.dataset.i); presses++; draw();
        if (grid.every(Boolean)) solve(presses <= p.presses.length ? `Lit in ${presses} touches, the fewest possible.` : `Lit in ${presses} touches. It can be done in ${p.presses.length}.`);
      });
      $('#reset').onclick = reset;
    };
    reset();
  }

  function playRiver({ p, play, wrong, solve, feedback }) {
    const NAMES = { jackal: 'Jackal', goose: 'Goose', grain: 'Grain' };
    const ICON = {
      farmer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="3.2"/><path d="M6 22v-6a6 6 0 0 1 12 0v6z"/><path d="M5 5.5h14" stroke-width="2" stroke="currentColor"/></svg>',
      jackal: '<svg viewBox="0 0 24 24"><path d="M4 21l2-8-3-6 4 2 2-6 2 5h2l2-5 2 6 4-2-3 6 2 8z"/></svg>',
      goose: '<svg viewBox="0 0 24 24"><path d="M8 3a3 3 0 0 1 3 3v6c3-1 8 0 10 3-2 4-6 6-11 6-4 0-7-3-6-7l1-5V6a3 3 0 0 1 3-3z"/><path d="M5 5l-3 1 3 1z"/></svg>',
      grain: '<svg viewBox="0 0 24 24"><path d="M7 7c0-2 2-4 5-4s5 2 5 4l2 12c0 2-3 3-7 3s-7-1-7-3z"/><path d="M8 7h8" stroke="var(--bg)" stroke-width="1.5"/></svg>'
    };
    let side, passenger, trips;
    const reset = () => { side = { farmer: 'L', jackal: 'L', goose: 'L', grain: 'L' }; passenger = null; trips = 0; draw(); };
    const token = (k) => `<button class="token ${passenger === k ? 'is-sel' : ''}" data-k="${k}" ${side[k] !== side.farmer ? 'disabled' : ''} aria-pressed="${passenger === k}">
        <span class="token-ico">${ICON[k]}</span><span>${NAMES[k]}</span></button>`;
    const bank = (s) => ['jackal', 'goose', 'grain'].filter((k) => side[k] === s && passenger !== k).map(token).join('');
    const draw = () => {
      const f = side.farmer;
      play.innerHTML = `<div class="river">
          <div class="bank"><span class="bank-label">West bank</span>${bank('L')}</div>
          <div class="water">
            <div class="boat ${f === 'L' ? 'at-left' : 'at-right'}">
              <span class="token is-farmer"><span class="token-ico">${ICON.farmer}</span><span>Farmer</span></span>
              ${passenger ? token(passenger) : '<span class="token is-empty">empty seat</span>'}
            </div>
          </div>
          <div class="bank"><span class="bank-label">East bank</span>${bank('R')}</div>
        </div>
        <div class="play-bar"><span class="counter">Crossings: <b>${trips}</b> · Tap an animal or item on the farmer’s side to load it</span>
          <span class="bar-btns"><button class="btn btn-primary btn-small" id="cross">Cross the river</button><button class="btn btn-small" id="reset">Start over</button></span></div>`;
      $$('.token[data-k]', play).forEach((b) => b.onclick = () => { const k = b.dataset.k; passenger = passenger === k ? null : k; draw(); });
      $('#cross').onclick = cross;
      $('#reset').onclick = reset;
    };
    const cross = () => {
      const to = side.farmer === 'L' ? 'R' : 'L';
      side.farmer = to; if (passenger) side[passenger] = to;
      passenger = null; trips++;
      const left = to === 'L' ? 'R' : 'L';
      const alone = (k) => side[k] === left;
      if (alone('jackal') && alone('goose')) { wrong('The jackal ate the goose! Everyone is back on the west bank.'); return reset(); }
      if (alone('goose') && alone('grain')) { wrong('The goose ate the grain! Everyone is back on the west bank.'); return reset(); }
      feedback('');
      draw();
      if (Object.values(side).every((s) => s === 'R')) solve(`Done in ${trips} crossings${trips === 7 ? ', the minimum.' : '. The minimum is 7.'}`);
    };
    reset();
  }

  function playJugs({ p, play, solve }) {
    const [CA, CB] = p.caps;
    let A, B, steps;
    const reset = () => { A = 0; B = 0; steps = 0; draw(); };
    const jug = (v, cap, name) => `<div class="jug"><div class="jug-body" style="--h:${cap * 28}px"><div class="jug-water" style="height:${(v / cap) * 100}%"></div>
      ${Array.from({ length: cap - 1 }, (_, i) => `<span class="tick" style="bottom:${((i + 1) / cap) * 100}%"></span>`).join('')}</div>
      <span class="jug-label">${name}: <b>${v}</b> / ${cap} L</span></div>`;
    const draw = () => {
      play.innerHTML = `<div class="jugs">${jug(A, CA, `${CA} L jug`)}${jug(B, CB, `${CB} L jug`)}</div>
        <div class="jug-actions">
          <button class="btn btn-small" data-a="fa">Fill ${CA} L</button><button class="btn btn-small" data-a="fb">Fill ${CB} L</button>
          <button class="btn btn-small" data-a="ea">Empty ${CA} L</button><button class="btn btn-small" data-a="eb">Empty ${CB} L</button>
          <button class="btn btn-small" data-a="ab">Pour ${CA} → ${CB}</button><button class="btn btn-small" data-a="ba">Pour ${CB} → ${CA}</button>
        </div>
        <div class="play-bar"><span class="counter">Steps: <b>${steps}</b> · Goal: exactly ${p.target} L in the ${CA} L jug</span><button class="btn btn-small" id="reset">Start over</button></div>`;
      $$('[data-a]', play).forEach((b) => b.onclick = () => act(b.dataset.a));
      $('#reset').onclick = reset;
      $('.jugs', play).setAttribute('aria-label', `${CA} litre jug holds ${A}, ${CB} litre jug holds ${B}`);
    };
    const act = (a) => {
      if (a === 'fa') A = CA; if (a === 'fb') B = CB; if (a === 'ea') A = 0; if (a === 'eb') B = 0;
      if (a === 'ab') { const t = Math.min(A, CB - B); A -= t; B += t; }
      if (a === 'ba') { const t = Math.min(B, CA - A); B -= t; A += t; }
      steps++; draw();
      if (A === p.target) solve(steps <= 6 ? `Measured in ${steps} steps, the fewest possible.` : `Measured in ${steps} steps. It can be done in 6.`);
    };
    reset();
  }

  function playMagic({ p, play, wrong, solve, feedback }) {
    play.innerHTML = `<div class="magic">${p.given.map((g, i) => g
        ? `<span class="cell is-given">${g}</span>`
        : `<input class="cell" id="cell-${i}" data-i="${i}" inputmode="numeric" maxlength="1" aria-label="Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}">`).join('')}</div>
      <div class="play-bar"><span class="counter" id="sums">Each line should total 15</span><button class="btn btn-primary btn-small" id="check">Check square</button></div>`;
    const values = () => p.given.map((g, i) => g || parseInt($(`#cell-${i}`, play)?.value, 10) || 0);
    const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    $$('input.cell', play).forEach((inp) => inp.oninput = () => { inp.value = inp.value.replace(/[^1-9]/g, '').slice(0, 1); });
    $('#check').onclick = () => {
      const v = values();
      if (v.includes(0)) return feedback('Fill every square first.', 'bad');
      if (new Set(v).size !== 9) return wrong('Each number from 1 to 9 must appear exactly once.');
      const good = LINES.filter((l) => l.reduce((s, i) => s + v[i], 0) === 15).length;
      if (good === 8) solve(); else wrong(`${good} of 8 lines total 15.`);
    };
  }

  /* ───────── field notes ───────── */
  function renderNotes() {
    const due = dueNotes();
    const unlocked = PUZZLES.filter((p) => S.notes[p.id]);
    const mastered = unlocked.filter((p) => S.notes[p.id].box >= 4).length;
    app().innerHTML = `
      <header class="page-head">
        <p class="eyebrow">Field Notes</p>
        <h1>What you have learned</h1>
        <p class="lede">Every solved puzzle adds a note. Notes come back for review after 1, 2, 4, 8 and 16 days. Each correct recall moves a note to a longer gap; a miss sends it back to the start. Spacing reviews out like this is one of the best-tested ways to remember things.</p>
      </header>
      <div class="review-bar">
        <div><b>${unlocked.length}</b> of ${PUZZLES.length} notes collected · <b>${mastered}</b> well remembered · <b>${due.length}</b> due today</div>
        <div class="bar-btns">
          <button class="btn btn-primary" id="rev" ${due.length ? '' : 'disabled'}>${due.length ? `Review ${Math.min(due.length, 10)} due notes` : 'Nothing due today'}</button>
          <button class="btn" id="prac" ${unlocked.length >= 3 ? '' : 'disabled'}>Practice any 5</button>
        </div>
      </div>
      ${unlocked.length ? '' : '<p class="empty">Your notebook is empty. Solve a puzzle in Cairo to write your first note.</p>'}
      <div class="notes-grid">
        ${unlocked.map((p) => {
          const st = S.notes[p.id];
          return `<article class="note-card">
            <span class="note-kind">${p.note.kind === 'fact' ? 'Fact' : 'Thinking tool'} · ${esc(chapterOf(p.chapter).name)}</span>
            <h3>${esc(p.note.title)}</h3>
            <p>${esc(p.note.text)}</p>
            <span class="boxes" aria-label="Memory level ${st.box} of 5">${[1, 2, 3, 4, 5].map((b) => `<span class="${b <= st.box ? 'on' : ''}"></span>`).join('')}<span class="due">${st.due <= todayKey() ? 'Due now' : `Next review ${st.due}`}</span></span>
          </article>`;
        }).join('')}
      </div>`;
    $('#rev').onclick = () => go('review', { practice: false });
    $('#prac').onclick = () => go('review', { practice: true });
  }

  function renderReview(practice) {
    const pool = practice ? shuffle(Object.keys(S.notes)).slice(0, 5) : shuffle(dueNotes()).slice(0, 10);
    if (!pool.length) return go('notes');
    let i = 0, right = 0;
    const step = () => {
      if (i >= pool.length) {
        markActive(); save(); renderHeader();
        app().innerHTML = `<section class="result">
          <h2>${right} / ${pool.length} remembered</h2>
          <p class="explain">${practice ? 'Practice rounds don’t change your review schedule.' : 'Notes you got right will come back after a longer gap. The ones you missed will return tomorrow.'}</p>
          <div class="result-actions"><button class="btn btn-primary" data-go="notes">Back to Field Notes</button><button class="btn" data-go="atlas">Atlas</button></div></section>`;
        return;
      }
      const p = byId(pool[i]);
      const r = p.note.recall;
      const order = shuffle(r.options.map((o, k) => k));
      app().innerHTML = `
        <button class="back" data-go="notes">← Field Notes</button>
        <article class="puzzle">
          <header class="puzzle-head"><span class="pnum">${practice ? 'Practice' : 'Review'} ${i + 1} / ${pool.length}</span><h1>${esc(p.note.title)}</h1></header>
          <div class="prompt">${esc(r.q)}</div>
          <div class="choices">${order.map((k, j) => `<button class="choice" data-k="${k}"><span class="choice-key">${'ABCD'[j]}</span>${esc(r.options[k])}</button>`).join('')}</div>
          <div id="after"></div>
        </article>`;
      $$('.choice').forEach((b) => b.onclick = () => {
        const ok = +b.dataset.k === r.a;
        $$('.choice').forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add('is-right'); });
        if (!ok) b.classList.add('is-wrong');
        if (ok) right++;
        if (!practice) {
          const st = S.notes[p.id];
          st.box = ok ? Math.min(5, st.box + 1) : 1;
          st.due = addDays(todayKey(), LEITNER_DAYS[st.box - 1]);
          save();
        }
        $('#after').innerHTML = `<div class="note-card"><span class="note-kind">${ok ? 'Correct' : 'Here’s the note again'}</span><p>${esc(p.note.text)}</p></div>
          <button class="btn btn-primary" id="next">${i === pool.length - 1 ? 'Finish' : 'Next'}</button>`;
        $('#next').onclick = () => { i++; step(); };
        $('#next').focus({ preventScroll: true });
      });
    };
    step();
  }

  /* ───────── mental gym ───────── */
  function renderGym() {
    app().innerHTML = `
      <header class="page-head">
        <p class="eyebrow">Mental Gym</p>
        <h1>Short daily workouts</h1>
        <p class="lede">The puzzles are fixed. These drills are generated fresh each time, so you can come back daily. Each one targets a different mental skill.</p>
      </header>
      <div class="gym-grid">
        ${gymCard('gym-math', 'Quick Maths', '60 seconds of mental arithmetic. It gets harder as you get answers right in a row.', 'Best', `${S.gym.math} correct`)}
        ${gymCard('gym-pattern', 'Number Patterns', 'Find the rule behind 6 sequences. Trains spotting structure and making hypotheses.', 'Best', `${S.gym.pattern} / 6`)}
        ${gymCard('gym-span', 'Digit Span', 'Memorise a growing string of digits. Measures working memory, the mind’s scratchpad.', 'Longest', `${S.gym.span} digits`)}
      </div>
      <p class="aside">Most adults can hold about 7 digits in working memory, give or take two. Psychologist George Miller described this limit in 1956.</p>`;
  }
  const gymCard = (go, title, text, bestLabel, best) => `<button class="gym-card" data-go="${go}">
      <span class="gym-title">${title}</span><span class="gym-text">${text}</span>
      <span class="gym-best"><span>${bestLabel}</span><b>${best}</b></span></button>`;

  function gymFinish(key, score, label, better) {
    const prev = S.gym[key];
    const record = better(score, prev);
    if (record) S.gym[key] = score;
    markActive(); save(); renderHeader();
    return `<section class="result">
      ${record && score > 0 ? '<div class="stamp" aria-hidden="true">Record</div>' : ''}
      <h2>${label}</h2>
      <p class="explain">${record && score > 0 ? 'A new personal best.' : `Your best is ${prev}.`}</p>
      <div class="result-actions"><button class="btn btn-primary" data-go="${view.name}">Go again</button><button class="btn" data-go="gym">Mental Gym</button></div></section>`;
  }

  function mathProblem(level) {
    const L = Math.min(level, 5);
    const ops = [
      () => { const a = rand(2, 20), b = rand(2, 20); return pick([[`${a} + ${b}`, a + b], [`${a + b} − ${b}`, a]]); },
      () => { const a = rand(12, 99), b = rand(12, 99), x = rand(2, 10), y = rand(2, 10); return pick([[`${a} + ${b}`, a + b], [`${Math.max(a, b)} − ${Math.min(a, b)}`, Math.abs(a - b)], [`${x} × ${y}`, x * y]]); },
      () => { const a = rand(12, 40), b = rand(3, 9), q = rand(3, 12); return pick([[`${a} × ${b}`, a * b], [`${q * b} ÷ ${b}`, q], [`${rand(101, 499)} + ${rand(101, 499)}`, null]]); },
      () => { const a = rand(3, 12), b = rand(3, 12), c = rand(5, 40), n = rand(11, 25), base = rand(2, 20) * 20; return pick([[`${a} × ${b} + ${c}`, a * b + c], [`${n}²`, n * n], [`25% of ${base}`, base / 4], [`10% of ${base * 3}`, base * 3 / 10]]); },
      () => { const a = rand(13, 49), b = rand(13, 29), p = pick([15, 20, 30, 75]), base = rand(2, 12) * 20; return pick([[`${a} × ${b}`, a * b], [`${p}% of ${base}`, (p * base) / 100], [`${a * 4} ÷ 4 + ${b}`, a + b]]); }
    ];
    let [q, ans] = ops[L - 1]();
    if (ans === null) { const parts = q.split(' + ').map(Number); ans = parts[0] + parts[1]; }
    return { q, ans };
  }

  function gymMath() {
    let level = 1, run = 0, score = 0, left = 60, prob = mathProblem(1);
    app().innerHTML = `
      <button class="back" data-go="gym">← Mental Gym</button>
      <article class="puzzle gym-run">
        <div class="gym-hud"><span>Time <b id="t">60</b>s</span><span>Correct <b id="s">0</b></span><span>Level <b id="l">1</b></span></div>
        <div class="big-q" id="q">${prob.q} = ?</div>
        <form class="answer-form" id="f" autocomplete="off"><div class="answer-row">
          <input id="gym-math-input" inputmode="numeric" aria-label="Answer" spellcheck="false"><button class="btn btn-primary" type="submit">Enter</button>
          <button class="btn" type="button" id="skip">Skip</button></div></form>
        <p class="feedback" id="fb" role="status" aria-live="polite"></p>
      </article>`;
    const input = $('#gym-math-input');
    input.focus();
    const next = (ok) => {
      if (ok) { score++; run++; if (run >= 3) { level = Math.min(5, level + 1); run = 0; } }
      else { run = 0; level = Math.max(1, level - 1); }
      $('#fb').textContent = ok ? 'Correct' : `It was ${prob.ans}`;
      $('#fb').className = 'feedback ' + (ok ? 'good' : 'bad');
      prob = mathProblem(level);
      $('#q').textContent = `${prob.q} = ?`; $('#s').textContent = score; $('#l').textContent = level;
      input.value = ''; input.focus();
    };
    $('#f').onsubmit = (e) => { e.preventDefault(); if (input.value.trim() === '') return; next(parseFloat(input.value.replace(/[^\d.\-]/g, '')) === prob.ans); };
    $('#skip').onclick = () => next(false);
    const timer = setInterval(() => {
      left--; const t = $('#t'); if (t) t.textContent = left;
      if (left <= 0) { clearInterval(timer); cleanup = null; app().innerHTML = gymFinish('math', score, `${score} correct in 60 seconds`, (a, b) => a > b); }
    }, 1000);
    cleanup = () => clearInterval(timer);
  }

  function makeSequence() {
    const kinds = [
      () => { const a = rand(1, 30), d = rand(2, 13) * pick([1, 1, -1]); const s = [0, 1, 2, 3, 4, 5].map((i) => a + 70 + d * i); return { s, rule: `Add ${d} each time` }; },
      () => { const a = rand(1, 5), r = pick([2, 3]); const s = [0, 1, 2, 3, 4, 5].map((i) => a * r ** i); return { s, rule: `Multiply by ${r} each time` }; },
      () => { const c = rand(0, 5), o = rand(1, 4); const s = [0, 1, 2, 3, 4, 5].map((i) => (i + o) ** 2 + c); return { s, rule: c ? `Square numbers plus ${c}` : 'Square numbers' }; },
      () => { let a = rand(1, 4), b = rand(2, 6); const s = [a, b]; while (s.length < 6) s.push(s[s.length - 1] + s[s.length - 2]); return { s, rule: 'Each number is the sum of the two before it' }; },
      () => { const a = rand(1, 10), b = rand(20, 40), d1 = rand(2, 5), d2 = rand(1, 3); const s = [a, b, a + d1, b - d2, a + 2 * d1, b - 2 * d2]; return { s, rule: `Two interleaved sequences: +${d1} and −${d2}` }; },
      () => { const a = rand(1, 10), d = rand(1, 3); const s = [a]; for (let i = 1; i < 6; i++) s.push(s[i - 1] + d * i); return { s, rule: `The gap grows by ${d} each time` }; },
      () => { const a = rand(2, 6); const s = [a]; for (let i = 1; i < 6; i++) s.push(i % 2 ? s[i - 1] * 2 : s[i - 1] + 3); return { s, rule: 'Alternately double, then add 3' }; }
    ];
    return shuffle(kinds).slice(0, 6).map((k) => k());
  }

  function gymPattern() {
    const seqs = makeSequence();
    let i = 0, score = 0;
    const step = () => {
      if (i >= seqs.length) { app().innerHTML = gymFinish('pattern', score, `${score} / ${seqs.length} patterns found`, (a, b) => a > b); return; }
      const { s, rule } = seqs[i];
      app().innerHTML = `
        <button class="back" data-go="gym">← Mental Gym</button>
        <article class="puzzle gym-run">
          <div class="gym-hud"><span>Pattern <b>${i + 1}</b> / ${seqs.length}</span><span>Found <b>${score}</b></span></div>
          <div class="big-q seq">${s.slice(0, 5).join(', ')}, <span class="blank">?</span></div>
          <form class="answer-form" id="f" autocomplete="off"><div class="answer-row">
            <input id="gym-pattern-input" inputmode="numeric" aria-label="Next number" spellcheck="false"><button class="btn btn-primary" type="submit">Submit</button>
            <button class="btn" type="button" id="skip">Give up</button></div></form>
          <div id="after"></div>
        </article>`;
      const input = $('#gym-pattern-input'); input.focus();
      const reveal = (ok) => {
        if (ok) score++;
        $$('#f input, #f button').forEach((b) => (b.disabled = true));
        $('#after').innerHTML = `<p class="feedback ${ok ? 'good' : 'bad'}">${ok ? 'Correct.' : `The answer was ${s[5]}.`} ${esc(rule)}.</p>
          <button class="btn btn-primary" id="next">${i === seqs.length - 1 ? 'Finish' : 'Next pattern'}</button>`;
        $('#next').onclick = () => { i++; step(); };
        $('#next').focus();
      };
      $('#f').onsubmit = (e) => { e.preventDefault(); if (input.value.trim() === '') return; reveal(parseInt(input.value.replace(/[^\d\-]/g, ''), 10) === s[5]); };
      $('#skip').onclick = () => reveal(false);
    };
    step();
  }

  function gymSpan() {
    let len = 3, best = 0, timers = [];
    cleanup = () => timers.forEach(clearTimeout);
    const round = () => {
      const digits = Array.from({ length: len }, () => rand(0, 9));
      app().innerHTML = `
        <button class="back" data-go="gym">← Mental Gym</button>
        <article class="puzzle gym-run">
          <div class="gym-hud"><span>Length <b>${len}</b></span><span>Best this run <b>${best}</b></span></div>
          <div class="big-q digit" id="d" aria-live="off">Get ready…</div>
          <div id="ans"></div>
        </article>`;
      const show = (k) => {
        const d = $('#d'); if (!d) return;
        if (k >= digits.length) { d.textContent = '…'; askAnswer(digits); return; }
        d.textContent = digits[k]; d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop');
        timers.push(setTimeout(() => { if ($('#d')) $('#d').textContent = ''; timers.push(setTimeout(() => show(k + 1), 200)); }, 800));
      };
      timers.push(setTimeout(() => show(0), 900));
    };
    const askAnswer = (digits) => {
      $('#d').textContent = 'Type the digits in order';
      $('#ans').innerHTML = `<form class="answer-form" id="f" autocomplete="off"><div class="answer-row">
        <input id="gym-span-input" inputmode="numeric" aria-label="Digits" spellcheck="false"><button class="btn btn-primary" type="submit">Submit</button></div></form>`;
      const input = $('#gym-span-input'); input.focus();
      $('#f').onsubmit = (e) => {
        e.preventDefault();
        const ok = input.value.replace(/\D/g, '') === digits.join('');
        if (ok) { best = len; len++; $('#ans').innerHTML = '<p class="feedback good">Correct. One more digit next time.</p>'; timers.push(setTimeout(round, 1100)); }
        else { cleanup = null; app().innerHTML = gymFinish('span', best, `Longest span: ${best} digits`, (a, b) => a > b) + `<p class="aside center">The last sequence was ${digits.join(' ')}.</p>`; }
      };
    };
    round();
  }

  /* ───────── profile ───────── */
  function renderProfile() {
    const pts = insight(), rank = rankFor(pts), nr = nextRank(pts);
    const cats = Object.keys(CATEGORIES).map((k) => {
      const all = PUZZLES.filter((p) => p.category === k);
      const max = all.reduce((s, p) => s + p.value, 0);
      const got = all.reduce((s, p) => s + (S.solved[p.id]?.score || 0), 0);
      return { k, name: CATEGORIES[k].name, blurb: CATEGORIES[k].blurb, got, max, n: all.filter((p) => S.solved[p.id]).length, t: all.length };
    });
    const solved = Object.keys(S.solved).length;
    app().innerHTML = `
      <header class="page-head">
        <p class="eyebrow">Profile</p>
        <h1>${esc(rank.name)}</h1>
        <p class="lede">${pts} insight earned${nr ? `. ${nr.at - pts} more to become ${esc(nr.name)}.` : '. The highest rank in the atlas.'}</p>
      </header>
      <div class="stat-row">
        <div class="stat"><span>Puzzles solved</span><b>${solved} / ${PUZZLES.length}</b></div>
        <div class="stat"><span>Field notes</span><b>${Object.keys(S.notes).length}</b></div>
        <div class="stat"><span>Day streak</span><b>${streak()}</b></div>
        <div class="stat"><span>Hint tokens</span><b>${S.tokens}</b></div>
      </div>
      <h2 class="section-title">Thinking skills</h2>
      <p class="aside">Share of the insight available in each kind of puzzle. Solving with fewer wrong answers earns more.</p>
      <div class="skills">
        ${cats.map((c) => `<div class="skill">
          <div class="skill-top"><span class="skill-name">${c.name}</span><span class="skill-num">${c.got} / ${c.max} · ${c.n} of ${c.t} puzzles</span></div>
          <div class="skill-bar"><span class="fill-${c.k}" style="width:${c.max ? (c.got / c.max) * 100 : 0}%"></span></div>
          <span class="skill-blurb">${c.blurb}</span></div>`).join('')}
      </div>
      <h2 class="section-title">Mental Gym bests</h2>
      <div class="stat-row">
        <div class="stat"><span>Quick Maths</span><b>${S.gym.math}</b></div>
        <div class="stat"><span>Number Patterns</span><b>${S.gym.pattern} / 6</b></div>
        <div class="stat"><span>Digit Span</span><b>${S.gym.span}</b></div>
      </div>
      <div class="danger-zone" id="dz">
        <button class="btn btn-quiet" id="reset-ask">Reset all progress</button>
      </div>`;
    $('#reset-ask').onclick = () => {
      $('#dz').innerHTML = `<p>This erases every solved puzzle, note and record. It can’t be undone.</p>
        <div class="bar-btns"><button class="btn btn-danger" id="reset-yes">Erase progress</button><button class="btn" id="reset-no">Keep my progress</button></div>`;
      $('#reset-yes').onclick = () => { S = freshState(); save(); go('atlas'); };
      $('#reset-no').onclick = () => renderProfile();
    };
  }

  /* ───────── boot ───────── */
  function start(hotData) {
    load(hotData);
    window.claude?.hot?.snapshot?.(() => ({ state: S }));
    render();
  }
  window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
})();
