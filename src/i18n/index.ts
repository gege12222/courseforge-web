import { DEFAULT_LOCALE, LOCALES, type Locale } from '../config/site.ts';
import { en, type UIStrings } from './en.ts';
import { hu } from './hu.ts';

const dictionaries: Record<Locale, UIStrings> = { en, hu };

/** Strings for a locale. Falls back to the default locale only for an unknown code. */
export function useTranslations(locale: Locale): UIStrings {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Locale of a built path, from its prefix. '/hu/palyak' -> 'hu', '/courses' -> 'en'. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

const DATE_LOCALES: Record<Locale, string> = { en: 'en-GB', hu: 'hu-HU' };

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Metres with the locale's decimal separator: 12.5 -> "12.5 m" / "12,5 m". */
export function formatMetres(value: number, locale: Locale, decimals = 0): string {
  const n = new Intl.NumberFormat(DATE_LOCALES[locale], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${n} m`;
}

/** Fence height stored in centimetres, shown the way riders say it. */
export function formatFenceHeight(cm: number, locale: Locale): string {
  if (cm < 100) return `${cm} cm`;
  const metres = (cm / 100).toFixed(2);
  return `${locale === 'hu' ? metres.replace('.', ',') : metres} m`;
}

export type { UIStrings };
export { en, hu };
