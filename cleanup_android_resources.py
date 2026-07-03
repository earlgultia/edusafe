from pathlib import Path
import shutil
root = Path('c:/Users/cherr/Desktop/edusafe')
report = []
for p in [root / 'android' / 'android', root / 'android' / 'app' / 'src' / 'main' / 'res' / 'values' / 'ic_launcher_background.xml']:
    if p.exists():
        try:
            if p.is_dir():
                shutil.rmtree(p)
                report.append(f'Removed directory: {p}')
            else:
                p.unlink()
                report.append(f'Removed file: {p}')
        except Exception as e:
            report.append(f'Failed to remove {p}: {e!r}')
    else:
        report.append(f'Not found: {p}')
report_path = root / 'cleanup_report.txt'
report_path.write_text('\n'.join(report), encoding='utf-8')
print('\n'.join(report))
