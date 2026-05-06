"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTranslation = resolveTranslation;
exports.resolveTranslationList = resolveTranslationList;
const i18n_1 = require("../config/i18n");
const TRANSLATION_META = new Set(["id", "lang", "createdAt", "updatedAt"]);
const overlay = (entity, translation) => {
    const out = { ...entity };
    for (const [key, value] of Object.entries(translation)) {
        if (TRANSLATION_META.has(key))
            continue;
        if (key.endsWith("Id"))
            continue;
        if (value == null)
            continue;
        out[key] = value;
    }
    return out;
};
/**
 * Resolves a single entity's translatable fields against `lang`.
 * Falls back to the default language, then to the original entity fields.
 * Keeps the `translations` array on the result so clients can see all options.
 */
function resolveTranslation(entity, lang) {
    if (!entity)
        return null;
    const translations = entity.translations ?? [];
    const match = translations.find((t) => t.lang === lang);
    const fallback = lang === i18n_1.DEFAULT_LANG ? null : translations.find((t) => t.lang === i18n_1.DEFAULT_LANG);
    let out = { ...entity };
    if (fallback)
        out = overlay(out, fallback);
    if (match)
        out = overlay(out, match);
    return out;
}
function resolveTranslationList(list, lang) {
    if (!list)
        return [];
    return list.map((item) => resolveTranslation(item, lang));
}
