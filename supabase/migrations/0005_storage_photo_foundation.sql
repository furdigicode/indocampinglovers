-- IndoCampingLovers M1.5 — Storage & Photo Foundation
-- Run in Supabase SQL Editor after migrations 0001-0004.
--
-- Architecture:
--   bucket: campground-photos (PUBLIC)
--   canonical object path: <campground_uuid>/<uuid>.<ext>
--   max upload: 8 MiB
--   accepted: JPEG, PNG, WebP
--
-- Security decision for M1.5:
--   public delivery is allowed because approved campground photos are public content.
--   NO anon/authenticated upload/update/delete policy is created yet.
--   Uploads will be introduced with the moderated contribution/admin flow later.
--
-- Important: Storage file operations must go through the Storage API.
-- This migration configures bucket metadata and RLS policies only.

-- 1. Create/update canonical public bucket.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'campground-photos',
  'campground-photos',
  true,
  8388608,
  array['image/jpeg','image/png','image/webp']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Explicitly remove browser write policies if this migration is rerun
-- after experimental/local policies were added with these names.
drop policy if exists "campground photos browser upload" on storage.objects;
drop policy if exists "campground photos browser update" on storage.objects;
drop policy if exists "campground photos browser delete" on storage.objects;

-- No INSERT / UPDATE / DELETE policy for anon or authenticated in M1.5.
-- Public bucket delivery does not require a SELECT policy for public asset URLs.

-- 3. Strengthen campground photo metadata integrity.
-- A campground may have at most one approved cover photo.
create unique index if not exists campground_photos_one_approved_cover_idx
  on public.campground_photos (campground_id)
  where is_cover = true and status = 'approved';

-- Prevent duplicate references to the same object path.
create unique index if not exists campground_photos_storage_path_uidx
  on public.campground_photos (storage_path);

-- 4. Verification summary.
select
  id as bucket_id,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'campground-photos';
