-- M1.4 reference seed data
-- Idempotent: safe to run repeatedly.
-- Scope: Indonesia provinces + initial campground taxonomy/facilities.

insert into public.provinces (code,name,slug) values
('11','Aceh','aceh'),('12','Sumatera Utara','sumatera-utara'),('13','Sumatera Barat','sumatera-barat'),('14','Riau','riau'),('15','Jambi','jambi'),('16','Sumatera Selatan','sumatera-selatan'),('17','Bengkulu','bengkulu'),('18','Lampung','lampung'),('19','Kepulauan Bangka Belitung','kepulauan-bangka-belitung'),('21','Kepulauan Riau','kepulauan-riau'),
('31','DKI Jakarta','dki-jakarta'),('32','Jawa Barat','jawa-barat'),('33','Jawa Tengah','jawa-tengah'),('34','DI Yogyakarta','di-yogyakarta'),('35','Jawa Timur','jawa-timur'),('36','Banten','banten'),
('51','Bali','bali'),('52','Nusa Tenggara Barat','nusa-tenggara-barat'),('53','Nusa Tenggara Timur','nusa-tenggara-timur'),
('61','Kalimantan Barat','kalimantan-barat'),('62','Kalimantan Tengah','kalimantan-tengah'),('63','Kalimantan Selatan','kalimantan-selatan'),('64','Kalimantan Timur','kalimantan-timur'),('65','Kalimantan Utara','kalimantan-utara'),
('71','Sulawesi Utara','sulawesi-utara'),('72','Sulawesi Tengah','sulawesi-tengah'),('73','Sulawesi Selatan','sulawesi-selatan'),('74','Sulawesi Tenggara','sulawesi-tenggara'),('75','Gorontalo','gorontalo'),('76','Sulawesi Barat','sulawesi-barat'),
('81','Maluku','maluku'),('82','Maluku Utara','maluku-utara'),
('91','Papua','papua'),('92','Papua Barat','papua-barat'),('93','Papua Selatan','papua-selatan'),('94','Papua Tengah','papua-tengah'),('95','Papua Pegunungan','papua-pegunungan'),('96','Papua Barat Daya','papua-barat-daya')
on conflict (code) do update set name=excluded.name,slug=excluded.slug;

insert into public.campground_types (name,slug,description) values
('Family Camping','family-camping','Camping yang cocok untuk keluarga dan pengalaman rekreasi umum.'),
('Mountain Camp','mountain-camp','Camping dengan karakter pegunungan, dataran tinggi, atau panorama gunung.'),
('Forest Camp','forest-camp','Camping di area hutan atau kawasan dengan dominasi pepohonan.'),
('Lakeside Camp','lakeside-camp','Camping di sekitar danau atau tepian perairan darat.'),
('Riverside Camp','riverside-camp','Camping di sekitar sungai atau aliran air.'),
('Beach Camp','beach-camp','Camping di kawasan pantai atau pesisir.'),
('Campervan','campervan','Lokasi yang mendukung pengalaman camping menggunakan campervan atau kendaraan.'),
('Glamping','glamping','Akomodasi camping dengan fasilitas dan kenyamanan tambahan.'),
('Wild Camp','wild-camp','Lokasi camping dengan fasilitas minimal dan karakter alam yang lebih alami.')
on conflict (slug) do update set name=excluded.name,description=excluded.description;

insert into public.facilities (name,slug,category,icon_key,sort_order) values
('Toilet','toilet','sanitasi','toilet',10),
('Kamar Mandi','kamar-mandi','sanitasi','shower',20),
('Air Bersih','air-bersih','sanitasi','droplets',30),
('Musala','musala','ibadah','landmark',40),
('Listrik','listrik','utilitas','zap',50),
('Warung','warung','makanan','store',60),
('Area Parkir','area-parkir','akses','parking',70),
('Sewa Tenda','sewa-tenda','rental','tent',80),
('Sewa Peralatan Camping','sewa-peralatan-camping','rental','backpack',90),
('Kayu Bakar','kayu-bakar','aktivitas','flame',100),
('Area Api Unggun','area-api-unggun','aktivitas','flame-kindling',110),
('WiFi','wifi','konektivitas','wifi',120),
('Sinyal Seluler','sinyal-seluler','konektivitas','signal',130),
('Tempat Sampah','tempat-sampah','kebersihan','trash-2',140),
('Petugas / Pengelola','petugas-pengelola','layanan','badge-info',150),
('P3K','p3k','keselamatan','briefcase-medical',160)
on conflict (slug) do update set name=excluded.name,category=excluded.category,icon_key=excluded.icon_key,sort_order=excluded.sort_order;
