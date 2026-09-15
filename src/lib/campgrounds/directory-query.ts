export const DIRECTORY_PAGE_SIZE = 24;

export const DIRECTORY_SORTS = ["recommended", "name", "price_asc", "price_desc", "recently_verified"] as const;
export type DirectorySort = (typeof DIRECTORY_SORTS)[number];
export const DIRECTORY_VIEWS = ["list", "map"] as const;
export type DirectoryView = (typeof DIRECTORY_VIEWS)[number];

export type DirectorySearchParams = Record<string, string | string[] | undefined>;

export type CampgroundDirectoryQuery = {
  q?: string;
  province?: string;
  regency?: string;
  types: string[];
  facilities: string[];
  access: string[];
  minPrice?: number;
  maxPrice?: number;
  sort: DirectorySort;
  view: DirectoryView;
  page: number;
  pageSize: number;
};

export type DirectoryOption = { value: string; label: string };
export type DirectoryRegencyOption = DirectoryOption & { province: string };
export type CampgroundDirectoryFacets = { provinces: DirectoryOption[]; regencies: DirectoryRegencyOption[]; types: DirectoryOption[]; facilities: DirectoryOption[]; access: DirectoryOption[] };
export type CampgroundDirectoryResult<T> = { items: T[]; total: number; page: number; pageSize: number; totalPages: number };

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function list(value: string | string[] | undefined) { const values = Array.isArray(value) ? value : value ? [value] : []; return [...new Set(values.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean))]; }
function positiveInteger(value: string | undefined, fallback: number) { const parsed = Number.parseInt(value ?? "", 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function nonNegativeNumber(value: string | undefined) { if (!value) return undefined; const parsed = Number(value); return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined; }

export function parseCampgroundDirectoryQuery(params: DirectorySearchParams): CampgroundDirectoryQuery {
  const rawSort = first(params.sort);
  const sort: DirectorySort = DIRECTORY_SORTS.includes(rawSort as DirectorySort) ? (rawSort as DirectorySort) : "recommended";
  const rawView = first(params.view);
  const view: DirectoryView = DIRECTORY_VIEWS.includes(rawView as DirectoryView) ? (rawView as DirectoryView) : "list";
  const minPrice = nonNegativeNumber(first(params.min_price));
  const maxPrice = nonNegativeNumber(first(params.max_price));

  return {
    q: first(params.q)?.trim() || undefined,
    province: first(params.province)?.trim() || undefined,
    regency: first(params.regency)?.trim() || undefined,
    types: list(params.type),
    facilities: list(params.facility),
    access: list(params.access),
    minPrice,
    maxPrice: maxPrice !== undefined && minPrice !== undefined && maxPrice < minPrice ? undefined : maxPrice,
    sort,
    view,
    page: positiveInteger(first(params.page), 1),
    pageSize: DIRECTORY_PAGE_SIZE
  };
}
