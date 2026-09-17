-- M3.5 GALLERY QA FIXTURE — UNSPLASH
-- DEVELOPMENT/QA ONLY.
-- Prerequisite: run supabase/fixtures/m3_detail_qa.sql first.
--
-- These records deliberately use source_url so M3.5 can be visually tested
-- without manually uploading binary files to Supabase Storage. Production
-- campground photos should still normally use the campground-photos bucket.
--
-- This fixture intentionally replaces ALL photo metadata for the fictional
-- campground `icl-qa-m3-detail`. That keeps reruns deterministic and avoids
-- the one-approved-cover unique constraint when an older QA cover exists.

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

  delete from public.campground_photos
  where campground_id = v_campground;

  insert into public.campground_photos
    (campground_id, storage_path, alt_text, caption, credit_name, source_url, is_cover, status, sort_order)
  values
    (v_campground, 'qa-external/m3-qa-cover',
      'Tenda camping di alam terbuka',
      'Foto QA untuk menguji cover dan galeri campground.',
      'Unsplash QA',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1600&q=85',
      true, 'approved', 10),

    (v_campground, 'qa-external/m3-qa-02',
      'Area camping di alam',
      'Foto QA untuk menguji susunan galeri.',
      'Unsplash QA',
      'https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=1400&q=85',
      false, 'approved', 20),

    (v_campground, 'qa-external/m3-qa-03',
      'Tenda di kawasan pegunungan',
      'Foto QA untuk menguji lightbox campground.',
      'Unsplash QA',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=1400&q=85',
      false, 'approved', 30),

    (v_campground, 'qa-external/m3-qa-04',
      'Suasana campground di alam terbuka',
      'Foto QA fasilitas dan suasana camping.',
      'Unsplash QA',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1400&q=85',
      false, 'approved', 40),

    (v_campground, 'qa-external/m3-qa-05',
      'Tenda camping pada malam hari',
      'Foto QA untuk menguji navigasi galeri sampai foto terakhir.',
      'Unsplash QA',
      'https://images.unsplash.com/photo-1496545672447-f699b503d270?auto=format&fit=crop&w=1400&q=85',
      false, 'approved', 50);
end $$;

commit;

-- EXPECTED: 5 approved rows, exactly one cover, sort_order 10..50.
select
  p.storage_path,
  p.source_url,
  p.is_cover,
  p.status,
  p.sort_order,
  p.alt_text,
  p.caption,
  p.credit_name
from public.campground_photos p
join public.campgrounds c on c.id = p.campground_id
where c.slug = 'icl-qa-m3-detail'
order by p.sort_order;
