/* Lanterns of Lore — rendering, maps, movement. */
(function () {
  const LL = window.LL;
  const TW = 24, TH = 12, PX = 4;            // internal tile size, pixel scale
  const WTW = TW * PX, WTH = TH * PX;        // world tile size (96 × 48)

  LL.ASSET_URLS = LL.ASSET_URLS || {
    tavern: 'assets/tavern.webp', hero: 'assets/hero-sprite.png',
    heroBattle: 'assets/hero-battle.png', heroPortrait: 'assets/hero-portrait.png'
  };
  LL.IMG = {};
  LL.loadAssets = () => Promise.all(Object.entries(LL.ASSET_URLS).map(([k, url]) => new Promise((res) => {
    const im = new Image(); im.onload = () => { LL.IMG[k] = im; res(); }; im.onerror = () => res(); im.src = url;
  })));

  /* ───────── helpers ───────── */
  const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const k = (v) => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
    return `rgb(${k(r)},${k(g)},${k(b)})`;
  };
  LL.shade = shade;

  /* ───────── pixel sprites with automatic outline ───────── */
  const spriteCache = {};
  LL.sprite = (name, palKey) => {
    const key = name + '|' + palKey;
    if (spriteCache[key]) return spriteCache[key];
    const rows = LL.SPRITES[name], pal = LL.PALETTES[palKey] || {};
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
    const c = canvas(w + 2, h + 2), g = c.getContext('2d');
    const filled = (x, y) => y >= 0 && y < h && x >= 0 && x < (rows[y] || '').length && rows[y][x] !== '.' && rows[y][x] !== ' ';
    g.fillStyle = pal.o || '#120c10';
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      if (filled(x, y)) continue;
      if (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1)) g.fillRect(x + 1, y + 1, 1, 1);
    }
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.' || ch === ' ') return;
      g.fillStyle = pal[ch] || '#ff00ff'; g.fillRect(x + 1, y + 1, 1, 1);
    }));
    return (spriteCache[key] = c);
  };

  /* ───────── material colours ───────── */
  const FLOORS = {
    grass: ['#2c4529', '#355431', '#24391f'], cobble: ['#4b4650', '#5a5560', '#3a3640'],
    stone: ['#363b4b', '#40465a', '#2b2f3c'], brass: ['#5a4526', '#6e5530', '#463519'],
    sand: ['#6e5a3c', '#7d6845', '#5c4a30'], carpet: ['#6a2626', '#7d3030', '#561d1d'],
    moss: ['#273825', '#30452c', '#1f2d1d'], stoneTile: ['#3e4238', '#4a4f43', '#33362e'],
    marble: ['#2a2340', '#342b4e', '#221c34'], void: ['#1a1428', '#22193a', '#120e1c'],
    water: ['#173552', '#1f4468', '#122a42'], bridge: ['#5c3a22', '#6e4629', '#45291a']
  };
  const WALLS = {
    stone: { top: '#454d63', face: '#5a6480', line: '#3a4156' },
    sandstone: { top: '#7a6040', face: '#a08050', line: '#6e5434' },
    obsidian: { top: '#2e2444', face: '#463864', line: '#221a34' },
    hedge: { top: '#2a4d2c', face: '#2f5a33', line: '#1f3d22' },
    plaster: { top: '#2b3550', face: '#7a6450', line: '#5a4636' }
  };

  /* ───────── iso tile drawing (internal pixels) ───────── */
  function diamondRows(fn) { for (let r = 0; r < TH; r++) { const d = r < TH / 2 ? r : TH - 1 - r; const hw = (d + 1) * 2; fn(r, hw); } }
  function fillDiamond(g, cx, cy, col) { g.fillStyle = col; diamondRows((r, hw) => g.fillRect(cx - hw, cy - TH / 2 + r, hw * 2, 1)); }
  function floorTile(g, cx, cy, type, tx, ty) {
    const [base, hi, lo] = FLOORS[type] || FLOORS.stone;
    fillDiamond(g, cx, cy, base);
    const tiled = ['stone', 'cobble', 'sand', 'marble', 'stoneTile', 'brass'].includes(type);
    diamondRows((r, hw) => {
      const y = cy - TH / 2 + r;
      if (tiled && r < TH / 2) { g.fillStyle = lo; g.fillRect(cx - hw, y, 2, 1); g.fillRect(cx + hw - 2, y, 2, 1); }
    });
    for (let i = 0; i < 7; i++) {
      const r = Math.floor(hash(tx, ty, i) * TH), d = r < TH / 2 ? r : TH - 1 - r, hw = (d + 1) * 2;
      const x = cx - hw + Math.floor(hash(tx, ty, i + 9) * hw * 2);
      g.fillStyle = hash(tx, ty, i + 20) > 0.5 ? hi : lo; g.fillRect(x, cy - TH / 2 + r, 1, 1);
    }
    if (type === 'bridge') { g.fillStyle = lo; for (let k = -8; k <= 8; k += 4) g.fillRect(cx + k, cy - 3 + Math.abs(k) / 4, 1, 6 - Math.abs(k) / 2); }
    if (type === 'carpet') { g.fillStyle = '#c9a24a'; g.fillRect(cx - 1, cy - 1, 2, 2); }
  }

  function blockSprite(h, top, face, line, opts = {}) {
    const c = canvas(TW, TH + h), g = c.getContext('2d');
    const cy = h + TH / 2;
    for (let i = 0; i < TW; i++) {
      const left = i < TW / 2;
      const yEdge = left ? Math.floor(TH / 2 + i / 2) : Math.floor(TH / 2 + (TW - 1 - i) / 2);
      g.fillStyle = left ? face : shade(face, -0.28);
      g.fillRect(i, yEdge, 1, h);
      g.fillStyle = left ? line : shade(line, -0.25);
      for (let k = 4; k < h; k += 5) {
        g.fillRect(i, yEdge + k, 1, 1);
        if (opts.bricks && ((i + (k % 10 ? 0 : 3)) % 6 === 0)) g.fillRect(i, yEdge + k - 4, 1, 4);
      }
      g.fillStyle = shade(face, -0.45); g.fillRect(i, yEdge + h - 1, 1, 1);
    }
    // top
    diamondRows((r, hw) => { g.fillStyle = !opts.roof && (r === 0 || r === TH - 1) ? shade(top, 0.15) : top; g.fillRect(TW / 2 - hw, r, hw * 2, 1); });
    if (opts.leaves) for (let i = 0; i < 30; i++) { g.fillStyle = hash(i, h, 3) > 0.5 ? shade(face, 0.25) : shade(face, -0.3); g.fillRect(Math.floor(hash(i, 1, h) * TW), Math.floor(hash(1, i, h) * (TH + h)), 1, 1); }
    if (opts.window) { g.fillStyle = '#2a1a10'; g.fillRect(4, 14, 5, 8); g.fillStyle = '#ffcf6a'; g.fillRect(5, 15, 3, 6); g.fillStyle = '#2a1a10'; g.fillRect(6, 15, 1, 6); }
    if (opts.door) { g.fillStyle = '#1a0e08'; g.fillRect(4, cy - 13, 6, 14); g.fillRect(5, cy - 14, 4, 1); g.fillStyle = '#5a3a20'; g.fillRect(5, cy - 12, 4, 12); g.fillStyle = '#e0b34c'; g.fillRect(8, cy - 6, 1, 1); }
    if (opts.books) {
      const cols = ['#8a2f2f', '#2f5a8a', '#c9a24a', '#3d6b54', '#6a3d7a'];
      for (let row = 0; row < 3; row++) for (let i = 1; i < TW / 2 - 1; i++) {
        g.fillStyle = cols[Math.floor(hash(i, row, h) * cols.length)];
        g.fillRect(i, Math.floor(TH / 2 + i / 2) + 3 + row * 6, 1, 4);
      }
    }
    if (opts.roof) for (let i = 0; i < 10; i++) { g.fillStyle = shade(top, hash(i, h, 5) > 0.5 ? 0.12 : -0.15); const r = 2 + Math.floor(hash(i, 2, h) * 8), d = r < 6 ? r : TH - 1 - r; g.fillRect(TW / 2 - d * 2 + Math.floor(hash(2, i, h) * d * 4), r, 2, 1); }
    return { c, ax: TW / 2, ay: cy };
  }

  function treeSprite(seed, autumn) {
    const c = canvas(TW + 4, 40), g = c.getContext('2d');
    g.fillStyle = '#3a2416'; g.fillRect(12, 26, 4, 10); g.fillStyle = '#2a1a10'; g.fillRect(12, 26, 1, 10);
    const base = autumn ? '#5a4a1e' : '#2d5130', hi = autumn ? '#8a6a2a' : '#3f6b3a', lo = autumn ? '#3a2e12' : '#1d3720';
    const blobs = [[14, 15, 10], [8, 19, 7], [20, 19, 7], [14, 9, 7]];
    blobs.forEach(([bx, by, br]) => {
      for (let y = -br; y <= br; y++) for (let x = -br; x <= br; x++) {
        if (x * x + y * y > br * br) continue;
        const n = hash(bx + x, by + y, seed);
        g.fillStyle = (x + y < -br * 0.4 && n > 0.3) ? hi : (x + y > br * 0.6 || n > 0.88 ? lo : base);
        g.fillRect(bx + x, by + y, 1, 1);
      }
    });
    return { c, ax: 14, ay: 35 };
  }

  function propSprite(kind, theme) {
    const g0 = (w, h) => { const c = canvas(w, h); return [c, c.getContext('2d')]; };
    if (kind === 'b') { // barrel
      const [c, g] = g0(12, 14);
      for (let y = 0; y < 13; y++) { const w = 8 + (y > 2 && y < 10 ? 2 : 0); g.fillStyle = '#6e4428'; g.fillRect(6 - w / 2, y, w, 1); g.fillStyle = '#4a2c18'; g.fillRect(6 - w / 2, y, 1, 1); g.fillRect(6 + w / 2 - 1, y, 1, 1); }
      g.fillStyle = '#2a2a30'; g.fillRect(1, 3, 10, 1); g.fillRect(1, 9, 10, 1); g.fillStyle = '#8a5a34'; g.fillRect(3, 0, 6, 2);
      return { c, ax: 6, ay: 12 };
    }
    if (kind === 'c') return blockSprite(8, '#7a5230', '#6a4528', '#4a2e18');
    if (kind === 't') { const s = blockSprite(5, '#7a4e2c', '#5a361e', '#3a2414'); return s; }
    if (kind === 'k') return blockSprite(24, '#3a2414', '#4a2e18', '#2a1a0e', { books: true });
    if (kind === 'p') { const w = WALLS[theme] || WALLS.stone; return blockSprite(26, w.top, shade(w.face, 0.1), w.line, { bricks: true }); }
    if (kind === 'r') {
      const [c, g] = g0(14, 10);
      for (let y = 0; y < 10; y++) for (let x = 0; x < 14; x++) { const dx = (x - 7) / 7, dy = (y - 6) / 5; if (dx * dx + dy * dy > 1) continue; g.fillStyle = dx + dy < -0.3 ? '#7a7680' : (dx + dy > 0.5 ? '#3e3b44' : '#5a5660'); g.fillRect(x, y, 1, 1); }
      return { c, ax: 7, ay: 9 };
    }
    if (kind === 'x') {
      const col = theme === 'grove' ? ['#b18cff', '#6a48b0', '#e8dcff'] : theme === 'spire' ? ['#c06aff', '#5a2a90', '#f0d8ff'] : ['#5fe0f0', '#2a8a9a', '#dcfbff'];
      const [c, g] = g0(12, 22);
      const shard = (x0, h, w) => { for (let y = 0; y < h; y++) { const ww = Math.max(1, Math.round(w * (y < 3 ? (y + 1) / 3 : 1))); g.fillStyle = col[1]; g.fillRect(x0 - Math.floor(ww / 2), 21 - h + y, ww, 1); g.fillStyle = col[0]; g.fillRect(x0 - Math.floor(ww / 2), 21 - h + y, Math.ceil(ww / 2), 1); } g.fillStyle = col[2]; g.fillRect(x0 - 1, 22 - h + 1, 1, 3); };
      shard(6, 20, 4); shard(3, 12, 3); shard(9, 14, 3);
      return { c, ax: 6, ay: 21 };
    }
    if (kind === 'l') {
      const [c, g] = g0(8, 32);
      g.fillStyle = '#1e1a1e'; g.fillRect(3, 8, 2, 23); g.fillRect(1, 30, 6, 2);
      g.fillStyle = '#2a2420'; g.fillRect(1, 2, 6, 7); g.fillStyle = '#ffd36a'; g.fillRect(2, 3, 4, 5); g.fillStyle = '#fff2c0'; g.fillRect(3, 4, 2, 3);
      g.fillStyle = '#1e1a1e'; g.fillRect(2, 0, 4, 2);
      return { c, ax: 4, ay: 31 };
    }
    return null;
  }

  /* ───────── map building ───────── */
  LL.buildMap = function (id) {
    const def = LL.MAPS[id];
    const m = { id, def, kind: def.kind || 'tiles', objects: [], lights: [], water: [], npcs: [], name: def.name };
    if (m.kind === 'image') {
      m.w = def.w; m.h = def.h;
      const poly = def.floor;
      const inPoly = (x, y) => { let ins = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins; } return ins; };
      m.walkStatic = (x, y) => inPoly(x, y) && !def.blocks.some((b) => ((x - b.x) / b.rx) ** 2 + ((y - b.y) / b.ry) ** 2 < 1);
      m.npcs = def.npcs.map((n) => Object.assign({}, n, { talkX: (n.talk || n).x, talkY: (n.talk || n).y, painted: true }));
      m.exits = def.exits.map((e) => Object.assign({}, e));
      return m;
    }
    const rows = def.tiles, H = rows.length, W = Math.max(...rows.map((r) => r.length));
    m.tw = W; m.th = H;
    const ox = H * TW / 2 + TW, oy = TH + 40;                       // internal-pixel origin
    const iw = (W + H) * TW / 2 + TW * 2, ih = (W + H) * TH / 2 + TH * 2 + 40;
    m.w = iw * PX; m.h = ih * PX; m.ox = ox; m.oy = oy;
    m.tileAt = (tx, ty) => (rows[ty] || '')[tx] || ' ';
    m.toWorld = (tx, ty) => ({ x: (ox + (tx - ty) * TW / 2) * PX, y: (oy + (tx + ty) * TH / 2) * PX });
    m.toTile = (wx, wy) => { const a = (wx / PX - ox) / (TW / 2), b = (wy / PX - oy) / (TH / 2); return { tx: Math.round((a + b) / 2), ty: Math.round((b - a) / 2) }; };
    const fc = canvas(iw, ih), g = fc.getContext('2d');
    const isWater = (ch) => ch === '~';
    const walls = WALLS[def.wall] || WALLS.stone;
    const theme = id === 'grove' ? 'grove' : id === 'spire' ? 'spire' : '';
    const doors = (def.doors || []).map((d) => d.x + ',' + d.y);
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      const ch = m.tileAt(tx, ty); if (ch === ' ') continue;
      const cx = ox + (tx - ty) * TW / 2, cy = oy + (tx + ty) * TH / 2;
      const ftype = isWater(ch) ? 'water' : ch === '=' ? 'bridge' : ch === ',' ? def.alt : def.floor;
      floorTile(g, cx, cy, ftype, tx, ty);
      if (ch === 'f') { const cols = ['#e86a8a', '#f0d060', '#b0a0ff', '#ffffff']; for (let i = 0; i < 5; i++) { g.fillStyle = cols[Math.floor(hash(tx, ty, i + 40) * 4)]; g.fillRect(cx - 6 + Math.floor(hash(tx, ty, i + 50) * 12), cy - 3 + Math.floor(hash(tx, ty, i + 60) * 6), 1, 1); } }
      if (isWater(ch)) m.water.push(m.toWorld(tx, ty));
      const wpos = m.toWorld(tx, ty);
      let spr = null;
      const low = !def.kind && (ty === H - 1 || tx === W - 1) && ch === '#';
      if (ch === '#') spr = blockSprite(low ? 4 : 30, walls.top, walls.face, walls.line, { bricks: def.wall !== 'hedge', leaves: def.wall === 'hedge' });
      else if (ch === 'H') spr = blockSprite(30, '#2b3550', '#6e5440', '#4e3a2a', { roof: true, window: hash(tx, ty, 7) > 0.45 && !doors.includes(tx + ',' + ty), door: doors.includes(tx + ',' + ty) });
      else if (ch === 'T') spr = treeSprite(tx * 31 + ty, id === 'grove' && hash(tx, ty, 2) > 0.6);
      else if ('bctkprxl'.includes(ch)) spr = propSprite(ch, theme || def.wall);
      if (spr) m.objects.push({ img: spr.c, ax: spr.ax, ay: spr.ay, x: wpos.x, y: wpos.y + (ch === 'T' ? 6 : 0) });
      if (ch === 'l') m.lights.push({ x: wpos.x, y: wpos.y - 110, r: 230, col: '255,190,90', flick: true });
      if (ch === 'x') m.lights.push({ x: wpos.x, y: wpos.y - 50, r: 200, col: theme === 'grove' ? '177,140,255' : theme === 'spire' ? '192,106,255' : '95,224,240' });
      if (ch === 'H' && hash(tx, ty, 7) > 0.45 && !doors.includes(tx + ',' + ty)) m.lights.push({ x: wpos.x - 30, y: wpos.y - 70, r: 110, col: '255,200,110', flick: true });
    }
    m.floorCanvas = fc;
    const solid = new Set(['#', 'H', 'T', '~', ' ', 'b', 'c', 't', 'k', 'p', 'r', 'x', 'l']);
    m.walkStatic = (wx, wy) => { const { tx, ty } = m.toTile(wx, wy); if (tx < 0 || ty < 0 || tx >= W || ty >= H) return false; return !solid.has(m.tileAt(tx, ty)); };
    m.npcs = (def.npcs || []).map((n) => { const p = m.toWorld(n.tx, n.ty); return Object.assign({}, n, { x: p.x, y: p.y, talkX: p.x, talkY: p.y, r: 80 }); });
    m.exits = (def.exits || []).map((e) => { const p = m.toWorld(e.tx, e.ty); return Object.assign({}, e, { x: p.x, y: p.y, r: 36 }); });
    return m;
  };

  /* ───────── renderer ───────── */
  const R = LL.R = { cam: { x: 0, y: 0 }, zoom: 1, t: 0, murk: [] };
  for (let i = 0; i < 26; i++) R.murk.push({ x: Math.random(), y: Math.random(), r: 120 + Math.random() * 200, s: 0.004 + Math.random() * 0.01, p: Math.random() * 6 });

  R.resize = function (cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    R.dpr = dpr; R.vw = w; R.vh = h;
    R.zoom = Math.max(0.62, Math.min(1.4, Math.min(w / 1000, h / 680) * 1.25));
    if (!R.light) R.light = canvas(1, 1);
  };

  R.screenToWorld = (sx, sy) => ({ x: (sx - R.vw / 2) / R.zoom + R.cam.x, y: (sy - R.vh / 2) / R.zoom + R.cam.y });

  R.follow = function (m, x, y, snap) {
    const halfW = R.vw / 2 / R.zoom, halfH = R.vh / 2 / R.zoom;
    let tx = x, ty = y - 30;
    tx = m.w <= halfW * 2 ? m.w / 2 : Math.max(halfW, Math.min(m.w - halfW, tx));
    ty = m.h <= halfH * 2 ? m.h / 2 : Math.max(halfH, Math.min(m.h - halfH, ty));
    if (snap) { R.cam.x = tx; R.cam.y = ty; } else { R.cam.x += (tx - R.cam.x) * 0.12; R.cam.y += (ty - R.cam.y) * 0.12; }
  };

  R.draw = function (cv, m, actors, opts) {
    const g = cv.getContext('2d'), Z = R.zoom * R.dpr;
    R.t += 1 / 60;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#0b1016'; g.fillRect(0, 0, cv.width, cv.height);
    g.imageSmoothingEnabled = false;
    g.setTransform(Z, 0, 0, Z, (R.vw / 2 - R.cam.x * R.zoom) * R.dpr, (R.vh / 2 - R.cam.y * R.zoom) * R.dpr);
    if (m.kind === 'image') g.drawImage(LL.IMG[m.def.image], 0, 0, m.w, m.h);
    else {
      g.drawImage(m.floorCanvas, 0, 0, m.w, m.h);
      // water shimmer
      g.fillStyle = 'rgba(160,210,255,.55)';
      m.water.forEach((w, i) => { const ph = (R.t * 1.5 + i * 1.7) % 3; if (ph < 1.2) g.fillRect(Math.round((w.x - 20 + ((i * 37) % 40)) / 4) * 4, Math.round((w.y - 8 + ((i * 13) % 16)) / 4) * 4, 8 + Math.round(ph * 4) * 4, 4); });
    }
    // depth-sorted objects + actors
    const list = m.objects.map((o) => ({ y: o.y, draw: () => g.drawImage(o.img, o.x - o.ax * PX, o.y - o.ay * PX, o.img.width * PX, o.img.height * PX) }));
    actors.forEach((a) => list.push(a));
    list.sort((a, b) => a.y - b.y).forEach((o) => o.draw(g));

    // lighting
    const dark = opts.dark || 0;
    if (dark > 0) {
      const L = R.light, lw = Math.ceil(R.vw / 4), lh = Math.ceil(R.vh / 4);
      if (L.width !== lw || L.height !== lh) { L.width = lw; L.height = lh; }
      const lg = L.getContext('2d');
      lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, lw, lh);
      lg.fillStyle = `rgba(6,8,20,${dark})`; lg.fillRect(0, 0, lw, lh);
      lg.globalCompositeOperation = 'destination-out';
      const toL = (wx, wy) => [((wx - R.cam.x) * R.zoom + R.vw / 2) / 4, ((wy - R.cam.y) * R.zoom + R.vh / 2) / 4];
      opts.lights.forEach((l) => {
        const [x, y] = toL(l.x, l.y), r = (l.r * (l.flick ? 1 + Math.sin(R.t * 9 + l.x) * 0.04 : 1)) * R.zoom / 4;
        if (x < -r || y < -r || x > lw + r || y > lh + r) return;
        const gr = lg.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.5, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        lg.fillStyle = gr; lg.beginPath(); lg.arc(x, y, r, 0, 7); lg.fill();
      });
      g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = true;
      g.drawImage(L, 0, 0, cv.width, cv.height);
      // warm glow
      g.globalCompositeOperation = 'lighter';
      opts.lights.forEach((l) => {
        const x = ((l.x - R.cam.x) * R.zoom + R.vw / 2) * R.dpr, y = ((l.y - R.cam.y) * R.zoom + R.vh / 2) * R.dpr, r = l.r * 0.6 * R.zoom * R.dpr;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(${l.col},.22)`); gr.addColorStop(1, `rgba(${l.col},0)`);
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      });
      g.globalCompositeOperation = 'source-over';
    }
    // murk fog
    if (opts.murk) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      R.murk.forEach((f) => {
        f.x = (f.x + f.s / 60) % 1.2;
        const x = (f.x - 0.1) * cv.width, y = (f.y + Math.sin(R.t * 0.3 + f.p) * 0.05) * cv.height, r = f.r * R.dpr;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(90,60,140,.13)'); gr.addColorStop(1, 'rgba(90,60,140,0)');
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      });
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
  };

  /* ───────── actor drawing helpers (world coords, inside transform) ───────── */
  R.shadow = (g, x, y, w) => { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y, w, w * 0.35, 0, 0, 7); g.fill(); };
  R.spriteAt = (g, img, x, y, scale, flip, bob = 0) => {
    const w = img.width * scale, h = img.height * scale;
    g.save(); g.translate(Math.round(x), Math.round(y + bob));
    if (flip) g.scale(-1, 1);
    g.drawImage(img, -w / 2, -h, w, h); g.restore();
  };
  R.label = (g, text, x, y, color = '#f4e6c4') => {
    g.save(); g.font = '600 15px "Pixelify Sans", system-ui, sans-serif'; g.textAlign = 'center';
    const w = g.measureText(text).width + 14;
    g.fillStyle = 'rgba(14,16,28,.85)'; g.fillRect(x - w / 2, y - 18, w, 22);
    g.strokeStyle = '#8a7a5a'; g.lineWidth = 1; g.strokeRect(x - w / 2 + 0.5, y - 17.5, w - 1, 21);
    g.fillStyle = color; g.fillText(text, x, y - 2); g.restore();
  };

  /* ───────── pathfinding (A* on 24 px cells) ───────── */
  LL.findPath = function (walk, from, to, w, h) {
    const C = 24, cw = Math.ceil(w / C), ch = Math.ceil(h / C);
    const key = (x, y) => y * cw + x;
    const ok = (x, y) => x >= 0 && y >= 0 && x < cw && y < ch && walk(x * C + C / 2, y * C + C / 2);
    let sx = Math.floor(from.x / C), sy = Math.floor(from.y / C), ex = Math.floor(to.x / C), ey = Math.floor(to.y / C);
    if (!ok(ex, ey)) { // nearest walkable cell to target
      let best = null;
      for (let r = 1; r < 6 && !best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (ok(ex + dx, ey + dy) && (!best || dx * dx + dy * dy < best.d)) best = { x: ex + dx, y: ey + dy, d: dx * dx + dy * dy };
      if (!best) return null; ex = best.x; ey = best.y;
    }
    const open = [[sx, sy]], g = new Map([[key(sx, sy), 0]]), came = new Map(), f = new Map([[key(sx, sy), 0]]);
    const hfn = (x, y) => Math.hypot(x - ex, y - ey);
    let guard = 0;
    while (open.length && guard++ < 5000) {
      open.sort((a, b) => f.get(key(...a)) - f.get(key(...b)));
      const [x, y] = open.shift();
      if (x === ex && y === ey) {
        const pts = []; let k = key(x, y);
        while (k !== undefined) { pts.unshift({ x: (k % cw) * C + C / 2, y: Math.floor(k / cw) * C + C / 2 }); k = came.get(k); }
        pts[pts.length - 1] = ok(Math.floor(to.x / C), Math.floor(to.y / C)) && walk(to.x, to.y) ? { x: to.x, y: to.y } : pts[pts.length - 1];
        return pts.slice(1);
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!ok(nx, ny) || (dx && dy && (!ok(x + dx, y) || !ok(x, y + dy)))) continue;
        const ng = g.get(key(x, y)) + (dx && dy ? 1.414 : 1);
        if (ng < (g.get(key(nx, ny)) ?? Infinity)) {
          came.set(key(nx, ny), key(x, y)); g.set(key(nx, ny), ng); f.set(key(nx, ny), ng + hfn(nx, ny));
          if (!open.some((p) => p[0] === nx && p[1] === ny)) open.push([nx, ny]);
        }
      }
    }
    return null;
  };

  LL.WTW = WTW; LL.WTH = WTH; LL.PX = PX;
})();
