#!/usr/bin/env python3
"""Export every course in content/ to docs/lessons.md, a readable version for reviewing the writing.

Usage: python3 tools/export_md.py
"""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
out = [
    '# Lesson content',
    '',
    'Generated from `content/*.json` by `tools/export_md.py`. Edit the JSON, not this file.',
    '',
]


def question(q):
    lines = [f"**Q:** {q['prompt']}", '']
    if q['kind'] == 'choice':
        for i, o in enumerate(q['options']):
            mark = '✅' if i == q['answer'] else '▫️'
            lines.append(f'- {mark} {o}')
    elif q['kind'] == 'number':
        lines.append(f"- Answer: **{q['answer']}**")
    elif q['kind'] == 'order':
        lines.append('- Items: ' + '; '.join(q['items']))
        lines.append('- Correct order: ' + ' → '.join(q['answer']))
    lines += ['', f"*Why:* {q['explain']}", '']
    return lines


for path in sorted(root.glob('content/*.json')):
    c = json.loads(path.read_text())
    out += [f"## {c['title']}", '', f"_{c['tagline']}_", '']
    for u in c['units']:
        out += [f"### {u['title']}", '', u['summary'], '']
        for n, l in enumerate(u['lessons'], 1):
            out += [f"#### Lesson {n}: {l['title']}", '', f"**Goal:** {l['goal']}", '']
            for s in l['steps']:
                if s['type'] == 'teach':
                    out += [f"> **{s['title']}**", '>']
                    out += ['> ' + line if line else '>' for line in s['text'].split('\n')]
                    out.append('')
                elif s['type'] == 'question':
                    out += question(s)
                elif s['type'] == 'recap':
                    out += ['**Recap**', ''] + [f'- {p}' for p in s['points']] + ['']
            out += ['<details><summary>Spaced-review cards</summary>', '']
            for r in l['review']:
                out += question(r)
            out += ['</details>', '']

(root / 'docs').mkdir(exist_ok=True)
(root / 'docs/lessons.md').write_text('\n'.join(out))
print('wrote docs/lessons.md')
