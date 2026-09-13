/**
 * Course OG backgrounds: a 1200×630 navy card with the course plan rasterised
 * into its right-hand side. astro-og-canvas then draws the title and
 * description over the empty left half, so a course's social card is generated
 * from the same file the reader downloads — one renderer, no hand-made images.
 *
 * The plan SVG is rasterised with sharp. Its only text is obstacle numbers and
 * START/FINISH, drawn with a generic `sans-serif` family, because the build
 * machine has no webfont — see render.ts `forRaster`. `assertRendered` fails the
 * build loudly if the rasteriser produced an empty card, rather than shipping
 * blank social images nobody notices for a month.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { rasterPlan, type LoadedCourse } from './courses.ts';
import { RASTER_TOKENS } from './course-plan/raster.ts';

const CACHE_DIR = join('node_modules', '.cache', 'cf-og-plans');
const WIDTH = 1200;
const HEIGHT = 630;
/** The plan sits in the right half; text gets the left. */
const PLAN_BOX = { width: 480, height: 520 };

export async function coursePlanBackground(course: LoadedCourse): Promise<string> {
  await mkdir(CACHE_DIR, { recursive: true });
  const target = join(CACHE_DIR, `${course.locale}-${course.slug}.png`);

  const plan = rasterPlan(course.file);
  const planPng = await sharp(Buffer.from(plan.svg))
    .resize({ ...PLAN_BOX, fit: 'inside' })
    .png()
    .toBuffer();
  const planMeta = await sharp(planPng).metadata();

  await assertRendered(planPng, `course plan for ${course.slug}`);

  // astro-og-canvas has no max-width for text: the title spans the full card
  // minus its padding, so a long course name would run across the plan. This
  // scrim keeps the left side readable whatever the title length, and leaves the
  // plan visible on the right.
  const navy = RASTER_TOKENS['cf-navy'];
  const scrim = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">` +
      `<defs><linearGradient id="s" x1="0" x2="1" y1="0" y2="0">` +
      `<stop offset="0" stop-color="${navy}" stop-opacity="1"/>` +
      `<stop offset="0.52" stop-color="${navy}" stop-opacity="0.96"/>` +
      `<stop offset="0.72" stop-color="${navy}" stop-opacity="0"/>` +
      `</linearGradient></defs>` +
      `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#s)"/></svg>`,
  );

  const card = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: navy,
    },
  })
    .composite([
      {
        input: planPng,
        top: Math.round((HEIGHT - (planMeta.height ?? PLAN_BOX.height)) / 2),
        left: WIDTH - (planMeta.width ?? PLAN_BOX.width) - 48,
      },
      { input: scrim },
    ])
    .png()
    .toBuffer();

  await writeFile(target, card);
  return `./${target.split('\\').join('/')}`;
}

/**
 * A rasterised SVG that came out uniform is a rendering failure, not a design.
 * Cheap guard: count distinct-ish luminance buckets.
 */
async function assertRendered(png: Buffer, label: string): Promise<void> {
  const { data } = await sharp(png).greyscale().resize(64, 64, { fit: 'fill' }).raw().toBuffer({
    resolveWithObject: true,
  });
  const buckets = new Set<number>();
  for (const value of data) buckets.add(value >> 4);
  if (buckets.size < 3) {
    throw new Error(
      `OG rasteriser produced a blank image for ${label}. ` +
        `sharp could not render the plan SVG — check that libvips has a usable sans-serif font.`,
    );
  }
}
