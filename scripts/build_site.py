"""Verify original assets, then assemble the public GitHub Pages artifact."""
from pathlib import Path
import hashlib
import json
import shutil

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'preservation-manifest.json').read_text(encoding='utf-8'))
for relative,record in manifest['assets'].items():
    source=ROOT/relative
    digest=hashlib.sha256()
    with source.open('rb') as stream:
        for block in iter(lambda:stream.read(1024*1024),b''):digest.update(block)
    if source.stat().st_size!=record['bytes'] or digest.hexdigest()!=record['sha256']:
        raise SystemExit('Asset preservation verification failed: '+relative)
output=ROOT/'dist'
output.mkdir(exist_ok=True)
for name in ['index.html','portfolio.js','portfolio-data.json']:
    shutil.copy2(ROOT/name,output/name)
shutil.copytree(ROOT/'assets',output/'assets',dirs_exist_ok=True)
(output/'.nojekyll').write_text('',encoding='utf-8')
print(f"Verified {len(manifest['assets'])} original assets; built {len(manifest['projects'])} projects for publication.")
