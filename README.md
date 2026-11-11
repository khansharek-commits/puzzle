# Professor Quill and the Clockwork Heart

A story-driven puzzle adventure in the spirit of classic gentleman-puzzler games, with an
original story, original characters and 13 original puzzles.

The Clockwork Heart that drives Thistlewick's great clocktower has vanished, and every
clock in town has stopped. Professor Ambrose Quill and his apprentice Pip have come to
find it. On the way they have to work through a series of puzzles.

## Playing

The game is plain HTML/CSS/JavaScript, so it needs no build step.

- **Quickest:** open `index.html` in a browser.
- **Recommended:** serve the folder so images load the same way they will in production:
  ```sh
  python3 -m http.server 8000   # then visit http://localhost:8000
  ```
- **Hosting:** any static host works, such as GitHub Pages, Netlify or itch.io (upload the folder as a zip).

Progress saves automatically in the browser (localStorage).

## Features

- Five chapters of dialogue scenes with a typewriter effect, speaker portraits and backgrounds
- 13 puzzles across 7 interaction types: multiple choice, numeric keypad, word answer,
  select items, ordering, linked lights and a sliding picture
- **Laurels** scoring. Each wrong answer lowers a puzzle's value by 20%, down to 40%.
- **Insight Tokens** that unlock up to 3 hints per puzzle. You start with 5 and earn 1 per solve.
- **Memo** pad for scribbling notes over the puzzle (pen, red pen, eraser)
- **Puzzle Archive** for replaying solved puzzles
- Synthesised sound effects (they can be switched off on the title screen)
- Works with mouse, touch and keyboard. Enter submits an answer or advances dialogue.

## Adding your artwork

Every image is optional. Until an image exists, the game shows a styled placeholder:
a monogram for characters, a painted gradient for scenes, and an icon card for puzzles.
Drop files at these paths and they appear automatically:

| What | Path | Suggested size |
|---|---|---|
| Puzzle illustrations | `assets/puzzles/p01.png` … `p13.png` | 16:9, e.g. 1280×720 |
| Sliding-puzzle picture (puzzle 13) | `assets/puzzles/p13.png` | **square**, e.g. 900×900 |
| Character portraits | `assets/characters/quill.png`, `pip.png`, `hobb.png`, `fennimore.png`, `wick.png`, `crumb.png`, `tobias.png` | transparent PNG, roughly 3:4 |
| Scene backgrounds | `assets/scenes/station.png`, `inn.png`, `square.png`, `bakery.png`, `fountain.png`, `shop.png`, `workshop.png`, `tower.png` | 16:9, e.g. 1920×1080 |

To use JPG or WebP files instead, change the `image` or `bg` path in `js/puzzles.js` or `js/story.js`.

Every puzzle's text describes everything needed to solve it, so the illustrations are
decorative. The one exception is puzzle 13, whose image becomes the sliding tiles.

## Puzzle list

| # | Title | Type | Answer |
|---|---|---|---|
| 1 | The Stationmaster's Tickets | number | 33 |
| 2 | The Inn Stairs | number | 90 |
| 3 | Lanterns of the Square | lights 3×3 | — |
| 4 | A Rumour Spreads | number | 6 |
| 5 | The Three Signposts | choice | Left road |
| 6 | The Bakery Queue | order | Dorian, Agnes, Edith, Clara, Bertram |
| 7 | Coins in the Fountain | select | 2 + 9 + 13 |
| 8 | The Torn Calendar | choice | Thursday |
| 9 | The Lagging Clock | choice | 6:00 pm |
| 10 | Riddle on the Door | text | STONE |
| 11 | The Workbench Lamps | lights 4×4 | — |
| 12 | The Gear Train | choice | 3 turns clockwise |
| 13 | The Heart's Panel | slide 3×3 | — |

## Editing or adding content

- **Puzzles:** `js/puzzles.js`. The comment at the top documents every puzzle type and its fields.
- **Story, characters and order of play:** `js/story.js`. The story is a list of
  `chapter`, `scene` and `puzzle` steps played in order.
- **Look and feel:** `css/style.css`. Colours are CSS variables at the top of the file.
- **Engine:** `js/game.js`.

## Project layout

```
index.html
css/style.css
js/puzzles.js   puzzle data
js/story.js     characters + story script
js/game.js      game engine
assets/         your images go here
```
