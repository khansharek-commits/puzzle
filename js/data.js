/* Atlas of Riddles — content.
 * Every puzzle teaches either a real-world fact or a thinking technique.
 * Puzzle types: choice, number, text, order, hanoi, lights, river, jugs, magic
 */
window.ATLAS = {};

ATLAS.CATEGORIES = {
  logic:    { name: 'Logic',     blurb: 'Deduction and careful reasoning' },
  numeracy: { name: 'Numeracy',  blurb: 'Working with numbers and quantities' },
  lateral:  { name: 'Lateral',   blurb: 'Questioning your assumptions' },
  spatial:  { name: 'Spatial',   blurb: 'Planning moves and seeing structure' },
  world:    { name: 'Knowledge', blurb: 'Facts about our world' }
};

ATLAS.CHAPTERS = [
  {
    id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.04, lon: 31.24,
    title: 'The Scribe’s Ledger',
    intro: [
      'Welcome aboard, apprentice. I am Professor Amara Quill, and this notebook is our atlas.',
      'We start in Cairo, where scribes worked through geometry problems on papyrus almost 4,000 years ago.',
      'Every puzzle we solve earns Insight. Every answer comes with a field note worth remembering. Shall we?'
    ]
  },
  {
    id: 'kyoto', name: 'Kyoto', country: 'Japan', lat: 35.01, lon: 135.77,
    title: 'Temple of Patience',
    intro: [
      'Kyoto. For more than a thousand years this was the seat of Japan’s emperors.',
      'The puzzles here reward patience. Rushing a tower of disks only makes it taller.'
    ]
  },
  {
    id: 'reykjavik', name: 'Reykjavík', country: 'Iceland', lat: 64.15, lon: -21.94,
    title: 'Fire and Ice',
    intro: [
      'Reykjavík, the world’s northernmost capital of a sovereign state.',
      'Iceland is being pulled apart by the planet itself. Let us see if our reasoning holds together better.'
    ]
  },
  {
    id: 'manaus', name: 'Manaus', country: 'Brazil', lat: -3.12, lon: -60.02,
    title: 'The Canopy Code',
    intro: [
      'Manaus sits in the heart of the Amazon, where the dark Rio Negro meets the sandy Solimões.',
      'The two rivers run side by side for kilometres without mixing. Keep your assumptions just as separate from the facts.'
    ]
  },
  {
    id: 'istanbul', name: 'Istanbul', country: 'Türkiye', lat: 41.01, lon: 28.98,
    title: 'Crossroads of Continents',
    intro: [
      'Istanbul: one city, two continents, three names over its long life.',
      'Merchants here have haggled for centuries. Watch your sums.'
    ]
  },
  {
    id: 'greenwich', name: 'Greenwich', country: 'United Kingdom', lat: 51.48, lon: 0.0,
    title: 'The Edge of Time',
    intro: [
      'Greenwich, home of longitude 0°. Every clock on Earth is measured from this hill.',
      'Our final riddles use everything you have learned. The Archive’s lock is waiting.'
    ]
  }
];

