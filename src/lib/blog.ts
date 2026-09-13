/**
 * Blog loading and the translation pairing.
 *
 * A post may exist in one language only. `translationKey` is what links a pair,
 * and `availableLocales` below is what the SEO component uses to decide which
 * hreflang tags may be emitted — so a Hungarian-only post never advertises an
 * English URL that would 404.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { LOCALES, type Locale } from '../config/site.ts';

export interface LoadedPost {
  entry: CollectionEntry<'blog'>;
  slug: string;
  locale: Locale;
  availableLocales: Locale[];
  readingMinutes: number;
}

/** 'en/walking-distances' -> 'walking-distances' */
function slugOf(id: string): string {
  const parts = id.split('/');
  return parts.length > 1 ? parts.slice(1).join('/') : (parts[0] ?? id);
}

export async function loadPosts(locale?: Locale): Promise<LoadedPost[]> {
  const all = await getCollection('blog', ({ data }) => !data.draft);

  const localesByKey = new Map<string, Locale[]>();
  for (const entry of all) {
    const key = entry.data.translationKey;
    localesByKey.set(key, [...(localesByKey.get(key) ?? []), entry.data.lang]);
  }

  return all
    .filter((entry) => !locale || entry.data.lang === locale)
    .map((entry) => ({
      entry,
      slug: slugOf(entry.id),
      locale: entry.data.lang,
      availableLocales: (localesByKey.get(entry.data.translationKey) ?? [entry.data.lang]).filter(
        (value, index, array) => array.indexOf(value) === index,
      ),
      readingMinutes: Math.max(1, Math.round(entry.body ? entry.body.split(/\s+/).length / 200 : 1)),
    }))
    .sort((a, b) => b.entry.data.publishedAt.valueOf() - a.entry.data.publishedAt.valueOf());
}

/**
 * The slug of a post's counterpart in another locale, when it exists. Slugs are
 * allowed to differ between languages, so this looks the pair up by key.
 */
export async function counterpartSlug(key: string, locale: Locale): Promise<string | undefined> {
  const all = await getCollection('blog', ({ data }) => !data.draft);
  const match = all.find((entry) => entry.data.translationKey === key && entry.data.lang === locale);
  return match ? slugOf(match.id) : undefined;
}

/** Every tag used in a locale, with its post count, most used first. */
export async function loadTags(locale: Locale): Promise<{ tag: string; count: number }[]> {
  const posts = await loadPosts(locale);
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.entry.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** URL-safe form of a tag. Hungarian tags contain spaces and accents. */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export { LOCALES };
