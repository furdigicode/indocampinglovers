-- M2.2 database-native directory filtering.
-- Idempotent: safe to re-run after 0006.

create or replace function public.search_campgrounds(
  p_q text default null,
  p_province text default null,
  p_regency text default null,
  p_types text[] default '{}'::text[],
  p_facilities text[] default '{}'::text[],
  p_access text[] default '{}'::text[],
  p_min_price bigint default null,
  p_max_price bigint default null,
  p_sort text default 'recommended',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (campground_id uuid, total_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with priced as (
    select c.id, c.name, c.featured, c.last_verified_at, p.slug as province_slug, r.slug as regency_slug,
      (select min(cp.amount_idr) from public.campground_prices cp where cp.campground_id = c.id and cp.is_active) as price_from,
      c.address, c.district, p.name as province_name, r.name as regency_name
    from public.campgrounds c
    join public.provinces p on p.id = c.province_id
    join public.regencies r on r.id = c.regency_id
    where c.status = 'published'
  ), eligible as (
    select c.*
    from priced c
    where (p_q is null or btrim(p_q) = '' or c.name ilike '%' || p_q || '%' or c.address ilike '%' || p_q || '%' or coalesce(c.district,'') ilike '%' || p_q || '%' or c.province_name ilike '%' || p_q || '%' or c.regency_name ilike '%' || p_q || '%')
      and (p_province is null or c.province_slug = p_province)
      and (p_regency is null or c.regency_slug = p_regency)
      and (coalesce(cardinality(p_types),0) = 0 or not exists (
        select 1 from unnest(p_types) wanted(slug)
        where not exists (
          select 1 from public.campground_type_relations ctr join public.campground_types ct on ct.id = ctr.type_id
          where ctr.campground_id = c.id and ct.slug = wanted.slug
        )
      ))
      and (coalesce(cardinality(p_facilities),0) = 0 or not exists (
        select 1 from unnest(p_facilities) wanted(slug)
        where not exists (
          select 1 from public.campground_facilities cf join public.facilities f on f.id = cf.facility_id
          where cf.campground_id = c.id and cf.is_available and f.slug = wanted.slug
        )
      ))
      and (coalesce(cardinality(p_access),0) = 0 or not exists (
        select 1 from unnest(p_access) wanted(value)
        where not exists (
          select 1 from public.campground_access ca where ca.campground_id = c.id and ca.is_accessible and ca.vehicle_type = wanted.value
        )
      ))
      and (p_min_price is null or c.price_from >= p_min_price)
      and (p_max_price is null or c.price_from <= p_max_price)
  )
  select e.id, count(*) over()
  from eligible e
  order by
    case when p_sort = 'recommended' then e.featured end desc nulls last,
    case when p_sort = 'price_asc' then e.price_from end asc nulls last,
    case when p_sort = 'price_desc' then e.price_from end desc nulls last,
    case when p_sort = 'recently_verified' then e.last_verified_at end desc nulls last,
    e.name asc
  limit greatest(1, least(coalesce(p_limit,24),100))
  offset greatest(coalesce(p_offset,0),0);
$$;

revoke all on function public.search_campgrounds(text,text,text,text[],text[],text[],bigint,bigint,text,integer,integer) from public;
grant execute on function public.search_campgrounds(text,text,text,text[],text[],text[],bigint,bigint,text,integer,integer) to anon, authenticated;

create index if not exists campground_access_filter_idx on public.campground_access(vehicle_type, campground_id) where is_accessible;
create index if not exists campground_prices_amount_filter_idx on public.campground_prices(amount_idr, campground_id) where is_active;
