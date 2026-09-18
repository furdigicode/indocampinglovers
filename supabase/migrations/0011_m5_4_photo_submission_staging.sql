-- M5.4 controlled photo submission staging
-- Photos for a NEW campground cannot use campground_photos yet because that
-- canonical table requires an existing campground_id. Stage them against the
-- moderated campground submission instead.

create table if not exists public.campground_submission_photos (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.campground_submissions(id) on delete cascade,
  storage_path text not null,
  original_name text,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  file_size integer not null check (file_size > 0 and file_size <= 8388608),
  status public.photo_status not null default 'pending',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (storage_path)
);

alter table public.campground_submission_photos enable row level security;
revoke all privileges on table public.campground_submission_photos from anon, authenticated;

-- Dedicated private staging bucket. A pending contribution must never become
-- publicly retrievable merely because the canonical campground bucket is public.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'campground-submissions',
  'campground-submissions',
  false,
  8388608,
  array['image/jpeg','image/png','image/webp']::text[]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "campground submission photos browser upload" on storage.objects;
drop policy if exists "campground submission photos browser read" on storage.objects;
drop policy if exists "campground submission photos browser update" on storage.objects;
drop policy if exists "campground submission photos browser delete" on storage.objects;

create index if not exists campground_submission_photos_submission_idx
  on public.campground_submission_photos(submission_id,status,sort_order);
