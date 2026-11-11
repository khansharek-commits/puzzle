/*
 * PUZZLE DATA
 * ------------------------------------------------------------------
 * Every puzzle is fully described here. To add your own artwork, drop an
 * image at the path given in `image` (PNG/JPG/WebP all fine — just update
 * the extension here if it differs). Until an image exists, the game shows
 * a tasteful placeholder, so nothing breaks.
 *
 * Supported `type`s and their extra fields:
 *   choice  – options: [..], answer: index of the correct option
 *   number  – answer: number, prefix/unit: optional labels around the input
 *   text    – answers: [accepted words] (case/spacing ignored)
 *   select  – items: [labels], cols, answer: [indices], maxSelect (optional)
 *   order   – start: [initial order], answer: [correct order]
 *   lights  – size: n, scramble: [[row,col],...] presses applied to an all-lit grid
 *   slide   – size: n, shuffle: number of random moves (uses `image` for tiles)
 *
 * `value` is the number of Laurels the puzzle is worth. Each wrong answer
 * knocks 20% off, down to a floor of 40%.
 */
const PUZZLES = [
  {
    id: 1,
    title: "The Stationmaster's Tickets",
    type: "number",
    value: 20,
    image: "assets/puzzles/p01.png",
    icon: "🎫",
    text: `<p>The stationmaster of Thistlewick numbers his tickets in a most peculiar way.</p>
           <p>The last five tickets he sold were numbered:</p>
           <p class="big-seq">2, 3, 5, 9, 17</p>
           <p>If he keeps to his habit, what number will the <em>next</em> ticket bear?</p>`,
    answer: 33,
    hints: [
      "Look at the gap between each number and the one after it.",
      "The gaps are 1, 2, 4, 8… Notice anything about how they grow?",
      "The gaps double each time. Alternatively: double each number and subtract one. What is 17 doubled, minus one?"
    ],
    explanation: `Each ticket is <strong>double the previous number, minus one</strong>: 17 × 2 − 1 = <strong>33</strong>.
                  Put another way, the gaps double every time — 1, 2, 4, 8 and then 16.`
  },
  {
    id: 2,
    title: "The Inn Stairs",
    type: "number",
    value: 25,
    unit: "steps",
    image: "assets/puzzles/p02.png",
    icon: "🪜",
    text: `<p>The Crooked Kettle Inn is a tall, narrow building, and every floor is joined to the next by an identical flight of stairs.</p>
           <p>Climbing from the <strong>1st floor</strong> to the <strong>3rd floor</strong> takes exactly <strong>30 steps</strong>.</p>
           <p>How many steps must Pip climb to get from the 1st floor to the <strong>7th floor</strong>?</p>`,
    answer: 90,
    hints: [
      "Going from the 1st floor to the 3rd floor — how many flights of stairs do you actually climb?",
      "Only two flights: 1st to 2nd, and 2nd to 3rd. So each flight has 15 steps.",
      "Now count the flights between the 1st and the 7th floors. It isn't seven!"
    ],
    explanation: `From the 1st to the 3rd floor is only <strong>two</strong> flights, so each flight is 15 steps.
                  From the 1st to the 7th floor is <strong>six</strong> flights: 6 × 15 = <strong>90 steps</strong>.
                  (If you said 70, the stairs got the better of you!)`
  },
  {
    id: 3,
    title: "Lanterns of the Square",
    type: "lights",
    value: 30,
    size: 3,
    scramble: [[0, 0], [1, 1], [2, 1]],
    image: "assets/puzzles/p03.png",
    icon: "🏮",
    text: `<p>The lanterns in the town square are linked by an old mechanism.</p>
           <p>Touching a lantern switches it between lit and unlit — and also switches the lanterns directly <strong>above, below, left and right</strong> of it.</p>
           <p>Light <strong>every</strong> lantern in the square.</p>`,
    hints: [
      "The order in which you touch the lanterns doesn't matter — only which ones you touch.",
      "Touching the same lantern twice simply undoes itself, so no lantern ever needs touching more than once.",
      "Work row by row: once the top row is how you want it, use only the row beneath it to fix any dark lantern directly above. Then repeat."
    ],
    explanation: `Because each touch is undone by touching again, the solution is simply a <strong>set</strong> of lanterns to touch once each.
                  Working one row at a time, using the row below to fix the row above, always leads you to the answer.`
  },
  {
    id: 4,
    title: "A Rumour Spreads",
    type: "number",
    value: 30,
    image: "assets/puzzles/p04.png",
    icon: "🗣️",
    text: `<p>Gossip travels fast in Thistlewick.</p>
           <p>On the <strong>first day</strong>, only the baker knows a juicy rumour.
           On every following day, <strong>everyone</strong> who already knows it tells exactly <strong>two</strong> people who haven't heard it yet.</p>
           <p>On which day will <strong>more than 100</strong> people know the rumour?</p>`,
    prefix: "Day",
    answer: 6,
    hints: [
      "Write down how many people know the rumour at the end of each day.",
      "Day 1: just the baker, so 1. Day 2: the baker tells two, so 3 know. Day 3: each of those three tells two more…",
      "Every person who knows brings two more, so the total triples each day: 1, 3, 9, 27…"
    ],
    explanation: `Each day, every person who knows adds two more, so the total <strong>triples</strong>:
                  1, 3, 9, 27, 81, 243. Day 5 is only 81 people, but on <strong>day 6</strong> it jumps to 243.`
  },
  {
    id: 5,
    title: "The Three Signposts",
    type: "choice",
    value: 35,
    image: "assets/puzzles/p05.png",
    icon: "🪧",
    text: `<p>Three roads leave the square, each marked with a weathered signpost. Only <strong>ONE</strong> of the three signs tells the truth.</p>
           <ul class="clues">
             <li><strong>Left sign:</strong> “The clockmaker's shop is down the middle road.”</li>
             <li><strong>Middle sign:</strong> “The shop is not down this road.”</li>
             <li><strong>Right sign:</strong> “The shop is not down the left road.”</li>
           </ul>
           <p>Which road leads to the clockmaker's shop?</p>`,
    options: ["The left road", "The middle road", "The right road"],
    answer: 0,
    hints: [
      "Try each road in turn. For each, count how many signs would then be telling the truth.",
      "If the shop were down the middle road, the left sign and the right sign would both be true. That's one too many!",
      "Check the right road the same way. Only one road leaves exactly one honest sign."
    ],
    explanation: `If the shop is down the <strong>left road</strong>, the left sign is false, the middle sign is true, and the right sign is false — exactly one truth.
                  The middle road would make two signs true, and so would the right road.`
  },
  {
    id: 6,
    title: "The Bakery Queue",
    type: "order",
    value: 35,
    image: "assets/puzzles/p06.png",
    icon: "🥖",
    text: `<p>Five customers are queuing at Crumb's Bakery, but nobody can agree on the order. Here's what they remember:</p>
           <ul class="clues">
             <li>Dorian is at the very front of the queue.</li>
             <li>Agnes is neither first nor last.</li>
             <li>Bertram stands directly behind Clara.</li>
             <li>Edith is somewhere behind Agnes — but Edith is not last.</li>
           </ul>
           <p>Arrange the queue from <strong>front (top)</strong> to <strong>back (bottom)</strong>.</p>`,
    start: ["Agnes", "Bertram", "Clara", "Dorian", "Edith"],
    answer: ["Dorian", "Agnes", "Edith", "Clara", "Bertram"],
    hints: [
      "Dorian is first, so the other four fill places 2 to 5. Clara and Bertram must sit together as a pair, Clara in front.",
      "Edith is behind Agnes, so Agnes can't be in place 5 — and Edith can't be last either.",
      "Try Agnes in place 2. Where can the Clara–Bertram pair go so that Edith isn't last?"
    ],
    explanation: `Dorian takes first place. If Agnes is 2nd, the Clara–Bertram pair must take 4th and 5th, leaving Edith 3rd — behind Agnes and not last.
                  Any other position for Agnes forces Edith to be last or in front of her.
                  The queue is <strong>Dorian, Agnes, Edith, Clara, Bertram</strong>.`
  },
  {
    id: 7,
    title: "Coins in the Fountain",
    type: "select",
    value: 30,
    image: "assets/puzzles/p07.png",
    icon: "🪙",
    text: `<p>Seven coins glint at the bottom of the fountain. Carved around its rim are the words:</p>
           <p class="inscription">“Three coins make my wish. Their sum is twenty-four.”</p>
           <p>Select the <strong>three</strong> coins that add up to exactly <strong>24</strong>.</p>`,
    items: ["1", "2", "5", "7", "9", "11", "13"],
    itemClass: "coin",
    cols: 4,
    maxSelect: 3,
    answer: [1, 4, 6],
    hints: [
      "Look closely at the coins. What do nearly all of them have in common?",
      "Every coin is odd except one. Adding three odd numbers always gives an odd total — but 24 is even.",
      "So the 2 must be one of your coins. Which two of the remaining coins add up to 22?"
    ],
    explanation: `Three odd numbers always sum to an odd number, so to reach an even 24 you <strong>must</strong> use the only even coin, the 2.
                  The other two must make 22, and the only way is <strong>9 + 13</strong>. So: 2 + 9 + 13 = 24.`
  },
  {
    id: 8,
    title: "The Torn Calendar",
    type: "choice",
    value: 35,
    image: "assets/puzzles/p08.png",
    icon: "📅",
    text: `<p>Hanging in the bakery is a calendar page with the month's name torn away. Scribbled on it is a note:</p>
           <p class="inscription">“This month, three Fridays fell on even-numbered dates.”</p>
           <p>What day of the week was the <strong>15th</strong>?</p>`,
    options: ["Monday", "Wednesday", "Thursday", "Saturday"],
    answer: 2,
    hints: [
      "Fridays are seven days apart, so their dates switch between odd and even.",
      "To have three even Fridays, the month needs five Fridays, and the first one must fall on an even date.",
      "The first Friday must be the 2nd, so Fridays fall on the 2nd, 9th, 16th, 23rd and 30th. What comes just before the 16th?"
    ],
    explanation: `Fridays alternate odd and even dates, so three even Fridays need five Fridays starting on an even date:
                  the <strong>2nd, 16th and 30th</strong>. The 16th is a Friday, so the 15th is a <strong>Thursday</strong>.`
  },
  {
    id: 9,
    title: "The Lagging Clock",
    type: "choice",
    value: 40,
    image: "assets/puzzles/p09.png",
    icon: "🕰️",
    text: `<p>In the clockmaker's window stands a clock with a note pinned beneath it:</p>
           <p class="inscription">“Set to the correct time at noon. Loses ten minutes every hour.”</p>
           <p>Later that same afternoon, the clock reads <strong>5:00 pm</strong>. What is the <strong>real</strong> time?</p>`,
    options: ["4:10 pm", "5:10 pm", "5:50 pm", "6:00 pm"],
    answer: 3,
    hints: [
      "The clock is slow, so the real time must be later than what it shows.",
      "For every real hour that passes, the clock's hands only move forward 50 minutes.",
      "Since noon, the clock has moved forward 300 minutes. How many real hours does that take at 50 minutes each?"
    ],
    explanation: `Each real hour, the clock moves only 50 minutes. It has moved 5 hours (300 minutes) since noon,
                  which takes 300 ÷ 50 = 6 real hours. The real time is <strong>6:00 pm</strong>.
                  (5:50 pm is the tempting trap!)`
  },
  {
    id: 10,
    title: "Riddle on the Door",
    type: "text",
    value: 30,
    image: "assets/puzzles/p10.png",
    icon: "🚪",
    text: `<p>The clockmaker's door is locked. Carved beneath the brass knocker is a riddle:</p>
           <p class="inscription">“I am five letters, found in every castle wall.<br>
           Take my first away, and I become a sound.<br>
           Take my first two away, and I am a number.<br>
           Speak my name, and enter.”</p>
           <p>What is the word?</p>`,
    answers: ["STONE"],
    hints: [
      "The number is a short word. Think of numbers spelled with just three letters.",
      "ONE, TWO, SIX, TEN… Which of these becomes a kind of sound if you add one letter in front?",
      "T + ONE makes TONE, a sound. Now add one more letter in front — something every castle wall is made of."
    ],
    explanation: `<strong>STONE</strong> — remove the S and you get TONE (a sound); remove the T too and you get ONE (a number).
                  And of course, castle walls are built of stone.`
  },
  {
    id: 11,
    title: "The Workbench Lamps",
    type: "lights",
    value: 45,
    size: 4,
    scramble: [[0, 0], [1, 2], [3, 3], [2, 1]],
    image: "assets/puzzles/p11.png",
    icon: "💡",
    text: `<p>Above the clockmaker's workbench hangs a 4 × 4 panel of lamps, wired just like the lanterns in the square.</p>
           <p>Touching a lamp switches it and the lamps directly <strong>above, below, left and right</strong> of it.</p>
           <p>Light <strong>every</strong> lamp so you can read the plans on the bench.</p>`,
    hints: [
      "Just like the square: order doesn't matter, and no lamp needs touching more than once.",
      "Leave the top row for a moment. Use the second row to fix any dark lamps in the top row, then the third row to fix the second, and so on.",
      "If the bottom row is still wrong at the end, it tells you which top-row lamps to touch first. Try touching different top-row lamps, then chase the lights down again."
    ],
    explanation: `The “chase the lights” method works here too: each row fixes the row above it.
                  Whatever is left over on the bottom row tells you which lamps to press in the top row before chasing again.`
  },
  {
    id: 12,
    title: "The Gear Train",
    type: "choice",
    value: 40,
    image: "assets/puzzles/p12.png",
    icon: "⚙️",
    text: `<p>Five gears are meshed together in a straight line: <strong>A, B, C, D, E</strong>.</p>
           <p>Gear <strong>A</strong> has <strong>30</strong> teeth and gear <strong>E</strong> has <strong>10</strong> teeth. The sizes of B, C and D are unknown.</p>
           <p>If gear A makes one full turn <strong>clockwise</strong>, what does gear E do?</p>`,
    options: [
      "One turn anticlockwise",
      "Three turns clockwise",
      "Three turns anticlockwise",
      "A third of a turn clockwise"
    ],
    answer: 1,
    hints: [
      "Two meshed gears always turn in opposite directions.",
      "A clockwise, B anticlockwise, C clockwise… keep going to E.",
      "The middle gears don't change the overall ratio: every tooth that passes A also passes E. If 30 teeth go by, how many turns is that for a 10-tooth gear?"
    ],
    explanation: `Directions alternate along the line, so A, C and E all turn the same way: <strong>clockwise</strong>.
                  Whatever the middle gears' sizes, 30 teeth pass by every gear. For a 10-tooth gear, that's <strong>3 full turns</strong>.`
  },
  {
    id: 13,
    title: "The Heart's Panel",
    type: "slide",
    value: 50,
    size: 3,
    shuffle: 120,
    image: "assets/puzzles/p13.png",
    icon: "🧩",
    text: `<p>The Clockwork Heart is sealed behind a panel bearing a scrambled picture.</p>
           <p>Slide the tiles into the empty space to restore the picture.</p>
           <p>When the picture is complete, the panel will open.</p>`,
    hints: [
      "Don't try to solve everything at once. Get the top row in place first, and then leave it alone.",
      "Next, place the left-hand column. That leaves just a small 2 × 2 corner to finish.",
      "In the final corner, cycle the three remaining tiles around the gap until they all fall into place."
    ],
    explanation: `Solving a sliding puzzle row by row — top row, then left column, then the last little square — keeps your finished tiles safe from being disturbed.`
  }
];
