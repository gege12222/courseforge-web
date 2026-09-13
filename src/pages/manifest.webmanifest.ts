import type { APIRoute } from 'astro';
import { SITE_NAME } from '../config/site.ts';
import { RASTER_TOKENS } from '../lib/course-plan/raster.ts';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: SITE_NAME,
      short_name: SITE_NAME,
      start_url: '/',
      display: 'browser',
      background_color: RASTER_TOKENS['cf-canvas'],
      theme_color: RASTER_TOKENS['cf-navy'],
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    }),
    { headers: { 'content-type': 'application/manifest+json' } },
  );
