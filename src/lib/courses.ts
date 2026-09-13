/**
 * Course loading: pair each Markdown entry with the `.courseforge` file it names,
 * render the plan, and derive the facts that must not be duplicated by hand.
 *
 * A build fails if a course names a file that is missing or malformed, or if its
 * optional `arenaSize` contradicts the file — the whole point of rendering from
 * the file is that a preview can never disagree with the download.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_COURSE_LICENSE, LOCALES, type Locale } from '../config/site.ts';
import { parseCourseFile, type CourseFile } from './course-plan/schema.ts';
import { renderCoursePlan, type CoursePlan } from './course-plan/render.ts';
import { RASTER_TOKENS } from './course-plan/raster.ts';

const COURSES_DIR = join(process.cwd(), 'public', 'courses');
const cache = new Map<string, CourseFile>();

export async function readCourseFile(fileName: string): Promise<CourseFile> {
  const cached = cache.get(fileName);
  if (cached) return cached;
  let raw: string;
  try {
    raw = await readFile(join(COURSES_DIR, fileName), 'utf8');
  } catch {
    throw new Error(
      `Course file public/courses/${fileName} does not exist. ` +
        `A course's frontmatter must name a file that is actually committed.`,
    );
  }
  const parsed = parseCourseFile(raw, `public/courses/${fileName}`);
  cache.set(fileName, parsed);
  return parsed;
}

export interface LoadedCourse {
  entry: CollectionEntry<'courses'>;
  /** File name without the locale folder — this is the URL slug. */
  slug: string;
  locale: Locale;
  file: CourseFile;
  plan: CoursePlan;
  license: string;
  /** Locales this course has a Markdown file for. */
  availableLocales: Locale[];
}

/** 'en/grand-prix-110' -> { locale: 'en', slug: 'grand-prix-110' } */
function splitId(id: string): { locale: Locale; slug: string } {
  const [first, ...rest] = id.split('/');
  const locale = (LOCALES as readonly string[]).includes(first ?? '') ? (first as Locale) : 'en';
  return { locale, slug: rest.join('/') || (first ?? '') };
}

export async function loadCourses(locale?: Locale): Promise<LoadedCourse[]> {
  const all = await getCollection('courses', ({ data }) => !data.draft);

  const localesBySlug = new Map<string, Locale[]>();
  for (const entry of all) {
    const { locale: entryLocale, slug } = splitId(entry.id);
    localesBySlug.set(slug, [...(localesBySlug.get(slug) ?? []), entryLocale]);
  }

  const loaded: LoadedCourse[] = [];
  for (const entry of all) {
    const { locale: entryLocale, slug } = splitId(entry.id);
    if (locale && entryLocale !== locale) continue;

    const file = await readCourseFile(entry.data.courseFile);
    const plan = renderCoursePlan(file, { label: entry.data.title });

    const derived = `${plan.meta.arenaWidthMetres} × ${plan.meta.arenaLengthMetres}`;
    if (entry.data.arenaSize && entry.data.arenaSize.replace(/\s/g, '') !== derived.replace(/\s/g, '')) {
      throw new Error(
        `Course ${entry.id}: frontmatter arenaSize "${entry.data.arenaSize}" does not match ` +
          `the course file, which is ${derived} m. Fix the frontmatter or remove the field.`,
      );
    }

    loaded.push({
      entry,
      slug,
      locale: entryLocale,
      file,
      plan,
      license: entry.data.license ?? DEFAULT_COURSE_LICENSE,
      availableLocales: localesBySlug.get(slug) ?? [entryLocale],
    });
  }

  return loaded.sort((a, b) => b.entry.data.publishedAt.valueOf() - a.entry.data.publishedAt.valueOf());
}

/** The raster-safe plan for OG images: literal colours, generic font. */
export function rasterPlan(file: CourseFile): CoursePlan {
  return renderCoursePlan(file, { forRaster: true, tokens: RASTER_TOKENS });
}

/** Filter buckets for the courses index. Values are stable ids, not labels. */
export const HEIGHT_BUCKETS = [
  { id: 'upTo80', max: 80 },
  { id: 'ninetyToHundred', max: 100 },
  { id: 'oneTenToOneTwenty', max: 120 },
  { id: 'overOneThirty', max: Infinity },
] as const;

export type HeightBucketId = (typeof HEIGHT_BUCKETS)[number]['id'];

export function heightBucket(cm: number): HeightBucketId {
  return (HEIGHT_BUCKETS.find((bucket) => cm <= bucket.max) ?? HEIGHT_BUCKETS[3]).id;
}
