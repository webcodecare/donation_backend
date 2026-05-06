"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = require("../config/i18n");
const parseAcceptLanguage = (header) => {
    if (!header)
        return null;
    // Take the first 2-letter code and check.
    for (const part of header.split(",")) {
        const code = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
        if ((0, i18n_1.isLang)(code))
            return code;
    }
    return null;
};
const attachLang = (req, _res, next) => {
    const queryLang = typeof req.query.lang === "string" ? req.query.lang.toLowerCase() : null;
    const headerLang = parseAcceptLanguage(req.headers["accept-language"]);
    req.lang = ((0, i18n_1.isLang)(queryLang) ? queryLang : headerLang) ?? i18n_1.DEFAULT_LANG;
    next();
};
exports.default = attachLang;
