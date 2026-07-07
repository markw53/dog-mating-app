// Safe parsing for user-supplied pagination query params: NaN and
// out-of-range values fall back to sane defaults instead of reaching Prisma
export function parsePagination(
  pageRaw: unknown,
  limitRaw: unknown,
  { defaultLimit = 12, maxLimit = 100 } = {},
) {
  const page = Math.max(1, parseInt(String(pageRaw), 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(String(limitRaw), 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function parseIntSafe(raw: unknown, fallback: number): number {
  const value = parseInt(String(raw), 10);
  return Number.isNaN(value) ? fallback : value;
}
