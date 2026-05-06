"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMeta = exports.parsePagination = void 0;
const parsePagination = (query) => {
    const rawPage = Number(query?.page);
    const rawLimit = Number(query?.limit);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, Math.floor(rawLimit)) : 10;
    const search = typeof query?.search === "string"
        ? query.search.trim()
        : "";
    return { page, limit, skip: (page - 1) * limit, search };
};
exports.parsePagination = parsePagination;
const buildMeta = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
});
exports.buildMeta = buildMeta;
