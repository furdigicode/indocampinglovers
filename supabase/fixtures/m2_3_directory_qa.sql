-- M2.3 DIRECTORY UX QA FIXTURE
-- DEVELOPMENT/QA ONLY. Do not run against production data.
-- Creates 30 clearly-labelled campground records to exercise pagination and filters.
-- Idempotent: cleanup matching ICL QA records first, then recreates them.

begin;

delete from public.campgrounds where slug like 'icl-qa-m23-%';

do $$
declare
  i integer;
  v_province uuid;
  v_regency uuid;
  v_campground uuid;
  v_type_slug text;
  v_facility_slug text;
  v_province_slug text;
  v_regency_slug text;
  v_name text;
  v_price bigint;
begin
  for i in 1..30 loop
    v_province_slug := case (i - 1) % 3 when 0 then 'jawa-barat' when 1 then 'jawa-tengah' else 'jawa-timur' end;
    v_regency_slug := case (i - 1) % 3 when 0 then 'kabupaten-bandung' when 1 then 'kabupaten-semarang' else 'kabupaten-malang' end;

    select id into v_province from public.provinces where slug = v_province_slug;
    select r.id into v_regency from public.regencies r where r.province_id = v_province and r.slug = v_regency_slug;

    if v_regency is null then
      -- Official regency seed slugs may omit the administrative prefix.
      v_regency_slug := case (i - 1) % 3 when 0 then 'bandung' when 1 then 'semarang' else 'malang' end;
      select r.id into v_regency from public.regencies r where r.province_id = v_province and r.slug = v_regency_slug;
    end if;

    if v_province is null or v_regency is null then
      raise exception 'M2.3 QA fixture requires Bandung, Semarang and Malang regencies from 0004_seed_regencies.sql';
    end if;

    v_name := 'ICL QA Camp ' || lpad(i::text, 2, '0');
    v_price := 15000 + ((i - 1) % 6) * 10000;

    insert into public.campgrounds (
      name, slug, short_description, description, province_id, regency_id, district, address,
      latitude, longitude, elevation_m, status, verification_status, last_verified_at, featured, published_at
    ) values (
      v_name,
      'icl-qa-m23-' || lpad(i::text, 2, '0'),
      'Data dummy khusus QA M2.3 untuk menguji directory, filter, sorting, card, dan pagination.',
      'Bukan campground nyata. Record ini hanya untuk development dan QA IndoCampingLovers.',
      v_province, v_regency, 'Kecamatan QA', 'Alamat QA ' || i || ', Indonesia',
      -7.000000 - (i::numeric / 1000), 107.000000 + (i::numeric / 1000), 500 + (i * 20),
      'published',
      case when i % 5 = 0 then 'needs_update'::public.verification_status when i % 3 = 0 then 'community_updated'::public.verification_status else 'verified'::public.verification_status end,
      now() - make_interval(days => i),
      i <= 3,
      now() - make_interval(days => 40 - i)
    ) returning id into v_campground;

    v_type_slug := case (i - 1) % 5 when 0 then 'family-camping' when 1 then 'mountain-camp' when 2 then 'forest-camp' when 3 then 'campervan' else 'glamping' end;
    insert into public.campground_type_relations (campground_id, type_id)
      select v_campground, id from public.campground_types where slug = v_type_slug;

    -- Every QA record has Toilet. Extra facilities create useful AND-filter combinations.
    insert into public.campground_facilities (campground_id, facility_id, is_available)
      select v_campground, id, true from public.facilities where slug = 'toilet';
    if i % 2 = 0 then
      insert into public.campground_facilities (campground_id, facility_id, is_available)
        select v_campground, id, true from public.facilities where slug = 'air-bersih';
    end if;
    if i % 3 = 0 then
      insert into public.campground_facilities (campground_id, facility_id, is_available)
        select v_campground, id, true from public.facilities where slug = 'listrik';
    end if;
    if i % 4 = 0 then
      insert into public.campground_facilities (campground_id, facility_id, is_available)
        select v_campground, id, true from public.facilities where slug = 'warung';
    end if;

    insert into public.campground_access (campground_id, vehicle_type, is_accessible, note)
    values (v_campground, case when i % 3 = 0 then 'motor' when i % 3 = 1 then 'mobil' else 'campervan' end, true, 'Data QA M2.3');

    -- Four records deliberately have no active price to test unknown-price UI.
    if i not in (7, 14, 21, 28) then
      insert into public.campground_prices (campground_id, type, label, amount_idr, unit, is_active, sort_order)
      values (v_campground, 'camping', 'Camping per orang', v_price, 'orang', true, 10);
    end if;
  end loop;
end $$;

commit;

-- Expected: 30 rows.
select count(*) as qa_campgrounds from public.campgrounds where slug like 'icl-qa-m23-%';
