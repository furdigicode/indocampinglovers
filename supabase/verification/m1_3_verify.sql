-- M1.3 verification query (read-only)
-- Expected: every check returns PASS. Safe to run repeatedly.

with checks as (
  select 1 sort,'tables' check_name,
    case when (select count(*) from information_schema.tables where table_schema='public' and table_name in ('provinces','regencies','campgrounds','campground_types','campground_type_relations','facilities','campground_facilities','campground_access','campground_suitable_for','campground_prices','campground_contacts','campground_photos','campground_verifications','campground_submissions','campground_update_submissions'))=15 then 'PASS' else 'FAIL' end result,
    (select count(*)::text||'/15 tables' from information_schema.tables where table_schema='public' and table_name in ('provinces','regencies','campgrounds','campground_types','campground_type_relations','facilities','campground_facilities','campground_access','campground_suitable_for','campground_prices','campground_contacts','campground_photos','campground_verifications','campground_submissions','campground_update_submissions')) detail
  union all
  select 2,'rls',case when count(*)=15 and bool_and(c.relrowsecurity) then 'PASS' else 'FAIL' end,count(*)::text||'/15 tables with RLS' from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname in ('provinces','regencies','campgrounds','campground_types','campground_type_relations','facilities','campground_facilities','campground_access','campground_suitable_for','campground_prices','campground_contacts','campground_photos','campground_verifications','campground_submissions','campground_update_submissions')
  union all
  select 3,'enums',case when count(distinct t.typname)=7 then 'PASS' else 'FAIL' end,count(distinct t.typname)::text||'/7 enums' from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typname in ('campground_status','verification_status','submission_status','photo_status','price_type','contact_type','update_type')
  union all
  select 4,'public policies',case when count(*)=12 then 'PASS' else 'FAIL' end,count(*)::text||'/12 expected policies' from pg_policies where schemaname='public' and policyname like 'public read%'
  union all
  select 5,'moderation isolation',case when count(*)=0 then 'PASS' else 'FAIL' end,count(*)::text||' anon/auth policies on private workflow tables' from pg_policies where schemaname='public' and tablename in ('campground_verifications','campground_submissions','campground_update_submissions') and (roles::text like '%anon%' or roles::text like '%authenticated%')
  union all
  select 6,'moderation grants',case when count(*)=0 then 'PASS' else 'FAIL' end,count(*)::text||' browser write grants on private workflow tables' from information_schema.role_table_grants where table_schema='public' and table_name in ('campground_verifications','campground_submissions','campground_update_submissions') and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE','DELETE')
  union all
  select 7,'canonical write grants',case when count(*)=0 then 'PASS' else 'FAIL' end,count(*)::text||' browser write grants on campgrounds' from information_schema.role_table_grants where table_schema='public' and table_name='campgrounds' and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE','DELETE')
  union all
  select 8,'updated_at triggers',case when count(*)=3 then 'PASS' else 'FAIL' end,count(*)::text||'/3 triggers' from information_schema.triggers where trigger_schema='public' and trigger_name in ('campgrounds_set_updated_at','campground_prices_set_updated_at','campground_contacts_set_updated_at')
  union all
  select 9,'planned indexes',case when count(*)>=12 then 'PASS' else 'FAIL' end,count(*)::text||' ICL indexes found' from pg_indexes where schemaname='public' and indexname in ('campgrounds_status_featured_idx','campgrounds_location_status_idx','campgrounds_verification_idx','campground_type_relations_type_idx','campground_facilities_facility_idx','campground_access_campground_idx','campground_suitable_for_campground_idx','campground_prices_public_idx','campground_contacts_public_idx','campground_photos_public_idx','campground_verifications_campground_idx','campground_submissions_status_idx','campground_update_submissions_status_idx')
  union all
  select 10,'published visibility policy',case when count(*)=1 then 'PASS' else 'FAIL' end,count(*)::text||'/1 campground public policy' from pg_policies where schemaname='public' and tablename='campgrounds' and policyname='public read published campgrounds' and cmd='SELECT' and qual like '%published%'
)
select check_name,result,detail from checks order by sort;
