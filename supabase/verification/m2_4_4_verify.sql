-- M2.4.4 verification: run in Supabase SQL Editor after 0008_map_directory_limit.sql.
-- Expected result: all rows PASS.

with checks as (
  select 1 as n, 'search_campgrounds exists' as check_name,
    to_regprocedure('public.search_campgrounds(text,text,text,text[],text[],text[],bigint,bigint,text,integer,integer)') is not null as passed
  union all
  select 2, 'RPC remains SECURITY INVOKER',
    coalesce((select not p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='search_campgrounds' limit 1), false)
  union all
  select 3, 'anon can execute RPC',
    has_function_privilege('anon','public.search_campgrounds(text,text,text,text[],text[],text[],bigint,bigint,text,integer,integer)','EXECUTE')
  union all
  select 4, 'authenticated can execute RPC',
    has_function_privilege('authenticated','public.search_campgrounds(text,text,text,text[],text[],text[],bigint,bigint,text,integer,integer)','EXECUTE')
  union all
  select 5, 'PUBLIC cannot execute RPC',
    not has_function_privilege('public','public.search_campgrounds(text,text,text,text[],text[],text[],bigint,bigint,text,integer,integer)','EXECUTE')
  union all
  select 6, 'RPC source has 500 result ceiling',
    coalesce((select pg_get_functiondef(p.oid) like '%least(coalesce(p_limit,24),500)%' from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='search_campgrounds' limit 1), false)
)
select n, check_name, case when passed then 'PASS' else 'FAIL' end as result
from checks
order by n;
