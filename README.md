# Puzzle

A learning game that teaches real topics in depth, with spaced review so what you learn sticks. The game itself (design and art) is still to come; this stage is the course content.

## Courses so far

| Course | Unit 1 | Lessons |
|---|---|---|
| Economics | Thinking Like an Economist | Scarcity · Opportunity cost · Sunk costs and the margin · Incentives · Trade and comparative advantage |
| Science | What Everything Is Made Of | Atoms · Inside the atom · The periodic table · Molecules and bonds · Solids, liquids and gases |
| History | How Civilisation Began | The long prehistory · The farming revolution · The first cities · Writing · Kings and the first written laws |

Each lesson opens with a question that asks you to predict, teaches one idea in small steps, makes you apply it, and ends with a recap. Each lesson also has spaced-review cards that come back after 1, 3, 7, 14 and 30 days.

**Read the lessons:** [docs/lessons.md](docs/lessons.md)

## Files

```
content/economics.json   course content (format: content/FORMAT.md)
content/science.json
content/history.json
docs/lessons.md          readable export of every lesson
tools/validate.py        checks the content files
tools/export_md.py       regenerates docs/lessons.md
tools/build_preview.py   builds a playable one-file preview of the lessons (template in preview/)
assets/                  the owner's artwork, kept for possible reuse
```
