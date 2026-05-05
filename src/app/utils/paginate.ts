export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  search: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const parsePagination = (query: any): PaginationParams => {
  const rawPage = Number(query?.page);
  const rawLimit = Number(query?.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, Math.floor(rawLimit)) : 10;

  const search =
    typeof query?.search === "string"
      ? query.search.trim()
      : "";

  return { page, limit, skip: (page - 1) * limit, search };
};

export const buildMeta = (page: number, limit: number, total: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
});
