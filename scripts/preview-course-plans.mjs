/**
 * Render every course file in public/courses to docs/plans/ as SVG and PNG so
 * the plans can be eyeballed without starting the dev server.
 *
 *   node scripts/preview-course-plans.mjs
 *
 * The same renderer the site uses, so what you see here is what ships.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parseCourseFile } from '../src/lib/course-plan/schema.ts';
import { renderCoursePlan } from '../src/lib/course-plan/render.ts';
import { RASTER_TOKENS } from '../src/lib/course-plan/raster.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'public/courses');
const out = join(root, 'docs/plans');
await mkdir(out, { recursive: true });

const files = (await readdir(source)).filter((f) => f.endsWith('.courseforge'));
if (files.length === 0) throw new Error('no .courseforge files in public/courses');

for (const file of files) {
  const raw = await readFile(join(source, file), 'utf8');
  const parsed = parseCourseFile(raw, `public/courses/${file}`);
  const name = basename(file, '.courseforge');

  const inline = renderCoursePlan(parsed);
  await writeFile(join(out, `${name}.svg`), inline.svg);

  const raster = renderCoursePlan(parsed, { forRaster: true, tokens: RASTER_TOKENS });
  await sharp(Buffer.from(raster.svg)).resize({ width: 1000 }).png().toFile(join(out, `${name}.png`));

  console.log(
    `${name}: ${inline.meta.arenaWidthMetres}×${inline.meta.arenaLengthMetres} m · ` +
      `${inline.meta.numberedObstacles} numbered · route ${inline.meta.routeLengthMetres} m · ` +
      `${(inline.svg.length / 1024).toFixed(1)} kB svg`,
  );
}
