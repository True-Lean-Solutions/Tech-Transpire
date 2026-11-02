// Post-build step for the GitHub Pages production build (npm run build:pages), D-50.
// GitHub Pages serves each page from its directory (contact-us/index.html) and 301s /contact-us
// to /contact-us/, so page links get the trailing slash here to avoid a redirect on every click.
// Assets and other files (anything with an extension) are left alone. Then writes CNAME for the
// custom domain and .nojekyll so Pages serves the /_astro directory.
//   node scripts/pages-finalize.mjs dist-pages
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DOMAIN = 'www.techtranspire.com';
const dir = path.resolve(process.argv[2] ?? 'dist-pages');
if (!existsSync(path.join(dir, 'index.html'))) throw new Error(`${dir}/index.html missing: run the Pages build first`);

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = path.join(d, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});

const SAME_SITE = `(?:https://${DOMAIN.replace(/\./g, '\\.')})?`;
const href = new RegExp(`(\\shref=")(${SAME_SITE}/(?!/)[^"?#]*)([?#][^"]*)?"`, 'g');
const refresh = new RegExp(`(url=)(${SAME_SITE}/(?!/)[^"?#;\\s]*)`, 'gi');

let changes = 0;
const slash = (p) => {
  const pathname = p.replace(/^https:\/\/[^/]+/, '');
  if (pathname === '/' || pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname.split('/').pop())) return p;
  changes++;
  return `${p}/`;
};

let files = 0;
for (const f of walk(dir)) {
  const before = readFileSync(f, 'utf8');
  const after = before
    .replace(href, (_, a, p, rest = '') => `${a}${slash(p)}${rest}"`)
    .replace(refresh, (_, a, p) => `${a}${slash(p)}`);
  if (after !== before) { writeFileSync(f, after); files++; }
}

writeFileSync(path.join(dir, 'CNAME'), `${DOMAIN}\n`);
writeFileSync(path.join(dir, '.nojekyll'), '');
console.log(`pages-finalize: ${changes} page links given a trailing slash in ${files} pages; CNAME (${DOMAIN}) and .nojekyll written`);
