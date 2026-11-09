/* Lanterns of Lore — image assets and pixel-sprite drawing. */
(function () {
  const LL = window.LL;
  LL.ASSET_URLS = LL.ASSET_URLS || {
    tavern: 'assets/tavern.webp', hero: 'assets/hero-sprite.png',
    heroBattle: 'assets/hero-battle.png', heroPortrait: 'assets/hero-portrait.png'
  };
  LL.IMG = {};
  LL.loadAssets = () => Promise.all(Object.entries(LL.ASSET_URLS).map(([k, url]) => new Promise((res) => {
    const im = new Image(); im.onload = () => { LL.IMG[k] = im; res(); }; im.onerror = () => res(); im.src = url;
  })));

  LL.shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const k = (v) => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
    return `rgb(${k(r)},${k(g)},${k(b)})`;
  };

  /* Pixel sprite from LL.SPRITES rows + LL.PALETTES colours, with an automatic 1px outline. */
  const cache = {};
  LL.sprite = (name, palKey) => {
    const key = name + '|' + palKey;
    if (cache[key]) return cache[key];
    const rows = LL.SPRITES[name], pal = LL.PALETTES[palKey] || {};
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
    const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
    const g = c.getContext('2d');
    const filled = (x, y) => y >= 0 && y < h && x >= 0 && x < (rows[y] || '').length && rows[y][x] !== '.';
    g.fillStyle = pal.o || '#120c10';
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      if (!filled(x, y) && (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1))) g.fillRect(x + 1, y + 1, 1, 1);
    }
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') { g.fillStyle = pal[ch] || '#ff00ff'; g.fillRect(x + 1, y + 1, 1, 1); } }));
    return (cache[key] = c);
  };

  /* A square, scaled-up data URL of a sprite (for portraits in HTML). */
  const urlCache = {};
  LL.spriteURL = (name, palKey, size = 96, cropTop = false) => {
    const key = [name, palKey, size, cropTop].join('|');
    if (urlCache[key]) return urlCache[key];
    const s = LL.sprite(name, palKey);
    const sh = cropTop ? Math.min(s.height, s.width) : s.height;
    const scale = Math.floor(size / Math.max(s.width, sh)) || 1;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(s, 0, 0, s.width, sh, Math.round((size - s.width * scale) / 2), Math.round((size - sh * scale) / 2), s.width * scale, sh * scale);
    return (urlCache[key] = c.toDataURL());
  };
})();
