import type { APIRoute } from 'astro';
import { SITE_URL, SITE_NOINDEX } from '../config/site.ts';

/**
 * While the domain is a placeholder, robots.txt disallows everything and the SEO
 * component also emits noindex. Neither is a substitute for the other: robots.txt
 * stops crawling, noindex stops indexing of anything already fetched.
 */
export const GET: APIRoute = () => {
  const body = SITE_NOINDEX
    ? ['# Preview or staging build', 'User-agent: *', 'Disallow: /', ''].join('\n')
    : [
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${SITE_URL}/sitemap-index.xml`,
        '',
      ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
