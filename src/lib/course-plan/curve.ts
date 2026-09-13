/**
 * Catmull-Rom curve helpers, shared by the course-plan renderer and the hero
 * scene so there is one definition of "a smooth line through these points".
 */

export interface Point {
  x: number;
  y: number;
}

export interface SampledPoint extends Point {
  /** Tangent direction in degrees, for rotating something onto the line. */
  angle: number;
}

const n = (value: number) => Number(value.toFixed(3)).toString();

/** Catmull-Rom through the points, emitted as cubic Béziers. */
export function smoothPath(points: Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${n(points[0]!.x)} ${n(points[0]!.y)} L ${n(points[1]!.x)} ${n(points[1]!.y)}`;
  }
  const parts = [`M ${n(points[0]!.x)} ${n(points[0]!.y)}`];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    parts.push(`C ${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(p2.x)} ${n(p2.y)}`);
  }
  return parts.join(' ');
}

/** Position on the Catmull-Rom spline at parameter t within segment i. */
function at(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
}

/** Dense polyline along the whole spline, used for lengths and for spacing. */
function polyline(points: Point[], perSegment = 24): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    for (let s = 0; s < perSegment; s += 1) out.push(at(p0, p1, p2, p3, s / perSegment));
  }
  out.push(points[points.length - 1]!);
  return out;
}

/** Approximate length of the smoothed path. */
export function pathLength(points: Point[]): number {
  const line = polyline(points, 12);
  let total = 0;
  for (let i = 1; i < line.length; i += 1) {
    total += Math.hypot(line[i]!.x - line[i - 1]!.x, line[i]!.y - line[i - 1]!.y);
  }
  return total;
}

/**
 * `count` points spread evenly *by distance* along the curve, each with the
 * tangent angle there. Even spacing matters for hoofprints: parameter-spaced
 * points bunch up on the tight parts of a bend and look wrong.
 */
export function samplePath(points: Point[], count: number, from = 0, to = 1): SampledPoint[] {
  const line = polyline(points, 32);
  const cumulative: number[] = [0];
  for (let i = 1; i < line.length; i += 1) {
    cumulative.push(cumulative[i - 1]! + Math.hypot(line[i]!.x - line[i - 1]!.x, line[i]!.y - line[i - 1]!.y));
  }
  const total = cumulative[cumulative.length - 1] ?? 0;

  const pointAtDistance = (distance: number): Point => {
    let i = 1;
    while (i < cumulative.length && cumulative[i]! < distance) i += 1;
    const before = line[i - 1]!;
    const after = line[Math.min(i, line.length - 1)]!;
    const span = (cumulative[i] ?? total) - cumulative[i - 1]!;
    const ratio = span === 0 ? 0 : (distance - cumulative[i - 1]!) / span;
    return { x: before.x + (after.x - before.x) * ratio, y: before.y + (after.y - before.y) * ratio };
  };

  const start = total * from;
  const end = total * to;
  const step = count > 1 ? (end - start) / (count - 1) : 0;

  return Array.from({ length: count }, (_, i) => {
    const distance = start + step * i;
    const here = pointAtDistance(distance);
    const ahead = pointAtDistance(Math.min(distance + Math.max(total * 0.004, 0.05), total));
    return {
      ...here,
      angle: (Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180) / Math.PI,
    };
  });
}
