const fs = require('fs');
const path = require('path');
const targetDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'mipmap-mdpi');
const outPath = path.join(__dirname, 'remove_stray_android_files.log');
const lines = [];
lines.push(`targetDir=${targetDir}`);
lines.push(`exists=${fs.existsSync(targetDir)}`);
if (fs.existsSync(targetDir)) {
  const listBefore = fs.readdirSync(targetDir);
  lines.push('before=' + JSON.stringify(listBefore));
  ['delete-marker.txt', 'restore-test.txt'].forEach((name) => {
    const fp = path.join(targetDir, name);
    lines.push(`check ${name} exists=${fs.existsSync(fp)}`);
    if (fs.existsSync(fp)) {
      try {
        fs.unlinkSync(fp);
        lines.push(`removed ${name}`);
      } catch (err) {
        lines.push(`error ${name} ${err.message}`);
      }
    }
  });
  const listAfter = fs.readdirSync(targetDir);
  lines.push('after=' + JSON.stringify(listAfter));
}
fs.writeFileSync(outPath, lines.join('\n'));
console.log('wrote', outPath);
