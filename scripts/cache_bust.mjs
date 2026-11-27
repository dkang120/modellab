import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const assets = ['style.css', 'tools.js', 'seo.js', 'motion.js'];
const hash = crypto.createHash('sha1');
for (const asset of assets) hash.update(fs.readFileSync(path.join('source', asset)));
const version = hash.digest('hex').slice(0, 8);

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(full) : (entry.name.endsWith('.html') ? [full] : []);
  });
}

for (const file of htmlFiles('dist')) {
  let html = fs.readFileSync(file, 'utf8');
  for (const asset of assets) {
    const attr = asset.endsWith('.css') ? 'href' : 'src';
    html = html.replaceAll(`${attr}="${asset}"`, `${attr}="${asset}?v=${version}"`);
  }
  fs.writeFileSync(file, html);
}
