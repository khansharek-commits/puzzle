/*
 * STORY & CHARACTERS
 * ------------------------------------------------------------------
 * CHARACTERS: drop portrait images at the `image` paths (transparent PNGs
 * look best). Until then a coloured monogram is shown.
 *
 * STORY is played in order. Step types:
 *   { type: "chapter", num, title }                      – title card
 *   { type: "scene", place, bg, lines: [{ who, text }] } – dialogue
 *   { type: "puzzle", id }                               – puzzle from PUZZLES
 * Use who: "narrator" for narration with no speaker.
 */
const CHARACTERS = {
  narrator:  { name: "", narrator: true },
  quill:     { name: "Professor Quill",    initials: "AQ", color: "#6b3f1d", image: "assets/characters/quill.png" },
  pip:       { name: "Pip",                initials: "P",  color: "#2f6d6a", image: "assets/characters/pip.png" },
  hobb:      { name: "Stationmaster Hobb", initials: "H",  color: "#44587a", image: "assets/characters/hobb.png" },
  fennimore: { name: "Mrs. Fennimore",     initials: "F",  color: "#8a3b4b", image: "assets/characters/fennimore.png" },
  wick:      { name: "Old Wick",           initials: "W",  color: "#9a7417", image: "assets/characters/wick.png" },
  crumb:     { name: "Mr. Crumb",          initials: "C",  color: "#a0612f", image: "assets/characters/crumb.png" },
  tobias:    { name: "Tobias Gearsley",    initials: "TG", color: "#4d4d58", image: "assets/characters/tobias.png" }
};

const START_TOKENS = 5;

