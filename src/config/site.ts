/**
 * The single source of truth for anything that is not yet decided, and for the
 * route/slug mapping. Nothing else in the codebase hardcodes a domain, an email
 * address, a bundle identifier, or a translated slug.
 *
 * Values marked PENDING are placeholders. They are deliberately obvious and
 * grep-able — see OPEN_QUESTIONS.md. `SITE_URL` and `CONTACT_EMAIL` can be
 * overridden by environment variables at build time, so switching them on
 * Cloudflare does not need a code change.
 */

/* ---------------------------------------------------------------- identity */

const PLACEHOLDER_ORIGIN = 'https://courseforge.example';

/**
 * Absolute origin, no trailing slash. Canonicals, hreflang, the sitemap, the OG
 * image URLs and robots.txt all derive from this one value. Override with the
 * SITE_URL environment variable for a staging host.
 */
export const SITE_URL = (
  import.meta.env?.SITE_URL ??
  process.env.SITE_URL ??
  'https://courseforge.hu'
).replace(/\/$/, '');

/**
 * While this is true every page ships noindex and robots.txt disallows
 * everything, so a placeholder host can never be indexed. It stops being true
 * the moment a real origin is set, which it now is.
 */
export const SITE_URL_IS_PLACEHOLDER = SITE_URL === PLACEHOLDER_ORIGIN;

/** Production stays indexable; preview branches and explicit staging builds don't. */
export const SITE_NOINDEX = SITE_URL_IS_PLACEHOLDER ||
  (import.meta.env?.SITE_NOINDEX ?? process.env.SITE_NOINDEX) === 'true' ||
  (process.env.CF_PAGES === '1' && !!process.env.CF_PAGES_BRANCH &&
    process.env.CF_PAGES_BRANCH !== (process.env.CF_PAGES_PRODUCTION_BRANCH ?? 'main'));

/** Waitlist confirmations and the privacy contact point (ANSWERS.md #14). */
export const CONTACT_EMAIL = import.meta.env?.CONTACT_EMAIL ?? process.env.CONTACT_EMAIL ?? 'support@courseforge.hu';

/** Optional account-issued tokens; no verification claim without a real token. */
export const SEARCH_VERIFICATION = {
  google: import.meta.env?.GOOGLE_SITE_VERIFICATION ?? process.env.GOOGLE_SITE_VERIFICATION,
  bing: import.meta.env?.BING_SITE_VERIFICATION ?? process.env.BING_SITE_VERIFICATION,
};

export const SITE_NAME = 'CourseForge';

/**
 * The service provider, as published in the Terms of Use and the Privacy Policy.
 * Kept here rather than in the i18n files because it is data, not copy: the same
 * values must appear in both languages, and a translator must never be able to
 * change a tax number. Labels for these rows live in src/i18n/*.ts.
 *
 * `registrationAuthority`: for a Hungarian egyéni vállalkozó the register has
 * been kept by the Nemzeti Adó- és Vámhivatal since 1 July 2020 — not by the
 * local notary, the chamber of commerce or the ministry, which are the usual
 * wrong answers.
 */
export const BUSINESS = {
  name: 'Bába Gergely e.v.',
  address: '2519 Piliscsév, Béke utca 145., Magyarország',
  taxNumber: '48261825131',
  registrationNumber: '58553789',
  registrationAuthority: 'Nemzeti Adó- és Vámhivatal (NAV)',
  email: CONTACT_EMAIL,
} as const;

/* --------------------------------------------------------------- app facts */

/** Verified against the Flutter app — see AUDIT.md §1d. Do not embellish. */
export const APP = {
  name: 'CourseForge',
  /** iOS listing verified at launch; Android versions can differ. */
  versionIos: '1.0.1',
  released: true,
  minIos: '15.6',
  minAndroid: '5.0',
  minAndroidApi: 21,
  bundleIdIos: 'com.example.courseforge',
  bundleIdAndroid: 'com.gege.courseforge',
  appStoreId: '6798715396',
  appleTeamId: 'TEAMID_PENDING',
  androidSha256: 'SHA256_PENDING',
} as const;

/** Public listing URLs remain usable without JavaScript and on desktop. */
export const STORES = {
  apple: {
    web: `https://apps.apple.com/us/app/courseforge/id${APP.appStoreId}`,
    native: `itms-apps://apps.apple.com/app/id${APP.appStoreId}`,
  },
  google: {
    web: `https://play.google.com/store/apps/details?id=${APP.bundleIdAndroid}`,
    native: `intent://details?id=${APP.bundleIdAndroid}#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=${encodeURIComponent(`https://play.google.com/store/apps/details?id=${APP.bundleIdAndroid}`)};end`,
  },
} as const;

