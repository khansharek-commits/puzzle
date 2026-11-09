# Lanterns of Lore

A pixel-art JRPG set entirely inside one tavern, where a wizard teaches you about the world and then tests you.

The Murk, Vesper Null's fog of forgetting, is creeping over the village of Emberwick. In the Gilded Lantern tavern, Hedda the wizard takes on Wren as an apprentice. Learn each subject, solve Hedda's puzzles, and pass the Trials to relight the four Lanterns of Lore. Then face Null.

## How it plays

Everything happens from the study screen: no walking around.

| Subject | Lantern | Puzzle | Trial |
|---|---|---|---|
| Science | Reason | The Alchemist's Flasks | The Entropy Engine |
| History | Memory | The Tower of Ages | The Forgotten Emperor |
| Geography | Wayfinding | The Ferry Problem | The Drift Leviathan |
| Philosophy | Wonder | The Lantern Ring | The Sophist |
| Logic | (key to the Final Trial) | Square of Fifteen, Null's Lock | |

- **Lessons**: 20 lessons, four per subject. Hedda teaches a few fact cards, then tests you on them. Any question you miss comes back before the lesson ends, and you earn 1–3 stars.
- **Puzzles**: each subject's puzzle unlocks after lesson 2. Hedda gives up to three hints.
- **Trials**: turn-based battles where every attack is a question. A right answer strikes; answer before the gold bar empties for a swift strike worth 50% more. A wrong answer lets the shadow hit you, and you still see the answer and the fact behind it. Win to relight the Lantern.
- **Final Trial**: once all four Lanterns burn and Logic is mastered, face Vesper Null, who asks questions from every subject.
- **Recall**: every fact goes into your Codex and is re-tested after 1, 2, 4, 8 and 16 days (spaced repetition).
- **Also**: a revision quiz and sparring illusions for each subject, a Riddle Board with eight lateral-thinking riddles, and Training drills (Quick Maths, Number Patterns, Digit Span).

There are 85 questions, each with a true fact for the Codex.

## Controls

Everything is clickable or tappable. On a keyboard: 1–4 choose an answer, Enter continues, M opens the menu and Esc closes windows.

## Running it

The game needs no build step. Serve the folder and open it in a browser:

```sh
python3 -m http.server 8000
# visit http://localhost:8000
```

Progress saves automatically in the browser's `localStorage`.

To make one self-contained HTML file with every image and script inlined:

```sh
python3 tools/build_single.py lanterns-of-lore.html
```

## Project layout

```
index.html          page shell
css/style.css       JRPG windows, study screens, battle and menu styles
js/questions.js     question bank (with Codex facts) and tavern riddles
js/lessons.js       Hedda's lessons, and each subject's puzzles and Trial
js/world.js         pixel sprites and palettes, monsters, story script
js/sprites.js       image loading and pixel-sprite drawing
js/game.js          study, lessons, battles, puzzles, Recall, Training, menus
assets/             Wren's sprite, battle art and portrait, and the tavern scene
tools/              single-file build script
```

## Adding content

- **Questions**: add `{ id, s, q, o, a, lore }` to `LL.QUESTIONS` in `js/questions.js`. `s` is the subject (`sci`, `his`, `geo`, `phi` or `log`). For a typed numeric answer, set `o: null` and make `a` the number.
- **Lessons**: add `{ id, s, title, intro, qs }` to `LL.LESSONS` in `js/lessons.js`. `qs` lists the question ids the lesson teaches and tests.
- **Monsters**: add to `LL.ENEMIES` with a sprite and palette from `LL.SPRITES` and `LL.PALETTES`.

## Art

The hero (Wren) and the Gilded Lantern tavern scene are original artwork supplied by the project owner. Hedda's portrait, the monsters and the puzzles are drawn in code.
