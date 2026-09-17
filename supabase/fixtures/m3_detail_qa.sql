-- M3 CAMPGROUND DETAIL QA FIXTURE
-- DEVELOPMENT/QA ONLY. Do not run against production data.
-- Creates one fictional, fully-populated campground for M3.2-M3.6 visual/data QA.
-- Idempotent: deletes and recreates only slug `icl-qa-m3-detail`.
--
-- Detail URL after running:
--   http://localhost:3000/camping/icl-qa-m3-detail
--
-- NOTE: no campground_photos are inserted here because Storage object upload is
-- handled through the Supabase Storage API. The page intentionally exercises
-- the existing fallback cover image until M3.5 gallery QA gets a Storage fixture.

begin;

delete from public.campgrounds where slug = 'icl-qa-m3-detail';

do $$
declare
  v_province uuid;
  v_regency uuid;
  v_campground uuid;
begin
  select id into v_province from public.provinces where slug = 'jawa-tengah';

  select r.id into v_regency
  from public.regencies r
  where r.province_id = v_province
    and r.slug in ('semarang', 'kabupaten-semarang')
  order by case when r.slug = 'semarang' then 0 else 1 end
  limit 1;

  if v_province is null or v_regency is null then
    raise exception 'M3 fixture requires Jawa Tengah and Kabupaten Semarang reference data';
  end if;

  insert into public.campgrounds (
    name, slug, short_description, description,
    province_id, regency_id, district, address,
    latitude, longitude, elevation_m, capacity_people,
    access_description, check_in_info, good_to_know,
    status, verification_status, last_verified_at, featured, published_at
  ) values (
    'ICL QA Detail Camp',
    'icl-qa-m3-detail',
    'Campground fiktif dengan data lengkap untuk menguji halaman detail IndoCampingLovers.',
    'ICL QA Detail Camp adalah data fiktif khusus development. Halaman ini dipakai untuk memastikan deskripsi panjang, fasilitas, akses, harga, kontak, status data, dan informasi kedatangan tampil dengan baik pada berbagai ukuran layar.\n\nData pada record ini bukan rekomendasi tempat camping nyata dan tidak boleh dipublikasikan sebagai informasi destinasi.',
    v_province, v_regency, 'Bandungan',
    'Jl. QA Camping No. 3, Bandungan, Kabupaten Semarang, Jawa Tengah',
    -7.214500, 110.342700, 1250, 120,
    'Jalan utama dapat dilalui mobil. Sekitar 300 meter terakhir berupa jalan lingkungan menanjak; kendaraan rendah disarankan berjalan perlahan.',
    'Check-in camper pukul 13.00–17.00. Jika tiba setelah pukul 17.00, konfirmasi terlebih dahulu kepada pengelola. Check-out maksimal pukul 11.00.',
    'Cuaca pegunungan dapat berubah cepat. Bawa jas hujan dan pakaian hangat. Api unggun hanya diperbolehkan di area yang ditentukan pengelola. Jaga ketenangan setelah pukul 22.00.',
    'published', 'verified', now() - interval '2 days', false, now() - interval '30 days'
  ) returning id into v_campground;

  -- Types
  insert into public.campground_type_relations (campground_id, type_id)
    select v_campground, id from public.campground_types where slug in ('family-camping','mountain-camp');

  -- Facilities with notes. Only inserts reference facilities that exist.
  insert into public.campground_facilities (campground_id, facility_id, note, is_available)
    select v_campground, id,
      case slug
        when 'toilet' then 'Toilet tersedia di dua blok dekat area camping.'
        when 'air-bersih' then 'Air bersih tersedia dari keran umum.'
        when 'listrik' then 'Titik listrik terbatas di area pengelola.'
        when 'warung' then 'Warung buka sekitar pukul 07.00–21.00.'
        else 'Fasilitas tersedia di area campground.'
      end,
      true
    from public.facilities
    where slug in ('toilet','air-bersih','listrik','warung');

  -- Vehicle access with notes
  insert into public.campground_access (campground_id, vehicle_type, is_accessible, note) values
    (v_campground, 'motor', true, 'Dapat masuk hingga area parkir dekat camping ground.'),
    (v_campground, 'mobil', true, 'Mobil dapat masuk hingga area parkir; jalan terakhir menanjak.'),
    (v_campground, 'campervan', true, 'Akses memungkinkan untuk campervan ukuran kecil; konfirmasi ruang parkir terlebih dahulu.');

  -- Audience suitability
  insert into public.campground_suitable_for (campground_id, label) values
    (v_campground, 'Keluarga'),
    (v_campground, 'Pemula'),
    (v_campground, 'Grup kecil'),
    (v_campground, 'Campervan kecil');

  -- Multiple active prices for M3.4
  insert into public.campground_prices (campground_id, type, label, amount_idr, unit, note, is_active, sort_order) values
    (v_campground, 'entrance', 'Tiket masuk', 10000, 'orang', 'Berlaku untuk pengunjung non-camping.', true, 10),
    (v_campground, 'camping', 'Camping dewasa', 35000, 'orang/malam', 'Belum termasuk sewa tenda.', true, 20),
    (v_campground, 'camping', 'Camping anak', 20000, 'anak/malam', 'Untuk anak usia 5–12 tahun.', true, 30),
    (v_campground, 'parking', 'Parkir mobil', 10000, 'kendaraan/malam', null, true, 40),
    (v_campground, 'tent_rental', 'Sewa tenda 4 orang', 120000, 'tenda/malam', 'Stok terbatas, reservasi disarankan.', true, 50),
    (v_campground, 'firewood', 'Kayu bakar', 25000, 'ikat', 'Gunakan hanya pada area api unggun.', true, 60),
    -- Must NOT appear publicly because active-price RLS excludes it.
    (v_campground, 'other', 'Harga lama QA', 999999, 'paket', 'INACTIVE — tidak boleh tampil di public detail.', false, 999);

  -- Public contacts for M3.4
  insert into public.campground_contacts (campground_id, type, label, value, is_primary, is_public) values
    (v_campground, 'whatsapp', 'Reservasi WhatsApp', '081234567890', true, true),
    (v_campground, 'instagram', 'Instagram campground', '@icl.qa.detail', false, true),
    (v_campground, 'phone', 'Telepon pengelola', '+62 812-3456-7890', false, true),
    (v_campground, 'website', 'Website resmi', 'example.com/icl-qa-detail', false, true),
    (v_campground, 'email', 'Email pengelola', 'qa-detail@example.com', false, true),
    -- Must NOT appear publicly because contact RLS excludes it.
    (v_campground, 'phone', 'Kontak internal QA', '0800000000', false, false);
end $$;

commit;

-- QA summary. Expected:
-- campground = 1
-- active_prices = 6 (inactive price must be hidden from public API)
-- public_contacts = 5 (private contact must be hidden from public API)
select
  c.slug,
  c.status,
  c.verification_status,
  c.capacity_people,
  (select count(*) from public.campground_prices p where p.campground_id=c.id and p.is_active) as active_prices,
  (select count(*) from public.campground_contacts x where x.campground_id=c.id and x.is_public) as public_contacts,
  (select count(*) from public.campground_facilities f where f.campground_id=c.id and f.is_available) as facilities,
  (select count(*) from public.campground_access a where a.campground_id=c.id and a.is_accessible) as access_modes
from public.campgrounds c
where c.slug='icl-qa-m3-detail';
