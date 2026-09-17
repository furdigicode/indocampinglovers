-- M3.5 GALLERY QA FIXTURE
-- DEVELOPMENT/QA ONLY.
--
-- Prerequisite:
--   Run supabase/fixtures/m3_detail_qa.sql first.
--
-- IMPORTANT:
-- SQL cannot upload image bytes to Supabase Storage. Before running this file,
-- upload 5 real JPEG files to bucket `campground-photos` using EXACTLY the
-- object paths printed by the first SELECT below.
--
-- Workflow:
-- 1. Run only the PREVIEW PATHS SELECT below and copy the campground UUID.
-- 2. In Supabase Storage > campground-photos, create/open folder <UUID>.
-- 3. Upload five JPEGs and name them exactly:
--      m3-qa-cover.jpg
--      m3-qa-02.jpg
--      m3-qa-03.jpg
--      m3-qa-04.jpg
--      m3-qa-05.jpg
-- 4. Run the whole file.
-- 5. Open http://localhost:3000/camping/icl-qa-m3-detail

-- PREVIEW PATHS: safe to run before uploading files.
select
  c.id as campground_id,
  c.id::text || '/m3-qa-cover.jpg' as cover_path,
  c.id::text || '/m3-qa-02.jpg' as photo_2_path,
  c.id::text || '/m3-qa-03.jpg' as photo_3_path,
  c.id::text || '/m3-qa-04.jpg' as photo_4_path,
  c.id::text || '/m3-qa-05.jpg' as photo_5_path
from public.campgrounds c
where c.slug = 'icl-qa-m3-detail';

begin;

do $$
declare
  v_campground uuid;
begin
  select id into v_campground
  from public.campgrounds
  where slug = 'icl-qa-m3-detail';

  if v_campground is null then
    raise exception 'Run supabase/fixtures/m3_detail_qa.sql first: campground icl-qa-m3-detail not found';
  end if;

  -- Remove only this fixture's previous metadata so reruns are idempotent.
  delete from public.campground_photos
  where campground_id = v_campground
    and storage_path in (
      v_campground::text || '/m3-qa-cover.jpg',
      v_campground::text || '/m3-qa-02.jpg',
      v_campground::text || '/m3-qa-03.jpg',
      v_campground::text || '/m3-qa-04.jpg',
      v_campground::text || '/m3-qa-05.jpg'
    );

  insert into public.campground_photos
    (campground_id, storage_path, alt_text, caption, credit_name, source_url, is_cover, status, sort_order)
  values
    (v_campground, v_campground::text || '/m3-qa-cover.jpg',
      'Area camping utama ICL QA Detail Camp',
      'Area camping utama dengan suasana pegunungan.',
      'ICL QA Fixture', null, true, 'approved', 10),
    (v_campground, v_campground::text || '/m3-qa-02.jpg',
      'Tenda di ICL QA Detail Camp',
      'Contoh area mendirikan tenda.',
      'ICL QA Fixture', null, false, 'approved', 20),
    (v_campground, v_campground::text || '/m3-qa-03.jpg',
      'Pemandangan dari ICL QA Detail Camp',
      'Pemandangan dari sekitar campground.',
      'ICL QA Fixture', null, false, 'approved', 30),
    (v_campground, v_campground::text || '/m3-qa-04.jpg',
      'Fasilitas umum ICL QA Detail Camp',
      'Contoh dokumentasi fasilitas campground.',
      'ICL QA Fixture', null, false, 'approved', 40),
    (v_campground, v_campground::text || '/m3-qa-05.jpg',
      'Suasana malam ICL QA Detail Camp',
      'Contoh suasana malam di area camping.',
      'ICL QA Fixture', null, false, 'approved', 50);
end $$;

commit;

-- EXPECTED: 5 rows, exactly one cover, all approved, sort_order 10..50.
select
  p.storage_path,
  p.is_cover,
  p.status,
  p.sort_order,
  p.alt_text,
  p.caption,
  p.credit_name
from public.campground_photos p
join public.campgrounds c on c.id = p.campground_id
where c.slug = 'icl-qa-m3-detail'
  and p.storage_path like '%/m3-qa-%'
order by p.sort_order;
