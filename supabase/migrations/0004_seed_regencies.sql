-- M1.4B — Kabupaten/Kota Indonesia
-- Source snapshot: awanaprilino/wilayah-administrasi-kemendagri
-- Based on Kepmendagri No. 300.2.2-2138 Tahun 2025.
-- Pinned source commit: 0070ea5850285f74cb747da3b72bccb1db13f20f
-- Expected dataset: 514 kabupaten/kota.
-- Idempotent by regencies.code.

create extension if not exists http with schema extensions;
create extension if not exists unaccent with schema extensions;

do $$
declare
  csv_text text;
  line text;
  cols text[];
  source_rows integer := 0;
  province_uuid uuid;
  regency_name text;
  regency_slug text;
  regency_type text;
begin
  select content into csv_text
  from extensions.http_get(
    'https://raw.githubusercontent.com/awanaprilino/wilayah-administrasi-kemendagri/0070ea5850285f74cb747da3b72bccb1db13f20f/csv/regencies.csv'
  );

  if csv_text is null or length(csv_text) < 1000 then
    raise exception 'M1.4B source download failed or returned incomplete data';
  end if;

  for line in
    select trim(both E'\r' from value)
    from regexp_split_to_table(csv_text, E'\n') as value
    where value <> '' and value not like 'id,province_id,code,name%'
  loop
    cols := string_to_array(line, ',');
    if array_length(cols, 1) <> 4 then
      raise exception 'Unexpected CSV row: %', line;
    end if;

    select id into province_uuid from public.provinces where code = trim(cols[2]);
    if province_uuid is null then
      raise exception 'Province code % does not exist. Run 0003_seed_reference_data.sql first.', trim(cols[2]);
    end if;

    regency_name := trim(cols[4]);
    regency_type := case when lower(regency_name) like 'kota%' then 'kota' else 'kabupaten' end;
    regency_slug := lower(extensions.unaccent(regency_name));
    regency_slug := regexp_replace(regency_slug, '[^a-z0-9]+', '-', 'g');
    regency_slug := trim(both '-' from regency_slug);

    insert into public.regencies (province_id, code, name, slug, type)
    values (province_uuid, trim(cols[3]), regency_name, regency_slug, regency_type)
    on conflict (code) do update set
      province_id = excluded.province_id,
      name = excluded.name,
      slug = excluded.slug,
      type = excluded.type;

    source_rows := source_rows + 1;
  end loop;

  if source_rows <> 514 then
    raise exception 'M1.4B validation failed: expected 514 source rows, received %', source_rows;
  end if;

  if (select count(*) from public.regencies) <> 514 then
    raise exception 'M1.4B validation failed: public.regencies should contain 514 rows, contains %', (select count(*) from public.regencies);
  end if;

  if exists (
    select 1 from public.provinces p
    left join public.regencies r on r.province_id = p.id
    group by p.id having count(r.id) = 0
  ) then
    raise exception 'M1.4B validation failed: at least one province has no regencies';
  end if;
end $$;

-- Verification summary returned by SQL Editor.
select
  (select count(*) from public.provinces) as provinces,
  (select count(*) from public.regencies) as regencies,
  (select count(distinct province_id) from public.regencies) as provinces_with_regencies;
