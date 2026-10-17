#!/usr/bin/env python3
"""
Build script: copies src files to dist/ with content-hash suffixes,
then rewrites index.html to reference the hashed filenames.
"""
import hashlib, shutil, re
from pathlib import Path

SRC  = Path('.')
DIST = Path('dist')

ASSETS = ['style.css', 'words-data.js', 'firebase.js', 'app.js']

def md5(path):
    return hashlib.md5(Path(path).read_bytes()).hexdigest()[:8]

if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir()

# Copy and rename assets with hash
mapping = {}   # original name → hashed name
for name in ASSETS:
    h = md5(SRC / name)
    stem, ext = name.rsplit('.', 1)
    hashed = f'{stem}.{h}.{ext}'
    shutil.copy2(SRC / name, DIST / hashed)
    mapping[name] = hashed
    print(f'  {name} → {hashed}')

# Rewrite index.html
html = (SRC / 'index.html').read_text(encoding='utf-8')
for original, hashed in mapping.items():
    html = html.replace(f'"{original}"', f'"{hashed}"')
    html = html.replace(f"'{original}'", f"'{hashed}'")
(DIST / 'index.html').write_text(html, encoding='utf-8')
print('  index.html rewritten')

# Copy PDF (no hashing needed for binary asset)
pdf = list(SRC.glob('*.pdf'))
for p in pdf:
    shutil.copy2(p, DIST / p.name)
    print(f'  {p.name} copied')

print(f'\nBuild complete → {DIST}/')
