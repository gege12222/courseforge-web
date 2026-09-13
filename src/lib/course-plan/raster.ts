/**
 * Literal colour values for build-time rasterising only.
 *
 * The OG image pipeline hands SVG to sharp, which has no stylesheet, so
 * `var(--cf-*)` would resolve to nothing and the plan would come out blank.
 * These are the same values as tokens.css and must be kept in step with it —
 * they are the third and last documented exception to "hex only in tokens.css",
 * alongside the favicon script and the standalone brand SVG.
 */
export const RASTER_TOKENS = {
  'cf-canvas': '#f5f7f4',
  'cf-navy': '#1b2a4a',
  'cf-cream': '#f2efe8',
  'cf-gold-on-dark': '#e3bc4b',
  'cf-ink': '#26332f',
  'cf-ink-muted': '#56635f',
  'cf-plan-pole': '#e94f37',
  'cf-plan-pole-dark': '#1f2926',
  'cf-plan-route-ink': '#37474f',
  'cf-plan-measure': '#ea7c2b',
  'cf-plan-marker': '#e6c229',
  'cf-plan-grid': 'rgba(23,62,55,0.13)',
  'cf-plan-water': '#2d9cdb',
  'cf-plan-water-light': '#6ec5e9',
  'cf-plan-water-rim': '#166b8f',
  'cf-plan-wall': '#263238',
  'cf-plan-stand': '#7a5427',
  'cf-plan-liverpool-rim': '#ed6a5a',
  'cf-plan-outline': '#7d918a',
  'cf-plan-paper': '#ffffff',
} satisfies Record<string, string>;
