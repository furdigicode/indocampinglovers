-- M3.6 TRUST & DATA FRESHNESS QA FIXTURE
-- DEVELOPMENT/QA ONLY.
--
-- Uses the existing fictional campground `icl-qa-m3-detail`.
-- Run ONE scenario at a time, then refresh /camping/icl-qa-m3-detail.
-- The default active scenario below is FRESH + VERIFIED.

-- SCENARIO A — FRESH + VERIFIED (ACTIVE)
update public.campgrounds
set verification_status = 'verified',
    last_verified_at = current_date - interval '2 days'
where slug = 'icl-qa-m3-detail';

-- SCENARIO B — AGING + COMMUNITY UPDATED
-- update public.campgrounds
-- set verification_status = 'community_updated',
--     last_verified_at = current_date - interval '120 days'
-- where slug = 'icl-qa-m3-detail';

-- SCENARIO C — STALE + NEEDS UPDATE
-- update public.campgrounds
-- set verification_status = 'needs_update',
--     last_verified_at = current_date - interval '220 days'
-- where slug = 'icl-qa-m3-detail';

-- SCENARIO D — UNKNOWN DATE + NEEDS UPDATE
-- update public.campgrounds
-- set verification_status = 'needs_update',
--     last_verified_at = null
-- where slug = 'icl-qa-m3-detail';

select
  slug,
  verification_status,
  last_verified_at,
  current_date - last_verified_at as age_days
from public.campgrounds
where slug = 'icl-qa-m3-detail';
