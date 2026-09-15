-- IndoCampingLovers M2.2 verification
-- Expected: every row returns PASS.

with fn as (
  select p.oid, p.prosecdef, p.provolatile, p.proconfig
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'search_campgrounds'
    and pg_get_function_identity_arguments(p.oid) = 'p_q text, p_province text, p_regency text, p_types text[], p_facilities text[], p_access text[], p_min_price bigint, p_max_price bigint, p_sort text, p_limit integer, p_offset integer'
), checks as (
  select 10 n, 'search_campgrounds RPC exists' check_name, exists(select 1 from fn) ok
  union all
  select 20, 'RPC is SECURITY INVOKER', exists(select 1 from fn where not prosecdef)
  union all
  select 30, 'RPC is STABLE', exists(select 1 from fn where provolatile = 's')
  union all
  select 40, 'RPC pins empty search_path', exists(select 1 from fn where proconfig @> array['search_path=""'])
  union all
  select 50, 'anon can execute directory RPC', has_function_privilege('anon', 'public.search_campgrounds(text,text,text,text[],text[],text[],bigint,bigint,text,integer,integer)', 'EXECUTE')
  union all
  select 60, 'authenticated can execute directory RPC', has_function_privilege('authenticated', 'public.search_campgrounds(text,text,text,text[],text[],text[],bigint,bigint,text,integer,integer)', 'EXECUTE')
  union all
  select 70, 'PUBLIC does not receive directory RPC EXECUTE', not exists (
    select 1 from fn f cross join lateral aclexplode(coalesce((select proacl from pg_proc where oid=f.oid), acldefault('f',(select proowner from pg_proc where oid=f.oid)))) a
    where a.grantee = 0 and a.privilege_type = 'EXECUTE'
  )
  union all
  select 80, 'directory filter indexes exist', to_regclass('public.campground_access_filter_idx') is not null and to_regclass('public.campground_prices_amount_filter_idx') is not null
)
select n, check_name, case when ok then 'PASS' else 'FAIL' end result from checks order by n;
