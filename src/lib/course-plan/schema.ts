/**
 * Reader and validator for `.courseforge` files.
 *
 * The schema mirrors CourseFileService in the Flutter app
 * (course_forge/lib/features/saved_courses/data/course_file_service.dart) and
 * the models it serialises. It is deliberately strict about the things the app
 * itself validates on import — format id, format version, a non-empty name,
 * positive arena dimensions — so a file that this site accepts is a file the
 * app will accept too.
 *
 * Unknown fields are allowed and ignored: a future formatVersion 2 that only
 * adds fields should not break the website. A version we do not know how to
 * read fails the build loudly instead.
 */
import { z } from 'zod';
import { COURSE_FILE } from '../../config/site.ts';

/** Every CourseElementType in the app, in declaration order. */
export const ELEMENT_TYPES = [
  'vertical',
  'oxer',
  'tripleBar',
  'crossRail',
  'wall',
  'gate',
  'liverpool',
  'waterJump',
  'cavaletti',
  'combination',
  'startMarker',
  'finishMarker',
  'flowerBox',
  'flowers',
  'bush',
  'tree',
  'cone',
  'flag',
  'obstacleNumber',
  'judgeBooth',
  'entrance',
  'exit',
  'liverpoolVertical',
  'liverpoolOxer',
  'entranceExit',
] as const;

export type ElementType = (typeof ELEMENT_TYPES)[number];

/** CourseElementTypeClassification.isJump in the app. */
export const JUMP_TYPES = new Set<ElementType>([
  'vertical',
  'oxer',
  'tripleBar',
  'crossRail',
  'wall',
  'gate',
  'liverpool',
  'liverpoolVertical',
  'liverpoolOxer',
  'waterJump',
  'cavaletti',
  'combination',
]);

const elementType = z.enum(ELEMENT_TYPES);

const courseElement = z.object({
  id: z.string().min(1),
  type: elementType,
  xMeters: z.number(),
  yMeters: z.number(),
  widthMeters: z.number().positive(),
  depthMeters: z.number().positive(),
  rotationDegrees: z.number(),
  layerIndex: z.number().int(),
  label: z.string().nullable().default(null),
  combinationElementCount: z.number().int().min(2).max(3).default(2),
  combinationElementTypes: z.array(elementType).default(['vertical', 'vertical', 'vertical']),
  combinationFirstDistanceMeters: z.number().default(7),
  combinationSecondDistanceMeters: z.number().default(7),
});

const measurementLine = z.object({
  id: z.string().min(1),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
});

const routeStep = z.object({
  id: z.string().min(1),
  type: z.enum(['start', 'jump', 'finish']),
  courseElementId: z.string().nullable().default(null),
  sequenceIndex: z.number().int(),
  obstacleNumber: z.number().int().nullable().default(null),
  combinationLetter: z.string().nullable().default(null),
  jumpDirection: z.enum(['forward', 'reverse']).default('forward'),
  includeInDistanceCalculation: z.boolean().default(true),
  connectionType: z.enum(['normal', 'relatedLine', 'combination', 'manual']).default('normal'),
  labelOffsetMeters: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
  numberSide: z.enum(['left', 'middle', 'right']).default('middle'),
});

const routeDefinition = z.object({
  steps: z.array(routeStep).default([]),
  routeVisible: z.boolean().default(false),
  manualControlPoints: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        transitionIndex: z.number().int(),
        positionMeters: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .default([]),
});

export const courseFileSchema = z.object({
  format: z.literal(COURSE_FILE.formatId),
  formatVersion: z.number().int().min(1).max(COURSE_FILE.formatVersion),
  exportedAt: z.string().optional(),
  course: z.object({
    name: z.string().trim().min(1).max(120),
    arenaWidthMeters: z.number().positive(),
    arenaLengthMeters: z.number().positive(),
    surfaceType: z.enum(['sand', 'grass', 'indoorFooting', 'custom']).default('sand'),
    /** ARGB packed into a 32-bit int, as Flutter's Color.toARGB32() writes it. */
    surfaceColorValue: z.number().int().default(0xffe3c995),
    strideMode: z.enum(['horse', 'pony', 'custom']).default('horse'),
    customStrideMeters: z.number().nullable().default(null),
    elements: z.array(courseElement).default([]),
    measurements: z.array(measurementLine).default([]),
    routeDefinition: routeDefinition.default({ steps: [], routeVisible: false, manualControlPoints: [] }),
  }),
});

export type CourseFile = z.infer<typeof courseFileSchema>;
export type CourseElement = z.infer<typeof courseElement>;
export type RouteStep = z.infer<typeof routeStep>;
export type MeasurementLine = z.infer<typeof measurementLine>;

/**
 * Parse a course file. Throws with the offending path and file name — the build
 * must fail loudly rather than emit a broken preview.
 */
export function parseCourseFile(raw: string, source: string): CourseFile {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${source} is not valid JSON: ${(error as Error).message}`);
  }

  const result = courseFileSchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`${source} is not a valid CourseForge course file:\n${issues}`);
  }
  return result.data;
}

/** Flutter packs colours as ARGB; CSS wants #RRGGBB. */
export function argbToHex(value: number): string {
  const rgb = (value & 0x00ffffff).toString(16).padStart(6, '0');
  return `#${rgb}`;
}
