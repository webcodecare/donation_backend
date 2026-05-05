import { Request, Response, NextFunction } from "express";
import { DEFAULT_LANG, isLang, type Lang } from "../config/i18n";

declare global {
  namespace Express {
    interface Request {
      lang: Lang;
    }
  }
}

const parseAcceptLanguage = (header: string | undefined): Lang | null => {
  if (!header) return null;
  // Take the first 2-letter code and check.
  for (const part of header.split(",")) {
    const code = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return null;
};

const attachLang = (req: Request, _res: Response, next: NextFunction) => {
  const queryLang = typeof req.query.lang === "string" ? req.query.lang.toLowerCase() : null;
  const headerLang = parseAcceptLanguage(req.headers["accept-language"] as string | undefined);

  req.lang = (isLang(queryLang) ? queryLang : headerLang) ?? DEFAULT_LANG;
  next();
};

export default attachLang;
