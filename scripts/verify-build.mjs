/**
 * Post-build verification. Checks the things that are easy to get subtly wrong
 * and impossible to spot by eye across 27 pages:
 *
 *  1. Every page has exactly one canonical, and it matches the page's own URL.
 *  2. Every hreflang target resolves to a page that was actually built.
 *  3. hreflang is reciprocal — if A says B is its Hungarian version, B must
 *     point back at A.
 *  4. Every page declares x-default.
 *  5. Every OG image referenced by a page exists in dist.
 *  6. Every page has a title, a description and one JSON-LD block.
 *
 *   node scripts/verify-build.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';
const problems = [];
const note = (message) => problems.push(message);

async function walk(dir) {
  const out = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const files = await walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const existing = new Set(files.map((f) => relative(DIST, f).split('\\').join('/')));

/** '/courses/x' -> 'courses/x/index.html' */
const toFile = (pathname) => {
  const clean = pathname.replace(/^\/|\/$/g, '');
  return clean === '' ? 'index.html' : `${clean}/index.html`;
};

const pageUrl = (file) => {
  const rel = relative(DIST, file).split('\\').join('/');
  return '/' + rel.replace(/index\.html$/, '').replace(/\/$/, '');
};

const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const pages = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const url = pageUrl(file);
  // The 404 is served for every unmatched path, so it is deliberately noindex
  // with no canonical and no hreflang. Nothing to verify.
  if (url === '/404.html') continue;

  const canonicals = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*>/g)];
  const alternates = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="[^"]*"[^>]*>/g)].map((m) => ({
    lang: attr(m[0], 'hreflang'),
    href: attr(m[0], 'href'),
  }));

  pages.set(url, { canonical: attr(canonicals[0]?.[0] ?? '', 'href'), alternates });

  if (canonicals.length !== 1) note(`${url}: expected 1 canonical, found ${canonicals.length}`);
  const canonicalPath = canonicals[0] ? new URL(attr(canonicals[0][0], 'href')).pathname : '';
  if (canonicalPath.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
    note(`${url}: canonical points at ${canonicalPath}`);
  }

  if (!alternates.some((a) => a.lang === 'x-default')) note(`${url}: no x-default`);

  for (const alternate of alternates) {
    const target = toFile(new URL(alternate.href).pathname);
    if (!existing.has(target)) note(`${url}: hreflang="${alternate.lang}" -> ${alternate.href} was never built`);
  }

  if (!/<title>[^<]+<\/title>/.test(html)) note(`${url}: missing or empty <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) note(`${url}: missing description`);
  if (!html.includes('application/ld+json')) note(`${url}: no JSON-LD`);

  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (!og) note(`${url}: no og:image`);
  else {
    const ogFile = new URL(og).pathname.replace(/^\//, '');
    if (!existing.has(ogFile)) note(`${url}: og:image ${ogFile} was never built`);
  }
}

// Reciprocity: A -> B implies B -> A.
for (const [url, page] of pages) {
  for (const alternate of page.alternates) {
    if (alternate.lang === 'x-default') continue;
    const targetPath = new URL(alternate.href).pathname.replace(/\/$/, '') || '/';
    if (targetPath === url) continue;
    const target = pages.get(targetPath);
    if (!target) continue; // already reported as not built
    const back = target.alternates.some((a) => {
      const p = new URL(a.href).pathname.replace(/\/$/, '') || '/';
      return p === url;
    });
    if (!back) note(`${url} claims ${targetPath} as hreflang="${alternate.lang}", but it does not point back`);
  }
}

console.log(`checked ${pages.size} pages, ${files.length} files in dist`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log('canonical, hreflang, x-default, reciprocity, OG images, titles and JSON-LD all check out');
