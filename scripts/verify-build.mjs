/**
 * Post-build verification. Checks the things that are easy to get subtly wrong
 * across both languages, including sitemap and rendered content regressions:
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
import { readSiteConfig } from './read-site-config.mjs';

const { SITE_URL, SITE_NOINDEX, STORES, BUSINESS, APP } = await readSiteConfig();

const DIST = process.argv[2] ?? 'dist';
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
const titles = new Map();
const descriptions = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const url = pageUrl(file);
  // The 404 is served for every unmatched path, so it is deliberately noindex
  // with no canonical and no hreflang.
  if (url === '/404.html') {
    if (!/<meta name="robots" content="noindex, nofollow"/.test(html)) note('404 must be noindex');
    if (html.includes('rel="canonical"') || html.includes('<link rel="alternate"')) note('404 must not advertise a canonical or alternates');
    if (!html.includes('lang="hu"')) note('404 must include Hungarian recovery content');
    continue;
  }

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
  const expectedCanonical = `${SITE_URL}${url === '/' ? '/' : `${url}/`}`;
  if (attr(canonicals[0]?.[0] ?? '', 'href') !== expectedCanonical) note(`${url}: canonical must be ${expectedCanonical}`);

  const locale = url === '/hu' || url.startsWith('/hu/') ? 'hu' : 'en';
  if (!html.includes(`<html lang="${locale}">`)) note(`${url}: wrong HTML language`);
  const robots = attr(html.match(/<meta name="robots"[^>]*>/)?.[0] ?? '', 'content');
  if (SITE_NOINDEX ? !robots?.includes('noindex') : !robots?.startsWith('index, follow')) note(`${url}: incorrect indexing policy`);
  const content = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
  const text = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, '').trim();
  if (text.length < 150 || (content.match(/<h1\b/g) ?? []).length !== 1) note(`${url}: main content and one H1 must be in static HTML`);
  if (/Coming soon|Hamarosan/.test(text)) note(`${url}: pre-launch copy remains visible`);

  if (!alternates.some((a) => a.lang === 'x-default')) note(`${url}: no x-default`);

  for (const alternate of alternates) {
    const target = toFile(new URL(alternate.href).pathname);
    if (!existing.has(target)) note(`${url}: hreflang="${alternate.lang}" -> ${alternate.href} was never built`);
  }

  if (!/<title>[^<]+<\/title>/.test(html)) note(`${url}: missing or empty <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) note(`${url}: missing description`);
  if (!html.includes('application/ld+json')) note(`${url}: no JSON-LD`);
  for (const [label, value, seen] of [
    ['title', html.match(/<title>([^<]+)<\/title>/)?.[1], titles],
    ['description', attr(html.match(/<meta name="description"[^>]*>/)?.[0] ?? '', 'content'), descriptions],
  ]) {
    if (seen.has(value)) note(`${url}: duplicate ${label} with ${seen.get(value)}`);
    seen.set(value, url);
  }

  if (attr(html.match(/<meta property="og:url"[^>]*>/)?.[0] ?? '', 'content') !== expectedCanonical) note(`${url}: og:url must match canonical`);
  for (const field of ['og:title', 'og:description', 'og:image:alt']) {
    if (!attr(html.match(new RegExp(`<meta property="${field}"[^>]*>`))?.[0] ?? '', 'content')) note(`${url}: missing ${field}`);
  }
  if (!html.includes('name="twitter:card" content="summary_large_image"')) note(`${url}: missing social card`);
  if (!html.includes(`name="apple-itunes-app" content="app-id=${APP.appStoreId}"`)) note(`${url}: missing Smart App Banner`);

  try {
    const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    if (blocks.length !== 1) note(`${url}: expected one JSON-LD graph`);
    const graph = JSON.parse(blocks[0]?.[1] ?? '{}')['@graph'] ?? [];
    const organization = graph.find((node) => node['@type'] === 'Organization');
    if (organization?.legalName !== BUSINESS.name || organization?.email !== BUSINESS.email) note(`${url}: incomplete provider identity`);
    const webpage = graph.find((node) => ['WebPage', 'AboutPage'].includes(node['@type']));
    if (webpage?.url !== expectedCanonical || webpage?.inLanguage !== locale) note(`${url}: wrong page schema URL or language`);
    if (url === '/' || url === '/hu') {
      const app = graph.find((node) => node['@type'] === 'SoftwareApplication');
      if (app?.offers?.availability !== 'https://schema.org/InStock') note(`${url}: app must be available, not pre-order`);
      if (!app?.downloadUrl?.includes(STORES.apple.web) || !app?.downloadUrl?.includes(STORES.google.web)) note(`${url}: app schema must include both stores`);
    }
  } catch (error) { note(`${url}: invalid JSON-LD: ${error.message}`); }

  if (['/', '/hu', '/pricing', '/hu/arak', '/about', '/hu/rolunk'].includes(url)) {
    for (const [store, urls] of Object.entries(STORES)) {
      const link = [...html.matchAll(/<a\b[^>]*>/g)].find(([tag]) => attr(tag, 'data-store') === store)?.[0] ?? '';
      if (attr(link, 'href')?.replaceAll('&amp;', '&') !== urls.web || !attr(link, 'data-native-url')) note(`${url}: ${store} needs a crawlable listing link and native handoff`);
    }
  }

  for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
    const href = attr(tag, 'href');
    if (!href?.startsWith('/') || href.startsWith('//')) continue;
    const path = new URL(href.replaceAll('&amp;', '&'), SITE_URL).pathname;
    if (!existing.has(path.slice(1)) && !existing.has(toFile(path))) note(`${url}: broken internal link ${href}`);
    if (existing.has(toFile(path)) && !path.endsWith('/')) note(`${url}: internal page link redirects: ${href}`);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!attr(tag, 'width') || !attr(tag, 'height') || attr(tag, 'alt') === undefined) note(`${url}: image missing dimensions or alt text`);
  }

  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (!og) note(`${url}: no og:image`);
  else {
    const ogFile = new URL(og).pathname.replace(/^\//, '');
    if (!existing.has(ogFile)) note(`${url}: og:image ${ogFile} was never built`);
  }
}

const robots = await readFile(join(DIST, 'robots.txt'), 'utf8');
if (SITE_NOINDEX ? !robots.includes('Disallow: /') : robots.includes('Disallow: /')) note('robots.txt indexing policy is incorrect');
if (!SITE_NOINDEX && !robots.includes(`Sitemap: ${SITE_URL}/sitemap-index.xml`)) note('robots.txt must advertise the sitemap');

const sitemapUrls = new Set();
const index = await readFile(join(DIST, 'sitemap-index.xml'), 'utf8');
for (const [, location] of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const sitemap = await readFile(join(DIST, new URL(location).pathname.slice(1)), 'utf8');
  for (const [, entry] of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const location = entry.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (sitemapUrls.has(location)) note(`duplicate sitemap URL: ${location}`);
    sitemapUrls.add(location);
    const page = [...pages.values()].find((page) => page.canonical === location);
    if (!page) { note(`sitemap includes a noncanonical or unbuilt URL: ${location}`); continue; }
    const alternates = [...entry.matchAll(/<xhtml:link\b[^>]*>/g)].map(([tag]) => `${attr(tag, 'hreflang')}=${attr(tag, 'href')}`).sort();
    const expected = page.alternates.map((a) => `${a.lang}=${a.href}`).sort();
    if (JSON.stringify(alternates) !== JSON.stringify(expected)) note(`sitemap hreflang disagrees with HTML: ${location}`);
  }
}
for (const page of pages.values()) {
  if (!sitemapUrls.has(page.canonical)) note(`missing from sitemap: ${page.canonical}`);
}
const headers = await readFile(join(DIST, '_headers'), 'utf8');
if (!SITE_NOINDEX && /X-Robots-Tag:\s*[^\n]*(?:noindex|none)/i.test(headers)) note('production headers contain noindex');
const redirects = await readFile(join(DIST, '_redirects'), 'utf8');
if (!/^\/sitemap\.xml\s+\/sitemap-index\.xml\s+301\s*$/m.test(redirects)) note('missing sitemap.xml redirect');
if (/^\/\*\s+\/index\.html\s+200/m.test(redirects)) note('SPA fallback would hide real 404s');

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

console.log(`checked ${pages.size} pages, ${files.length} files in ${DIST}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log('static content, indexing, sitemap, canonical, hreflang, links, stores, social metadata and JSON-LD all check out');
