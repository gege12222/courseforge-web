import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { LOCALES } from './config/site.ts';

const locale = z.enum(LOCALES);

/**
 * Courses. One Markdown file per course per language, both using the SAME file
 * name — that shared name is the URL slug, which is what pairs /courses/x with
 * /hu/palyak/x for hreflang.
 *
 * There is deliberately no previewImage: the plan on the page and the OG image
 * are rendered at build time from `courseFile`, so a preview cannot disagree
 * with the course it claims to show. `arenaSize` is likewise derived from the
 * file; the optional field here exists only so a mismatch can be caught.
 */
const courses = defineCollection({
  loader: glob({ base: './src/content/courses', pattern: '**/[^_]*.md' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(300),
    difficulty: z.enum(['beginner', 'club', 'regional', 'national']),
    /** Fence height in centimetres — 110 means 1.10 m. Sorts and filters cleanly. */
    fenceHeight: z.number().int().min(20).max(200),
    /** Optional cross-check, e.g. "50 × 60". The plan is the source of truth. */
    arenaSize: z.string().optional(),
    designer: z.string().min(1),
    discipline: z.enum(['showjumping', 'schooling', 'pony']),
    publishedAt: z.coerce.date(),
    /** File name inside public/courses, including the extension. */
    courseFile: z.string().regex(/^[a-z0-9-]+\.courseforge$/, 'must be a .courseforge file name'),
    /** Overrides DEFAULT_COURSE_LICENSE from src/config/site.ts. */
    license: z.enum(['free-to-ride']).optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Blog. A post may exist in one language only. `translationKey` links a pair
 * when both exist, and hreflang is emitted only for the counterparts that are
 * really there.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1).max(300),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().min(1),
      tags: z.array(z.string().min(1)).default([]),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      lang: locale,
      /** Shared id across languages. Two posts with the same key are a pair. */
      translationKey: z.string().min(1),
      draft: z.boolean().default(false),
    }),
});

/** Privacy, terms and cookies prose. Titles and dates come from frontmatter. */
const legal = defineCollection({
  loader: glob({ base: './src/content/legal', pattern: '**/[^_]*.md' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(300),
    updated: z.coerce.date(),
    /**
     * Shows the "not final, must be reviewed" banner. Set it to false once a
     * document has been through legal review and is the version you intend to
     * publish — the banner is a real warning, not decoration, so it should not
     * outlive the state it describes.
     */
    reviewNotice: z.boolean().default(true),
  }),
});

export const collections = { courses, blog, legal };
