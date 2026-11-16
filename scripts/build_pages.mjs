// Writes a real page per route (dist/models/value/index.html etc.) with its own title, description,
// canonical URL and readable content, plus sitemap.xml and robots.txt. The app then takes over in the browser.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const SITE = 'https://dkang120.github.io/modellab/';
const src = fs.readFileSync('source/index.html', 'utf8');
const a = src.indexOf('var MODELS=[') + 'var MODELS='.length, b = src.indexOf('\n];', a) + 2;
const MODELS = new Function('return ' + src.slice(a, b))();
const { seoFor } = require(path.resolve('source/seo.js'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TOOLS = ['match', 'pain', 'stress', 'implement', 'overlap', 'build'];
const routes = [['library', ''], ['compare', ''], ['tools', ''], ['leaderboard', ''], ['about', '']]
  .map(([n]) => ({ path: n + '/', h: '#' + n }))
  .concat(TOOLS.map(n => ({ path: 'tools/' + n + '/', h: '#' + n })))
  .concat(MODELS.map(m => ({ path: 'models/' + m.id + '/', h: '#m-' + m.id })));
const nav = rel => ['library', 'compare', 'tools', 'leaderboard', 'about'].map(n => `<a href="${rel}${n}/">${n[0].toUpperCase() + n.slice(1)}</a>`).join(' · ');
function body(r, rel) {
  const s = seoFor(r.h, MODELS);
  let h = `<div class="wrap page"><p>${nav(rel)}</p><h1>${esc(s.title.replace(/ \| ModelLab$/, ''))}</h1><p>${esc(s.desc)}</p>`;
  const m = r.h.startsWith('#m-') && MODELS.find(x => x.id === r.h.slice(3));
  if (m) {
    h += `<h2>The belief</h2><p>${esc(m.belief)}</p><h2>How it works</h2><ol>${m.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
    h += `<h2>Example portfolio</h2><ul>${m.hold.map(x => `<li>${esc(x[0])} (${esc(x[1])}): ${x[2]}%</li>`).join('')}</ul>`;
    h += `<h2>Strengths</h2><ul>${m.pros.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h2>Risks and criticisms</h2><ul>${m.cons.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    h += `<p>Works best when: ${esc(m.best)}. Struggles when: ${esc(m.worst)}.</p><p>${esc(m.origin)}</p>`;
  } else if (r.h === '#library') {
    h += `<ul>${MODELS.map(x => `<li><a href="${rel}models/${x.id}/">${esc(x.name)}</a>: ${esc(x.tag)}</li>`).join('')}</ul>`;
  } else if (r.h === '#tools') {
    h += `<ul>${TOOLS.map(n => `<li><a href="${rel}tools/${n}/">${esc(seoFor('#' + n).title.replace(/ \| ModelLab$/, ''))}</a></li>`).join('')}</ul>`;
  }
  return h + `<p>Educational only, not investment advice. Example portfolios are hypothetical.</p></div>`;
}
const rep = (html, re, to) => { if (!re.test(html)) throw new Error('template changed: ' + re); return html.replace(re, to); };
for (const r of routes) {
  const rel = '../'.repeat(r.path.split('/').filter(Boolean).length), s = seoFor(r.h, MODELS), url = SITE + r.path;
  let html = src;
  html = rep(html, /<title>[^<]*<\/title>/, `<title>${esc(s.title)}</title>`).replace('<base href="./">', `<base href="${rel}">`);
  html = rep(html, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(s.desc)}">\n<link rel="canonical" href="${url}">\n<meta property="og:title" content="${esc(s.title)}">\n<meta property="og:description" content="${esc(s.desc)}">\n<meta property="og:url" content="${url}">\n<meta property="og:type" content="website">`);
  html = rep(html, /<main id="view"><\/main>/, `<main id="view">${body(r, rel)}</main>`);
  const out = path.join('dist', r.path, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}
// home gets canonical + og too
let home = fs.readFileSync('dist/index.html', 'utf8');
home = home.replace(/(<meta name="description" content="[^"]*">)/, `$1\n<link rel="canonical" href="${SITE}">\n<meta property="og:title" content="${esc(seoFor('#home').title)}">\n<meta property="og:description" content="${esc(seoFor('#home').desc)}">\n<meta property="og:url" content="${SITE}">\n<meta property="og:type" content="website">`);
fs.writeFileSync('dist/index.html', home);
const urls = [SITE].concat(routes.map(r => SITE + r.path));
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log('pages:', routes.length + 1);
