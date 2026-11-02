// Publish dist-pages/ to the gh-pages branch: the production site at https://www.techtranspire.com
// (GitHub Pages, D-50). Run via `npm run deploy:pages`, which builds first. The branch holds build
// output only and is replaced on every deploy; source history stays on main. CNAME and .nojekyll
// come from scripts/pages-finalize.mjs, so the custom domain survives each deploy.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const site = path.resolve(import.meta.dirname, '..');
const out = path.join(site, 'dist-pages');
for (const f of ['index.html', 'CNAME', '.nojekyll']) {
  if (!existsSync(path.join(out, f))) throw new Error(`dist-pages/${f} missing: run npm run build:pages`);
}
const domain = readFileSync(path.join(out, 'CNAME'), 'utf8').trim();

const git = (args, cwd = out) => execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
const remote = git(['remote', 'get-url', 'origin'], site);
const source = git(['rev-parse', '--short', 'HEAD'], site);
const dirty = git(['status', '--porcelain'], site) ? ' (with uncommitted changes)' : '';

rmSync(path.join(out, '.git'), { recursive: true, force: true });
git(['init', '-q', '-b', 'gh-pages']);
git(['add', '-A']);
git(['-c', 'user.name=Tech Transpire deploy', '-c', 'user.email=deploy@users.noreply.github.com', 'commit', '-q', '-m', `Production build from ${source}${dirty}`]);
git(['push', '-q', '--force', remote, 'gh-pages']);
rmSync(path.join(out, '.git'), { recursive: true, force: true });
console.log(`Deployed production build (from ${source}${dirty}) to gh-pages: https://${domain}/`);