ATLAS.PUZZLES = [
  /* ───────── CAIRO ───────── */
  {
    id: 'c1', chapter: 'cairo', title: 'Stacking Stones', category: 'numeracy', value: 20, type: 'number',
    prompt: 'A builder makes a small model pyramid from identical cubes. The top layer is 1 cube, the next is a 2×2 square, then 3×3, and so on.\n\nHow many cubes does a model with 5 layers use?',
    answer: 55,
    hints: [
      'Count each layer separately. The layer sizes are 1, 4, 9, …',
      'Each layer is a square number: 1², 2², 3², 4², 5².',
      '1 + 4 + 9 + 16 + 25. Add them up.'
    ],
    explain: '1 + 4 + 9 + 16 + 25 = 55. The sum of the first n squares is n(n+1)(2n+1)/6, so 5·6·11/6 = 55.',
    note: {
      kind: 'fact', title: 'The Great Pyramid',
      text: 'The Great Pyramid of Giza was built around 2560 BCE from an estimated 2.3 million stone blocks. At about 146 m tall, it was the tallest human-made structure on Earth for nearly 3,800 years.',
      recall: { q: 'For roughly how long was the Great Pyramid the tallest human-made structure?', options: ['About 500 years', 'About 1,200 years', 'Nearly 3,800 years', 'It still is'], a: 2 }
    }
  },
  {
    id: 'c2', chapter: 'cairo', title: 'The Long Rivers', category: 'world', value: 25, type: 'order',
    prompt: 'The Nile is one of the longest rivers on Earth. Put these rivers in order from longest to shortest.',
    items: ['Danube', 'Nile', 'Thames', 'Yangtze'],
    answer: ['Nile', 'Yangtze', 'Danube', 'Thames'],
    hints: [
      'Two of these are among the three longest rivers in the world.',
      'The Yangtze is Asia’s longest river, but it is a little shorter than the Nile.',
      'The Danube crosses ten countries; the Thames stays inside England.'
    ],
    explain: 'Nile (~6,650 km), Yangtze (~6,300 km), Danube (~2,850 km), Thames (~346 km).',
    note: {
      kind: 'fact', title: 'Nile or Amazon?',
      text: 'The Nile (~6,650 km) is usually listed as the world’s longest river, but some measurements put the Amazon slightly ahead. The answer depends on where you decide each river starts. The Nile flows north and empties into the Mediterranean Sea.',
      recall: { q: 'Why is the "longest river" title disputed between the Nile and the Amazon?', options: ['The Amazon changes course every year', 'Measurements depend on where each river’s source is placed', 'The Nile has dried up in places', 'Nobody has measured the Amazon'], a: 1 }
    }
  },
  {
    id: 'c3', chapter: 'cairo', title: 'The Ferryman’s Cargo', category: 'spatial', value: 35, type: 'river',
    prompt: 'A farmer must cross the Nile with a jackal, a goose and a sack of grain. The boat holds the farmer and one passenger.\n\nLeft alone, the jackal will eat the goose, and the goose will eat the grain. Get everything across safely.',
    hints: [
      'There is only one safe first move.',
      'Nothing says the farmer can’t bring a passenger back again.',
      'Take the goose over. Later, bring the goose back to swap it for something else.'
    ],
    explain: 'Goose over, return alone, jackal over, bring the goose back, grain over, return alone, goose over: 7 crossings.',
    note: {
      kind: 'fact', title: 'A puzzle 1,200 years old',
      text: 'River-crossing puzzles like this one appear in "Propositiones ad Acuendos Juvenes" (Problems to Sharpen the Young), a collection attributed to Alcuin of York from around 800 CE. It is one of the oldest known puzzle books in Latin.',
      recall: { q: 'The river-crossing puzzle appears in a collection from around 800 CE. What was it called?', options: ['The Rhind Papyrus', 'Problems to Sharpen the Young', 'The Book of Calculation', 'Elements'], a: 1 }
    }
  },
  {
    id: 'c4', chapter: 'cairo', title: 'Numbers in Stone', category: 'numeracy', value: 30, type: 'number',
    prompt: 'Egyptian hieroglyphs wrote numbers by repeating symbols:\n\n|  stroke = 1\n∩  heel bone = 10\n@  coil of rope = 100\n✿  lotus flower = 1,000\n\nA tomb inscription reads:  ✿ @ @ @ ∩ ∩ | | | |\n\nWhat number is it?',
    answer: 1324,
    hints: [
      'Count how many of each symbol appear.',
      'One lotus, three coils, two heel bones, four strokes.',
      '1,000 + 300 + 20 + 4.'
    ],
    explain: '1 × 1,000 + 3 × 100 + 2 × 10 + 4 × 1 = 1,324. Order didn’t matter: the system has no place value.',
    note: {
      kind: 'fact', title: 'Counting without zero',
      text: 'Egyptian hieroglyphic numerals had separate symbols for each power of ten, up to a kneeling god (Heh) for one million. Because each symbol carries its own value, the system needed no zero and the order of symbols did not change the number.',
      recall: { q: 'Why did Egyptian hieroglyphic numbers not need a zero?', options: ['They never counted past 100', 'Each symbol had a fixed value regardless of position', 'They used dots instead', 'Zero was forbidden by law'], a: 1 }
    }
  },
  {
    id: 'c5', chapter: 'cairo', title: 'Two Scribes', category: 'logic', value: 35, type: 'choice',
    prompt: 'In the scribes’ hall, every scribe either always tells the truth or always lies.\n\nScribe Ahmes says: "At least one of the two of us is a liar."\n\nWhat are Ahmes and his colleague Neferu?',
    options: ['Both truth-tellers', 'Both liars', 'Ahmes tells the truth, Neferu lies', 'Ahmes lies, Neferu tells the truth'],
    answer: 2,
    hints: [
      'Suppose Ahmes is a liar. What would his statement then have to be?',
      'If Ahmes lied, "at least one of us is a liar" would be false, so neither is a liar. That contradicts him lying.',
      'So Ahmes tells the truth. Now his statement says at least one is a liar…'
    ],
    explain: 'If Ahmes lied, his statement would be false, meaning nobody lies, which contradicts him lying. So Ahmes is truthful, and his true statement means Neferu must be the liar.',
    note: {
      kind: 'fact', title: 'Ahmes the scribe',
      text: 'The Rhind Mathematical Papyrus (c. 1550 BCE) was copied by a scribe named Ahmes, one of the earliest mathematicians known by name. It contains 84 problems, including fractions, areas and the slopes of pyramids.',
      recall: { q: 'Who copied the Rhind Mathematical Papyrus?', options: ['Imhotep', 'Ahmes', 'Ptolemy', 'Champollion'], a: 1 }
    }
  },
  {
    id: 'c6', chapter: 'cairo', title: 'The Three Scripts', category: 'world', value: 30, type: 'choice',
    prompt: 'The Rosetta Stone carries the same decree in three scripts: hieroglyphic, Demotic and one more. Scholars could already read the third script, and it became the key to cracking hieroglyphs.\n\nWhich was it?',
    options: ['Latin', 'Ancient Greek', 'Arabic', 'Phoenician'],
    answer: 1,
    hints: [
      'The decree was issued in 196 BCE under the Ptolemies, a dynasty founded by one of Alexander the Great’s generals.',
      'The ruling class of Egypt at that time spoke the language of Alexander.',
      'It was the administrative language of Ptolemaic Egypt.'
    ],
    explain: 'Ancient Greek. Egypt was ruled by the Greek-speaking Ptolemaic dynasty, so official decrees were also written in Greek.',
    note: {
      kind: 'fact', title: 'The Rosetta Stone',
      text: 'Found by French soldiers in 1799, the Rosetta Stone records a decree from 196 BCE. Comparing its Greek text with the hieroglyphs, Jean-François Champollion announced his decipherment of hieroglyphs in 1822. The stone is in the British Museum.',
      recall: { q: 'Who announced the decipherment of Egyptian hieroglyphs in 1822?', options: ['Howard Carter', 'Jean-François Champollion', 'Napoleon Bonaparte', 'Thomas Young'], a: 1 }
    }
  },

  /* ───────── KYOTO ───────── */
  {
    id: 'k1', chapter: 'kyoto', title: 'The Monk’s Tower', category: 'spatial', value: 35, type: 'hanoi', disks: 4,
    prompt: 'Move the whole tower of 4 disks from the left post to the right post.\n\nOnly the top disk of a post can move, and a disk can never sit on a smaller one. The fewest possible moves is 15. Can you match it?',
    hints: [
      'To move the biggest disk, the three smaller disks must all be on the middle post first.',
      'Moving 3 disks works the same way: first move the top 2 out of the way.',
      'The smallest disk moves every other turn, always cycling in the same direction.'
    ],
    explain: 'Moving n disks takes 2ⁿ − 1 moves at minimum: 15 for 4 disks. Each tower is solved by solving a smaller tower twice, which is a recursive strategy.',
    note: {
      kind: 'idea', title: 'Recursion',
      text: 'The Tower of Hanoi was invented by French mathematician Édouard Lucas in 1883. It is a classic example of recursion: break a problem into a smaller copy of itself. A 64-disk tower would need 2⁶⁴ − 1 moves, about 585 billion years at one move per second.',
      recall: { q: 'What is the minimum number of moves for a Tower of Hanoi with n disks?', options: ['n²', '2n', '2ⁿ − 1', 'n!'], a: 2 }
    }
  },
  {
    id: 'k2', chapter: 'kyoto', title: 'The Old Capital', category: 'world', value: 25, type: 'choice',
    prompt: 'Kyoto (then called Heian-kyō) became Japan’s imperial capital in 794 CE. The emperor moved to Tokyo in 1868–69.\n\nRoughly how long was Kyoto the capital?',
    options: ['About 300 years', 'About 600 years', 'More than 1,000 years', 'About 1,500 years'],
    answer: 2,
    hints: [
      'This is a subtraction, not a memory test.',
      '1869 − 794.',
      'It comes to 1,075.'
    ],
    explain: '1869 − 794 = 1,075 years.',
    note: {
      kind: 'fact', title: 'Heian-kyō',
      text: 'Kyoto was laid out in 794 CE as Heian-kyō, “capital of peace and tranquillity”, on a grid modelled on the Chinese capital Chang’an. It remained the imperial capital until 1869, when the emperor moved to Tokyo (“eastern capital”).',
      recall: { q: 'Which city was Kyoto’s grid plan modelled on?', options: ['Beijing', 'Chang’an', 'Seoul', 'Nara'], a: 1 }
    }
  },
  {
    id: 'k3', chapter: 'kyoto', title: 'Folded Paper', category: 'numeracy', value: 25, type: 'number',
    prompt: 'An origami student folds a sheet of paper in half, then in half again, and keeps going.\n\nAfter 7 folds, how many layers thick is the paper?',
    answer: 128,
    hints: [
      'After one fold there are 2 layers. After two folds?',
      'Each fold doubles the layers.',
      '2 × 2 × 2 × 2 × 2 × 2 × 2.'
    ],
    explain: 'Each fold doubles the layers: 2⁷ = 128.',
    note: {
      kind: 'fact', title: 'The 12-fold record',
      text: 'It was long claimed paper couldn’t be folded in half more than 7 or 8 times. In 2002, US high-school student Britney Gallivan worked out the maths of the paper needed and folded a very long sheet in half 12 times.',
      recall: { q: 'How many times did Britney Gallivan fold a sheet of paper in half in 2002?', options: ['7', '9', '12', '20'], a: 2 }
    }
  },
  {
    id: 'k4', chapter: 'kyoto', title: 'The Swallow and the Trains', category: 'lateral', value: 40, type: 'number', unit: 'km',
    prompt: 'Two trains start 500 km apart on the same track and head toward each other, each at 250 km/h.\n\nA swallow starts at the front of one train and flies at 300 km/h to the other, turns instantly, flies back, and so on until the trains meet.\n\nHow many kilometres does the swallow fly in total?',
    answer: 300,
    hints: [
      'You could add up every zig and zag, but there is a much shorter route.',
      'How long does it take before the trains meet?',
      'They close 500 km at a combined 500 km/h, so 1 hour. How far does the swallow fly in one hour?'
    ],
    explain: 'The trains meet after 1 hour. The swallow flies the whole time at 300 km/h, so it covers 300 km. Ask what the question really depends on (time), and the infinite series disappears.',
    note: {
      kind: 'fact', title: 'The first bullet train',
      text: 'Japan’s Tōkaidō Shinkansen opened on 1 October 1964 between Tokyo and Osaka, nine days before the Tokyo Olympics. It was the world’s first high-speed rail line. A famous story says mathematician John von Neumann solved this “fly between trains” puzzle instantly by summing the series in his head.',
      recall: { q: 'When did the first Shinkansen line open?', options: ['1945', '1964', '1982', '1998'], a: 1 }
    }
  },
  {
    id: 'k5', chapter: 'kyoto', title: 'The Long Timeline', category: 'world', value: 30, type: 'order',
    prompt: 'Arrange these events from earliest to latest.',
    items: ['Gutenberg’s printing press', 'Heian-kyō (Kyoto) founded', 'Great Pyramid of Giza built', 'First Moon landing', 'Traditional founding of Rome'],
    answer: ['Great Pyramid of Giza built', 'Traditional founding of Rome', 'Heian-kyō (Kyoto) founded', 'Gutenberg’s printing press', 'First Moon landing'],
    hints: [
      'One of these happened before 2000 BCE.',
      'Rome’s traditional founding date is 753 BCE.',
      'Kyoto: 794 CE. Gutenberg: around 1440–1450. Moon: 1969.'
    ],
    explain: 'Great Pyramid (~2560 BCE), Rome (753 BCE, traditional), Heian-kyō (794 CE), Gutenberg’s press (~1440), Apollo 11 (1969).',
    note: {
      kind: 'fact', title: 'Cleopatra and the pyramids',
      text: 'Cleopatra VII (died 30 BCE) lived closer in time to the Moon landing (1969) than to the building of the Great Pyramid (~2560 BCE). Ancient history spans far more time than most of us picture.',
      recall: { q: 'Cleopatra lived closer in time to which event?', options: ['The building of the Great Pyramid', 'The first Moon landing'], a: 1 }
    }
  },
  {
    id: 'k6', chapter: 'kyoto', title: 'Festival Lanterns', category: 'spatial', value: 40, type: 'lights', size: 3, presses: [0, 4, 8],
    prompt: 'Light every lantern for the festival.\n\nTouching a lantern switches it and the lanterns directly above, below, left and right of it (on becomes off, off becomes on).',
    hints: [
      'Pressing a lantern twice undoes it, so each lantern needs pressing at most once.',
      'The order of presses doesn’t matter, only which lanterns you press.',
      'Press the top-left, centre and bottom-right lanterns once each.'
    ],
    explain: 'Because presses can be done in any order and pressing twice cancels out, the puzzle is really asking which set of lanterns to press. Mathematicians solve these with linear algebra over two values: on and off.',
    note: {
      kind: 'fact', title: 'Gion Matsuri',
      text: 'Kyoto’s Gion Matsuri, held every July, began in 869 CE as a ritual to calm the gods during an epidemic. It is one of Japan’s most famous festivals, known for its giant decorated floats and lantern-lit evenings.',
      recall: { q: 'Why did Kyoto’s Gion Matsuri begin in 869 CE?', options: ['To celebrate a harvest', 'As a ritual during an epidemic', 'To mark a new emperor', 'To honour the founding of the city'], a: 1 }
    }
  },

  /* ───────── REYKJAVÍK ───────── */
  {
    id: 'r1', chapter: 'reykjavik', title: 'The Splitting Island', category: 'world', value: 25, type: 'choice',
    prompt: 'Iceland sits on top of the Mid-Atlantic Ridge, and the island is slowly being pulled apart.\n\nWhich two tectonic plates are separating there?',
    options: ['Pacific and Nazca', 'North American and Eurasian', 'African and Arabian', 'Indian and Eurasian'],
    answer: 1,
    hints: [
      'The ridge runs down the middle of the Atlantic Ocean.',
      'One plate carries Canada; the other carries Norway.',
      'Think of the continents on each side of the North Atlantic.'
    ],
    explain: 'The North American and Eurasian plates move apart by roughly 2 cm a year, which is why Iceland has so many volcanoes and rift valleys.',
    note: {
      kind: 'fact', title: 'Þingvellir',
      text: 'At Þingvellir you can walk in the rift valley between the North American and Eurasian plates. It is also where Iceland’s parliament, the Althing, was founded in 930 CE, making it one of the oldest parliaments in the world.',
      recall: { q: 'Iceland’s parliament, the Althing, was founded in roughly which year?', options: ['930 CE', '1215 CE', '1603 CE', '1918 CE'], a: 0 }
    }
  },
  {
    id: 'r2', chapter: 'reykjavik', title: 'Hot Spring Measures', category: 'spatial', value: 35, type: 'jugs', caps: [5, 3], target: 4,
    prompt: 'At a geothermal spring you have a 5-litre jug and a 3-litre jug, with no markings.\n\nMeasure exactly 4 litres in the 5-litre jug.',
    hints: [
      'You can fill, empty, and pour one jug into the other until one is full or empty.',
      'Fill the 5 L jug and pour into the 3 L jug. What is left in the 5 L jug?',
      'Keep that 2 L in the 3 L jug, then fill the 5 L again and top up the 3 L jug.'
    ],
    explain: 'Fill 5 → pour into 3 (leaves 2) → empty 3 → pour the 2 into 3 → fill 5 → top up the 3 (needs 1) → 4 left in the 5 L jug.',
    note: {
      kind: 'fact', title: 'A geothermal nation',
      text: 'About nine in ten Icelandic homes are heated with geothermal energy, using hot water from deep underground. Most of the country’s electricity comes from hydropower and geothermal plants.',
      recall: { q: 'Roughly what share of Icelandic homes are heated geothermally?', options: ['1 in 10', '1 in 3', '9 in 10', 'None'], a: 2 }
    }
  },
  {
    id: 'r3', chapter: 'reykjavik', title: 'The Heavy Coin', category: 'logic', value: 40, type: 'choice',
    prompt: 'You have 9 identical-looking silver coins. One is a forgery and slightly heavier than the rest.\n\nUsing a balance scale, what is the smallest number of weighings that always finds the forgery?',
    options: ['1', '2', '3', '4'],
    answer: 1,
    hints: [
      'A balance scale has three possible results, not two.',
      'Split the coins into three groups of 3 and weigh two of the groups.',
      'Whichever group holds the forgery, one more weighing among its 3 coins finds it.'
    ],
    explain: 'Weigh 3 against 3. If one side is heavier, the fake is there; if balanced, it is in the other 3. Then weigh 1 against 1 from that group in the same way. 2 weighings.',
    note: {
      kind: 'idea', title: 'Counting outcomes',
      text: 'Each weighing has 3 possible outcomes (left heavier, right heavier, balanced), so k weighings can tell apart at most 3ᵏ possibilities. With 9 = 3² coins, 2 weighings is enough. Counting how many cases a test can distinguish is a core idea in information theory.',
      recall: { q: 'How many coins can 3 weighings handle in this puzzle?', options: ['9', '12', '27', '81'], a: 2 }
    }
  },
  {
    id: 'r4', chapter: 'reykjavik', title: 'The Runestone Sequence', category: 'lateral', value: 35, type: 'text',
    prompt: 'A weathered stone shows these letters:\n\nO  T  T  F  F  S  S  E  _\n\nWhat letter comes next?',
    accept: ['n'],
    hints: [
      'These are not abbreviations of words on the stone. They come from something you use every day.',
      'Try counting out loud.',
      'One, Two, Three, Four, …'
    ],
    explain: 'N, for Nine. They are the first letters of One, Two, Three, Four, Five, Six, Seven, Eight.',
    note: {
      kind: 'idea', title: 'Change the representation',
      text: 'When a pattern refuses to make sense, try a different way of looking at the symbols: as words, positions, shapes or sounds. Many hard problems become easy once they are written in a different form.',
      recall: { q: 'What is a good move when a pattern makes no sense in its current form?', options: ['Guess and move on', 'Change how you represent it', 'Look for the longest symbol', 'Count backwards'], a: 1 }
    }
  },
  {
    id: 'r5', chapter: 'reykjavik', title: 'Nations by Number', category: 'world', value: 30, type: 'order',
    prompt: 'Iceland has one of the smallest populations of any country. Order these countries from smallest population to largest.',
    items: ['Japan', 'Iceland', 'Canada', 'Norway'],
    answer: ['Iceland', 'Norway', 'Canada', 'Japan'],
    hints: [
      'Iceland has fewer than half a million people.',
      'Canada is enormous in area but has about 41 million people.',
      'Japan has around 124 million people.'
    ],
    explain: 'Iceland (~0.4 million), Norway (~5.5 million), Canada (~41 million), Japan (~124 million).',
    note: {
      kind: 'fact', title: 'Big land, few people',
      text: 'Canada is the second-largest country by area, yet it has about a third of Japan’s population. Most Canadians live within a few hundred kilometres of the US border. Area and population often have little to do with each other.',
      recall: { q: 'Canada is the ___ largest country by area.', options: ['Largest', 'Second-largest', 'Fifth-largest', 'Tenth-largest'], a: 1 }
    }
  },
  {
    id: 'r6', chapter: 'reykjavik', title: 'Three Guides', category: 'logic', value: 30, type: 'choice',
    prompt: 'Three guides, Ari, Freyja and Gunnar, each led one tour today: to a glacier, a geyser or a volcano.\n\n• Gunnar went to the glacier.\n• Freyja did not go to the volcano.\n• The geyser tour was not led by Ari.\n\nWho led the volcano tour?',
    options: ['Ari', 'Freyja', 'Gunnar'],
    answer: 0,
    hints: [
      'Start with the clue that tells you something definite.',
      'Gunnar has the glacier, so Freyja and Ari share the geyser and volcano.',
      'Freyja did not go to the volcano.'
    ],
    explain: 'Gunnar: glacier. Freyja can’t have the volcano, so she has the geyser. Ari has the volcano, which fits the last clue.',
    note: {
      kind: 'fact', title: 'The original Geysir',
      text: 'The English word “geyser” comes from Geysir, a hot spring in Iceland’s Haukadalur valley. Its name comes from the Icelandic verb “geysa”, to gush. Its neighbour Strokkur erupts every few minutes.',
      recall: { q: 'Where does the word “geyser” come from?', options: ['A Greek god', 'A hot spring in Iceland', 'A Maori word', 'A Latin verb for “boil”'], a: 1 }
    }
  },

  /* ───────── MANAUS ───────── */
  {
    id: 'm1', chapter: 'manaus', title: 'A Forest of Nations', category: 'world', value: 30, type: 'choice',
    prompt: 'Most of the Amazon rainforest is in Brazil, but not all of it.\n\nAcross how many countries and territories does it stretch?',
    options: ['3', '5', '9', '14'],
    answer: 2,
    hints: [
      'Peru, Colombia and Bolivia are all included.',
      'So are Ecuador, Venezuela, Guyana and Suriname.',
      'Don’t forget Brazil, and French Guiana, an overseas region of France.'
    ],
    explain: 'Nine: Brazil, Peru, Colombia, Venezuela, Ecuador, Bolivia, Guyana, Suriname and French Guiana.',
    note: {
      kind: 'fact', title: 'The Amazon',
      text: 'The Amazon is the largest tropical rainforest on Earth, covering about 5.5 million km² across nine countries and territories. Around 60% of it lies in Brazil. The Amazon River carries more water than any other river.',
      recall: { q: 'Roughly what share of the Amazon rainforest is in Brazil?', options: ['About 20%', 'About 60%', 'About 90%', 'All of it'], a: 1 }
    }
  },
  {
    id: 'm2', chapter: 'manaus', title: 'Giant Lily Pads', category: 'lateral', value: 30, type: 'number', unit: 'days',
    prompt: 'A patch of giant water lilies doubles in area every day. It takes 30 days to cover a lagoon completely.\n\nOn which day was the lagoon exactly half covered?',
    answer: 29,
    hints: [
      'Your first instinct might be 15. Check it.',
      'Work backwards from day 30.',
      'If it doubles every day, what was it the day before it was full?'
    ],
    explain: 'Day 29. Doubling from half gives full the next day. Exponential growth looks slow for most of the time, then fills everything at once.',
    note: {
      kind: 'fact', title: 'Victoria amazonica',
      text: 'The giant Amazon water lily, Victoria amazonica, grows leaves up to about 3 m across that can support a small child spread over the surface. Its underside is covered with sharp spines that protect it from fish and manatees.',
      recall: { q: 'How wide can a Victoria amazonica leaf grow?', options: ['About 30 cm', 'About 1 m', 'About 3 m', 'About 10 m'], a: 2 }
    }
  },
  {
    id: 'm3', chapter: 'manaus', title: 'The Night Bridge', category: 'logic', value: 45, type: 'number', unit: 'minutes',
    prompt: 'Four explorers reach a rope bridge at night. They have one torch, and the bridge holds two people at once. Anyone crossing needs the torch, and a pair moves at the slower person’s pace.\n\nThey take 1, 2, 5 and 10 minutes to cross.\n\nWhat is the shortest total time to get everyone across?',
    answer: 17,
    hints: [
      'The obvious plan, where the 1-minute explorer escorts each person, takes 19 minutes. You can do better.',
      'The two slowest explorers should cross together.',
      '1 & 2 cross (2), 1 returns (1), 5 & 10 cross (10), 2 returns (2), 1 & 2 cross (2).'
    ],
    explain: '2 + 1 + 10 + 2 + 2 = 17 minutes. Sending 5 and 10 together means you only pay for the 10 once.',
    note: {
      kind: 'idea', title: 'Group the bottlenecks',
      text: 'When the slowest steps dominate the cost, try doing them together so you pay their price only once. The same idea shows up in scheduling, logistics and computing.',
      recall: { q: 'In the bridge puzzle, what was the key move?', options: ['The fastest person escorts everyone', 'The two slowest cross together', 'Everyone crosses alone', 'Cross without the torch'], a: 1 }
    }
  },
  {
    id: 'm4', chapter: 'manaus', title: 'Rodent of the River', category: 'world', value: 20, type: 'choice',
    prompt: 'Along Amazon riverbanks lives the largest rodent in the world. Which is it?',
    options: ['Beaver', 'Capybara', 'Porcupine', 'Agouti'],
    answer: 1,
    hints: [
      'It is semi-aquatic and has partly webbed feet.',
      'It lives in large social groups and other animals often sit on it.',
      'Its name comes from a Tupi word often translated as “grass-eater”.'
    ],
    explain: 'The capybara. Adults can weigh over 60 kg.',
    note: {
      kind: 'fact', title: 'The capybara',
      text: 'Capybaras are the largest living rodents, often weighing over 60 kg. They are excellent swimmers with partly webbed feet and can stay underwater for several minutes to hide from predators.',
      recall: { q: 'What is the largest living rodent?', options: ['Beaver', 'Capybara', 'Coypu', 'Giant rat'], a: 1 }
    }
  },
  {
    id: 'm5', chapter: 'manaus', title: 'The Turtle’s Square', category: 'numeracy', value: 45, type: 'magic',
    given: [4, 0, 0, 0, 5, 0, 0, 0, 0],
    prompt: 'Fill the grid with the numbers 1 to 9, each used once, so that every row, column and both diagonals add up to the same total.\n\nTwo numbers are already in place.',
    hints: [
      '1 + 2 + … + 9 = 45, and there are three rows. What must each row add to?',
      'Each line adds to 15. Opposite cells through the centre must add to 10.',
      'Opposite 4 is 6. The even numbers go in the corners, the odd numbers in the middle of each edge.'
    ],
    explain: 'One solution: 4 9 2 / 3 5 7 / 8 1 6. Every line totals 15, because the nine numbers add to 45, split into three equal rows.',
    note: {
      kind: 'fact', title: 'The Lo Shu square',
      text: 'This arrangement is the Lo Shu square from ancient Chinese legend, said to have appeared on the shell of a turtle rising from the Luo River. It is essentially the only 3×3 magic square: all others are rotations or reflections of it.',
      recall: { q: 'What does every line of a 3×3 magic square using 1–9 add up to?', options: ['12', '15', '18', '45'], a: 1 }
    }
  },
  {
    id: 'm6', chapter: 'manaus', title: 'Three Huts', category: 'logic', value: 45, type: 'choice',
    prompt: 'A guide hides supplies in one of three huts. You pick hut 1. The guide, who knows where the supplies are and always opens an empty hut you didn’t pick, opens hut 3: it’s empty.\n\nThe guide offers you a switch to hut 2. What should you do?',
    options: ['Stay: it is 50/50 either way', 'Switch: hut 2 is now twice as likely', 'Stay: your first choice is more likely', 'It makes no difference whatever the guide knows'],
    answer: 1,
    hints: [
      'What was the chance your first pick was right?',
      'The guide’s choice was not random. They had to avoid the supplies.',
      'Your hut stays at 1/3. The remaining 2/3 now sits entirely on hut 2.'
    ],
    explain: 'Your first pick had a 1/3 chance. The guide’s action doesn’t change that, so hut 2 holds the other 2/3. Switching wins twice as often.',
    note: {
      kind: 'fact', title: 'The Monty Hall problem',
      text: 'This puzzle is named after Monty Hall, host of the US game show “Let’s Make a Deal”. When Marilyn vos Savant explained in 1990 that switching is better, thousands of readers, including many with PhDs, wrote in to say she was wrong. She was right.',
      recall: { q: 'In the Monty Hall problem, switching wins how often?', options: ['1/3 of the time', '1/2 of the time', '2/3 of the time', 'Always'], a: 2 }
    }
  },

  /* ───────── ISTANBUL ───────── */
  {
    id: 'i1', chapter: 'istanbul', title: 'Between Two Seas', category: 'world', value: 25, type: 'choice',
    prompt: 'Istanbul is split between Europe and Asia by a narrow strait connecting the Black Sea and the Sea of Marmara.\n\nWhat is it called?',
    options: ['The Dardanelles', 'The Bosphorus', 'The Strait of Gibraltar', 'The Suez Canal'],
    answer: 1,
    hints: [
      'The Dardanelles is a different strait, connecting the Sea of Marmara to the Aegean.',
      'Its name is often said to mean “ox ford” in Greek.',
      'Several large suspension bridges cross it.'
    ],
    explain: 'The Bosphorus. The Dardanelles is the other Turkish strait, further south-west.',
    note: {
      kind: 'fact', title: 'A city on two continents',
      text: 'Istanbul is one of very few major cities that spans two continents. The Bosphorus is about 30 km long and less than a kilometre wide at its narrowest point.',
      recall: { q: 'Which two seas does the Bosphorus connect?', options: ['Black Sea and Sea of Marmara', 'Aegean and Mediterranean', 'Red Sea and Mediterranean', 'Caspian and Black Sea'], a: 0 }
    }
  },
  {
    id: 'i2', chapter: 'istanbul', title: 'Three Names', category: 'world', value: 35, type: 'order',
    prompt: 'Put these moments in the city’s history in order, earliest first.',
    items: ['Ottoman conquest of Constantinople', 'Greek colonists found Byzantium', 'Republic of Turkey founded', 'Constantine renames the city Constantinople'],
    answer: ['Greek colonists found Byzantium', 'Constantine renames the city Constantinople', 'Ottoman conquest of Constantinople', 'Republic of Turkey founded'],
    hints: [
      'The city’s first name came first.',
      'Constantine was a Roman emperor in the 4th century CE.',
      'The Ottomans took the city in 1453; the Republic came in 1923.'
    ],
    explain: 'Byzantium (~657 BCE), Constantinople (330 CE), Ottoman conquest (1453), Republic of Turkey (1923).',
    note: {
      kind: 'fact', title: 'Capital of empires',
      text: 'Constantinople was the capital of the Eastern Roman (Byzantine) Empire for over 1,100 years, then of the Ottoman Empire until 1922. When the Republic of Turkey was founded in 1923, the capital moved to Ankara.',
      recall: { q: 'Which city is the capital of modern Türkiye?', options: ['Istanbul', 'Izmir', 'Ankara', 'Bursa'], a: 2 }
    }
  },
  {
    id: 'i3', chapter: 'istanbul', title: 'The Carpet Dealer', category: 'numeracy', value: 30, type: 'number', unit: 'coins',
    prompt: 'In the Grand Bazaar, a trader buys a carpet for 60 coins and sells it for 70. Regretting it, she buys it back for 80 and sells it again for 90.\n\nHow much profit did she make overall?',
    answer: 20,
    hints: [
      'Don’t follow the story. Follow the money.',
      'Add up everything she paid, then everything she received.',
      'Paid: 60 + 80. Received: 70 + 90.'
    ],
    explain: 'She received 160 and paid 140, so 20 coins profit. Thinking of it as two separate deals (+10, +10) gives the same answer.',
    note: {
      kind: 'fact', title: 'The Grand Bazaar',
      text: 'Construction of Istanbul’s Grand Bazaar began in the 1450s, soon after the Ottoman conquest. Today it is one of the largest and oldest covered markets in the world, with around 4,000 shops along dozens of streets.',
      recall: { q: 'Roughly how many shops are in the Grand Bazaar today?', options: ['About 40', 'About 400', 'About 4,000', 'About 40,000'], a: 2 }
    }
  },
  {
    id: 'i4', chapter: 'istanbul', title: 'The Clock Tower', category: 'numeracy', value: 40, type: 'number', unit: 'degrees', tolerance: 0.01,
    prompt: 'A clock tower shows exactly 3:15.\n\nWhat is the angle, in degrees, between the hour hand and the minute hand?',
    answer: 7.5,
    hints: [
      'It’s not zero. The hour hand keeps moving between the numbers.',
      'The hour hand moves 30° per hour, so 0.5° per minute.',
      'The minute hand is at 90°. The hour hand is at 90° + 15 × 0.5°.'
    ],
    explain: 'Minute hand: 90°. Hour hand: 3 × 30° + 15 × 0.5° = 97.5°. Difference: 7.5°.',
    note: {
      kind: 'idea', title: 'Check hidden motion',
      text: 'Many puzzles hide a quantity that changes while you are not paying attention to it, like the hour hand creeping forward. Before you answer, ask what else moved.',
      recall: { q: 'How many degrees does a clock’s hour hand move per minute?', options: ['0.5°', '1°', '6°', '30°'], a: 0 }
    }
  },
  {
    id: 'i5', chapter: 'istanbul', title: 'The Portrait', category: 'lateral', value: 35, type: 'choice',
    prompt: 'A merchant points at a portrait in his shop and says:\n\n"Brothers and sisters I have none, but that man’s father is my father’s son."\n\nWho is in the portrait?',
    options: ['The merchant himself', 'The merchant’s father', 'The merchant’s son', 'The merchant’s nephew'],
    answer: 2,
    hints: [
      'Simplify one phrase at a time.',
      'He has no siblings. So who is “my father’s son”?',
      '“My father’s son” is the merchant. So the man’s father is the merchant.'
    ],
    explain: 'With no brothers, “my father’s son” is the merchant himself. So the portrait shows a man whose father is the merchant: his son.',
    note: {
      kind: 'idea', title: 'Substitute and simplify',
      text: 'When a sentence is tangled, replace each phrase with the simplest thing it refers to, one at a time. It is the same move as simplifying an algebraic expression.',
      recall: { q: 'What is the best approach to a tangled description?', options: ['Read it faster', 'Replace each phrase with what it refers to, step by step', 'Guess the most common answer', 'Draw a picture of the room'], a: 1 }
    }
  },
  {
    id: 'i6', chapter: 'istanbul', title: 'The Chessboard', category: 'spatial', value: 45, type: 'number',
    prompt: 'A merchant sells a standard 8×8 chessboard.\n\nCounting squares of every size (1×1, 2×2, and so on up to the whole board), how many squares are on it?',
    answer: 204,
    hints: [
      'It is a lot more than 64.',
      'How many positions can a 7×7 square take on an 8×8 board? A 2×2?',
      'There are 8² of size 1, 7² of size 2, … , 1² of size 8. Add them.'
    ],
    explain: '64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204. The same sum of squares you met in Cairo.',
    note: {
      kind: 'fact', title: 'Chess on the move',
      text: 'Chess began in India around the 6th century CE as chaturanga, spread to Persia as shatranj, and reached Europe through the Islamic world. The queen gained her modern long-range powers in Europe in the late 15th century.',
      recall: { q: 'Where did the earliest form of chess, chaturanga, originate?', options: ['China', 'India', 'Persia', 'Spain'], a: 1 }
    }
  },

  /* ───────── GREENWICH ───────── */
  {
    id: 'g1', chapter: 'greenwich', title: 'Longitude Zero', category: 'world', value: 25, type: 'choice',
    prompt: 'At an international conference in Washington, D.C., delegates from 25 nations chose Greenwich as the world’s prime meridian.\n\nIn what year?',
    options: ['1714', '1815', '1884', '1919'],
    answer: 2,
    hints: [
      'Railways and the telegraph made a common time system urgent.',
      'It was the late 19th century.',
      'It was the year after Krakatoa erupted (1883).'
    ],
    explain: '1884, at the International Meridian Conference.',
    note: {
      kind: 'fact', title: 'Why Greenwich?',
      text: 'By 1884, about 72% of the world’s shipping already used charts based on Greenwich, so it was the practical choice. France abstained from the vote and kept using the Paris meridian on its maps for decades.',
      recall: { q: 'Which country abstained and kept its own meridian for decades?', options: ['Spain', 'France', 'Germany', 'Japan'], a: 1 }
    }
  },
  {
    id: 'g2', chapter: 'greenwich', title: 'Noon Across the World', category: 'numeracy', value: 35, type: 'number', unit: 'hours (24h clock)',
    prompt: 'Earth turns 360° in 24 hours. Japan sets its clocks by the meridian at 135° East.\n\nWhen it is exactly 12:00 noon at Greenwich (0°), what hour is it in Japan on a 24-hour clock?',
    answer: 21,
    hints: [
      'First find how many degrees Earth turns in one hour.',
      '360 ÷ 24 = 15° per hour. How many hours is 135°?',
      'East of Greenwich is ahead. 12 + 9 = ?'
    ],
    explain: '360° ÷ 24 h = 15° per hour. 135° ÷ 15° = 9 hours ahead, so 21:00.',
    note: {
      kind: 'fact', title: 'Fifteen degrees an hour',
      text: 'Because Earth rotates 15° per hour, time zones were designed to be about 15° wide. Japan Standard Time is set by the 135°E meridian, which passes through the city of Akashi. Political borders bend many zones; China uses a single time zone despite spanning about 60° of longitude.',
      recall: { q: 'How many degrees does Earth rotate in one hour?', options: ['10°', '12°', '15°', '24°'], a: 2 }
    }
  },
  {
    id: 'g3', chapter: 'greenwich', title: 'The Astronomers’ Hats', category: 'logic', value: 50, type: 'choice',
    prompt: 'Three astronomers stand in a line, all facing forward. C at the back sees A and B; B sees only A; A sees no one. They know the hats came from a box of 3 white and 2 black.\n\nAsked in turn, C says "I don’t know my hat colour." Then B says "I don’t know either." A then says "I know mine."\n\nWhat colour is A’s hat?',
    options: ['White', 'Black', 'It can’t be known'],
    answer: 0,
    hints: [
      'When would C know their colour straight away?',
      'C would only know if A and B were both black. So at least one of A and B is white.',
      'Now B knows that. If A were black, what could B conclude?'
    ],
    explain: 'C doesn’t know, so A and B aren’t both black. If A were black, B would then know they’re white. B doesn’t know, so A must be white.',
    note: {
      kind: 'idea', title: 'Silence is information',
      text: 'What people don’t know, or don’t say, can rule out possibilities. Reasoning about what others know is called epistemic logic, and it is used in game theory, economics and computer security.',
      recall: { q: 'In the hats puzzle, what let A work out the answer?', options: ['Looking in a mirror', 'What the others could not deduce', 'A lucky guess', 'Counting the hats in the box'], a: 1 }
    }
  },
  {
    id: 'g4', chapter: 'greenwich', title: 'Giants of the Sky', category: 'world', value: 40, type: 'order',
    prompt: 'From the Royal Observatory you can see the planets. Order these by diameter, largest first.',
    items: ['Neptune', 'Earth', 'Saturn', 'Uranus', 'Jupiter'],
    answer: ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Earth'],
    hints: [
      'The two gas giants are the biggest.',
      'The two ice giants are close in size, and both about 4 times wider than Earth.',
      'Uranus is slightly wider than Neptune.'
    ],
    explain: 'Jupiter (~139,800 km), Saturn (~116,500 km), Uranus (~50,700 km), Neptune (~49,200 km), Earth (~12,700 km).',
    note: {
      kind: 'fact', title: 'Wider is not heavier',
      text: 'Uranus is slightly wider than Neptune, but Neptune is more massive and denser. William Herschel discovered Uranus in 1781, the first planet found with a telescope.',
      recall: { q: 'Which is more massive: Uranus or Neptune?', options: ['Uranus', 'Neptune', 'They are identical'], a: 1 }
    }
  },
  {
    id: 'g5', chapter: 'greenwich', title: 'The Archivist’s Sequence', category: 'lateral', value: 45, type: 'text',
    prompt: 'A note in the archive reads:\n\n1\n11\n21\n1211\n111221\n?\n\nWhat comes next?',
    accept: ['312211'],
    hints: [
      'This isn’t arithmetic. Try reading each line out loud.',
      'Describe the line above: “1” is “one 1”.',
      '111221 is “three 1s, two 2s, one 1”.'
    ],
    explain: '312211: each line describes the one above it. 111221 is three 1s, two 2s, one 1.',
    note: {
      kind: 'fact', title: 'Look-and-say',
      text: 'Mathematician John Conway studied this “look-and-say” sequence in 1986. He proved each line grows about 30% longer than the last, by a constant now called Conway’s constant (≈ 1.3036).',
      recall: { q: 'Who analysed the look-and-say sequence in 1986?', options: ['Alan Turing', 'John Conway', 'Ada Lovelace', 'Paul Erdős'], a: 1 }
    }
  },
  {
    id: 'g6', chapter: 'greenwich', title: 'The Archive Lock', category: 'logic', value: 60, type: 'text', inputMode: 'numeric',
    prompt: 'The Archive door has a 3-digit lock. Pinned beside it:\n\n6 8 2   one digit is correct and in the right place\n6 1 4   one digit is correct but in the wrong place\n2 0 6   two digits are correct but in the wrong places\n7 3 8   nothing is correct\n7 8 0   one digit is correct but in the wrong place\n\nWhat is the code?',
    accept: ['042'],
    hints: [
      'Start with the clue that rules things out: 7, 3 and 8 are not in the code.',
      'From 7 8 0, the 0 is in the code but not last. From 6 8 2, either 6 or 2 is in the code.',
      'If 6 were in the code it would have to be first (from 682), but 614 forbids that. So 2 is last, then 0 is first, and 4 fills the middle.'
    ],
    explain: '042. Eliminate 7, 3, 8. Then 0 is in the code but not third. 6 can’t fit anywhere, so 2 is correct in third place. 0 must be first, and 4 (from 614) goes in the middle.',
    note: {
      kind: 'idea', title: 'Eliminate first',
      text: 'Begin with the strongest constraints, especially the ones that rule options out completely. Each elimination shrinks the space you have to search, often far faster than testing guesses one by one.',
      recall: { q: 'Which clue type is usually best to start with?', options: ['The longest one', 'One that rules options out completely', 'The last one', 'The one with the biggest numbers'], a: 1 }
    }
  }
];

ATLAS.RANKS = [
  { at: 0, name: 'Curious Traveller' },
  { at: 150, name: 'Apprentice' },
  { at: 400, name: 'Field Scholar' },
  { at: 700, name: 'Cartographer' },
  { at: 950, name: 'Professor' },
  { at: 1150, name: 'Keeper of the Archive' }
];
