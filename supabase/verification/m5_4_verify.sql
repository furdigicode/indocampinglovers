-- M5.4 verifier: expected 7 PASS rows after migration 0011.
with checks as (
 select 1 n,'photo staging table exists' label,to_regclass('public.campground_submission_photos') is not null ok
 union all select 2,'private staging bucket exists',
   exists(select 1 from storage.buckets where id='campground-submissions' and public=false)
 union all select 3,'staging bucket max 8 MiB',
   exists(select 1 from storage.buckets where id='campground-submissions' and file_size_limit=8388608)
 union all select 4,'anon has no photo staging table privileges',
   not exists(select 1 from information_schema.role_table_grants where grantee='anon' and table_schema='public' and table_name='campground_submission_photos')
 union all select 5,'authenticated has no photo staging table privileges',
   not exists(select 1 from information_schema.role_table_grants where grantee='authenticated' and table_schema='public' and table_name='campground_submission_photos')
 union all select 6,'no anon storage write policy for staging bucket',
   not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and roles::text like '%anon%' and cmd in ('INSERT','UPDATE','DELETE'))
 union all select 7,'canonical campground photo bucket remains public',
   exists(select 1 from storage.buckets where id='campground-photos' and public=true)
)
select n,label,case when ok then 'PASS' else 'FAIL' end result from checks order by n;
