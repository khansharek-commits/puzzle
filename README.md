# Lanterns of Lore

A pixel-art JRPG where every battle is a question.

The four Great Lanterns around the village of Emberwick have gone dark, and the Murk, a fog that makes people forget, is creeping in. You play Wren, a young lamplighter. Walk out from the Gilded Lantern tavern, battle creatures of the Murk with what you know, solve the seals that guard each Lantern, and confront the villain, Vesper Null.

## What it trains

| Area | Where | What you face |
|---|---|---|
| Science | Brass Observatory (north) | Physics, chemistry, biology, astronomy |
| History | Sunken Archive (east) | Ancient to modern history |
| Geography | Wayfarer Wilds (west) | Oceans, mountains, countries, plate tectonics |
| Philosophy | Grove of Whys (south) | Thinkers, ethics, and logical fallacies |
| Logic | Null’s Spire | Reasoning traps, probability, number puzzles |

- **85 questions**, each with a true fact. Answering a question writes its fact into your **Codex**.
- **Battles**: a right answer damages the monster. Answer within the gold bar's time for a swift strike that deals 50% more damage. A wrong answer lets the monster hit you, but you still see the right answer and why.
- **Seals**: mechanism puzzles guard each Lantern: Tower of Hanoi, river crossing, measuring flasks, a ring of lanterns, a magic square and a code lock.
- **Riddles**: eight townsfolk (marked with a gold `?`) have lateral-thinking riddles that reward Tonics.
- **Recall**: Marla, the innkeeper, quizzes you on your Codex after 1, 2, 4, 8 and 16 days. This spaced repetition keeps the facts in your memory.
- **Training**: daily mind drills (Quick Maths, Number Patterns, Digit Span).

## Controls

- Move: arrow keys or WASD, or tap/click where you want to go.
- Talk/examine: Enter or Space, the A button on touchscreens, or tap the person.
- Menu (status, Codex, help): M or Esc, or the Menu button.
- In battle: 1–4 to choose an answer, Enter to continue.

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
css/style.css       JRPG windows, HUD, battle and menu styles
js/questions.js     question bank (with Codex facts) and townsfolk riddles
js/world.js         maps, characters, monster sprites and palettes, story script
js/engine.js        isometric pixel renderer, lighting, pathfinding
js/game.js          exploration, dialogue, battles, seals, inn, Codex, menus
assets/             the hero sprite, battle art and portrait, and the tavern scene
tools/              single-file build script
```

## Adding content

- **Questions**: add `{ id, s, q, o, a, lore }` to `LL.QUESTIONS` in `js/questions.js`. `s` is the subject (`sci`, `his`, `geo`, `phi` or `log`). For a typed numeric answer, set `o: null` and make `a` the number.
- **Maps**: each map in `js/world.js` is a grid of characters. The legend is in the comment above `LL.MAPS`.
- **Monsters**: add to `LL.ENEMIES` with a sprite and palette from `LL.SPRITES` and `LL.PALETTES`.

## Art

The hero (Wren) and the Gilded Lantern tavern scene are original artwork supplied by the project owner. Everything else is drawn in code.
