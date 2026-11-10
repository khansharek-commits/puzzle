# Lesson format

Each course is one JSON file in this folder: `economics.json`, `science.json`, `history.json`.

```
course   { id, title, tagline, units: [unit] }
unit     { id, title, summary, lessons: [lesson] }
lesson   { id, title, goal, steps: [step], review: [card] }
```

## Steps

A lesson is a sequence of steps, shown one at a time. Most lessons open with a question that asks the learner to predict or guess before being taught, then alternate teaching and questions that make the learner use the idea. Every lesson ends with a recap.

| type | fields |
|---|---|
| `teach` | `title`, `text` (paragraphs separated by `\n\n`, bullet lines start with `•`) |
| `question` | see below |
| `recap` | `points`: the 2–4 ideas to remember |

## Questions

All questions have `prompt` and `explain` (shown after answering, right or wrong).

| kind | fields |
|---|---|
| `choice` | `options`, `answer` (index of the right option), optional `feedback` (`{ "<wrong index>": "hint for that mistake" }`) |
| `number` | `answer` (a number), optional `unit`, optional `tolerance` |
| `order` | `items` (shown shuffled), `answer` (the items in the correct order) |

## Review cards

`review` holds 2–3 short questions per lesson, using the same `choice` and `number` formats. After a lesson they enter spaced review and come back after 1, 3, 7, 14 and 30 days, moving to a longer gap when answered correctly and back to the start when missed. Review cards should test the lesson's key ideas in new wording, not repeat a lesson question word for word.

## Checking and reading

- `python3 tools/validate.py` checks every file against this format.
- `python3 tools/export_md.py` writes `docs/lessons.md`, a readable version of all lessons.
