# M4 — Final QA Checklist

Status: QA

## A. Build & regression
- [ ] `npm run build` passes from current `develop`.
- [ ] `/camping` national directory loads.
- [ ] Existing campground detail route still loads.

## B. Geographic routing
- [ ] `/camping/jawa-tengah` resolves as province landing, not campground detail.
- [ ] `/camping/jawa-tengah/kabupaten-semarang` resolves as regency landing.
- [ ] Unknown geographic/detail slug returns 404.
- [ ] Province URL remains canonical in browser after internal rewrite.

## C. Directory & internal linking
- [ ] Province landing shows only published/RLS-visible campground data.
- [ ] Regency landing shows only campground data from that province/regency.
- [ ] Province → regency links work.
- [ ] Detail breadcrumb links Camping → Province → Regency → Campground.
- [ ] Existing detail actions/gallery/map/trust UI have no visible regression.

## D. SEO metadata & indexing
- [ ] Province title/description/canonical are correct.
- [ ] Regency title/description/canonical are correct.
- [ ] Geographic page with zero published results is `noindex,follow`.
- [ ] Canonical geographic URL excludes transient filter/query parameters.
- [ ] `NEXT_PUBLIC_APP_URL` is the metadata base.

## E. Discovery
- [ ] `/sitemap.xml` loads.
- [ ] Sitemap includes national directory, public province/regency pages, and public campground details.
- [ ] Sitemap excludes geographic pages without public campground data.
- [ ] `/robots.txt` blocks localhost/Netlify preview.
- [ ] Production-domain robots configuration allows crawling and advertises sitemap.

## F. Structured data
- [ ] Province source contains JSON-LD `BreadcrumbList` + `ItemList`.
- [ ] Regency source contains JSON-LD `BreadcrumbList` + `ItemList`.
- [ ] Detail source contains JSON-LD `BreadcrumbList` + `Place`.
- [ ] Place includes only supported public facts; no fabricated rating/review/price.
- [ ] Coordinates are emitted only when valid.

## G. Security & data integrity
- [ ] No M4 database migration is pending.
- [ ] No RLS policy was relaxed.
- [ ] No anon/authenticated browser grant was expanded.
- [ ] No secret/service-role credential is exposed to browser code.

## Known non-blocking issue
The existing Next development-runtime `transformAlgorithm` / occasional timeout error remains tracked separately. It is not considered resolved by M4 and does not override a passing production build.

M4 can be frozen only after all blocking items above are confirmed PASS.
