/* Lanterns of Lore — Hedda's lessons, puzzles and trials for each subject. */
(function () {
  const LL = window.LL;

  LL.LESSONS = [
    // Science
    { id: 'sci1', s: 'sci', title: 'Air and Life', qs: ['s1', 's2', 's13', 's6'],
      intro: 'Every breath you take is a deal struck between you and the plants. Let us see how.' },
    { id: 'sci2', s: 'sci', title: 'Light and Sound', qs: ['s3', 's15', 's10', 's5'],
      intro: 'Light is the fastest thing there is, yet even it takes time to cross the sky.' },
    { id: 'sci3', s: 'sci', title: 'What Things Are Made Of', qs: ['s4', 's11', 's16', 's17', 's7'],
      intro: 'Everything you can touch is built from elements. Learn their names and their tempers.' },
    { id: 'sci4', s: 'sci', title: 'Bodies, Medicine and Seasons', qs: ['s8', 's9', 's14', 's12'],
      intro: 'Some of science’s greatest ideas came from noticing what everyone else ignored.' },
    // History
    { id: 'his1', s: 'his', title: 'The First Civilisations', qs: ['h15', 'h13', 'h1', 'h2', 'h14'],
      intro: 'History begins with writing. Before it, we have only stones and guesses.' },
    { id: 'his2', s: 'his', title: 'Empires and Roads', qs: ['h3', 'h9', 'h12', 'h16'],
      intro: 'Empires rise, trade, fight and fall. Their roads often outlive them.' },
    { id: 'his3', s: 'his', title: 'Kings, Gold and Printing', qs: ['h6', 'h10', 'h7', 'h4'],
      intro: 'One charter, one pilgrimage, one mountain city, one machine. Each changed its world.' },
    { id: 'his4', s: 'his', title: 'The Modern Age', qs: ['h11', 'h8', 'h17', 'h5'],
      intro: 'Steam, rockets and a wall coming down. The last few centuries moved very fast.' },
    // Geography
    { id: 'geo1', s: 'geo', title: 'A Water World', qs: ['g1', 'g10', 'g2', 'g12'],
      intro: 'Look at a globe and you will see our world is mostly blue. Let us dive in.' },
    { id: 'geo2', s: 'geo', title: 'Extremes of the Land', qs: ['g3', 'g4', 'g13', 'g6'],
      intro: 'The highest, the driest, the biggest and the smallest. Some answers will surprise you.' },
    { id: 'geo3', s: 'geo', title: 'People and Places', qs: ['g5', 'g7', 'g8', 'g16', 'g15'],
      intro: 'Maps are not only rivers and rocks. They are also people and the lines they draw.' },
    { id: 'geo4', s: 'geo', title: 'Maps and a Moving Earth', qs: ['g14', 'g17', 'g11', 'g9'],
      intro: 'Every map needs a starting line, and the ground beneath it is quietly moving.' },
    // Philosophy
    { id: 'phi1', s: 'phi', title: 'Ancient Wisdom', qs: ['p2', 'p3', 'p8', 'p16'],
      intro: 'In Greece and China, around the same time, people began asking how best to live.' },
    { id: 'phi2', s: 'phi', title: 'Thinking About Thinking', qs: ['p1', 'p14', 'p5', 'p4', 'p15'],
      intro: 'How do you know what you know? Careful, Wren: this question has no floor.' },
    { id: 'phi3', s: 'phi', title: 'Right and Wrong', qs: ['p6', 'p7', 'p17', 'p9', 'p13'],
      intro: 'Should we judge actions by their results, or by the rules behind them?' },
    { id: 'phi4', s: 'phi', title: 'Spotting Bad Arguments', qs: ['p10', 'p11', 'p12'],
      intro: 'Null’s favourite weapon is a clever-sounding argument. Learn to see through the trick.' },
    // Logic
    { id: 'log1', s: 'log', title: 'Slow Down', qs: ['l1', 'l2', 'l16', 'l10'],
      intro: 'Your first answer is often your fastest, not your best. These questions punish haste.' },
    { id: 'log2', s: 'log', title: 'Patterns and Growth', qs: ['l3', 'l14', 'l8', 'l6'],
      intro: 'Numbers love patterns. Find the rule and the rest follows.' },
    { id: 'log3', s: 'log', title: 'Chance and Averages', qs: ['l7', 'l13', 'l12', 'l9'],
      intro: 'Probability fools almost everyone. Count the possibilities and you will be fine.' },
    { id: 'log4', s: 'log', title: 'Pure Logic', qs: ['l4', 'l5', 'l11', 'l15'],
      intro: 'Strip away the meaning and look only at the shape of an argument.' }
  ];

  /* Each subject: Hedda's puzzle(s) and the Trial that relights its Lantern. */
  LL.TRACKS = {
    sci: { puzzles: ['jugs'], trial: 'entropy', blurb: 'How the natural world works' },
    his: { puzzles: ['hanoi'], trial: 'emperor', blurb: 'What happened, and why it matters' },
    geo: { puzzles: ['river'], trial: 'leviathan', blurb: 'Our planet and its people' },
    phi: { puzzles: ['lights'], trial: 'sophist', blurb: 'How to think, and how to live' },
    log: { puzzles: ['magic', 'lock'], trial: null, blurb: 'Reasoning that does not fool itself' }
  };

  /* Which tavern regular poses each riddle. */
  LL.RIDDLE_GIVERS = {
    swallow: 'Tobiah', chess: 'Hedda', carpet: 'Lark', letters: 'Mira', folds: 'Ilse', portrait: 'Oren', bridge: 'Ferrin', looksay: 'Bram'
  };
})();
