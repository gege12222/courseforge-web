/**
 * Build-time `.courseforge` → SVG arena plan.
 *
 * Deliberately a thumbnail renderer, not a second implementation of the app's
 * route engine. It draws the arena, the jumps, the markers, the numbers from
 * routeDefinition.steps, and the ride as one smoothed polyline through the
 * ordered anchors. It does NOT reproduce RouteGenerationService's approach and
 * landing anchors, curve dots or Bézier transitions — if it reads correctly at
 * 600 px wide, it is doing its job.
 *
 * Decorations, the jury box and entrances/exits are skipped: at this size they
 * are noise.
 */
import { JUMP_TYPES, argbToHex, type CourseElement, type CourseFile } from './schema.ts';
import { cssVarColour, literalColour, symbolMarkup, type SymbolStyle } from './symbols.ts';
import { pathLength, smoothPath, type Point } from './curve.ts';

/** Metres of clear space around the arena, for numbers that sit outside it. */
const PAD = 3.5;
/** The app's default grid spacing (AppSettings.gridSpacingMeters). */
const GRID = 5;
const PX_PER_M = 14;

export interface CoursePlan {
  svg: string;
  width: number;
  height: number;
  meta: {
    arenaWidthMetres: number;
    arenaLengthMetres: number;
    surfaceHex: string;
    numberedObstacles: number;
    routeLengthMetres: number | null;
    hasRoute: boolean;
  };
}

const n = (value: number) => Number(value.toFixed(3)).toString();
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Unit vector along the obstacle's width. Rotation is clockwise, +y down. */
function tangent(rotationDegrees: number): Point {
  const t = rad(rotationDegrees);
  return { x: Math.cos(t), y: Math.sin(t) };
}

/** Forward normal: the tangent turned 90° clockwise in screen coordinates. */
function normal(rotationDegrees: number, reverse = false): Point {
  const t = tangent(rotationDegrees);
  const f = { x: -t.y, y: t.x };
  return reverse ? { x: -f.x, y: -f.y } : f;
}

const centreOf = (element: CourseElement): Point => ({ x: element.xMeters, y: element.yMeters });

/**
 * Render a plan.
 *
 * `forRaster` swaps CSS variables for literal colours and the display font for
 * a generic family, because the OG rasteriser has no stylesheet and no webfont.
 * The literals are read from the token values, passed in by the caller.
 */
