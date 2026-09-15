-- IndoCampingLovers M1.7 end-to-end development fixture
-- PURPOSE: prove the public Next.js read path against real Supabase relations + RLS.
-- SAFE TO RE-RUN: yes. Development/testing only; do not treat this record as verified real-world data.
-- Cleanup: run supabase/verification/m1_7_e2e_cleanup.sql when testing is complete.

do $$
declare
  v_province_id uuid;
  v_regency_id uuid;
  v_campground_id uuid;
begin
  select id into v_province_id from public.provinces where code = '32';
  if v_province_id is null then raise exception 'M1.7 fixture: Jawa Barat province not found'; end if;

  select id into v_regency_id
  from public.regencies
  where province_id = v_province_id and lower(name) like '%bandung%'
  order by case when type = 'kabupaten' then 0 else 1 end, name
  limit 1;
  if v_regency_id is null then raise exception 'M1.7 fixture: Bandung regency not found'; end if;

  insert into public.campgrounds (
    name, slug, short_description, description, province_id, regency_id, district, address,
    latitude, longitude, elevation_m, capacity_people, access_description, check_in_info, good_to_know,
    status, verification_status, last_verified_at, featured, published_at
  ) values (
    'ICL Development Camp', 'icl-development-camp',
    'Campground khusus pengujian end-to-end IndoCampingLovers. Bukan listing tempat camping nyata.',
    'Fixture development untuk memverifikasi directory, detail, relasi, harga, fasilitas, akses, foto fallback, dan RLS.',
    v_province_id, v_regency_id, 'Development District', 'Alamat pengujian — bukan lokasi campground nyata',
    -6.917500, 107.619100, 768, 50,
    'Akses pengujian untuk mobil dan motor.', 'Check-in pengujian.', 'Data ini hanya untuk development.',
    'published', 'verified', now(), true, now()
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    province_id = excluded.province_id,
    regency_id = excluded.regency_id,
    district = excluded.district,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    elevation_m = excluded.elevation_m,
    capacity_people = excluded.capacity_people,
    access_description = excluded.access_description,
    check_in_info = excluded.check_in_info,
    good_to_know = excluded.good_to_know,
    status = excluded.status,
    verification_status = excluded.verification_status,
    last_verified_at = excluded.last_verified_at,
    featured = excluded.featured,
    published_at = excluded.published_at
  returning id into v_campground_id;

  insert into public.campground_type_relations (campground_id, type_id)
  select v_campground_id, id from public.campground_types where slug in ('family-camping','mountain-camp')
  on conflict do nothing;

  insert into public.campground_facilities (campground_id, facility_id, is_available)
  select v_campground_id, id, true from public.facilities where slug in ('toilet','air-bersih','area-parkir','musala','warung')
  on conflict (campground_id, facility_id) do update set is_available = true;

  insert into public.campground_access (campground_id, vehicle_type, is_accessible, note) values
    (v_campground_id, 'Mobil', true, 'Fixture development'),
    (v_campground_id, 'Motor', true, 'Fixture development')
  on conflict (campground_id, vehicle_type) do update set is_accessible = true, note = excluded.note;

  insert into public.campground_suitable_for (campground_id, label) values
    (v_campground_id, 'Keluarga'),
    (v_campground_id, 'Pemula')
  on conflict (campground_id, label) do nothing;

  delete from public.campground_prices where campground_id = v_campground_id;
  insert into public.campground_prices (campground_id, type, label, amount_idr, unit, note, is_active, sort_order) values
    (v_campground_id, 'camping', 'Camping per orang', 35000, 'orang/malam', 'Harga fixture development', true, 10),
    (v_campground_id, 'parking', 'Parkir mobil', 10000, 'kendaraan', 'Harga fixture development', true, 20);

  -- Intentionally no campground_photos row. The UI must exercise its approved-photo fallback path.
end $$;

select
  c.slug,
  c.status,
  c.featured,
  c.verification_status,
  p.name as province,
  r.name as regency,
  (select count(*) from public.campground_type_relations x where x.campground_id = c.id) as type_count,
  (select count(*) from public.campground_facilities x where x.campground_id = c.id and x.is_available) as facility_count,
  (select count(*) from public.campground_prices x where x.campground_id = c.id and x.is_active) as active_price_count
from public.campgrounds c
join public.provinces p on p.id = c.province_id
join public.regencies r on r.id = c.regency_id
where c.slug = 'icl-development-camp';
