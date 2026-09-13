/**
 * Top-down obstacle symbols as SVG, in metres, centred on (0,0).
 *
 * Hand-authored to match element_symbol_painter.dart closely enough to be
 * recognisable at thumbnail size — striped red-and-white poles, one pole for a
 * vertical, two for an oxer, three for a triple bar, a blue tray for a
 * Liverpool, solid blue for open water. Where the app's exact geometry is not
 * reproducible from the outside (cross rail, wall, gate) a standard plan-view
 * convention is used; noted in OPEN_QUESTIONS.md.
 *
 * Local axes follow the app: +x along the obstacle's width (the pole), +y along
 * its depth in the direction of travel.
 *
 * Colours come through a resolver rather than being written inline, because the
 * same markup is used two ways: in the page, where `var(--cf-*)` from tokens.css
 * is what we want, and in the OG rasteriser, which has no stylesheet and needs
 * literals. See raster.ts.
 */
import type { ElementType } from './schema.ts';

/**
 * Resolves a token name to something an SVG can use. Deliberately takes no
 * fallback: a fallback hex here would be a second copy of a value that already
 * lives in tokens.css, free to drift. If a token is missing, that is a bug and
 * the build should say so.
 */
export type Colour = (name: string) => string;

/** Default: resolve against tokens.css at render time in the browser. */
export const cssVarColour: Colour = (name) => `var(--${name})`;

/** For build-time rasterising, where there is no stylesheet. */
export const literalColour =
  (tokens: Record<string, string>): Colour =>
  (name) => {
    const value = tokens[name];
    if (!value) throw new Error(`No raster value for --${name}. Add it to raster.ts.`);
    return value;
  };

export interface SymbolStyle {
  colour?: Colour;
  /** Font stack for the START/FINISH lettering. */
  font?: string;
}

/** Pole thickness in metres — a true 100 mm pole reads too thin at this scale. */
const POLE_T = 0.34;
const STRIPES = 7;

/** Default width/depth per type, from ElementCatalog in the app. */
export const SYMBOL_DEFAULTS: Record<string, { width: number; depth: number }> = {
  vertical: { width: 3, depth: 0.8 },
  oxer: { width: 3, depth: 1.4 },
  tripleBar: { width: 3, depth: 1.8 },
  combination: { width: 3, depth: 1.2 },
  crossRail: { width: 3, depth: 0.8 },
  wall: { width: 3, depth: 0.6 },
  gate: { width: 3, depth: 0.8 },
  liverpool: { width: 3, depth: 2 },
  liverpoolVertical: { width: 3, depth: 2 },
  liverpoolOxer: { width: 3, depth: 2.2 },
  waterJump: { width: 3, depth: 3.5 },
  cavaletti: { width: 3, depth: 0.4 },
  startMarker: { width: 2, depth: 0.5 },
  finishMarker: { width: 2, depth: 0.5 },
};

/** The types that read clearly on their own, for the features page. */
export const STANDALONE_SYMBOLS: ElementType[] = [
  'vertical',
  'oxer',
  'tripleBar',
  'crossRail',
  'wall',
  'gate',
  'liverpool',
  'waterJump',
  'cavaletti',
];

const n = (value: number) => Number(value.toFixed(3)).toString();

/** One striped pole, centred at (0, y). */
function pole(width: number, y: number, c: Colour, thickness = POLE_T): string {
  const half = width / 2;
  const top = y - thickness / 2;
  const band = width / STRIPES;
  const stripes: string[] = [];
  for (let i = 1; i < STRIPES; i += 2) {
    stripes.push(
      `<rect x="${n(-half + i * band)}" y="${n(top)}" width="${n(band)}" height="${n(thickness)}" fill="${c('cf-plan-pole')}"/>`,
    );
  }
  return (
    `<rect x="${n(-half)}" y="${n(top)}" width="${n(width)}" height="${n(thickness)}" rx="${n(thickness / 2)}" fill="${c('cf-plan-paper')}"/>` +
    stripes.join('') +
    `<rect x="${n(-half)}" y="${n(top)}" width="${n(width)}" height="${n(thickness)}" rx="${n(thickness / 2)}" fill="none" stroke="${c('cf-plan-pole-dark')}" stroke-width="0.09"/>`
  );
}

/** The water tray under a Liverpool, or open water on its own. */
function water(width: number, depth: number, c: Colour, deep = false): string {
  return (
    `<rect x="${n(-width / 2)}" y="${n(-depth / 2)}" width="${n(width)}" height="${n(depth)}" rx="0.35"` +
    ` fill="${deep ? c('cf-plan-water') : c('cf-plan-water-light')}"` +
    ` stroke="${c('cf-plan-water-rim')}" stroke-width="0.12"/>`
  );
}

/**
 * Poles across the depth, at the app's own offsets: ±0.28 of the depth for two,
 * ±0.34 and centre for three (`_parallelPoles` in element_symbol_painter.dart).
 */
function spreadPoles(width: number, depth: number, count: number, c: Colour): string {
  if (count === 1) return pole(width, 0, c);
  const offsets = count === 2 ? [-0.28, 0.28] : [-0.34, 0, 0.34];
  return offsets.map((offset) => pole(width, depth * offset, c)).join('');
}

