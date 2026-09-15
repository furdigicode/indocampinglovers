-- IndoCampingLovers M1.8 verification
-- Expected: every row returns PASS.

with icl_tables(name) as (values
 ('provinces'),('regencies'),('campgrounds'),('campground_types'),('campground_type_relations'),('facilities'),
 ('campground_facilities'),('campground_access'),('campground_suitable_for'),('campground_prices'),('campground_contacts'),
 ('campground_photos'),('campground_verifications'),('campground_submissions'),('campground_update_submissions')
), public_read(name) as (values
 ('provinces'),('regencies'),('campgrounds'),('campground_types'),('campground_type_relations'),('facilities'),
 ('campground_facilities'),('campground_access'),('campground_suitable_for'),('campground_prices'),('campground_contacts'),('campground_photos')
), checks as (
 select 10 n, 'RLS enabled on all ICL tables' check_name,
   not exists(select 1 from icl_tables i left join pg_class c on c.relname=i.name and c.relnamespace='public'::regnamespace where c.oid is null or not c.relrowsecurity) ok
 union all
 select 20, 'anon has no INSERT/UPDATE/DELETE/TRUNCATE privileges',
   not exists(select 1 from icl_tables i cross join (values('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE')) p(priv) where has_table_privilege('anon', 'public.'||i.name, p.priv))
 union all
 select 30, 'authenticated has no INSERT/UPDATE/DELETE/TRUNCATE privileges',
   not exists(select 1 from icl_tables i cross join (values('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE')) p(priv) where has_table_privilege('authenticated', 'public.'||i.name, p.priv))
 union all
 select 40, 'public directory tables remain SELECT-readable',
   not exists(select 1 from public_read p where not has_table_privilege('anon','public.'||p.name,'SELECT') or not has_table_privilege('authenticated','public.'||p.name,'SELECT'))
 union all
 select 50, 'workflow tables are not browser SELECT-readable',
   not has_table_privilege('anon','public.campground_verifications','SELECT')
   and not has_table_privilege('anon','public.campground_submissions','SELECT')
   and not has_table_privilege('anon','public.campground_update_submissions','SELECT')
   and not has_table_privilege('authenticated','public.campground_verifications','SELECT')
   and not has_table_privilege('authenticated','public.campground_submissions','SELECT')
   and not has_table_privilege('authenticated','public.campground_update_submissions','SELECT')
 union all
 select 60, 'set_updated_at cannot be called by browser/public roles',
   not has_function_privilege('anon','public.set_updated_at()','EXECUTE')
   and not has_function_privilege('authenticated','public.set_updated_at()','EXECUTE')
   and not has_function_privilege('public','public.set_updated_at()','EXECUTE')
 union all
 select 70, 'published campground RLS policy exists',
   exists(select 1 from pg_policies where schemaname='public' and tablename='campgrounds' and policyname='public read published campgrounds' and cmd='SELECT')
 union all
 select 80, 'approved-photo RLS policy exists',
   exists(select 1 from pg_policies where schemaname='public' and tablename='campground_photos' and policyname='public read approved photos' and cmd='SELECT')
 union all
 select 90, 'critical public-read indexes exist',
   to_regclass('public.campgrounds_status_featured_idx') is not null
   and to_regclass('public.campgrounds_location_status_idx') is not null
   and to_regclass('public.campground_prices_public_idx') is not null
   and to_regclass('public.campground_photos_public_idx') is not null
 union all
 select 100, 'M1.7 fixture has been removed',
   not exists(select 1 from public.campgrounds where slug='icl-development-camp')
)
select n, check_name, case when ok then 'PASS' else 'FAIL' end result from checks order by n;
