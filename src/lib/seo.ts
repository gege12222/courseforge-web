/**
 * SEO helpers. Canonicals, hreflang pairs and JSON-LD all derive from ROUTES in
 * src/config/site.ts, so an en/hu URL pair cannot drift from the router.
 */
import {
  APP,
  DEFAULT_LOCALE,
  LOCALES,
  ROUTES,
  SITE_NAME,
  SITE_URL,
  routePath,
  routeUrl,
  type Locale,
  type RouteId,
} from '../config/site.ts';

export interface Alternate {
  locale: Locale;
  href: string;
}

/**
 * The hreflang set for a page.
 *
 * `available` limits it to the locales a page really exists in — a blog post
 * written only in Hungarian must not advertise an English counterpart. Pass
 * undefined for ordinary pages, which exist in both.
 */
export function alternatesFor(id: RouteId, entry?: string, available?: Locale[]): Alternate[] {
  const locales = available ?? [...LOCALES];
  return locales.map((locale) => ({ locale, href: routeUrl(id, locale, entry) }));
}

export function absolute(path: string): string {
  return new URL(path, `${SITE_URL}/`).href;
}

/* ------------------------------------------------------------------ JSON-LD */

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: absolute('/icon-512.png'),
      width: 512,
      height: 512,
    },
  };
}

export function websiteSchema(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: absolute(routePath('home', locale)),
    inLanguage: locale,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function softwareApplicationSchema(locale: Locale, description: string) {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#app`,
    name: APP.name,
    applicationCategory: 'DesignApplication',
    applicationSubCategory: 'Show jumping course design',
    operatingSystem: `iOS ${APP.minIos}+, Android ${APP.minAndroid}+`,
    softwareVersion: APP.version,
    description,
    inLanguage: [...LOCALES],
    url: absolute(routePath('home', locale)),
    publisher: { '@id': `${SITE_URL}/#organization` },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/PreOrder',
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** One graph per page keeps Google happy and the markup small. */
export function jsonLdGraph(nodes: object[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}

/* ------------------------------------------------------------- OG image keys */

/**
 * OG image path for a page. Keys mirror the route ids rather than the localised
 * slugs so the endpoint stays readable: /og/hu/courses/grand-prix-110.png
 */
export function ogImagePath(locale: Locale, id: RouteId, entry?: string): string {
  const segments = [locale, id, entry].filter(Boolean).join('/');
  return `/og/${segments}.png`;
}

/** Every OG key the endpoint must generate, for a given set of entries. */
export function ogKey(locale: Locale, id: RouteId, entry?: string): string {
  return [locale, id, entry].filter(Boolean).join('/');
}

export { ROUTES, DEFAULT_LOCALE, LOCALES, SITE_NAME, SITE_URL, routePath, routeUrl };
export type { Locale, RouteId };