/** The SVG children for one obstacle, in local metres centred on the origin. */
export function symbolMarkup(
  type: ElementType,
  width: number,
  depth: number,
  element?: {
    combinationElementCount?: number;
    combinationElementTypes?: ElementType[];
    combinationFirstDistanceMeters?: number;
    combinationSecondDistanceMeters?: number;
  },
  style: SymbolStyle = {},
): string {
  const c = style.colour ?? cssVarColour;
  const font = style.font ?? 'var(--cf-font-display, sans-serif)';

  switch (type) {
    case 'vertical':
      return pole(width, 0, c);

    case 'oxer':
      return spreadPoles(width, depth, 2, c);

    case 'tripleBar':
      return spreadPoles(width, depth, 3, c);

    case 'cavaletti':
      return pole(width, 0, c, POLE_T * 0.7);

    case 'crossRail':
      // Plan-view convention: one pole with a crossing mark at its centre.
      return (
        pole(width, 0, c) +
        `<path d="M ${n(-width * 0.18)} ${n(-depth / 2)} L ${n(width * 0.18)} ${n(depth / 2)}` +
        ` M ${n(width * 0.18)} ${n(-depth / 2)} L ${n(-width * 0.18)} ${n(depth / 2)}"` +
        ` stroke="${c('cf-plan-pole')}" stroke-width="0.14" stroke-linecap="round" fill="none"/>`
      );

    case 'wall': {
      const d = Math.min(depth, 0.7);
      return (
        `<rect x="${n(-width / 2)}" y="${n(-d / 2)}" width="${n(width)}" height="${n(d)}" rx="0.1"` +
        ` fill="${c('cf-plan-wall')}"/>` +
        `<line x1="${n(-width / 2 + 0.1)}" y1="${n(-d / 2 + 0.14)}" x2="${n(width / 2 - 0.1)}" y2="${n(-d / 2 + 0.14)}"` +
        ` stroke="${c('cf-plan-stand')}" stroke-width="0.1"/>`
      );
    }

    case 'gate': {
      const d = Math.min(depth, 0.5);
      const bars = 4;
      const step = width / (bars + 1);
      const uprights = Array.from({ length: bars }, (_, i) => {
        const x = -width / 2 + step * (i + 1);
        return `<line x1="${n(x)}" y1="${n(-d / 2)}" x2="${n(x)}" y2="${n(d / 2)}" stroke="${c('cf-plan-pole-dark')}" stroke-width="0.08"/>`;
      }).join('');
      return (
        `<rect x="${n(-width / 2)}" y="${n(-d / 2)}" width="${n(width)}" height="${n(d)}" rx="0.08"` +
        ` fill="${c('cf-plan-paper')}" stroke="${c('cf-plan-pole-dark')}" stroke-width="0.1"/>` +
        uprights
      );
    }

    case 'liverpool':
    case 'liverpoolVertical':
      return water(width, depth, c) + pole(width, 0, c);

    case 'liverpoolOxer':
      return water(width, depth, c) + spreadPoles(width, depth * 0.8, 2, c);

    case 'waterJump':
      return water(width, depth, c, true);

    case 'combination': {
      const count = element?.combinationElementCount ?? 2;
      const types = element?.combinationElementTypes ?? ['vertical', 'vertical', 'vertical'];
      const first = element?.combinationFirstDistanceMeters ?? 7;
      const second = element?.combinationSecondDistanceMeters ?? 7;
      const offsets = count === 2 ? [0, first] : [0, first, first + second];
      const span = offsets[offsets.length - 1] ?? 0;
      return offsets
        .map((offset, i) => {
          const partType = (types[i] ?? 'vertical') as ElementType;
          const partDepth = SYMBOL_DEFAULTS[partType]?.depth ?? 0.8;
          return `<g transform="translate(0 ${n(offset - span / 2)})">${symbolMarkup(partType, width, partDepth, undefined, style)}</g>`;
        })
        .join('');
    }

    case 'startMarker':
    case 'finishMarker': {
      const label = type === 'startMarker' ? 'START' : 'FINISH';
      // The app stores these as 2.0 × 0.5 m, which at plan scale makes the word
      // unreadable. Like the app's own arena view, the marker is drawn as a
      // label rather than to scale: a floor of 4 m long and 1.5 m deep.
      const w = Math.max(width, 4);
      const d = Math.max(depth, 1.5);
      return (
        `<rect x="${n(-w / 2)}" y="${n(-d / 2)}" width="${n(w)}" height="${n(d)}" rx="${n(d / 2)}"` +
        ` fill="${c('cf-plan-marker')}" stroke="${c('cf-plan-pole-dark')}" stroke-width="0.1"/>` +
        `<text x="0" y="${n(d * 0.3)}" text-anchor="middle" font-size="${n(d * 0.66)}"` +
        ` font-weight="700" fill="${c('cf-plan-pole-dark')}" font-family="${font}">${label}</text>`
      );
    }

    default:
      // Decorations, jury box and entrances are deliberately not drawn.
      return '';
  }
}

/** A standalone symbol tile for /features: its own viewBox with a little air. */
export function standaloneSymbol(type: ElementType): { markup: string; viewBox: string; width: number; height: number } {
  const size = SYMBOL_DEFAULTS[type] ?? { width: 3, depth: 1 };
  const pad = 0.6;
  const w = size.width + pad * 2;
  const h = Math.max(size.depth, 1.2) + pad * 2;
  return {
    markup: symbolMarkup(type, size.width, size.depth),
    viewBox: `${n(-w / 2)} ${n(-h / 2)} ${n(w)} ${n(h)}`,
    width: Math.round(w * 28),
    height: Math.round(h * 28),
  };
}