/** The downloadable course file. Extension and format from AUDIT.md §1c. */
export const COURSE_FILE = {
  extension: '.courseforge',
  /** ANSWERS.md #3. Must match the eventual iOS UTI and Android intent filter. */
  mime: 'application/vnd.courseforge.course+json',
  formatId: 'courseforge.course',
  formatVersion: 1,
} as const;

/**
 * Default licence line for published courses. UNCONFIRMED (ANSWERS.md #12) —
 * a course may override it with `license` in its frontmatter.
 */
export const DEFAULT_COURSE_LICENSE = 'free-to-ride' as const;

/**
 * Lifetime Pro pricing. Data, not copy — a translator must not be able to change
 * a price. These are reference prices: the App Store and Google Play convert and
 * tax per country, so the page says so rather than implying these are universal.
 */
export const PRICING = {
  lifetimePro: {
    usd: '$6.99',
    huf: '2990 Ft',
  },
} as const;

/* ------------------------------------------------------------ localisation */

export const LOCALES = ['en', 'hu'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Every page of the site, keyed by a stable route id, with the slug for each
 * locale. The router, the language switcher, the hreflang generator and the
 * sitemap all read this one object, so an en/hu pair cannot drift.
 *
 * A slug of '' is the locale home. Nested routes give the collection segment;
 * an entry slug is appended to it.
 */
// `courses`, `blog` and `cookies` are deliberately absent: all three are
// switched off for the first release. Their content is kept — the course
// Markdown and .courseforge files, the blog posts, the cookie text — so putting
// any of them back is a route file plus a line here. Cookies are covered by
// section 7 of the privacy policy, which is why that page is not needed.
export const ROUTES = {
  home: { en: '', hu: '' },
  features: { en: 'features', hu: 'funkciok' },
  pricing: { en: 'pricing', hu: 'arak' },
  about: { en: 'about', hu: 'rolunk' },
  privacy: { en: 'privacy', hu: 'adatvedelem' },
  terms: { en: 'terms', hu: 'aszf' },
  impressum: { en: 'impresszum', hu: 'impresszum' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteId = keyof typeof ROUTES;

/** Locale-prefixed path for a route, e.g. ('courses','hu') -> '/hu/palyak'. */
export function routePath(id: RouteId, locale: Locale, entry?: string): string {
  const slug = ROUTES[id][locale];
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const segments = [slug, entry].filter(Boolean).join('/');
  // Cloudflare Pages serves directory routes with a trailing slash. Match the
  // final response URL in links, canonicals, hreflang and sitemap entries.
  return segments ? `${prefix}/${segments}/` : `${prefix}/`;
}

/** Absolute URL for a route — canonicals, hreflang, OG, sitemap. */
export function routeUrl(id: RouteId, locale: Locale, entry?: string): string {
  return new URL(routePath(id, locale, entry), `${SITE_URL}/`).href;
}

/**
 * The inverse of routePath: given a built pathname, work out which route it is.
 * The sitemap uses this to pair en/hu URLs whose slugs differ. Returns null for
 * anything not in ROUTES (404, feeds, OG images).
 */
export function resolveRoute(pathname: string): { id: RouteId; locale: Locale; entry?: string } | null {
  const segments = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  const locale: Locale = (LOCALES as readonly string[]).includes(segments[0] ?? '')
    ? (segments.shift() as Locale)
    : DEFAULT_LOCALE;

  if (segments.length === 0) return { id: 'home', locale };

  const ids = Object.keys(ROUTES) as RouteId[];
  // Longest slug first, so a one-segment slug cannot shadow a nested match.
  const match = ids
    .filter((id) => ROUTES[id][locale] && ROUTES[id][locale] === segments[0])
    .sort((a, b) => ROUTES[b][locale].length - ROUTES[a][locale].length)[0];
  if (!match) return null;

  const entry = segments.slice(1).join('/');
  return entry ? { id: match, locale, entry } : { id: match, locale };
}

/**
 * The other locale's version of the same page, for the language switcher.
 * Returns null when no counterpart exists (a blog post in one language only).
 */
export function counterpartPath(id: RouteId, from: Locale, entry?: string): string {
  const to = LOCALES.find((l) => l !== from) ?? DEFAULT_LOCALE;
  return routePath(id, to, entry);
}
