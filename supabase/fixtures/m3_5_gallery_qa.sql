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

  -- QA campground only: remove previous photo metadata, including any older
  -- approved cover created by an earlier M3 fixture run.
  delete from public.campground_photos
  where campground_id = v_campground;

  insert into public.campground_photos
    (campground_id, storage_path, alt_text, caption, credit_name, source_url, is_cover, status, sort_order)
  values
    (v_campground, 'qa-external/m3-qa-cover',
      'Tenda camping di punggung gunung',
      'Foto QA untuk menguji cover dan galeri campground.',
      'Mohit Sharma / Unsplash',
      'https://images.unsplash.com/photo-cQqSizbbDxU?auto=format&fit=crop&w=1600&q=85',
      true, 'approved', 10),

    (v_campground, 'qa-external/m3-qa-02',
      'Tenda di area hijau',
      'Foto QA untuk menguji susunan galeri.',
      'Alexey Demidov / Unsplash',
      'https://images.unsplash.com/photo-MgyGdPopV-c?auto=format&fit=crop&w=1400&q=85',
      false, 'approved', 20),

    (v_campground, 'qa-external/m3-qa-03',
      'Tenda di tengah hutan',
      'Foto QA untuk menguji lightbox campground.',
      'Marco Bicca / Unsplash',
      'https://images.unsplash.com/photo-T3rly2lrc4w?auto=format&fit=crop&w=1400&q=85',
      false, 'approved', 30),

    (v_campground, 'qa-external/m3-qa-04',
      'Area camping dengan meja dan kursi outdoor',
      'Foto QA fasilitas dan suasana camping.',
      'Regi Munandar / Unsplash',
      'https://images.unsplash.com/photo-ZSNSjyz0eps?auto=format&fit=crop&w=1400&q=85',
      false, 'approved', 40),

    (v_campground, 'qa-external/m3-qa-05',
      'Tenda menyala pada malam hari',
      'Foto QA untuk menguji navigasi galeri sampai foto terakhir.',
      'Jimmy Liu / Unsplash',
      'https://images.unsplash.com/photo-und_28PbwAA?auto=format&fit=crop&w=1400&q=85',
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
