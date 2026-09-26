-- M5.5 verifier: expected 5 PASS rows after migration 0012.
with checks as (
 select 1 n,'update submission idempotency column exists' label,
   exists(select 1 from information_schema.columns where table_schema='public' and table_name='campground_update_submissions' and column_name='idempotency_key') ok
 union all select 2,'update submission reference code exists',
   exists(select 1 from information_schema.columns where table_schema='public' and table_name='campground_update_submissions' and column_name='reference_code')
 union all select 3,'idempotency unique index exists',
   to_regclass('public.campground_update_submissions_idempotency_key_idx') is not null
 union all select 4,'anon has no update queue privileges',
   not exists(select 1 from information_schema.role_table_grants where grantee='anon' and table_schema='public' and table_name='campground_update_submissions')
 union all select 5,'authenticated has no update queue privileges',
   not exists(select 1 from information_schema.role_table_grants where grantee='authenticated' and table_schema='public' and table_name='campground_update_submissions')
)
select n,label,case when ok then 'PASS' else 'FAIL' end result from checks order by n;
