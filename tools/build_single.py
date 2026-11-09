#!/usr/bin/env python3
"""Bundle the game into one self-contained HTML file (CSS, JS and images inlined).

Usage: python3 tools/build_single.py OUT.html [--fragment]
--fragment omits <!doctype>/<html>/<head>/<body> for hosts that add their own skeleton.
"""
import base64, json, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1])
fragment = '--fragment' in sys.argv
html = (root / 'index.html').read_text()

mime = {'.png': 'image/png', '.webp': 'image/webp'}
assets = {'tavern': 'assets/tavern.webp', 'hero': 'assets/hero-sprite.png',
          'heroBattle': 'assets/hero-battle.png', 'heroPortrait': 'assets/hero-portrait.png'}
urls = {k: f"data:{mime[pathlib.Path(v).suffix]};base64,{base64.b64encode((root / v).read_bytes()).decode()}" for k, v in assets.items()}

html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + (root / 'css/style.css').read_text() + '\n</style>')
def inline_script(m):
    src = m.group(1)
    code = (root / src).read_text()
    extra = f"\nwindow.LL.ASSET_URLS = {json.dumps(urls)};\n" if src == 'js/questions.js' else ''
    return '<script>\n' + code + extra + '\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', inline_script, html)

if fragment:
    head = re.search(r'<head>(.*)</head>', html, re.S).group(1)
    body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
    head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head)
    html = head.strip() + '\n' + body.strip() + '\n'
out.write_text(html)
print(f'wrote {out} ({out.stat().st_size // 1024} KB)')
