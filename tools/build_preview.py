#!/usr/bin/env python3
"""Build a single-file lesson preview with all course content inlined.

Usage: python3 tools/build_preview.py OUT.html
"""
import json, pathlib, sys

root = pathlib.Path(__file__).resolve().parent.parent
order = ['economics', 'science', 'history']
courses = [json.loads((root / f'content/{c}.json').read_text()) for c in order]
html = (root / 'preview/template.html').read_text()
html = html.replace('/*CONTENT*/[]', json.dumps(courses, ensure_ascii=False).replace('</', '<\\/'))
out = pathlib.Path(sys.argv[1])
out.write_text(html)
print(f'wrote {out}')
