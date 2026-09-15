-- M1.3 security hardening
-- Supabase may provision broad default table privileges for anon/authenticated.
-- RLS blocks row access, but ICL also enforces least-privilege GRANTs.
-- Safe to run once after 0001_initial_schema.sql.

-- Remove browser privileges from every ICL table first.
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

-- Restore only the public-directory read surface.
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

-- Workflow/private tables intentionally receive no anon/authenticated table grants:
-- campground_verifications, campground_submissions, campground_update_submissions.
-- RLS remains enabled as defense in depth.
