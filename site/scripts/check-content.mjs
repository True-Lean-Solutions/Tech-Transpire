// Content integrity and publication gating. Run after `npm run build` AND `npm run build:public`.
//   node --experimental-strip-types scripts/check-content.mjs
// 1. Verbatim (review build): every archived line of every migrated block appears in its page,
//    after only the approved corrections (src/lib/corrections.ts).
// 2. Gating (public build): held articles are absent, publishable ones present; no unverified
//    figures on site-level pages; no review markers; unapproved pages not built.
// 3. Launch blockers: unverified wording that cannot be removed without an approved edit is
//    reported as a warning until confirmed (19-article-claims-report, H-01/H-04/H-05).
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { applyTo } from '../src/lib/corrections.ts';

const root = path.resolve(import.meta.dirname, '..');
const pick = (d) => (existsSync(path.join(root, d, 'client')) ? path.join(root, d, 'client') : path.join(root, d));
const review = pick('dist');
const pub = pick('dist-public');
for (const d of [review, pub]) if (!existsSync(d)) throw new Error(`${d} not found. Run npm run build and npm run build:public.`);

const blocks = JSON.parse(readFileSync(path.join(root, '../docs/website-architecture/data/content-blocks.json'), 'utf8')).map(applyTo);
const publication = JSON.parse(readFileSync(path.join(root, 'src/data/publication.json'), 'utf8'));

const decode = (s) => s
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
// Pages are written as a/b/index.html (directory format); index.html stays at the root.
const locate = (dir, file) => [file, file.replace(/\.html$/, '/index.html')].map((f) => path.join(dir, f)).find((f) => existsSync(f));
const has = (dir, file) => !!locate(dir, file);
const raw = (dir, file) => { const f = locate(dir, file); return f ? readFileSync(f, 'utf8') : null; };
const text = (dir, file) => { const r = raw(dir, file); return r === null ? null : decode(r); };

