# M2.1 — Directory Query & Filter Architecture

Status: implementation baseline on `develop`.

## Public URL contract

`/camping` is the canonical directory route. Discovery state lives in query parameters so searches can be shared, bookmarked, crawled intentionally, and restored without client-only state.

| Parameter | Meaning | Example |
| --- | --- | --- |
| `q` | free-text search | `q=bandung` |
| `province` | province slug | `province=jawa-barat` |
| `regency` | regency slug | `regency=kabupaten-bandung` |
| `type` | repeatable/comma-compatible campground type | `type=mountain-camp` |
| `facility` | repeatable/comma-compatible facility | `facility=toilet` |
| `access` | repeatable/comma-compatible vehicle access | `access=Mobil` |
| `min_price` | minimum displayed price, IDR | `min_price=25000` |
| `max_price` | maximum displayed price, IDR | `max_price=100000` |
| `sort` | `recommended`, `name`, `price_asc`, `price_desc`, `recently_verified` | `sort=name` |
| `page` | 1-based page | `page=2` |

Unknown/invalid values are normalized by the server. Page size is fixed at 24 for M2.

## Query layers

1. `directory-query.ts` owns parsing, normalization, types, pagination defaults, and the URL contract.
2. `repository.ts` owns Supabase queries and mapping database rows into the public `Campground` contract.
3. `/camping/page.tsx` consumes the normalized query. It does not construct database filters itself.
4. UI controls in M2.2 will only modify the URL query. This keeps browser history/back-forward behavior native.

## Filtering semantics

- Text search: campground name, address, district in M2.1. Broader location/name search can move to PostgreSQL full-text/fuzzy search later.
- Province/regency: canonical slugs.
- Multi type/facility/access: AND semantics by default; a campground must satisfy every selected value in a category.
- Price: based on the public `priceFrom` contract for now. Pricing semantics will be refined before exposing production price filters.
- Recommended sort: featured first, then name. This is deterministic and can evolve into a ranking model later.
- `recently_verified`: latest verification date first.

## Pagination and scale

The public repository uses database range pagination instead of loading the entire directory. Default page size is 24. Exact count is returned for pagination UI.

Relationship-heavy filters are intentionally not considered scale-complete in M2.1: their public contract is frozen, but the temporary implementation filters the returned page in application memory. M2.2 must move type/facility/access/price filtering into PostgreSQL/Supabase before those controls are exposed as production filters, otherwise result counts and pagination would be inaccurate.

## Security

The public client uses only the Supabase publishable key. RLS remains the enforcement boundary: only `published` campgrounds and public/approved child records are visible. No canonical write operation is added in M2.

## M2.1 acceptance

- URL query contract frozen and typed.
- Next 15 async `searchParams` supported.
- Search is server-driven and shareable.
- Directory reads are paginated at the database level.
- Result includes exact count/page metadata.
- Facet data has a repository contract for province, regency, type, facility and access.
- Invalid query values degrade safely to defaults.
- No client-side canonical data mutation.
- CI build/type/security checks remain green.

## M2.2 next

Build database-native relationship filters and the responsive filter UI. Do not expose type/facility/access/price controls until filtering occurs before pagination/counting in PostgreSQL.
