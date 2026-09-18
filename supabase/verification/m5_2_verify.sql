-- M5.2 verifier: expected 6 PASS rows after 0009.
with checks as (
  select 1 n, 'new submission reference_code exists' label,
    exists(select 1 from information_schema.columns where table_schema='public' and table_name='campground_submissions' and column_name='reference_code') ok
  union all
  select 2, 'update submission reference_code exists',
    exists(select 1 from information_schema.columns where table_schema='public' and table_name='campground_update_submissions' and column_name='reference_code')
  union all
  select 3, 'anon has no new-submission table privileges',
    not exists(select 1 from information_schema.role_table_grants where grantee='anon' and table_schema='public' and table_name='campground_submissions')
  union all
  select 4, 'authenticated has no new-submission table privileges',
    not exists(select 1 from information_schema.role_table_grants where grantee='authenticated' and table_schema='public' and table_name='campground_submissions')
  union all
  select 5, 'anon has no update-submission table privileges',
    not exists(select 1 from information_schema.role_table_grants where grantee='anon' and table_schema='public' and table_name='campground_update_submissions')
  union all
  select 6, 'authenticated has no update-submission table privileges',
    not exists(select 1 from information_schema.role_table_grants where grantee='authenticated' and table_schema='public' and table_name='campground_update_submissions')
)
select n, label, case when ok then 'PASS' else 'FAIL' end result from checks order by n;
