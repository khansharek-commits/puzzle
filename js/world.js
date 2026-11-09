/* Lanterns of Lore — world data: maps, characters, monsters, story. */
(function () {
  const LL = window.LL;

  /* ── Pixel sprites (drawn with an automatic dark outline). '.' = transparent. ── */
  LL.SPRITES = {
    person: [
      '...hhhh...',
      '..hhhhhh..',
      '..hsssshh.',
      '..sesses..',
      '..ssssss..',
      '...ssss...',
      '..aaaaaa..',
      '.aaabbaaa.',
      'saaabbaaas',
      'saaabbaaas',
      '.aaaaaaaa.',
      '.aaaaaaaa.',
      '.aaaaaaaa.',
      '..dd..dd..',
      '..dd..dd..',
      '..ff..ff..'
    ],
    robed: [
      '....hhhh....',
      '...hhhhhh...',
      '..hhsssshh..',
      '..hseesesh..',
      '..hhssssh...',
      '...aassaa...',
      '..aaabbaaa..',
      '.aaaabbaaaa.',
      '.caaabbaaac.',
      'scaaabbaaacs',
      '.caaabbaaac.',
      '.aaaaaaaaaa.',
      '.aaaaaaaaaa.',
      'aaaaaaaaaaaa',
      'aaaaaaaaaaaa',
      '.dd......dd.'
    ],
    slime: [
      '............',
      '....aaaa....',
      '...aaaaaa...',
      '..accaaaaa..',
      '..acaaaaaa..',
      '.aaeaaaeaaa.',
      '.aapaaapaaa.',
      '.aaaaaaaaaa.',
      'aaaaaaaaaaaa',
      'abaaaaaaaaba',
      '.bbbbbbbbbb.'
    ],
    wisp: [
      '.....a......',
      '....aa......',
      '....aca.....',
      '...acca..a..',
      '..aaccaa.a..',
      '..accccaaa..',
      '.aaccccccaa.',
      '.aceccecca..',
      '.acpccpcca..',
      '.aacccccaa..',
      '..aaccccaa..',
      '...aaaaaa...',
      '....b..b....'
    ],
    beetle: [
      '..p......p..',
      '...p....p...',
      '....aaaa....',
      '..aaaaaaaa..',
      '.aacaabacaa.',
      '.acaaabaaca.',
      '.aaaaabaaaa.',
      '.aaaaabaaaa.',
      '..aaaabaaa..',
      '.d.bbbbbb.d.',
      'd..d....d..d'
    ],
    moth: [
      '..c......c..',
      '...c....c...',
      'aaa..bb..aaa',
      'acaa.bb.aaca',
      'aacaebbeacaa',
      'aaaabbbbaaaa',
      '.aaa.bb.aaa.',
      '..aa.bb.aa..',
      '.aca.bb.aca.',
      '.aa..bb..aa.',
      '.....b......'
    ],
    crab: [
      'aa........aa',
      'aca......aca',
      '.aa.e..e.aa.',
      '..a.p..p.a..',
      '...aaaaaa...',
      '..aaccaaaa..',
      '.aacaaaaaaa.',
      '.aaaaaaaaaa.',
      '..bbbbbbbb..',
      '.b.b.bb.b.b.',
      'b..b....b..b'
    ],
    golem: [
      '...aaaaaa...',
      '..aaaaaaaa..',
      '..aeaaaaea..',
      '..apaaaapa..',
      '...aaaaaa...',
      '.bbbaaaabbb.',
      'bbaaaccaaabb',
      'baaaaccaaaab',
      'baa.aaaa.aab',
      'bb..aaaa..bb',
      '....aaaa....',
      '...aa..aa...',
      '..bbb..bbb..'
    ],
    imp: [
      '.c........c.',
      '.cc......cc.',
      '..caaaaaac..',
      '..aaaaaaaa..',
      '..aeaaaaea..',
      '..apaaaapa..',
      '...aabbaa...',
      'a..aaaaaa..a',
      'aa.aaaaaa.aa',
      '.aaaaaaaaaa.',
      '...aaaaaa...',
      '...a....a...',
      '..aa....aa..'
    ],
    owl: [
      '.a........a.',
      '.aa......aa.',
      '.aaaaaaaaaa.',
      'aceecaaceeca',
      'acppcaacppca',
      'aceecbbceeca',
      '.aaaabbaaaa.',
      '.aaccccccaa.',
      'aaccbccbccaa',
      'aaccccccccaa',
      '.aaccbccbaa.',
      '..aaaaaaaa..',
      '...d....d...'
    ],
    lantern: [
      '...aaaa...',
      '..a....a..',
      '.aaaaaaaa.',
      '.a.cccc.a.',
      '.a.cccc.a.',
      '.a.cccc.a.',
      '.a.cccc.a.',
      '.aaaaaaaa.',
      '...aaaa...',
      '....aa....',
      '....aa....',
      '...aaaa...',
      '..aaaaaa..'
    ],
    chest: [
      '.aaaaaaaaaa.',
      'abbbbbbbbbba',
      'abbbbbbbbbba',
      'aaaaaccaaaaa',
      'abbbbccbbbba',
      'abbbbbbbbbba',
      'abbbbbbbbbba',
      'aaaaaaaaaaaa'
    ],
    seal: [
      '....aaaa....',
      '..aaccccaa..',
      '.acc.cc.cca.',
      '.ac.c..c.ca.',
      'acc.c..c.cca',
      'ac.cccccc.ca',
      'ac.cccccc.ca',
      'acc.c..c.cca',
      '.ac.c..c.ca.',
      '.acc.cc.cca.',
      '..aaccccaa..',
      '....aaaa....'
    ],
    gate: [
      '...aaaaaa...',
      '..aabbbbaa..',
      '.aabccccbaa.',
      '.abccccccba.',
      'aabccccccbaa',
      'abccccccccba',
      'abccccccccba',
      'abccccccccba',
      'abccccccccba',
      'abccccccccba',
      'abccccccccba',
      'aaaaaaaaaaaa'
    ]
  };

  const P = (o) => Object.assign({ o: '#140f14', e: '#f4efe0', p: '#140f14', s: '#e9c4a0' }, o);
  LL.PALETTES = {
    marla: P({ h: '#a8432f', a: '#6d3b2a', b: '#e0b34c', d: '#3b2a24', f: '#24170f' }),
    villager1: P({ h: '#2b1d14', a: '#3d6b54', b: '#c9a24a', d: '#3a3048', f: '#24170f' }),
    villager2: P({ h: '#d8c27a', a: '#7a4d7a', b: '#e6d5a8', d: '#2f3a4a', f: '#24170f' }),
    villager3: P({ h: '#8a8a8a', a: '#4a5a7a', b: '#d0d0c0', d: '#3a3048', f: '#24170f', s: '#c9a07a' }),
    child: P({ h: '#c46a2a', a: '#b0473a', b: '#f0d070', d: '#3a3048', f: '#24170f' }),
    scholar: P({ h: '#e8e8e0', a: '#2f4a6a', b: '#d9b64c', d: '#2a2a3a', f: '#1a1a22' }),
    hermit: P({ h: '#d9d9d0', a: '#5a6a3a', b: '#a8905a', d: '#3a3326', f: '#1f1a12', s: '#cfa585' }),
    null: P({ h: '#d9d4f0', a: '#2a1d40', b: '#9a7ae0', c: '#4a3470', d: '#130d1f', s: '#c8c3dc', e: '#b18cff' }),
    // monsters
    emberWisp: { a: '#e8742a', b: '#7a2a14', c: '#ffd36a', e: '#fff7d6', p: '#3a120a', o: '#1a0a06' },
    brassBeetle: { a: '#b48a3a', b: '#5a3c18', c: '#f0d58a', p: '#2a1a0a', d: '#3a2a14', o: '#140c04' },
    quarkSlime: { a: '#3fb7c9', b: '#1d6577', c: '#bff4ff', e: '#f6ffff', p: '#0a2a33', o: '#061418' },
    entropy: { a: '#8a7a5a', b: '#4a3f2e', c: '#5fe0f0', e: '#f0fbff', p: '#0a2a33', o: '#120e08' },
    dustWraith: { a: '#9a958a', b: '#4a463e', c: '#e6e0d0', e: '#ffffff', p: '#201e1a', o: '#100f0c' },
    chronicleMoth: { a: '#c9a46a', b: '#5a4024', c: '#f2e2b0', e: '#1a1206', o: '#140c04' },
    claySentinel: { a: '#b0763f', b: '#5e3a1c', c: '#e8b47a', e: '#ffe9b0', p: '#2a1406', o: '#140904' },
    emperor: { a: '#c9a227', b: '#6a4a10', c: '#fff0a0', e: '#ffffff', p: '#3a0a0a', o: '#160e02' },
    bogToad: { a: '#5c8a3a', b: '#2e4a1c', c: '#a8d070', e: '#f0f8d0', p: '#10200a', o: '#0a1406' },
    compassCrab: { a: '#c4473a', b: '#6a1f18', c: '#f2a080', e: '#ffffff', p: '#200806', o: '#140504' },
    galeMoth: { a: '#5f8fc8', b: '#24406a', c: '#cfe4ff', e: '#0a1426', o: '#060c18' },
    leviathan: { a: '#2f8f8a', b: '#134540', c: '#9ff0e0', e: '#ffffff', p: '#04201c', o: '#031210' },
    paradoxImp: { a: '#8a4fc0', b: '#3e1f60', c: '#f0c040', e: '#ffffff', p: '#1a0a2a', o: '#0e0618' },
    echoOwl: { a: '#7a6a8a', b: '#3a3048', c: '#d8cce6', e: '#ffe680', p: '#140f1a', d: '#e0a040', o: '#0e0a12' },
    doubtShade: { a: '#5a4a8a', b: '#251d40', c: '#b9a8f0', e: '#ffffff', p: '#0e0a1e', o: '#08060f' },
    sophist: { a: '#b04a8a', b: '#541f40', c: '#ffd36a', e: '#ffffff', p: '#20061a', o: '#12040e' },
    murkSlime: { a: '#4a3a6a', b: '#221a36', c: '#9a86d0', e: '#e8e0ff', p: '#0e0a1a', o: '#08060f' },
    // objects
    lanternOff: { a: '#3a3a44', c: '#1a1a22', o: '#0a0a10' },
    lanternOn: { a: '#c9a227', c: '#ffe08a', o: '#1a1206' },
    chest: { a: '#3a2412', b: '#8a5a2a', c: '#e0b34c', o: '#120a04' },
    chestOpen: { a: '#2a1a0c', b: '#4a3218', c: '#6a5a3a', o: '#120a04' },
    seal: { a: '#3a2a5a', c: '#b18cff', o: '#0e0818' },
    gate: { a: '#1a1424', b: '#3a2a5a', c: '#0a0812', o: '#000000' },
    gateOpen: { a: '#1a1424', b: '#5a3a9a', c: '#b18cff', o: '#000000' }
  };

  /* ── Monsters ── hp counts hits; atk is damage on a wrong answer. */
  LL.ENEMIES = {
    emberWisp:     { name: 'Ember Wisp',     sprite: 'wisp',   pal: 'emberWisp',     s: 'sci', hits: 3, atk: 9,  xp: 14 },
    brassBeetle:   { name: 'Brass Beetle',   sprite: 'beetle', pal: 'brassBeetle',   s: 'sci', hits: 3, atk: 10, xp: 15 },
    quarkSlime:    { name: 'Quark Slime',    sprite: 'slime',  pal: 'quarkSlime',    s: 'sci', hits: 3, atk: 8,  xp: 13 },
    dustWraith:    { name: 'Dust Wraith',    sprite: 'wisp',   pal: 'dustWraith',    s: 'his', hits: 3, atk: 9,  xp: 14 },
    chronicleMoth: { name: 'Chronicle Moth', sprite: 'moth',   pal: 'chronicleMoth', s: 'his', hits: 3, atk: 9,  xp: 14 },
    claySentinel:  { name: 'Clay Sentinel',  sprite: 'golem',  pal: 'claySentinel',  s: 'his', hits: 3, atk: 11, xp: 16 },
    bogToad:       { name: 'Bog Toad',       sprite: 'slime',  pal: 'bogToad',       s: 'geo', hits: 3, atk: 8,  xp: 13 },
    compassCrab:   { name: 'Compass Crab',   sprite: 'crab',   pal: 'compassCrab',   s: 'geo', hits: 3, atk: 10, xp: 15 },
    galeMoth:      { name: 'Gale Moth',      sprite: 'moth',   pal: 'galeMoth',      s: 'geo', hits: 3, atk: 9,  xp: 14 },
    paradoxImp:    { name: 'Paradox Imp',    sprite: 'imp',    pal: 'paradoxImp',    s: 'phi', hits: 3, atk: 10, xp: 15 },
    echoOwl:       { name: 'Echo Owl',       sprite: 'owl',    pal: 'echoOwl',       s: 'phi', hits: 3, atk: 9,  xp: 14 },
    doubtShade:    { name: 'Doubt Shade',    sprite: 'wisp',   pal: 'doubtShade',    s: 'phi', hits: 3, atk: 9,  xp: 14 },
    murkSlime:     { name: 'Murk Slime',     sprite: 'slime',  pal: 'murkSlime',     s: 'log', hits: 3, atk: 12, xp: 18 },
    murkShade:     { name: 'Murk Shade',     sprite: 'wisp',   pal: 'doubtShade',    s: 'mix', hits: 3, atk: 12, xp: 18 },
    // bosses
    entropy:   { name: 'The Entropy Engine',    sprite: 'golem', pal: 'entropy',   s: 'sci', hits: 6, atk: 14, xp: 70, boss: true,
      intro: ['Everything runs down, little lamplighter. Heat spreads, order crumbles.', 'Why keep a light burning in a universe that is cooling?'],
      defeat: 'Order… from chaos… for a little while…' },
    emperor:   { name: 'The Forgotten Emperor', sprite: 'golem', pal: 'emperor',   s: 'his', hits: 6, atk: 14, xp: 70, boss: true,
      intro: ['I ruled half the world once. Can you name me? No. No one can.', 'If kings are forgotten, why should anyone remember anything?'],
      defeat: 'Remember… us… all of us…' },
    leviathan: { name: 'The Drift Leviathan',   sprite: 'crab',  pal: 'leviathan', s: 'geo', hits: 6, atk: 14, xp: 70, boss: true,
      intro: ['Coastlines shift. Rivers wander. Every map is already wrong.', 'Lose your way with me, wanderer.'],
      defeat: 'The tide… turns…' },
    sophist:   { name: 'The Sophist',           sprite: 'imp',   pal: 'sophist',   s: 'phi', hits: 6, atk: 14, xp: 70, boss: true,
      intro: ['Truth? Whose truth? I can argue any side and win.', 'Let us see whether your reasons are better than my tricks.'],
      defeat: 'A good argument… is hard to beat…' },
    null:      { name: 'Vesper Null, the Unlit', sprite: 'robed', pal: 'null',     s: 'mix', hits: 10, atk: 18, xp: 150, boss: true, final: true,
      intro: ['So the lamplighter climbs my Spire at last.', 'Everything you learn, you will forget. I only hurry it along.', 'Answer me, then. Every question you have faced, all at once.'],
      defeat: 'The light… it is warm. I had forgotten.' }
  };

  /* ── Maps ──
   * Tile legend: '.' floor  ',' path/rug  '#' wall  'H' roof block  '~' water  '=' bridge
   * 'T' tree  'b' barrel  'c' crate  'r' rock  'p' pillar  'x' crystal (light)  'l' lamp (light)
   * 'k' bookshelf  't' table  'f' flowers
   */
  LL.MAPS = {
    tavern: {
      name: 'The Gilded Lantern', kind: 'image', image: 'tavern', w: 1024, h: 1024,
      // walkable floor polygon (image pixels)
      floor: [[60, 772], [150, 742], [250, 715], [330, 702], [480, 712], [600, 706], [652, 704], [690, 758], [820, 766], [905, 792], [965, 806], [900, 852], [760, 915], [640, 958], [560, 975], [470, 960], [330, 900], [200, 852], [95, 802]],
      blocks: [
        { x: 515, y: 862, rx: 150, ry: 62 },   // big table and chairs
        { x: 577, y: 785, rx: 16, ry: 10 },    // lamp post
        { x: 770, y: 822, rx: 34, ry: 20 },    // small round table
        { x: 872, y: 760, rx: 52, ry: 22 },    // barrel
        { x: 400, y: 942, rx: 30, ry: 16 },    // footstool
        { x: 700, y: 752, rx: 18, ry: 12 }     // stand
      ],
      dark: 0, start: { x: 330, y: 790 },
      npcs: [
        { id: 'marla', name: 'Marla', x: 512, y: 600, talk: { x: 512, y: 718 }, r: 75, action: 'inn', portrait: 'marla' },
        { id: 'hedda', name: 'Hedda', x: 265, y: 850, r: 60, riddle: 'chess', portrait: 'villager2',
          lines: ['The Grove of Whys lies south. Its creatures argue in circles.', 'Spot the trick in an argument and it loses its power over you.'] },
        { id: 'sable', name: 'Sable', x: 665, y: 772, r: 55, portrait: 'villager1', story: true },
        { id: 'tobiah', name: 'Tobiah', x: 585, y: 880, talk: { x: 640, y: 940 }, r: 65, riddle: 'swallow', portrait: 'scholar',
          lines: ['The Sunken Archive is east of the village. Mind the dust: it remembers more than you do.'] },
        { id: 'bram', name: 'Bram', x: 105, y: 690, talk: { x: 130, y: 760 }, r: 70, portrait: 'villager3',
          lines: ['First time in a scrap? Murk creatures fight with questions. A true answer is your sword.', 'Answer quickly and you strike twice as hard. A wrong answer, and they hit back.', 'Out of breath? Use Clarity to clear two wrong choices, or Mend to heal. Marla will patch you up for free.'] },
        { id: 'lark', name: 'Lark', x: 952, y: 640, talk: { x: 925, y: 800 }, r: 80, riddle: 'carpet', portrait: 'child',
          lines: ['West of the village is the Wayfarer Wilds. I wrote a song about every river in it!'] }
      ],
      exits: [{ x: 70, y: 776, r: 40, to: 'village', tx: 3, ty: 7, label: 'To Emberwick' }]
    },

    village: {
      name: 'Emberwick', floor: 'grass', alt: 'cobble', wall: 'hedge', roof: 'slate', dark: 0.55, litBy: 'all',
      tiles: [
        'TTTTTTTT,,TTTTTTTT',
        'T......f,,f..TT..T',
        'T.HHHH..,,.......T',
        'T.HHHH..,,..~~~..T',
        'T.HHHH.l,,..~~~~.T',
        'T.HHHH..,,...~~..T',
        ',,,,,,,,,,,,,,,,,,',
        'T...l...,,....l..T',
        'T.f.....,,.......T',
        'T...HHH.,,..r..f.T',
        'T...HHH.,,.......T',
        'T.T.....,,.....T.T',
        'T.....f.,,.l.....T',
        'TTTTTTTT,,TTTTTTTT'
      ],
      doors: [{ x: 3, y: 5 }],
      exits: [
        { tx: 3, ty: 6, to: 'tavern', label: 'The Gilded Lantern', door: true },
        { tx: 8, ty: 0, to: 'observatory', spawn: [7, 11], label: 'Brass Observatory' },
        { tx: 9, ty: 0, to: 'observatory', spawn: [7, 11], label: 'Brass Observatory' },
        { tx: 17, ty: 6, to: 'archive', spawn: [7, 11], label: 'Sunken Archive' },
        { tx: 0, ty: 6, to: 'wilds', spawn: [7, 10], label: 'Wayfarer Wilds' },
        { tx: 8, ty: 13, to: 'grove', spawn: [7, 10], label: 'Grove of Whys' },
        { tx: 9, ty: 13, to: 'grove', spawn: [7, 10], label: 'Grove of Whys' }
      ],
      npcs: [
        { id: 'mira', name: 'Mira', tx: 6, ty: 8, pal: 'child', riddle: 'letters', lines: ['The lamps in the square are getting dimmer every night. Are you going to fix it?'] },
        { id: 'hal', name: 'Warden Hal', tx: 10, ty: 2, pal: 'villager3', lines: ['North: the Brass Observatory. East: the Sunken Archive. West: the Wayfarer Wilds. South: the Grove of Whys.', 'Each one held a Great Lantern. Now each one holds a monster.'] },
        { id: 'oma', name: 'Old Oma', tx: 14, ty: 2, pal: 'hermit', gateKeeper: true }
      ],
      gate: { tx: 16, ty: 1, to: 'spire', spawn: [7, 10] },
      monsters: []
    },

    observatory: {
      name: 'Brass Observatory', floor: 'stone', alt: 'brass', wall: 'stone', dark: 0.62, lantern: 'sci',
      tiles: [
        '###############',
        '#x...p#.......#',
        '#.....#.......#',
        '#.k...#.......#',
        '#.....#.......#',
        '###.#####.#####',
        '#.............#',
        '#.x...t...t.x.#',
        '#.............#',
        '#..p.......p..#',
        '#.............#',
        '#x.....,.....x#',
        '#######,#######'
      ],
      exits: [{ tx: 7, ty: 12, to: 'village', spawn: [8, 1], label: 'Emberwick' }],
      seal: { tx: 9, ty: 5, puzzle: 'jugs', name: 'Alchemical Lock' },
      boss: { tx: 10, ty: 3, enemy: 'entropy' },
      lanternAt: { tx: 10, ty: 1 },
      chests: [{ id: 'obs1', tx: 4, ty: 1 }],
      npcs: [{ id: 'ilse', name: 'Astronomer Ilse', tx: 2, ty: 2, pal: 'scholar', riddle: 'folds', lines: ['The Engine beyond the lock feeds on disorder. Measure carefully to open the way.'] }],
      monsters: [['emberWisp', 3, 8], ['quarkSlime', 11, 8], ['brassBeetle', 7, 9], ['quarkSlime', 4, 10]]
    },

    archive: {
      name: 'Sunken Archive', floor: 'sand', alt: 'carpet', wall: 'sandstone', dark: 0.62, lantern: 'his',
      tiles: [
        '###############',
        '#kkkk#.......k#',
        '#....#.......k#',
        '#.t..#........#',
        '#....#p.....p.#',
        '##.#####.######',
        '#.....k.k.....#',
        '#.p.........p.#',
        '#.....l.l.....#',
        '#.............#',
        '#.p.........p.#',
        '#......,......#',
        '#######,#######'
      ],
      exits: [{ tx: 7, ty: 12, to: 'village', spawn: [16, 6], label: 'Emberwick' }],
      seal: { tx: 8, ty: 5, puzzle: 'hanoi', name: 'Tower Seal' },
      boss: { tx: 9, ty: 2, enemy: 'emperor' },
      lanternAt: { tx: 9, ty: 1 },
      chests: [{ id: 'arc1', tx: 1, ty: 4 }],
      npcs: [{ id: 'oren', name: 'Archivist Oren', tx: 3, ty: 2, pal: 'scholar', riddle: 'portrait', lines: ['The seal is an old monks’ game: move the tower, one disk at a time, never big on small.'] }],
      monsters: [['dustWraith', 3, 7], ['chronicleMoth', 11, 7], ['claySentinel', 7, 9], ['chronicleMoth', 5, 10]]
    },

    wilds: {
      name: 'Wayfarer Wilds', floor: 'grass', alt: 'sand', wall: 'hedge', dark: 0.5, lantern: 'geo',
      tiles: [
        'TTTTTTTTTTTTTTT',
        'T....r.......TT',
        'T.f..........fT',
        'T..r.........TT',
        '~~~~~~~=~~~~~~~',
        '~~~~~~~=~~~~~~~',
        'T......,......T',
        'T.T.........T.T',
        'T.....f...r...T',
        'T..l.......l..T',
        'T.T....,....T.T',
        'TTTTTTT,TTTTTTT'
      ],
      exits: [{ tx: 7, ty: 11, to: 'village', spawn: [1, 6], label: 'Emberwick' }],
      seal: { tx: 7, ty: 6, puzzle: 'river', name: 'Ferry Post' },
      boss: { tx: 9, ty: 2, enemy: 'leviathan' },
      lanternAt: { tx: 8, ty: 1 },
      chests: [{ id: 'wil1', tx: 12, ty: 8 }],
      npcs: [{ id: 'ferrin', name: 'Ferrin', tx: 5, ty: 6, pal: 'villager1', riddle: 'bridge', lines: ['The bridge is out and only my little ferry crosses. Mind what you leave alone on the bank!'] }],
      monsters: [['bogToad', 3, 8], ['compassCrab', 10, 7], ['galeMoth', 6, 9], ['compassCrab', 12, 9]]
    },

    grove: {
      name: 'Grove of Whys', floor: 'moss', alt: 'stoneTile', wall: 'hedge', dark: 0.66, lantern: 'phi',
      tiles: [
        'TTTTTTTTTTTTTTT',
        'TTx...p...p..xT',
        'TT...........TT',
        'T..p.......p..T',
        'TTTTTTT.TTTTTTT',
        'T.............T',
        'T.x.r.....r.x.T',
        'T.............T',
        'T..p...f...p..T',
        'T.............T',
        'TT....,,,....TT',
        'TTTTTTT,TTTTTTT'
      ],
      exits: [{ tx: 7, ty: 11, to: 'village', spawn: [8, 12], label: 'Emberwick' }],
      seal: { tx: 7, ty: 4, puzzle: 'lights', name: 'Lantern Ring' },
      boss: { tx: 7, ty: 2, enemy: 'sophist' },
      lanternAt: { tx: 8, ty: 1 },
      chests: [{ id: 'gro1', tx: 1, ty: 9 }],
      npcs: [{ id: 'hermit', name: 'The Hermit', tx: 12, ty: 9, pal: 'hermit', riddle: 'looksay', lines: ['Why do you seek the Lantern? Good. Keep asking why. That is what this grove is for.'] }],
      monsters: [['paradoxImp', 3, 7], ['echoOwl', 11, 7], ['doubtShade', 7, 8], ['paradoxImp', 5, 9]]
    },

    spire: {
      name: 'Null’s Spire', floor: 'marble', alt: 'void', wall: 'obsidian', dark: 0.7,
      tiles: [
        '###############',
        '#x...........x#',
        '#.............#',
        '#p....,,,....p#',
        '#######.#######',
        '#.............#',
        '#x....p.p....x#',
        '#######.#######',
        '#.............#',
        '#.p.........p.#',
        '#......,......#',
        '#######,#######'
      ],
      exits: [{ tx: 7, ty: 11, to: 'village', spawn: [15, 2], label: 'Emberwick' }],
      seals: [{ id: 'spire2', tx: 7, ty: 7, puzzle: 'magic', name: 'Square of Fifteen' }, { id: 'spire1', tx: 7, ty: 4, puzzle: 'lock', name: 'Null’s Lock' }],
      boss: { tx: 7, ty: 2, enemy: 'null' },
      chests: [{ id: 'spi1', tx: 13, ty: 5 }],
      npcs: [],
      monsters: [['murkSlime', 3, 9], ['murkShade', 11, 9], ['murkSlime', 4, 5], ['murkShade', 10, 5]]
    }
  };

  /* ── Story ── speaker null = narration */
  LL.STORY = {
    intro: [
      [null, 'Emberwick: a village where the lanterns never went out.'],
      [null, 'Until tonight.'],
      ['Marla', 'Wren! Thank the stars you’re awake. Something is very wrong.'],
      ['Marla', 'The four Great Lanterns beyond the village have gone dark, all at once.'],
      ['Marla', 'Without them the Murk creeps in. It’s a fog that makes folk forget: names, numbers, why the sky is blue.'],
      ['Sable', 'It was Vesper Null. I saw a pale figure carry the last light away toward the old Spire.'],
      ['Marla', 'You carry the lamplighter’s banner, Wren. The Lanterns are guarded by creatures of the Murk.'],
      ['Marla', 'They fight with questions, and only true answers can wound them.'],
      ['Marla', 'Relight the Lanterns of Reason, Memory, Wayfinding and Wonder, and the gate to Null’s Spire will open.'],
      ['Marla', 'Come back to me whenever you need rest. And talk to the regulars: they know a thing or two.'],
      [null, 'Walk with the arrow keys or WASD, or tap where you want to go. Press Enter or Space, or tap a person, to talk.']
    ],
    sable: [
      ['Sable', 'Null was a scholar once, they say. The greatest in the land.'],
      ['Sable', 'Then the years took their memory, piece by piece. Maybe they decided everyone should lose theirs too.']
    ],
    sableAfter: [['Sable', 'Four lanterns lit. The Spire gate stands open now, north-east of the village square. Be careful, Wren.']],
    lanternLit: (name) => [[null, `The ${name} blazes back to life. The Murk retreats from this place.`]],
    allLit: [[null, 'Far away, a gate of black stone groans open. Null’s Spire awaits, past the north-east corner of Emberwick.']],
    gateClosed: [['Old Oma', 'That black gate leads to Null’s Spire. It won’t open while the Great Lanterns are dark.']],
    gateOpen: [['Old Oma', 'The gate is open. Go on, little lamplighter. Bring back the light.']],
    ending: [
      ['Vesper Null', 'I spent a lifetime learning. Then the fog came for my own mind, and I couldn’t bear it.'],
      ['Vesper Null', 'I thought if everyone forgot, it would hurt less.'],
      ['Wren', '…'],
      ['Vesper Null', 'You answered every question. You remembered. Perhaps forgetting isn’t the end, if someone teaches it back.'],
      [null, 'Null returns the stolen light. Every lantern in Emberwick blazes at once.'],
      ['Marla', 'You did it, Wren! Come back anytime. The Codex keeps what you’ve learned bright, if you keep reviewing it.'],
      [null, 'THE END. Thank you for playing. You can keep exploring, reviewing your Codex and training your mind.']
    ]
  };
})();
