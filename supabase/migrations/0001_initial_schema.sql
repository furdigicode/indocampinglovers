-- IndoCampingLovers M1.2 initial schema
-- Run once in the ICL Supabase project's SQL Editor.

create extension if not exists pgcrypto;

create type public.campground_status as enum ('draft','review','published','closed','archived');
create type public.verification_status as enum ('unverified','community_updated','verified','needs_update');
create type public.submission_status as enum ('pending','reviewing','approved','rejected');
create type public.photo_status as enum ('pending','approved','rejected');
create type public.price_type as enum ('entrance','camping','parking','tent_rental','equipment_rental','firewood','other');
create type public.contact_type as enum ('whatsapp','phone','instagram','website','email');
create type public.update_type as enum ('general','price','facility','access','contact','location','operating_status','photo');

create table public.provinces (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null unique, slug text not null unique,
  created_at timestamptz not null default now()
);
create table public.regencies (
  id uuid primary key default gen_random_uuid(), province_id uuid not null references public.provinces(id) on delete restrict,
  code text not null unique, name text not null, slug text not null, type text not null check (type in ('kabupaten','kota')),
  created_at timestamptz not null default now(), unique(province_id, slug)
);
create table public.campgrounds (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, short_description text, description text,
  province_id uuid not null references public.provinces(id) on delete restrict, regency_id uuid not null references public.regencies(id) on delete restrict,
  district text, address text not null, latitude numeric(9,6) not null check (latitude between -90 and 90), longitude numeric(9,6) not null check (longitude between -180 and 180),
  elevation_m integer check (elevation_m is null or elevation_m >= 0), capacity_people integer check (capacity_people is null or capacity_people >= 0),
  access_description text, check_in_info text, good_to_know text,
  status public.campground_status not null default 'draft', verification_status public.verification_status not null default 'unverified',
  last_verified_at timestamptz, featured boolean not null default false, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.campground_types (
  id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, description text
);
create table public.campground_type_relations (
  campground_id uuid not null references public.campgrounds(id) on delete cascade, type_id uuid not null references public.campground_types(id) on delete restrict,
  primary key(campground_id,type_id)
);
create table public.facilities (
  id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, category text, icon_key text, sort_order integer not null default 0
);
create table public.campground_facilities (
  campground_id uuid not null references public.campgrounds(id) on delete cascade, facility_id uuid not null references public.facilities(id) on delete restrict,
  note text, is_available boolean not null default true, primary key(campground_id,facility_id)
);
create table public.campground_access (
  id uuid primary key default gen_random_uuid(), campground_id uuid not null references public.campgrounds(id) on delete cascade,
  vehicle_type text not null, is_accessible boolean not null default true, note text, unique(campground_id,vehicle_type)
);
create table public.campground_suitable_for (
  id uuid primary key default gen_random_uuid(), campground_id uuid not null references public.campgrounds(id) on delete cascade,
  label text not null, unique(campground_id,label)
);
create table public.campground_prices (
  id uuid primary key default gen_random_uuid(), campground_id uuid not null references public.campgrounds(id) on delete cascade,
  type public.price_type not null, label text not null, amount_idr bigint not null check(amount_idr >= 0), unit text, note text,
  is_active boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.campground_contacts (
  id uuid primary key default gen_random_uuid(), campground_id uuid not null references public.campgrounds(id) on delete cascade,
  type public.contact_type not null, label text, value text not null, is_primary boolean not null default false, is_public boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.campground_photos (
  id uuid primary key default gen_random_uuid(), campground_id uuid not null references public.campgrounds(id) on delete cascade,
  storage_path text not null, alt_text text, caption text, credit_name text, source_url text, is_cover boolean not null default false,
  status public.photo_status not null default 'pending', sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table public.campground_verifications (
  id uuid primary key default gen_random_uuid(), campground_id uuid not null references public.campgrounds(id) on delete cascade,
  status public.verification_status not null, verified_at timestamptz not null default now(), verified_by uuid references auth.users(id) on delete set null,
  source_type text, source_note text, created_at timestamptz not null default now()
);
create table public.campground_submissions (
  id uuid primary key default gen_random_uuid(), submitted_by uuid references auth.users(id) on delete set null, submitter_name text, submitter_contact text,
  payload jsonb not null check(jsonb_typeof(payload)='object'), status public.submission_status not null default 'pending', moderator_note text,
  created_at timestamptz not null default now(), reviewed_at timestamptz
);
create table public.campground_update_submissions (
  id uuid primary key default gen_random_uuid(), campground_id uuid not null references public.campgrounds(id) on delete cascade,
  submitted_by uuid references auth.users(id) on delete set null, submitter_name text, submitter_contact text, update_type public.update_type not null,
  payload jsonb not null check(jsonb_typeof(payload)='object'), status public.submission_status not null default 'pending', moderator_note text,
  created_at timestamptz not null default now(), reviewed_at timestamptz
);

create index campgrounds_status_featured_idx on public.campgrounds(status,featured);
create index campgrounds_location_status_idx on public.campgrounds(province_id,regency_id,status);
create index campgrounds_verification_idx on public.campgrounds(verification_status,last_verified_at);
create index campground_type_relations_type_idx on public.campground_type_relations(type_id);
create index campground_facilities_facility_idx on public.campground_facilities(facility_id);
create index campground_access_campground_idx on public.campground_access(campground_id);
create index campground_suitable_for_campground_idx on public.campground_suitable_for(campground_id);
create index campground_prices_public_idx on public.campground_prices(campground_id,is_active);
create index campground_contacts_public_idx on public.campground_contacts(campground_id,is_public);
create index campground_photos_public_idx on public.campground_photos(campground_id,status,sort_order);
create index campground_verifications_campground_idx on public.campground_verifications(campground_id,verified_at desc);
create index campground_submissions_status_idx on public.campground_submissions(status,created_at);
create index campground_update_submissions_status_idx on public.campground_update_submissions(status,created_at);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger campgrounds_set_updated_at before update on public.campgrounds for each row execute function public.set_updated_at();
create trigger campground_prices_set_updated_at before update on public.campground_prices for each row execute function public.set_updated_at();
create trigger campground_contacts_set_updated_at before update on public.campground_contacts for each row execute function public.set_updated_at();

-- RLS baseline: enabled everywhere. Policies below expose only directory-safe reads.
alter table public.provinces enable row level security;
alter table public.regencies enable row level security;
alter table public.campgrounds enable row level security;
alter table public.campground_types enable row level security;
alter table public.campground_type_relations enable row level security;
alter table public.facilities enable row level security;
alter table public.campground_facilities enable row level security;
alter table public.campground_access enable row level security;
alter table public.campground_suitable_for enable row level security;
alter table public.campground_prices enable row level security;
alter table public.campground_contacts enable row level security;
alter table public.campground_photos enable row level security;
alter table public.campground_verifications enable row level security;
alter table public.campground_submissions enable row level security;
alter table public.campground_update_submissions enable row level security;

create policy "public read provinces" on public.provinces for select to anon,authenticated using (true);
create policy "public read regencies" on public.regencies for select to anon,authenticated using (true);
create policy "public read campground types" on public.campground_types for select to anon,authenticated using (true);
create policy "public read facilities" on public.facilities for select to anon,authenticated using (true);
create policy "public read published campgrounds" on public.campgrounds for select to anon,authenticated using (status='published');
create policy "public read published campground types" on public.campground_type_relations for select to anon,authenticated using (exists(select 1 from public.campgrounds c where c.id=campground_id and c.status='published'));
create policy "public read published campground facilities" on public.campground_facilities for select to anon,authenticated using (exists(select 1 from public.campgrounds c where c.id=campground_id and c.status='published'));
create policy "public read published campground access" on public.campground_access for select to anon,authenticated using (exists(select 1 from public.campgrounds c where c.id=campground_id and c.status='published'));
create policy "public read published campground suitable for" on public.campground_suitable_for for select to anon,authenticated using (exists(select 1 from public.campgrounds c where c.id=campground_id and c.status='published'));
create policy "public read active prices" on public.campground_prices for select to anon,authenticated using (is_active and exists(select 1 from public.campgrounds c where c.id=campground_id and c.status='published'));
create policy "public read public contacts" on public.campground_contacts for select to anon,authenticated using (is_public and exists(select 1 from public.campgrounds c where c.id=campground_id and c.status='published'));
create policy "public read approved photos" on public.campground_photos for select to anon,authenticated using (status='approved' and exists(select 1 from public.campgrounds c where c.id=campground_id and c.status='published'));

-- Explicit Data API grants. RLS still determines which rows are visible.
grant usage on schema public to anon,authenticated;
grant select on public.provinces,public.regencies,public.campgrounds,public.campground_types,public.campground_type_relations,public.facilities,public.campground_facilities,public.campground_access,public.campground_suitable_for,public.campground_prices,public.campground_contacts,public.campground_photos to anon,authenticated;

-- No browser grants/policies for moderation, verification, or submission tables in M1.2.