const STORY = [
  { type: "chapter", num: 1, title: "A Town Without Time" },
  {
    type: "scene", place: "Thistlewick Station", bg: "assets/scenes/station.png",
    lines: [
      { who: "narrator", text: "The night train hissed to a halt. Through the fog, the spire of a great clocktower loomed over the little town of Thistlewick — its hands frozen at a quarter past three." },
      { who: "pip", text: "Professor, look! The town clock has stopped." },
      { who: "quill", text: "Indeed it has, Pip. And that, I suspect, is precisely why we were summoned." },
      { who: "quill", text: "The letter said the clock's mechanism — the Clockwork Heart — vanished a week ago. Since then, nothing in Thistlewick has run on time." },
      { who: "hobb", text: "Ah! You must be the professor. Hobb's the name — stationmaster. Not that the trains keep any sort of schedule now, mind." },
      { who: "hobb", text: "I'll need to issue you a ticket before you head into town. Only… I've gone and misplaced my ledger. Can you work out which number comes next?" }
    ]
  },
  { type: "puzzle", id: 1 },
  {
    type: "scene", place: "Thistlewick Station", bg: "assets/scenes/station.png",
    lines: [
      { who: "hobb", text: "Thirty-three! Right you are. Here's your ticket, sir." },
      { who: "hobb", text: "If it's lodgings you're after, the Crooked Kettle Inn is up the hill. Mind the stairs — there are rather a lot of them." }
    ]
  },
  {
    type: "scene", place: "The Crooked Kettle Inn", bg: "assets/scenes/inn.png",
    lines: [
      { who: "fennimore", text: "Welcome to the Crooked Kettle, my dears! I've put you on the seventh floor — finest view of the clocktower in town." },
      { who: "pip", text: "The seventh floor?! My legs ache just thinking about it." },
      { who: "fennimore", text: "Oh, it's not so bad. From the first floor to the third is only thirty steps. I'm sure a clever pair like you can work out the rest." }
    ]
  },
  { type: "puzzle", id: 2 },
  {
    type: "scene", place: "The Crooked Kettle Inn", bg: "assets/scenes/inn.png",
    lines: [
      { who: "pip", text: "Ninety steps… phew… I made it." },
      { who: "quill", text: "Splendidly done, Pip. Rest well — tomorrow we begin our investigation in the town square." }
    ]
  },

  { type: "chapter", num: 2, title: "The Town Square" },
  {
    type: "scene", place: "Thistlewick Square", bg: "assets/scenes/square.png",
    lines: [
      { who: "narrator", text: "Morning brought little light. The fog clung to the cobblestones, and the lanterns of the square stood dark." },
      { who: "wick", text: "Blast these lanterns! Ever since the clock stopped, the mechanism that lights them has gone all topsy-turvy." },
      { who: "wick", text: "Touch one and its neighbours flicker too. I can't make heads nor tails of it." },
      { who: "quill", text: "Allow us, sir. A linked mechanism is merely a puzzle in disguise." }
    ]
  },
  { type: "puzzle", id: 3 },
  {
    type: "scene", place: "Thistlewick Square", bg: "assets/scenes/square.png",
    lines: [
      { who: "wick", text: "Well, I never! Every lantern burning bright. My thanks, Professor." },
      { who: "quill", text: "Tell me, Mr. Wick — what are people saying about the missing Heart?" },
      { who: "wick", text: "Saying? Why, everybody's saying something! Crumb the baker started a rumour that Tobias the clockmaker took it himself. Spread like wildfire, it did." }
    ]
  },
  { type: "puzzle", id: 4 },
  {
    type: "scene", place: "Thistlewick Square", bg: "assets/scenes/square.png",
    lines: [
      { who: "pip", text: "Six days to reach more than a hundred people! No wonder the whole town has heard it." },
      { who: "quill", text: "Rumours travel quickly, Pip — but the truth must be checked. We ought to pay this clockmaker a visit." },
      { who: "wick", text: "His shop's down one of those three roads. But be warned — those signposts were painted by the town prankster." }
    ]
  },
  { type: "puzzle", id: 5 },
  {
    type: "scene", place: "Thistlewick Square", bg: "assets/scenes/square.png",
    lines: [
      { who: "quill", text: "The left road it is. But first, I think a word with the baker who began this rumour is in order." }
    ]
  },

  { type: "chapter", num: 3, title: "Flour and Rumours" },
  {
    type: "scene", place: "Crumb's Bakery", bg: "assets/scenes/bakery.png",
    lines: [
      { who: "narrator", text: "The smell of warm bread drifted from Crumb's Bakery, where a small queue had formed in spite of the gloom." },
      { who: "crumb", text: "Order, order! Five customers, and not one of them can remember who came first!" },
      { who: "crumb", text: "I've jotted down what each of them told me. Can you sort it out, Professor?" }
    ]
  },
  { type: "puzzle", id: 6 },
  {
    type: "scene", place: "Crumb's Bakery", bg: "assets/scenes/bakery.png",
    lines: [
      { who: "crumb", text: "Dorian, Agnes, Edith, Clara, Bertram. Splendid! Everyone gets their bread at last." },
      { who: "quill", text: "Now, Mr. Crumb. You told the town that Tobias stole the Clockwork Heart. Why?" },
      { who: "crumb", text: "Well… I saw him by the fountain the night it vanished, tossing in coins and muttering about 'twenty-four'. Strange behaviour, I thought." },
      { who: "pip", text: "The fountain! Let's take a look, Professor." }
    ]
  },
  {
    type: "scene", place: "The Wishing Fountain", bg: "assets/scenes/fountain.png",
    lines: [
      { who: "narrator", text: "At the bottom of the fountain lay seven coins of different values. Words were carved around its stone rim." }
    ]
  },
  { type: "puzzle", id: 7 },
  {
    type: "scene", place: "The Wishing Fountain", bg: "assets/scenes/fountain.png",
    lines: [
      { who: "narrator", text: "As Pip lifted the three coins, a small brass key rolled out from beneath them." },
      { who: "pip", text: "A key! Tobias must have left it here on purpose." },
      { who: "quill", text: "Most curious. He wanted it found — but only by someone who could think." },
      { who: "crumb", text: "Hm. Perhaps I was too hasty about him. Wait — he left something with me too. A torn calendar page. He said, 'Someone will need the date.'" }
    ]
  },
  { type: "puzzle", id: 8 },
  {
    type: "scene", place: "Crumb's Bakery", bg: "assets/scenes/bakery.png",
    lines: [
      { who: "quill", text: "Thursday the fifteenth… the day before the Heart disappeared. Tobias knew something was coming." },
      { who: "pip", text: "Then let's find him before anyone else does!" }
    ]
  },

  { type: "chapter", num: 4, title: "The Clockmaker's Shop" },
  {
    type: "scene", place: "Gearsley & Sons, Clockmakers", bg: "assets/scenes/shop.png",
    lines: [
      { who: "narrator", text: "At the end of the left road stood a crooked shop crammed with clocks — every one of them ticking, and none of them agreeing." },
      { who: "pip", text: "Professor, the clock in the window says five o'clock. That can't be right!" },
      { who: "quill", text: "There's a note pinned beneath it, Pip. Let us read it carefully." }
    ]
  },
  { type: "puzzle", id: 9 },
  {
    type: "scene", place: "Gearsley & Sons, Clockmakers", bg: "assets/scenes/shop.png",
    lines: [
      { who: "quill", text: "Six o'clock. Then we have little time before nightfall." },
      { who: "pip", text: "The door's locked, and the key from the fountain doesn't fit… wait, there's something carved here." }
    ]
  },
  { type: "puzzle", id: 10 },
  {
    type: "scene", place: "Inside the Workshop", bg: "assets/scenes/workshop.png",
    lines: [
      { who: "narrator", text: "“Stone,” said the Professor clearly. With a click and a whir, the door swung open." },
      { who: "pip", text: "It's ever so dark in here. There's a panel of lamps above the workbench…" }
    ]
  },
  { type: "puzzle", id: 11 },
  {
    type: "scene", place: "Inside the Workshop", bg: "assets/scenes/workshop.png",
    lines: [
      { who: "narrator", text: "Lamplight spilled across the workbench, revealing a set of drawings: the inner workings of the great clocktower." },
      { who: "tobias", text: "So. You've made it this far." },
      { who: "pip", text: "Mr. Gearsley!" },
      { who: "tobias", text: "Forgive the theatrics. I hid the Heart myself. A collector from the city meant to steal it, and I couldn't let that happen." },
      { who: "tobias", text: "So I left a trail only a true puzzler could follow. One last test, Professor, before I trust you with my tower." }
    ]
  },
  { type: "puzzle", id: 12 },
  {
    type: "scene", place: "Inside the Workshop", bg: "assets/scenes/workshop.png",
    lines: [
      { who: "tobias", text: "Three turns clockwise — exactly so. You'll do, Professor. Come. To the tower." }
    ]
  },

  { type: "chapter", num: 5, title: "The Heart of Thistlewick" },
  {
    type: "scene", place: "Atop the Clocktower", bg: "assets/scenes/tower.png",
    lines: [
      { who: "narrator", text: "Up the spiral stairs they climbed, past the silent bells, to the great frozen mechanism at the very top of the tower." },
      { who: "tobias", text: "The Heart lies behind this panel. I scrambled its picture so that no thief could open it." },
      { who: "quill", text: "Pip, would you care to do the honours?" },
      { who: "pip", text: "With pleasure, Professor!" }
    ]
  },
  { type: "puzzle", id: 13 },
  {
    type: "scene", place: "Atop the Clocktower", bg: "assets/scenes/tower.png",
    lines: [
      { who: "narrator", text: "The last tile slid home. The panel swung open, and the Clockwork Heart glowed gold in Tobias's hands." },
      { who: "narrator", text: "With a deep, shuddering CLONG, the great clock of Thistlewick began to tick once more." },
      { who: "tobias", text: "Thank you, both of you. This town owes you a great debt." },
      { who: "pip", text: "Professor… do you think there'll be another mystery soon?" },
      { who: "quill", text: "My dear Pip — there always is." }
    ]
  }
];
