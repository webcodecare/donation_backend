export const SUPPORTED_LANGS = ["en", "az"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = "en";

export const isLang = (value: unknown): value is Lang =>
  typeof value === "string" && (SUPPORTED_LANGS as readonly string[]).includes(value);
