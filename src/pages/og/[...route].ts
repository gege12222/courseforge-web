/**
 * One generated OG image per page, per language.
 *
 * Keys mirror the route ids rather than the translated slugs, so the endpoint
 * stays readable: /og/hu/pricing.png. `ogImagePath()` in src/lib/seo.ts builds
 * the same key, so a page and its image cannot disagree.
 *
 * The course-plan backgrounds this used to render live on in
 * src/lib/og-plan.ts, unused while the course library is switched off.
 */
import { OGImageRoute } from 'astro-og-canvas';
import { LOCALES, type RouteId } from '../../config/site.ts';
import { useTranslations } from '../../i18n/index.ts';
import { RASTER_TOKENS } from '../../lib/course-plan/raster.ts';
import { ogKey } from '../../lib/seo.ts';

interface OgPage {
  title: string;
  description: string;
}

const pages: Record<string, OgPage> = {};

for (const locale of LOCALES) {
  const t = useTranslations(locale);

  const simple: [RouteId, string, string][] = [
    ['home', t.common.appName, t.home.heroTitle],
    ['features', t.features.title, t.features.description],
    ['pricing', t.pricing.title, t.pricing.heading],
    ['privacy', t.footer.privacy, t.common.appName],
    ['terms', t.footer.terms, t.common.appName],
    ['impressum', t.impressum.title, t.common.appName],
  ];
  for (const [id, title, description] of simple) {
    pages[ogKey(locale, id)] = { title, description };
  }
}

const rgb = (hex: string): [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

const NAVY = rgb(RASTER_TOKENS['cf-navy']);
const CREAM = rgb(RASTER_TOKENS['cf-cream']);
const GOLD = rgb(RASTER_TOKENS['cf-gold-on-dark']);

/**
 * Redundant under `output: 'static'`, deliberate anyway. canvaskit-wasm can only
 * initialise in Node at build time, never inside a Cloudflare worker, so if an
 * adapter is ever added this route must stay prerendered or every OG image turns
 * into a runtime crash.
 */
export const prerender = true;

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    logo: { path: './src/assets/brand/courseforge-icon-1024.png', size: [72] },
    bgGradient: [NAVY],
    padding: 60,
    border: { color: GOLD, width: 8, side: 'block-end' as const },
    font: {
      title: { color: CREAM, size: 64, weight: 'Bold' as const, families: ['Space Grotesk'], lineHeight: 1.1 },
      description: { color: GOLD, size: 30, weight: 'Medium' as const, families: ['Space Grotesk'], lineHeight: 1.3 },
    },
    fonts: ['./src/assets/fonts/og/space-grotesk-700.ttf', './src/assets/fonts/og/space-grotesk-500.ttf'],
  }),
});
