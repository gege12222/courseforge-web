// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE_URL, SITE_URL_IS_PLACEHOLDER, LOCALES, DEFAULT_LOCALE, resolveRoute, routeUrl } from './src/config/site.ts';

if (SITE_URL_IS_PLACEHOLDER) {
  console.warn(
    `\n[courseforge] Building against the placeholder domain ${SITE_URL}.\n` +
      `              Canonical URLs, hreflang and the sitemap will all point at it.\n` +
      `              Set SITE_URL in the environment once the domain is chosen.\n`,
  );
}

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',

  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    mdx(),
    sitemap({
      // The integration's own i18n pairing assumes the same slug in every
      // language and would emit /hu/features for /features. Slugs here are
      // translated, so alternates are rebuilt from ROUTES instead — one source
      // of truth for the router, the hreflang tags and the sitemap.
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: Object.fromEntries(LOCALES.map((locale) => [locale, locale])),
      },
      // OG images are endpoints, not pages.
      filter: (page) => !new URL(page).pathname.startsWith('/og/'),
      serialize(item) {
        const route = resolveRoute(new URL(item.url).pathname);
        if (!route) return item;
        const links = LOCALES.map((locale) => ({
          lang: locale,
          url: routeUrl(route.id, locale, route.entry),
        }));
        return {
          ...item,
          links: [...links, { lang: 'x-default', url: routeUrl(route.id, DEFAULT_LOCALE, route.entry) }],
        };
      },
    }),
  ],

  image: {
    // AVIF first with a WebP fallback is decided per <Picture>; this only sets
    // the formats the pipeline is allowed to emit.
    responsiveStyles: true,
  },

  vite: {
    // Cast: Astro bundles its own Vite copy, so @tailwindcss/vite's Plugin type
    // and Astro's are structurally identical but nominally different. Runtime is
    // fine; only the checker sees two Vites.
    plugins: [/** @type {any} */ (tailwindcss())],
  },

  build: {
    inlineStylesheets: 'auto',
  },
});
