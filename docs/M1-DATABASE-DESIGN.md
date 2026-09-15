# M1.1 — Database Schema & Data Contract

Status: FROZEN FOR M1 IMPLEMENTATION

## Principles
- PostgreSQL/Supabase is the source of truth; frontend types are generated/derived from DB.
- Public directory reads only published/visible records.
- Community submissions never mutate canonical campground data directly.
- Verification history is append-only; current verification fields on campground are a read optimization.
- Public schema tables use RLS and least-privilege grants.
- UUID primary keys; timestamps are timestamptz; money stored as integer IDR.
- Geography starts with latitude/longitude numeric fields. PostGIS can be added when radius/spatial search is required.

## Enums
`campground_status`: draft, review, published, closed, archived
`verification_status`: unverified, community_updated, verified, needs_update
`submission_status`: pending, reviewing, approved, rejected
`photo_status`: pending, approved, rejected
`price_type`: entrance, camping, parking, tent_rental, equipment_rental, firewood, other
`contact_type`: whatsapp, phone, instagram, website, email
`update_type`: general, price, facility, access, contact, location, operating_status, photo

## Canonical tables

### provinces
- id uuid PK
- code text unique
- name text unique
- slug text unique
- created_at timestamptz

### regencies
- id uuid PK
- province_id uuid FK provinces
- code text unique
- name text
- slug text
- type text (kabupaten/kota)
- created_at timestamptz
- unique(province_id, slug)

### campgrounds
- id uuid PK
- name text not null
- slug text unique not null
- short_description text
- description text
- province_id uuid FK provinces not null
- regency_id uuid FK regencies not null
- district text
- address text not null
- latitude numeric(9,6) not null
- longitude numeric(9,6) not null
- elevation_m integer
- capacity_people integer
- access_description text
- check_in_info text
- good_to_know text
- status campground_status default draft
- verification_status verification_status default unverified
- last_verified_at timestamptz
- featured boolean default false
- published_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### campground_types
- id uuid PK
- name text unique
- slug text unique
- description text

### campground_type_relations
- campground_id uuid FK campgrounds ON DELETE CASCADE
- type_id uuid FK campground_types ON DELETE RESTRICT
- primary key(campground_id, type_id)

### facilities
- id uuid PK
- name text unique
- slug text unique
- category text
- icon_key text
- sort_order integer default 0

### campground_facilities
- campground_id uuid FK campgrounds ON DELETE CASCADE
- facility_id uuid FK facilities ON DELETE RESTRICT
- note text
- is_available boolean default true
- primary key(campground_id, facility_id)

### campground_access
- id uuid PK
- campground_id uuid FK campgrounds ON DELETE CASCADE
- vehicle_type text not null
- is_accessible boolean default true
- note text
- unique(campground_id, vehicle_type)

### campground_suitable_for
- id uuid PK
- campground_id uuid FK campgrounds ON DELETE CASCADE
- label text not null
- unique(campground_id, label)

### campground_prices
- id uuid PK
- campground_id uuid FK campgrounds ON DELETE CASCADE
- type price_type
- label text not null
- amount_idr bigint not null check amount_idr >= 0
- unit text
- note text
- is_active boolean default true
- sort_order integer default 0
- created_at timestamptz
- updated_at timestamptz

### campground_contacts
- id uuid PK
- campground_id uuid FK campgrounds ON DELETE CASCADE
- type contact_type
- label text
- value text not null
- is_primary boolean default false
- is_public boolean default true
- created_at timestamptz
- updated_at timestamptz

### campground_photos
- id uuid PK
- campground_id uuid FK campgrounds ON DELETE CASCADE
- storage_path text not null
- alt_text text
- caption text
- credit_name text
- source_url text
- is_cover boolean default false
- status photo_status default pending
- sort_order integer default 0
- created_at timestamptz

## Trust & moderation

### campground_verifications
Append-only verification audit log.
- id uuid PK
- campground_id uuid FK campgrounds ON DELETE CASCADE
- status verification_status not null
- verified_at timestamptz not null
- verified_by uuid nullable FK auth.users(id)
- source_type text
- source_note text
- created_at timestamptz

### campground_submissions
New-place suggestions; never published directly.
- id uuid PK
- submitted_by uuid nullable FK auth.users(id)
- submitter_name text
- submitter_contact text
- payload jsonb not null
- status submission_status default pending
- moderator_note text
- created_at timestamptz
- reviewed_at timestamptz

### campground_update_submissions
Suggested edits to an existing campground; canonical row changes only after moderation.
- id uuid PK
- campground_id uuid FK campgrounds ON DELETE CASCADE
- submitted_by uuid nullable FK auth.users(id)
- submitter_name text
- submitter_contact text
- update_type update_type
- payload jsonb not null
- status submission_status default pending
- moderator_note text
- created_at timestamptz
- reviewed_at timestamptz

## Public read contract
A public campground is visible only when `campgrounds.status = 'published'`. Related photos must be `approved`; contacts must be `is_public = true`; active prices only. Draft/review/archived canonical rows are not public.

Recommended public query shape for Next.js:
- campground core
- province + regency
- types[]
- facilities[]
- access[]
- suitable_for[]
- prices[]
- public contacts[]
- approved photos[]

The frontend M0 `Campground` seed type is temporary. Once M1 schema exists, generate Supabase TypeScript types and add a mapping/query layer instead of hand-maintaining DB types.

## RLS / grants model
- Canonical directory tables: `anon` and `authenticated` receive SELECT only where explicitly public; no direct client INSERT/UPDATE/DELETE.
- Submission tables: public contribution is written through a controlled server/API path in MVP; no anonymous direct canonical writes.
- Admin/moderation writes are server-side with elevated secret credentials, never browser-exposed.
- Enable RLS on every public-schema table and revoke default grants before granting minimum required privileges.
- Any future public view must use `security_invoker = true` or remain unexposed.

## Index plan
- campgrounds(slug) unique
- campgrounds(status, featured)
- campgrounds(province_id, regency_id, status)
- campgrounds(verification_status, last_verified_at)
- regencies(province_id, slug) unique
- relation FK indexes for campground_id/type_id/facility_id
- campground_prices(campground_id, is_active)
- campground_photos(campground_id, status, sort_order)
- campground_contacts(campground_id, is_public)
- submissions(status, created_at)

## Deferred deliberately
- Reviews/ratings
- User favorites
- Owner claim workflow
- Booking/payment/inventory
- PostGIS geography/radius queries
- Full-text/fuzzy search infrastructure
- Articles/content CMS

These are not required to establish the national camping directory source-of-truth in M1.

## M1 implementation sequence
M1.1 schema/data contract freeze → M1.2 create Supabase project/environment → M1.3 execute schema + RLS/grants → M1.4 location/type/facility seed → M1.5 storage/photo foundation → M1.6 Next.js Supabase integration + generated types → M1.7 migrate development seed/read path → M1.8 database security/performance verification.
