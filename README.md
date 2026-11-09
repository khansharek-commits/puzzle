# Atlas of Riddles

A puzzle adventure that trains how you think and teaches you true things about the world.

You travel with Professor Amara Quill to six real places: Cairo, Kyoto, Reykjavík, Manaus, Istanbul and Greenwich. There are 36 hand-written puzzles in five skill areas:

| Skill | What it trains | Examples |
|---|---|---|
| Logic | Deduction | Truth-tellers and liars, the three-hat problem, a code lock |
| Numeracy | Number sense | Sums of squares, clock angles, time zones |
| Lateral | Questioning assumptions | Doubling lily pads, the swallow between trains |
| Spatial | Planning moves | Tower of Hanoi, river crossing, water jugs, lanterns |
| Knowledge | Facts about the world | Rivers, plate tectonics, history timelines |

## How it plays

- **Insight**: each puzzle is worth points. Every wrong answer lowers what it pays, so think before you answer.
- **Hint tokens**: each puzzle has three hints, and each one costs a token. You earn a token for every puzzle you solve.
- **Field Notes**: every solution unlocks a note with a real fact or a thinking technique. Notes come back as quiz questions after 1, 2, 4, 8 and 16 days (a Leitner spaced-repetition schedule), so the facts stick.
- **Mental Gym**: freshly generated drills you can repeat every day: Quick Maths (60 s, adapts to how well you're doing), Number Patterns and Digit Span (working memory).
- **Profile**: your rank, a breakdown by skill area, gym bests and your daily streak.

Solve 4 puzzles in a city to unlock the next one.

## Running it

It needs no build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Progress is saved in your browser's `localStorage`.

## Project layout

```
index.html      page shell
css/style.css   all styles (light and dark themes)
js/data.js      chapters, puzzles, hints, explanations and field notes
js/app.js       game engine, puzzle mechanics, review system, Mental Gym
```

## Adding puzzles

Add an entry to `ATLAS.PUZZLES` in `js/data.js`. Supported `type`s are `choice`, `number`, `text`, `order`, `hanoi`, `lights`, `river`, `jugs` and `magic`. Every puzzle needs three `hints`, an `explain`, and a `note` with a `recall` question for the review system.