const MARKERS = new Set(['Title', 'Body', 'Tag', 'Text', 'Label', 'Headline', 'Subtext', 'Background (optional)', 'Attribution', '>', 'yes', 'no']);
const ICONS = new Set(['alert', 'target', 'process', 'clock', 'search', 'lightning', 'star', 'check', 'shield', 'people', 'growth', 'chart', 'settings', 'tool', 'repeat', 'list', 'zap']);
const contentLines = (b) => b.text.filter((l) => !MARKERS.has(l) && !ICONS.has(l) && !/^(GDRIVE:|CTA2?:|\[LINK|https?:)/.test(l) && !/^\d$/.test(l)).map(norm).filter(Boolean);

const slugs = {
  'TT-INS-001': 'mastering-kaizen-events', 'TT-INS-002': 'two-quarters-of-migration-work-cleared-in-a-single-day', 'TT-INS-003': 'seven-year-migration-closed-in-19-hours',
  'TT-INS-004': 'weekend-scrum-to-kanban-migration-across-nine-teams', 'TT-INS-005': 'value-stream-mapping-9-5-hours-of-work-in-208-days', 'TT-INS-006': 'executing-the-wrong-plan',
  'TT-INS-007': 'the-19-hour-project-rapid-execution', 'TT-INS-008': 'look-at-the-handoffs-not-the-steps', 'TT-INS-009': 'decentralized-purchasing-destroys-margins', 'TT-INS-010': 'why-transformation-programs-fail-after-a-strong-start',
};
const sources = { 'TT-PG-001': 'index.html', 'TT-PG-002': 'services.html', 'TT-PG-004': 'about-us.html' };
for (const [id, slug] of Object.entries(slugs)) sources[id] = `insights/${slug}.html`;

// Deliberate exclusions from the verbatim check, each with its reason:
//   TT-PG-001-B08  Home stats: shown only as "Selected Experience" tiles once verified (C-02–C-07)
//   TT-PG-004-B04  Team profiles: publish per person when confirmed (D-07)
// (TT-PG-001-B02's headline "Clarity before Execution." is checked: it is the Method eyebrow.
//  Every carousel line, including "Want to learn more?", is checked. The Home fit list is shown
//  in full again, as in the Home page Word file (D-32).)
const notVerbatim = new Set(['TT-PG-001-B08', 'TT-PG-004-B04']);

const failures = [];
const warnings = [];
let checked = 0;

// 1. Verbatim against the review build.
for (const b of blocks) {
  const file = sources[b.source_id];
  if (!file || notVerbatim.has(b.block_id)) continue;
  const html = text(review, file);
  if (html === null) { failures.push(`${b.block_id}: review page ${file} missing`); continue; }
  for (const line of contentLines(b)) {
    if (notVerbatim.has(`${b.block_id}:${line}`)) continue;
    checked++;
    if (!html.includes(line)) failures.push(`${b.block_id} → ${file}: missing "${line.slice(0, 80)}…"`);
  }
  // Button labels: "CTA: Label > url" must appear as the label of a link on the page.
  for (const l of b.text) {
    const m = /^CTA2?:\s*(.+?)\s*>/.exec(l);
    if (!m) continue;
    checked++;
    const r = raw(review, file);
    const labels = [...r.matchAll(/<a [^>]*>([\s\S]*?)<\/a>/g)].map((a) => norm(decode(a[1])));
    if (!labels.some((t) => t.includes(m[1]))) failures.push(`${b.block_id} → ${file}: button "${m[1]}" missing`);
  }
  if (b.heading) { checked++; if (!html.includes(norm(b.heading))) failures.push(`${b.block_id} → ${file}: heading missing "${b.heading}"`); }
}

// 2. Gating against the public build.
const verified = (c) => publication.claims[c]?.status === 'verified';
const publishable = (id) => {
  const covered = new Set(publication.omissions?.[id]?.covers ?? []);
  return (publication.articles[id] ?? []).every((c) => covered.has(c) || verified(c));
};
const held = [];
for (const [id, slug] of Object.entries(slugs)) {
  const exists = has(pub, `insights/${slug}.html`);
  if (publishable(id) && !exists) failures.push(`GATE ${id} is publishable but missing from the public build`);
  if (!publishable(id)) { held.push(id); if (exists) failures.push(`GATE ${id} has unverified claims but was published`); }
}
const anyCaseStudy = publication.caseStudies.some(publishable);
if (anyCaseStudy !== has(pub, 'insights/case-studies.html')) failures.push('GATE case-studies page presence does not match publishable case studies');

const sitePages = ['index.html', 'services.html', 'services/transformation-recovery.html', 'about-us.html', 'contact-us.html', 'insights.html', '404.html'];
const leaks = [
  ['review banner', /Review build/],
  ['withdrawn C-01 label', /Revenue impact/],
  ...(verified('C-14') ? [] : [['E-09 withheld sentence', /Twelve other programs subsequently replicated it/]]),
  ['unverified result figure', /\$89M|\b63%|7 yrs|\b90\+|\$311|prevented \$3M|\$3M in fraud/],
  ...(verified('C-15') ? [] : [['unconfirmed timeframe tag (C-15)', /6-8 weeks/]]),
];
for (const f of sitePages) {
  const r = raw(pub, f);
  if (r === null) { failures.push(`GATE public page ${f} missing`); continue; }
  const t = decode(r);
  for (const [name, re] of leaks) if (re.test(t)) failures.push(`GATE ${name} on public ${f}`);
  if (r.includes('class="flag')) failures.push(`GATE review flag rendered in public ${f}`);
  if (r.includes('noindex')) failures.push(`GATE noindex left in public ${f}`);
}
if (raw(pub, 'index.html')?.includes('class="results"')) failures.push('GATE results band rendered without two verified results');
for (const f of ['industries.html', 'industries/healthcare.html']) if (has(pub, f)) failures.push(`GATE ${f} built before approval`);

// 3. Launch blockers still present in public text (warnings).
const blockers = [
  ['H-05 / C-17', 'contact-us.html', '1 business day'],
];
for (const [id, f, s] of blockers) if (text(pub, f)?.includes(s)) warnings.push(`${id}: "${s}" on ${f} must be confirmed (or an omission approved) before launch`);
// N-07 approved for launch 2026-11-02 (D-50): the contact form consent links to it, so it must ship.
if (!has(pub, 'privacy-policy.html')) failures.push('GATE Privacy Policy missing from the public build (N-07, D-50)');

console.log(`Verbatim lines checked (review build): ${checked}`);
console.log(`Articles held from the public build: ${held.length} (${held.join(', ')})`);
if (warnings.length) console.log(`Launch blockers (warnings):\n` + warnings.map((w) => `  ! ${w}`).join('\n'));
if (failures.length) { console.error(`${failures.length} problem(s):\n` + failures.map((f) => `  - ${f}`).join('\n')); process.exit(1); }
console.log('All content and gating checks passed.');
