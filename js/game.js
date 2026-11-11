/* Professor Quill and the Clockwork Heart — game engine */
(() => {
  'use strict';

  const SAVE_KEY = 'quill-clockwork-heart-save-v1';
  const PUZ = Object.fromEntries(PUZZLES.map(p => [p.id, p]));
  const app = document.getElementById('app');
  let keyHandler = null;          // current screen's keyboard handler
  const memos = {};               // puzzle id -> memo dataURL (session only)

  /* ---------------- state ---------------- */
  function fresh() {
    return { progress: 0, laurels: 0, tokens: START_TOKENS, solved: {}, hints: {}, wrong: {}, sound: true };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && typeof s.progress === 'number') return Object.assign(fresh(), s);
    } catch (e) { /* ignore */ }
    return fresh();
  }
  let state = load();
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  /* ---------------- helpers ---------------- */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const pad = n => String(n).padStart(3, '0');
  function setScreen(el) {
    keyHandler = null;
    app.replaceChildren(el);
    window.scrollTo(0, 0);
  }
  function currentValue(p, wrong) {
    return Math.max(Math.round(p.value * 0.4), Math.round(p.value * (1 - 0.2 * wrong)));
  }
  /* Load an image; resolve true/false. */
  function probeImage(src) {
    return new Promise(res => {
      if (!src) return res(false);
      const img = new Image();
      img.onload = () => res(true);
      img.onerror = () => res(false);
      img.src = src;
    });
  }
  document.addEventListener('keydown', e => { if (keyHandler) keyHandler(e); });

  /* ---------------- sound ---------------- */
  let actx = null;
  function tone(freq, dur = 0.08, type = 'sine', vol = 0.06, when = 0) {
    if (!state.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + when;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* audio unavailable */ }
  }
  const sfx = {
    click: () => tone(660, 0.05, 'triangle', 0.05),
    blip: () => tone(990, 0.03, 'square', 0.015),
    page: () => tone(520, 0.06, 'triangle', 0.035),
    good: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.07, i * 0.1)),
    bad: () => { tone(233, 0.25, 'sawtooth', 0.04); tone(175, 0.4, 'sawtooth', 0.04, 0.16); },
    coin: () => { tone(1320, 0.08, 'square', 0.03); tone(1760, 0.15, 'square', 0.03, 0.07); }
  };

  /* ---------------- art ---------------- */
  const GEAR_SVG = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor">
    <path d="M50 18l5 0 2 9a24 24 0 0 1 7 3l8-5 4 4-5 8a24 24 0 0 1 3 7l9 2v6l-9 2a24 24 0 0 1-3 7l5 8-4 4-8-5a24 24 0 0 1-7 3l-2 9h-6l-2-9a24 24 0 0 1-7-3l-8 5-4-4 5-8a24 24 0 0 1-3-7l-9-2v-6l9-2a24 24 0 0 1 3-7l-5-8 4-4 8 5a24 24 0 0 1 7-3l2-9z M50 38a12 12 0 1 0 0.01 0z" fill-rule="evenodd"/></g></svg>`;

  function portraitEl(c) {
    const wrap = h('div', { class: 'portrait-inner' });
    const mono = h('div', { class: 'monogram', style: `--c:${c.color || '#555'}` }, c.initials || '?');
    wrap.append(mono);
    if (c.image) probeImage(c.image).then(ok => {
      if (ok) wrap.replaceChildren(h('img', { src: c.image, alt: c.name }));
    });
    return wrap;
  }

  function artEl(p) {
    const box = h('div', { class: 'pz-art' },
      h('div', { class: 'pz-art-placeholder' },
        h('div', { class: 'ph-icon' }, p.icon || '?'),
        h('div', { class: 'ph-label' }, `Illustration for Puzzle ${pad(p.id)}`),
        h('code', {}, p.image || '')));
    probeImage(p.image).then(ok => {
      if (ok) box.replaceChildren(h('img', { src: p.image, alt: p.title }));
      else if (p.type === 'slide') box.replaceChildren(h('img', { src: fallbackPicture(), alt: 'The completed picture' }));
    });
    return box;
  }

  /* A drawn clock-face picture used for the sliding puzzle until real art is supplied. */
  let fallbackCache = null;
  function fallbackPicture() {
    if (fallbackCache) return fallbackCache;
    const s = 600, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(s / 2, s / 2, 40, s / 2, s / 2, s * 0.75);
    grad.addColorStop(0, '#f6e7c1'); grad.addColorStop(1, '#8a5a2b');
    g.fillStyle = grad; g.fillRect(0, 0, s, s);
    // gears in corners
    const gear = (x, y, r, teeth, col) => {
      g.save(); g.translate(x, y); g.fillStyle = col; g.beginPath();
      for (let i = 0; i < teeth * 2; i++) {
        const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r : r * 0.82;
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath(); g.fill();
      g.globalCompositeOperation = 'destination-out';
      g.beginPath(); g.arc(0, 0, r * 0.3, 0, 7); g.fill();
      g.restore();
    };
    gear(70, 80, 70, 12, '#b07a32'); gear(540, 530, 90, 14, '#a0692a');
    gear(530, 70, 55, 10, '#c58f3d'); gear(75, 530, 60, 10, '#c58f3d');
    // clock face
    g.beginPath(); g.arc(s / 2, s / 2, 210, 0, 7); g.fillStyle = '#fdf6e3'; g.fill();
    g.lineWidth = 16; g.strokeStyle = '#6b3f1d'; g.stroke();
    g.lineWidth = 4; g.strokeStyle = '#c9a24a';
    g.beginPath(); g.arc(s / 2, s / 2, 190, 0, 7); g.stroke();
    g.fillStyle = '#3b2412'; g.font = 'bold 40px Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const roman = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    roman.forEach((r, i) => {
      const a = i / 12 * Math.PI * 2 - Math.PI / 2;
      g.font = `bold ${r.length > 2 ? 30 : 38}px Georgia, serif`;
      g.fillText(r, s / 2 + Math.cos(a) * 150, s / 2 + Math.sin(a) * 150);
    });
    // heart in middle
    g.save(); g.translate(s / 2, s / 2 + 10); g.fillStyle = '#c0392b';
    g.beginPath(); g.moveTo(0, 40);
    g.bezierCurveTo(-70, -10, -40, -70, 0, -35);
    g.bezierCurveTo(40, -70, 70, -10, 0, 40); g.fill();
    g.restore();
    // hands
    g.lineCap = 'round'; g.strokeStyle = '#2a1a0c';
    g.lineWidth = 10; g.beginPath(); g.moveTo(s / 2, s / 2); g.lineTo(s / 2 + 70, s / 2 - 40); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(s / 2, s / 2); g.lineTo(s / 2 - 20, s / 2 - 120); g.stroke();
    g.beginPath(); g.arc(s / 2, s / 2, 10, 0, 7); g.fillStyle = '#c9a24a'; g.fill();
    return (fallbackCache = c.toDataURL());
  }

  /* ---------------- overlays ---------------- */
  function overlay(content, cls = '') {
    const ov = h('div', { class: 'overlay ' + cls }, content);
    document.body.append(ov);
    requestAnimationFrame(() => ov.classList.add('show'));
    return { el: ov, close: () => { ov.classList.remove('show'); setTimeout(() => ov.remove(), 200); } };
  }
  function confirmBox(msg, yesLabel, onYes) {
    const o = overlay(h('div', { class: 'card modal' },
      h('p', {}, msg),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => { sfx.click(); o.close(); } }, 'Cancel'),
        h('button', { class: 'btn primary', onclick: () => { sfx.click(); o.close(); onYes(); } }, yesLabel))));
  }

  /* ---------------- title ---------------- */
  function showTitle() {
    const solved = Object.keys(state.solved).length;
    const started = state.progress > 0;
    const soundBtn = h('button', { class: 'btn ghost small', onclick: () => {
      state.sound = !state.sound; save(); soundBtn.textContent = state.sound ? '♪ Sound: On' : '♪ Sound: Off'; sfx.click();
    } }, state.sound ? '♪ Sound: On' : '♪ Sound: Off');
    setScreen(h('div', { class: 'screen title-screen' },
      h('div', { class: 'title-gear big', html: GEAR_SVG }),
      h('div', { class: 'title-gear small', html: GEAR_SVG }),
      h('div', { class: 'title-card' },
        h('div', { class: 'title-sub' }, 'Professor Quill'),
        h('div', { class: 'title-and' }, 'and the'),
        h('h1', { class: 'title-main' }, 'Clockwork Heart'),
        h('div', { class: 'title-rule' }),
        h('div', { class: 'menu' },
          started && h('button', { class: 'btn primary', onclick: () => { sfx.click(); advance(); } },
            state.progress >= STORY.length ? 'Epilogue' : 'Continue'),
          h('button', { class: 'btn' + (started ? '' : ' primary'), onclick: newGame }, 'New Game'),
          h('button', { class: 'btn', onclick: () => { sfx.click(); showArchive(); } }, 'Puzzle Archive')),
        h('div', { class: 'title-stats' },
          `${solved} / ${PUZZLES.length} puzzles solved · `, h('span', { class: 'laurel-ico' }, '❦'), ` ${state.laurels} laurels`),
        soundBtn)));
  }
  function newGame() {
    sfx.click();
    const go = () => { const snd = state.sound; state = fresh(); state.sound = snd; save(); advance(); };
    if (state.progress > 0) confirmBox('Start a new game? Your current progress will be erased.', 'Start over', go);
    else go();
  }

  /* ---------------- story flow ---------------- */
  function advance() {
    const step = STORY[state.progress];
    const next = () => { state.progress++; save(); advance(); };
    if (!step) return showEnding();
    if (step.type === 'chapter') return showChapter(step, next);
    if (step.type === 'scene') return showScene(step, next);
    if (step.type === 'puzzle') {
      const p = PUZ[step.id];
      if (!p) { console.warn('Missing puzzle', step.id); return next(); }
      if (state.solved[p.id]) return next();   // already solved (e.g. resumed save)
      return showPuzzle(p, { replay: false, onContinue: next, onQuit: showTitle });
    }
    next();
  }

  function showChapter(step, done) {
    let finished = false;
    const go = () => { if (finished) return; finished = true; sfx.page(); done(); };
    setScreen(h('div', { class: 'screen chapter-screen', onclick: go },
      h('div', { class: 'chapter-card' },
        h('div', { class: 'chapter-num' }, `Chapter ${step.num}`),
        h('div', { class: 'title-rule' }),
        h('h2', { class: 'chapter-title' }, step.title),
        h('div', { class: 'tap-hint' }, 'Tap to continue'))));
    keyHandler = e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); go(); } };
  }

  function showScene(step, done) {
    const bg = h('div', { class: 'scene-bg' });
    probeImage(step.bg).then(ok => { if (ok) { bg.style.backgroundImage = `url("${step.bg}")`; bg.classList.add('has-img'); } });
    const portrait = h('div', { class: 'portrait' });
    const nameEl = h('div', { class: 'speaker' });
    const textEl = h('div', { class: 'dialogue-text' });
    const more = h('div', { class: 'more' }, '▼');
    const box = h('div', { class: 'dialogue-box' }, nameEl, textEl, more);
    let i = -1, timer = null, full = '', finished = false;

    function finishTyping() { clearInterval(timer); timer = null; textEl.textContent = full; more.classList.add('on'); }
    function showLine() {
      const L = step.lines[i];
      const c = CHARACTERS[L.who] || { name: L.who, initials: '?', color: '#555' };
      const narr = !!c.narrator;
      box.classList.toggle('narration', narr);
      nameEl.textContent = c.name || '';
      nameEl.style.setProperty('--c', c.color || '#555');
      nameEl.hidden = narr;
      portrait.replaceChildren();
      portrait.classList.toggle('empty', narr);
      if (!narr) { portrait.append(portraitEl(c)); portrait.classList.remove('pop'); void portrait.offsetWidth; portrait.classList.add('pop'); }
      full = L.text; textEl.textContent = ''; more.classList.remove('on');
      let n = 0;
      clearInterval(timer);
      timer = setInterval(() => {
        n += 1; textEl.textContent = full.slice(0, n);
        if (n % 3 === 0) sfx.blip();
        if (n >= full.length) finishTyping();
      }, 22);
    }
    function next() {
      if (finished) return;
      if (timer) return finishTyping();
      i++;
      if (i >= step.lines.length) { finished = true; clearInterval(timer); return done(); }
      sfx.page();
      showLine();
    }
    const skip = h('button', { class: 'btn ghost small skip', onclick: e => { e.stopPropagation(); clearInterval(timer); finished = true; done(); } }, 'Skip »');
    const menu = h('button', { class: 'btn ghost small menu-btn', onclick: e => { e.stopPropagation(); clearInterval(timer); finished = true; showTitle(); } }, '☰ Menu');
    setScreen(h('div', { class: 'screen scene-screen', onclick: next },
      bg, h('div', { class: 'place-label' }, step.place || ''), menu, skip, portrait, box));
    keyHandler = e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); next(); } };
    next();
  }

  function showEnding() {
    const solved = Object.keys(state.solved).length;
    const max = PUZZLES.reduce((a, p) => a + p.value, 0);
    setScreen(h('div', { class: 'screen chapter-screen ending' },
      h('div', { class: 'chapter-card' },
        h('div', { class: 'chapter-num' }, 'The End'),
        h('div', { class: 'title-rule' }),
        h('h2', { class: 'chapter-title' }, 'The clock ticks on…'),
        h('p', { class: 'ending-stats' }, `Puzzles solved: ${solved} / ${PUZZLES.length}`),
        h('p', { class: 'ending-stats' }, `Laurels earned: ${state.laurels} / ${max}`),
        h('div', { class: 'menu' },
          h('button', { class: 'btn primary', onclick: () => { sfx.click(); showArchive(); } }, 'Puzzle Archive'),
          h('button', { class: 'btn', onclick: () => { sfx.click(); showTitle(); } }, 'Title Screen')))));
  }

  /* ---------------- archive ---------------- */
  function showArchive() {
    const cards = PUZZLES.map(p => {
      const s = state.solved[p.id];
      return h('button', {
        class: 'arch-card' + (s ? ' solved' : ' locked'),
        disabled: !s,
        onclick: () => { sfx.click(); showPuzzle(p, { replay: true, onContinue: showArchive, onQuit: showArchive }); }
      },
        h('div', { class: 'arch-num' }, pad(p.id)),
        h('div', { class: 'arch-title' }, s ? p.title : '???'),
        h('div', { class: 'arch-val' }, s ? `❦ ${s.earned} / ${p.value}` : 'Unsolved'));
    });
    setScreen(h('div', { class: 'screen archive-screen' },
      h('div', { class: 'archive-head' },
        h('button', { class: 'btn small', onclick: () => { sfx.click(); showTitle(); } }, '« Back'),
        h('h2', {}, 'Puzzle Archive'),
        h('div', { class: 'arch-total' }, `❦ ${state.laurels}`)),
      h('p', { class: 'archive-note' }, 'Solved puzzles can be replayed here at any time.'),
      h('div', { class: 'archive-grid' }, cards)));
    keyHandler = e => { if (e.key === 'Escape') showTitle(); };
  }

  /* ---------------- puzzle widgets ---------------- */
  const WIDGETS = {
    choice(p) {
      let sel = null;
      const btns = p.options.map((o, i) => h('button', {
        class: 'choice', onclick: () => {
          sel = i; btns.forEach((b, j) => b.classList.toggle('selected', j === i)); sfx.blip();
        }
      }, h('span', { class: 'choice-letter' }, 'ABCDEFGH'[i]), h('span', { class: 'choice-text' }, o)));
      return {
        el: h('div', { class: 'choices' }, btns),
        instr: 'Choose an answer, then press Submit.',
        check: () => sel === null ? null : sel === p.answer
      };
    },

    number(p) {
      const input = h('input', { class: 'answer-input', type: 'text', inputmode: 'numeric', autocomplete: 'off', placeholder: '?', 'aria-label': 'Your answer' });
      input.addEventListener('input', () => { input.value = input.value.replace(/[^\d.\-]/g, '').slice(0, 9); });
      const key = k => h('button', {
        class: 'key' + (typeof k === 'string' && k.length > 1 ? ' wide' : ''), onclick: () => {
          sfx.blip();
          if (k === '⌫') input.value = input.value.slice(0, -1);
          else if (k === 'Clear') input.value = '';
          else if (input.value.length < 9) input.value += k;
        }
      }, k);
      const pad_ = h('div', { class: 'keypad' }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 'Clear', 0, '⌫'].map(k => key(String(k))));
      return {
        el: h('div', { class: 'numeric' },
          h('div', { class: 'answer-row' }, p.prefix && h('span', { class: 'unit' }, p.prefix), input, p.unit && h('span', { class: 'unit' }, p.unit)),
          pad_),
        instr: 'Enter your answer, then press Submit.',
        focus: input,
        check: () => {
          const v = input.value.trim();
          if (!v) return null;
          return Number(v) === p.answer;
        }
      };
    },

    text(p) {
      const input = h('input', { class: 'answer-input text', type: 'text', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', placeholder: 'Your answer', 'aria-label': 'Your answer' });
      const norm = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return {
        el: h('div', { class: 'numeric' }, h('div', { class: 'answer-row' }, input)),
        instr: 'Write your answer, then press Submit.',
        focus: input,
        check: () => {
          const v = norm(input.value);
          if (!v) return null;
          return p.answers.map(norm).includes(v);
        }
      };
    },

    select(p) {
      const sel = new Set();
      const cells = p.items.map((label, i) => h('button', {
        class: 'sel-item ' + (p.itemClass || ''), onclick: () => {
          if (sel.has(i)) sel.delete(i);
          else {
            if (p.maxSelect && sel.size >= p.maxSelect) { cells[i].classList.add('nope'); setTimeout(() => cells[i].classList.remove('nope'), 300); return; }
            sel.add(i);
          }
          cells[i].classList.toggle('selected', sel.has(i));
          p.itemClass === 'coin' ? sfx.coin() : sfx.blip();
          counter.textContent = p.maxSelect ? `Selected: ${sel.size} / ${p.maxSelect}` : `Selected: ${sel.size}`;
        }
      }, label));
      const counter = h('div', { class: 'counter' }, p.maxSelect ? `Selected: 0 / ${p.maxSelect}` : 'Selected: 0');
      return {
        el: h('div', { class: 'select-wrap' },
          h('div', { class: 'sel-grid', style: `--cols:${p.cols || 4}` }, cells), counter),
        instr: 'Tap to select, then press Submit.',
        reset: () => { sel.clear(); cells.forEach(c => c.classList.remove('selected')); counter.textContent = p.maxSelect ? `Selected: 0 / ${p.maxSelect}` : 'Selected: 0'; },
        check: () => {
          if (!sel.size) return null;
          const a = [...sel].sort((x, y) => x - y), b = [...p.answer].sort((x, y) => x - y);
          return a.length === b.length && a.every((v, i) => v === b[i]);
        }
      };
    },

    order(p) {
      let arr = [...p.start], picked = null;
      const list = h('ol', { class: 'order-list' });
      function render() {
        list.replaceChildren(...arr.map((name, i) => h('li', { class: 'order-item' + (picked === i ? ' picked' : '') },
          h('span', { class: 'order-pos' }, i + 1),
          h('button', { class: 'order-name', onclick: () => tap(i) }, name),
          h('span', { class: 'order-arrows' },
            h('button', { class: 'arrow', 'aria-label': 'Move up', disabled: i === 0, onclick: () => swap(i, i - 1) }, '▲'),
            h('button', { class: 'arrow', 'aria-label': 'Move down', disabled: i === arr.length - 1, onclick: () => swap(i, i + 1) }, '▼')))));
      }
      function swap(a, b) { [arr[a], arr[b]] = [arr[b], arr[a]]; picked = null; sfx.blip(); render(); }
      function tap(i) {
        if (picked === null) { picked = i; sfx.blip(); render(); }
        else if (picked === i) { picked = null; render(); }
        else swap(picked, i);
      }
      render();
      return {
        el: h('div', { class: 'order-wrap' }, h('div', { class: 'order-end' }, 'Front'), list, h('div', { class: 'order-end' }, 'Back')),
        instr: 'Tap two names to swap them (or use the arrows), then press Submit.',
        reset: () => { arr = [...p.start]; picked = null; render(); },
        check: () => arr.every((v, i) => v === p.answer[i])
      };
    },

    lights(p, onSolved) {
      const n = p.size;
      let grid, done = false, moves = 0;
      const press = (r, c, g) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < n && cc >= 0 && cc < n) g[rr * n + cc] = !g[rr * n + cc];
      });
      const cells = [];
      const board = h('div', { class: 'lights-grid', style: `--n:${n}` });
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const b = h('button', { class: 'lamp', 'aria-label': `Lantern row ${r + 1} column ${c + 1}`, onclick: () => {
          if (done) return;
          press(r, c, grid); moves++; sfx.blip(); render();
          if (grid.every(Boolean)) { done = true; board.classList.add('solved'); setTimeout(onSolved, 700); }
        } }, h('span', { class: 'flame' }));
        cells.push(b); board.append(b);
      }
      const counter = h('div', { class: 'counter' });
      function render() {
        cells.forEach((b, i) => b.classList.toggle('on', grid[i]));
        counter.textContent = `Touches: ${moves}`;
      }
      function init() {
        grid = Array(n * n).fill(true); done = false; moves = 0;
        p.scramble.forEach(([r, c]) => press(r, c, grid));
        board.classList.remove('solved'); render();
      }
      init();
      return { el: h('div', { class: 'lights-wrap' }, board, counter), instr: 'Touch the lamps until every one is lit.', auto: true, reset: init };
    },

    slide(p, onSolved) {
      const n = p.size, N = n * n, BLANK = N - 1;
      let tiles, done = false, moves = 0;
      const board = h('div', { class: 'slide-board', style: `--n:${n}` });
      const tileEls = [];
      for (let id = 0; id < N; id++) {
        const t = h('button', { class: 'tile' + (id === BLANK ? ' blank' : ''), onclick: () => tapTile(id) },
          h('span', { class: 'tile-num' }, id + 1));
        const r = Math.floor(id / n), c = id % n;
        t.style.backgroundPosition = `${(c / (n - 1)) * 100}% ${(r / (n - 1)) * 100}%`;
        tileEls.push(t); board.append(t);
      }
      const counter = h('div', { class: 'counter' });
      const applyPicture = src => {
        tileEls.forEach(t => { t.style.backgroundImage = `url("${src}")`; t.classList.add('pic'); });
      };
      probeImage(p.image).then(ok => applyPicture(ok ? p.image : fallbackPicture()));

      function render() {
        tiles.forEach((id, pos) => {
          const t = tileEls[id];
          t.style.left = `${(pos % n) * (100 / n)}%`;
          t.style.top = `${Math.floor(pos / n) * (100 / n)}%`;
        });
        counter.textContent = `Moves: ${moves}`;
      }
      function neighbours(pos) {
        const r = Math.floor(pos / n), c = pos % n, out = [];
        if (r > 0) out.push(pos - n); if (r < n - 1) out.push(pos + n);
        if (c > 0) out.push(pos - 1); if (c < n - 1) out.push(pos + 1);
        return out;
      }
      function tapTile(id) {
        if (done || id === BLANK) return;
        const pos = tiles.indexOf(id), bpos = tiles.indexOf(BLANK);
        if (!neighbours(bpos).includes(pos)) { tileEls[id].classList.add('nope'); setTimeout(() => tileEls[id].classList.remove('nope'), 250); return; }
        tiles[bpos] = id; tiles[pos] = BLANK; moves++; sfx.blip(); render();
        if (tiles.every((v, i) => v === i)) {
          done = true; board.classList.add('solved'); setTimeout(onSolved, 900);
        }
      }
      function init() {
        tiles = [...Array(N).keys()]; done = false; moves = 0; board.classList.remove('solved');
        do {
          let b = BLANK, prev = -1;
          for (let k = 0; k < (p.shuffle || 100); k++) {
            const opts = neighbours(b).filter(x => x !== prev);
            const pick = opts[Math.floor(Math.random() * opts.length)];
            tiles[b] = tiles[pick]; tiles[pick] = BLANK; prev = b; b = pick;
          }
        } while (tiles.every((v, i) => v === i));
        render();
      }
      init();
      return { el: h('div', { class: 'slide-wrap' }, board, counter), instr: 'Tap a tile next to the gap to slide it.', auto: true, reset: init };
    }
  };

  /* ---------------- puzzle screen ---------------- */
  function showPuzzle(p, opts) {
    const replay = opts.replay;
    let wrong = replay ? 0 : (state.wrong[p.id] || 0);
    let solvedNow = false;

    const valEl = h('span', { class: 'stat-val' });
    const tokEl = h('span', { class: 'stat-val' });
    const hintBadge = h('span', { class: 'badge' });
    function refreshStats() {
      valEl.textContent = replay ? '—' : currentValue(p, wrong);
      tokEl.textContent = state.tokens;
      const unlocked = replay ? 3 : (state.hints[p.id] || 0);
      hintBadge.textContent = `${unlocked}/3`;
    }

    const widget = WIDGETS[p.type](p, () => solved());
    const workArea = h('div', { class: 'pz-widget type-' + p.type }, widget.el);

    const submitBtn = !widget.auto && h('button', { class: 'btn primary submit', onclick: submit }, 'Submit');
    const resetBtn = widget.reset && h('button', { class: 'btn', onclick: () => { sfx.click(); widget.reset(); } }, 'Reset');

    const screen = h('div', { class: 'screen puzzle-screen' },
      h('header', { class: 'pz-header' },
        h('div', { class: 'pz-num' }, h('small', {}, 'Puzzle'), pad(p.id)),
        h('div', { class: 'pz-title' }, p.title, replay && h('span', { class: 'replay-tag' }, 'Replay')),
        h('div', { class: 'pz-stats' },
          h('div', { class: 'stat', title: 'Laurels this puzzle is worth' }, h('span', { class: 'stat-ico' }, '❦'), valEl),
          h('div', { class: 'stat', title: 'Insight Tokens' }, h('span', { class: 'stat-ico token' }, '✦'), tokEl))),
      h('div', { class: 'pz-body' },
        h('section', { class: 'pz-page' }, artEl(p), h('div', { class: 'pz-text', html: p.text })),
        h('section', { class: 'pz-work' },
          h('div', { class: 'pz-instr' }, widget.instr),
          workArea,
          h('div', { class: 'pz-actions' }, resetBtn, submitBtn))),
      h('footer', { class: 'pz-toolbar' },
        h('button', { class: 'tool', onclick: () => { sfx.click(); confirmBox(replay ? 'Return to the archive?' : 'Leave this puzzle for now? You can come back to it later.', replay ? 'Leave' : 'Quit', opts.onQuit); } }, h('span', {}, '⟵'), 'Quit'),
        h('button', { class: 'tool', onclick: () => { sfx.click(); openMemo(p); } }, h('span', {}, '✎'), 'Memo'),
        h('button', { class: 'tool hint-tool', onclick: () => { sfx.click(); openHints(p, replay, refreshStats); } }, h('span', {}, '✦'), 'Hints ', hintBadge)));

    refreshStats();
    setScreen(screen);
    if (widget.focus && window.matchMedia('(pointer:fine)').matches) widget.focus.focus();
    keyHandler = e => {
      if (document.querySelector('.overlay')) return;
      if (e.key === 'Enter' && submitBtn) { e.preventDefault(); submit(); }
    };

    function submit() {
      if (solvedNow) return;
      const r = widget.check();
      if (r === null) {
        submitBtn.classList.remove('shake'); void submitBtn.offsetWidth; submitBtn.classList.add('shake');
        return;
      }
      if (r) solved(); else incorrect();
    }

    function solved() {
      if (solvedNow) return;
      solvedNow = true;
      let earned = null;
      if (!replay && !state.solved[p.id]) {
        earned = currentValue(p, wrong);
        state.solved[p.id] = { earned };
        state.laurels += earned;
        state.tokens += 1;
        delete state.wrong[p.id];
        save();
      }
      sfx.good();
      const o = overlay(h('div', { class: 'card result correct' },
        h('div', { class: 'stamp good' }, 'Solved!'),
        h('div', { class: 'result-expl', html: p.explanation }),
        earned !== null && h('div', { class: 'result-reward' },
          h('span', {}, `❦ +${earned} laurels`), h('span', {}, '✦ +1 Insight Token')),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: () => { sfx.click(); o.close(); opts.onContinue(); } }, 'Continue'))), 'result-ov');
    }

    function incorrect() {
      if (!replay) { wrong++; state.wrong[p.id] = wrong; save(); }
      sfx.bad();
      const o = overlay(h('div', { class: 'card result wrong' },
        h('div', { class: 'stamp bad' }, 'Not quite…'),
        h('p', {}, 'That isn\'t the answer. Take another look — a hint might help.'),
        !replay && h('p', { class: 'muted' }, `This puzzle is now worth ❦ ${currentValue(p, wrong)} laurels.`),
        h('div', { class: 'row' },
          h('button', { class: 'btn', onclick: () => { sfx.click(); o.close(); openHints(p, replay, refreshStats); } }, 'View hints'),
          h('button', { class: 'btn primary', onclick: () => { sfx.click(); o.close(); refreshStats(); } }, 'Try again'))), 'result-ov');
    }
  }

  /* ---------------- hints ---------------- */
  function openHints(p, replay, refresh) {
    let tab = 0;
    const body = h('div', { class: 'hint-body' });
    const tabs = h('div', { class: 'hint-tabs' });
    const unlocked = () => replay ? 3 : (state.hints[p.id] || 0);
    function render() {
      const u = unlocked();
      tabs.replaceChildren(...[0, 1, 2].map(i => h('button', {
        class: 'hint-tab' + (i === tab ? ' active' : '') + (i < u ? ' open' : ''),
        onclick: () => { tab = i; sfx.page(); render(); }
      }, i < u ? `Hint ${i + 1}` : `🔒 ${i + 1}`)));
      if (tab < u) body.replaceChildren(h('p', { class: 'hint-text' }, p.hints[tab]));
      else if (tab > u) body.replaceChildren(h('p', { class: 'muted' }, `Unlock Hint ${u + 1} first.`));
      else if (state.tokens < 1) body.replaceChildren(h('p', { class: 'muted' }, 'You have no Insight Tokens left. Solve more puzzles to earn them!'));
      else body.replaceChildren(
        h('p', {}, `Spend 1 Insight Token to reveal this hint? You have ✦ ${state.tokens}.`),
        h('button', { class: 'btn primary', onclick: () => {
          state.tokens--; state.hints[p.id] = u + 1; save(); sfx.coin(); refresh(); render();
        } }, 'Unlock (✦ 1)'));
    }
    tab = Math.min(unlocked(), 2);   // open on the next locked hint (or the last one)
    render();
    const o = overlay(h('div', { class: 'card modal hints' },
      h('h3', {}, 'Hints'),
      tabs, body,
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => { sfx.click(); o.close(); } }, 'Close'))));
  }

  /* ---------------- memo ---------------- */
  function openMemo(p) {
    const canvas = h('canvas', { class: 'memo-canvas' });
    let color = '#2a1a0c', size = 3, erasing = false, drawing = false, last = null;
    const tools = [
      ['Pen', () => { erasing = false; color = '#2a1a0c'; size = 3; }],
      ['Red', () => { erasing = false; color = '#b0302a'; size = 3; }],
      ['Eraser', () => { erasing = true; size = 22; }]
    ];
    const toolBtns = tools.map(([label, fn], i) => h('button', {
      class: 'btn small' + (i === 0 ? ' active' : ''), onclick: () => {
        fn(); toolBtns.forEach(b => b.classList.remove('active')); toolBtns[i].classList.add('active'); sfx.blip();
      }
    }, label));
    const close = () => { memos[p.id] = canvas.toDataURL(); window.removeEventListener('resize', onResize); o.close(); };
    const o = overlay(h('div', { class: 'memo' },
      h('div', { class: 'memo-bar' },
        h('strong', {}, 'Memo'), toolBtns,
        h('button', { class: 'btn small', onclick: () => { sfx.click(); ctx.clearRect(0, 0, canvas.width, canvas.height); } }, 'Clear'),
        h('button', { class: 'btn small primary', onclick: () => { sfx.click(); close(); } }, 'Done')),
      canvas), 'memo-ov');
    const ctx = canvas.getContext('2d');
    function fit() {
      const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      const prev = canvas.width ? canvas.toDataURL() : memos[p.id];
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (prev) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height); img.src = prev; }
    }
    const onResize = () => fit();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(fit);
    const pt = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener('pointerdown', e => { drawing = true; last = pt(e); canvas.setPointerCapture(e.pointerId); dot(last); });
    canvas.addEventListener('pointermove', e => {
      if (!drawing) return;
      const cur = pt(e);
      ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
      ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...cur); ctx.stroke();
      last = cur;
    });
    const end = () => { drawing = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    function dot([x, y]) {
      ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, size / 2, 0, 7); ctx.fill();
    }
  }

  /* ---------------- boot ---------------- */
  showTitle();
})();
