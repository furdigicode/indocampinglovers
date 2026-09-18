-- IndoCampingLovers M5.2 public submission security foundation
-- Run once in the ICL Supabase SQL Editor after 0008.
-- This migration does NOT grant browser access to submission tables.
-- Server-side API writes require NEXT_PRIVATE_SUPABASE_SECRET_KEY.

-- Make submission references human-friendly without exposing sequential IDs.
alter table public.campground_submissions
  add column if not exists reference_code text;

alter table public.campground_update_submissions
  add column if not exists reference_code text;

create unique index if not exists campground_submissions_reference_code_idx
  on public.campground_submissions(reference_code)
  where reference_code is not null;

create unique index if not exists campground_update_submissions_reference_code_idx
  on public.campground_update_submissions(reference_code)
  where reference_code is not null;

-- Reassert the M1 least-privilege boundary. Public clients must use the
-- controlled Next.js server API and cannot read/write moderation queues.
revoke all privileges on table public.campground_submissions from anon, authenticated;
revoke all privileges on table public.campground_update_submissions from anon, authenticated;

-- Explicitly remove any accidental browser policies that could have been
-- introduced outside the migration history. M5 server writes use a secret
-- server credential and do not depend on browser policies.
drop policy if exists "public insert campground submissions" on public.campground_submissions;
drop policy if exists "public read campground submissions" on public.campground_submissions;
drop policy if exists "public insert campground update submissions" on public.campground_update_submissions;
drop policy if exists "public read campground update submissions" on public.campground_update_submissions;
