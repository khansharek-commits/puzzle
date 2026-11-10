#!/usr/bin/env python3
"""Check every course file in content/ against the lesson format (see content/FORMAT.md).

Usage: python3 tools/validate.py      (exits non-zero if anything is wrong)
"""
import json, pathlib, sys

root = pathlib.Path(__file__).resolve().parent.parent / 'content'
errors, ids = [], set()
counts = {'lessons': 0, 'questions': 0, 'reviews': 0}


def err(where, msg):
    errors.append(f'{where}: {msg}')


def check_question(q, where, is_review=False):
    kind = q.get('kind')
    if not q.get('prompt'):
        err(where, 'missing prompt')
    if not q.get('explain'):
        err(where, 'missing explain')
    if kind == 'choice':
        opts = q.get('options') or []
        if len(opts) < 2:
            err(where, 'choice needs at least 2 options')
        if not isinstance(q.get('answer'), int) or not 0 <= q['answer'] < len(opts):
            err(where, f'answer index {q.get("answer")} out of range')
        if len(set(opts)) != len(opts):
            err(where, 'duplicate options')
        for k in (q.get('feedback') or {}):
            if not k.isdigit() or int(k) >= len(opts) or int(k) == q.get('answer'):
                err(where, f'feedback key {k} is not a wrong option')
    elif kind == 'number':
        if not isinstance(q.get('answer'), (int, float)):
            err(where, 'number answer must be numeric')
    elif kind == 'order':
        if is_review:
            err(where, 'order questions are not used in reviews')
        if sorted(q.get('items') or []) != sorted(q.get('answer') or []):
            err(where, 'order answer must be a permutation of items')
        if q.get('items') == q.get('answer'):
            err(where, 'items are already in the right order')
    else:
        err(where, f'unknown kind {kind!r}')


for path in sorted(root.glob('*.json')):
    course = json.loads(path.read_text())
    for unit in course['units']:
        for lesson in unit['lessons']:
            counts['lessons'] += 1
            lid = lesson['id']
            if lid in ids:
                err(lid, 'duplicate id')
            ids.add(lid)
            for k in ('title', 'goal', 'steps', 'review'):
                if not lesson.get(k):
                    err(lid, f'missing {k}')
            steps = lesson.get('steps', [])
            if not any(s['type'] == 'teach' for s in steps):
                err(lid, 'no teach step')
            if steps and steps[-1]['type'] != 'recap':
                err(lid, 'last step should be a recap')
            for i, s in enumerate(steps):
                where = f'{lid} step {i + 1}'
                if s['type'] == 'teach':
                    if not s.get('title') or not s.get('text'):
                        err(where, 'teach step needs title and text')
                elif s['type'] == 'question':
                    counts['questions'] += 1
                    check_question(s, where)
                elif s['type'] == 'recap':
                    if not s.get('points'):
                        err(where, 'recap needs points')
                else:
                    err(where, f'unknown step type {s["type"]!r}')
            for r in lesson.get('review', []):
                counts['reviews'] += 1
                if r['id'] in ids:
                    err(r['id'], 'duplicate id')
                ids.add(r['id'])
                check_question(r, r['id'], is_review=True)

print(f"{counts['lessons']} lessons, {counts['questions']} lesson questions, {counts['reviews']} review cards")
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('All content valid.')
