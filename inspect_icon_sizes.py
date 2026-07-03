from pathlib import Path
from PIL import Image
root = Path('android/app/src/main/res')
lines = []
for d in sorted(root.glob('mipmap*')):
    for f in sorted(d.glob('ic_launcher*.png')):
        with Image.open(f) as im:
            lines.append(f'{f.relative_to(root)} | {im.size} | {im.mode} | {f.stat().st_size}')
Path('icon_sizes_report.txt').write_text('\n'.join(lines), encoding='utf-8')
print('DONE')