export function renderCoursePlan(
  file: CourseFile,
  options: { forRaster?: boolean; tokens?: Record<string, string>; label?: string } = {},
): CoursePlan {
  const { course } = file;
  const { forRaster = false, tokens = {} } = options;

  const colour = forRaster ? literalColour(tokens) : cssVarColour;
  const font = forRaster ? 'sans-serif' : 'var(--cf-font-display, sans-serif)';
  const style: SymbolStyle = { colour, font };

  const W = course.arenaWidthMeters;
  const L = course.arenaLengthMeters;
  const surfaceHex = argbToHex(course.surfaceColorValue);

  const byId = new Map(course.elements.map((element) => [element.id, element]));
  const steps = [...course.routeDefinition.steps].sort((a, b) => a.sequenceIndex - b.sequenceIndex);

  const markers = course.elements.filter((e) => e.type === 'startMarker' || e.type === 'finishMarker');
  const jumps = course.elements
    .filter((e) => JUMP_TYPES.has(e.type))
    .sort((a, b) => a.layerIndex - b.layerIndex);

  /* ---------------------------------------------------------------- layers */

  const grid: string[] = [];
  for (let x = GRID; x < W; x += GRID) {
    grid.push(`<line x1="${n(x)}" y1="0" x2="${n(x)}" y2="${n(L)}"/>`);
  }
  for (let y = GRID; y < L; y += GRID) {
    grid.push(`<line x1="0" y1="${n(y)}" x2="${n(W)}" y2="${n(y)}"/>`);
  }

  const obstacles = jumps
    .map((element) => {
      const inner = symbolMarkup(element.type, element.widthMeters, element.depthMeters, element, style);
      if (!inner) return '';
      return `<g transform="translate(${n(element.xMeters)} ${n(element.yMeters)}) rotate(${n(element.rotationDegrees)})">${inner}</g>`;
    })
    .filter(Boolean);

  const markerMarkup = markers.map((element) => {
    const inner = symbolMarkup(element.type, element.widthMeters, element.depthMeters, element, style);
    return `<g transform="translate(${n(element.xMeters)} ${n(element.yMeters)}) rotate(${n(element.rotationDegrees)})">${inner}</g>`;
  });

  /* ------------------------------------------------------- route and arrows */

  const anchors: Point[] = [];
  const arrows: string[] = [];
  const numbers: string[] = [];
  const seenElement = new Map<string, number>();
  let numberedObstacles = 0;

  for (const step of steps) {
    const element = step.courseElementId ? byId.get(step.courseElementId) : undefined;

    if (step.type === 'jump' && element) {
      const centre = centreOf(element);
      anchors.push(centre);

      const dir = normal(element.rotationDegrees, step.jumpDirection === 'reverse');
      const reach = element.depthMeters / 2 + 0.9;
      arrows.push(
        `<line x1="${n(centre.x - dir.x * reach)}" y1="${n(centre.y - dir.y * reach)}"` +
          ` x2="${n(centre.x + dir.x * reach)}" y2="${n(centre.y + dir.y * reach)}"` +
          ` stroke="${colour('cf-plan-pole')}" stroke-width="0.16" marker-end="url(#cf-arrow)"/>`,
      );

      if (step.obstacleNumber !== null) {
        numberedObstacles += 1;
        const repeat = seenElement.get(element.id) ?? 0;
        seenElement.set(element.id, repeat + 1);

        const tan = tangent(element.rotationDegrees);
        const away = element.widthMeters / 2 + 1.5;
        let pos: Point;
        if (step.numberSide === 'left') {
          pos = { x: centre.x - tan.x * away, y: centre.y - tan.y * away };
        } else if (step.numberSide === 'right') {
          pos = { x: centre.x + tan.x * away, y: centre.y + tan.y * away };
        } else {
          const back = element.depthMeters / 2 + 1.7;
          pos = { x: centre.x - dir.x * back, y: centre.y - dir.y * back };
        }
        // Two steps on one element (a combination used twice): fan the labels.
        pos = {
          x: pos.x + step.labelOffsetMeters.x + tan.x * repeat * 1.6,
          y: pos.y + step.labelOffsetMeters.y + tan.y * repeat * 1.6,
        };

        const label = `${step.obstacleNumber}${step.combinationLetter ?? ''}`;
        numbers.push(
          `<g transform="translate(${n(pos.x)} ${n(pos.y)})">` +
            `<circle r="1.25" fill="${colour('cf-plan-paper')}" stroke="${colour('cf-plan-pole-dark')}" stroke-width="0.13"/>` +
            `<text y="0.5" text-anchor="middle" font-size="1.45" font-weight="700"` +
            ` fill="${colour('cf-plan-pole-dark')}"` +
            ` font-family="${font}">${label}</text>` +
            `</g>`,
        );
      }
      continue;
    }

    if (step.type === 'start' || step.type === 'finish') {
      const marker = markers.find((m) => m.type === (step.type === 'start' ? 'startMarker' : 'finishMarker'));
      if (marker) anchors.push(centreOf(marker));
    }
  }

  const hasRoute = anchors.length >= 2;
  const routePath = hasRoute ? smoothPath(anchors) : '';
  const routeLengthMetres = hasRoute ? Math.round(pathLength(anchors)) : null;

  /* ------------------------------------------------------------ measurements */

  // "Only if trivial" — a handful reads as information, a dozen reads as mess.
  const measurements =
    course.measurements.length > 0 && course.measurements.length <= 3
      ? course.measurements.map(
          (line) =>
            `<line x1="${n(line.startX)}" y1="${n(line.startY)}" x2="${n(line.endX)}" y2="${n(line.endY)}"` +
            ` stroke="${colour('cf-plan-measure')}" stroke-width="0.18" stroke-linecap="round"/>`,
        )
      : [];

  /* ------------------------------------------------------------------ output */

  const vbX = -PAD;
  const vbY = -PAD;
  const vbW = W + PAD * 2;
  const vbH = L + PAD * 2;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(vbX)} ${n(vbY)} ${n(vbW)} ${n(vbH)}"`,
    ` width="${Math.round(vbW * PX_PER_M)}" height="${Math.round(vbH * PX_PER_M)}"`,
    forRaster ? '' : ` role="img" aria-label="${escapeXml(options.label ?? course.name)}"`,
    `>`,
    `<defs><marker id="cf-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">`,
    `<path d="M 0 0 L 6 3 L 0 6 z" fill="${colour('cf-plan-pole')}"/></marker></defs>`,
    `<rect x="${n(vbX)}" y="${n(vbY)}" width="${n(vbW)}" height="${n(vbH)}" fill="${forRaster ? colour('cf-canvas') : 'transparent'}"/>`,
    `<rect x="0" y="0" width="${n(W)}" height="${n(L)}" fill="${surfaceHex}" stroke="${colour('cf-plan-pole-dark')}" stroke-width="0.22"/>`,
    `<g stroke="${colour('cf-plan-grid')}" stroke-width="0.07">${grid.join('')}</g>`,
    hasRoute
      ? `<path d="${routePath}" fill="none" stroke="${colour('cf-plan-route-ink')}" stroke-width="0.26"` +
        ` stroke-dasharray="1.3 1.1" stroke-linecap="round" opacity="0.85"/>`
      : '',
    measurements.join(''),
    obstacles.join(''),
    arrows.join(''),
    markerMarkup.join(''),
    numbers.join(''),
    `</svg>`,
  ].join('');

  return {
    svg,
    width: Math.round(vbW * PX_PER_M),
    height: Math.round(vbH * PX_PER_M),
    meta: {
      arenaWidthMetres: W,
      arenaLengthMetres: L,
      surfaceHex,
      numberedObstacles,
      routeLengthMetres,
      hasRoute,
    },
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
