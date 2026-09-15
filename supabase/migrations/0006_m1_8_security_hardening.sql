-- IndoCampingLovers M1.8 security hardening
-- Idempotent: safe to re-run.
-- Run in the ICL Supabase SQL Editor after migrations 0001-0005.

-- Trigger helper is an internal database implementation detail. Browser roles
-- do not need permission to invoke it directly.
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Protect FUTURE public-schema objects from Supabase/Postgres broad defaults.
-- Explicit grants in reviewed migrations remain the only browser surface.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Reassert least privilege for all current ICL tables.
revoke all privileges on table
  public.provinces,
  public.regencies,
  public.campgrounds,
  public.campground_types,
  public.campground_type_relations,
  public.facilities,
  public.campground_facilities,
  public.campground_access,
  public.campground_suitable_for,
  public.campground_prices,
  public.campground_contacts,
  public.campground_photos,
  public.campground_verifications,
  public.campground_submissions,
  public.campground_update_submissions
from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on table
  public.provinces,
  public.regencies,
  public.campgrounds,
  public.campground_types,
  public.campground_type_relations,
  public.facilities,
  public.campground_facilities,
  public.campground_access,
  public.campground_suitable_for,
  public.campground_prices,
  public.campground_contacts,
  public.campground_photos
to anon, authenticated;

-- No browser privileges are granted to moderation/verification workflow tables.
