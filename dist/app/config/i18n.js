"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLang = exports.DEFAULT_LANG = exports.SUPPORTED_LANGS = void 0;
exports.SUPPORTED_LANGS = ["en", "az"];
exports.DEFAULT_LANG = "en";
const isLang = (value) => typeof value === "string" && exports.SUPPORTED_LANGS.includes(value);
exports.isLang = isLang;
