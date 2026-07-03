from pathlib import Path
from shutil import copy2
from PIL import Image

root = Path('android/app/src/main/res')
source = Path('android/app-icon.png')
if not source.exists():
    raise FileNotFoundError(str(source))

sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
    'mipmap-anydpi': 512,
}
source_image = Image.open(source).convert('RGBA')
for folder, size in sizes.items():
    target_dir = root / folder
    target_dir.mkdir(parents=True, exist_ok=True)
    for name in ('ic_launcher.png', 'ic_launcher_foreground.png'):
        target_path = target_dir / name
        resized = source_image.resize((size, size), Image.LANCZOS)
        resized.save(target_path, format='PNG')

print('updated icons')
