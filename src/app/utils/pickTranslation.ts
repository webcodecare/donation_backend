import { DEFAULT_LANG, type Lang } from "../config/i18n";

type WithTranslations<T> = T & { translations?: Array<{ lang: string } & Record<string, any>> };

const TRANSLATION_META = new Set(["id", "lang", "createdAt", "updatedAt"]);

const overlay = <T extends Record<string, any>>(entity: T, translation: Record<string, any>): T => {
  const out: Record<string, any> = { ...entity };
  for (const [key, value] of Object.entries(translation)) {
    if (TRANSLATION_META.has(key)) continue;
    if (key.endsWith("Id")) continue;
    if (value == null) continue;
    out[key] = value;
  }
  return out as T;
};

/**
 * Resolves a single entity's translatable fields against `lang`.
 * Falls back to the default language, then to the original entity fields.
 * Keeps the `translations` array on the result so clients can see all options.
 */
export function resolveTranslation<T extends Record<string, any>>(
  entity: WithTranslations<T> | null | undefined,
  lang: Lang
): T | null {
  if (!entity) return null;
  const translations = entity.translations ?? [];
  const match = translations.find((t) => t.lang === lang);
  const fallback = lang === DEFAULT_LANG ? null : translations.find((t) => t.lang === DEFAULT_LANG);
  let out: Record<string, any> = { ...entity };
  if (fallback) out = overlay(out, fallback);
  if (match) out = overlay(out, match);
  return out as T;
}

export function resolveTranslationList<T extends Record<string, any>>(
  list: Array<WithTranslations<T>> | null | undefined,
  lang: Lang
): T[] {
  if (!list) return [];
  return list.map((item) => resolveTranslation(item, lang) as T);
}
