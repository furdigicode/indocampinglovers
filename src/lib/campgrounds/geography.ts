import { createPublicSupabaseClient } from "@/lib/supabase/client";

export type ProvinceGeography = {
  id: string;
  code: string;
  name: string;
  slug: string;
};

export type RegencyGeography = {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: "kabupaten" | "kota";
  provinceId: string;
};

export type ProvinceLanding = ProvinceGeography & {
  publishedCampgroundCount: number;
  regencies: Array<RegencyGeography & { publishedCampgroundCount: number }>;
};

export type RegencyLanding = RegencyGeography & {
  province: ProvinceGeography;
  publishedCampgroundCount: number;
};

type DbRegency = {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: "kabupaten" | "kota";
  province_id: string;
};

function normalizeCount(count: number | null): number {
  return typeof count === "number" && Number.isFinite(count) ? count : 0;
}

function mapRegency(row: DbRegency): RegencyGeography {
  return { id: row.id, code: row.code, name: row.name, slug: row.slug, type: row.type, provinceId: row.province_id };
}

export async function getProvinceBySlug(slug: string): Promise<ProvinceGeography | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("provinces").select("id,code,name,slug").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Unable to resolve province: ${error.message}`);
  return data as ProvinceGeography | null;
}

export async function isProvinceSlug(slug: string): Promise<boolean> {
  return Boolean(await getProvinceBySlug(slug));
}

export async function getProvinceLanding(slug: string): Promise<ProvinceLanding | null> {
  const province = await getProvinceBySlug(slug);
  if (!province) return null;

  const supabase = createPublicSupabaseClient();
  const [{ count: provinceCount, error: provinceCountError }, { data: regencies, error: regencyError }] = await Promise.all([
    supabase.from("campgrounds").select("id", { count: "exact", head: true }).eq("province_id", province.id),
    supabase.from("regencies").select("id,code,name,slug,type,province_id").eq("province_id", province.id).order("name"),
  ]);
  const error = provinceCountError ?? regencyError;
  if (error) throw new Error(`Unable to load province geography: ${error.message}`);

  const regencyRows = ((regencies ?? []) as DbRegency[]).map(mapRegency);
  const regencyCounts = await Promise.all(regencyRows.map(async (regency) => {
    const { count, error: countError } = await supabase.from("campgrounds").select("id", { count: "exact", head: true }).eq("regency_id", regency.id);
    if (countError) throw new Error(`Unable to count regency campgrounds: ${countError.message}`);
    return { ...regency, publishedCampgroundCount: normalizeCount(count) };
  }));

  return { ...province, publishedCampgroundCount: normalizeCount(provinceCount), regencies: regencyCounts };
}

export async function getRegencyLanding(provinceSlug: string, regencySlug: string): Promise<RegencyLanding | null> {
  const province = await getProvinceBySlug(provinceSlug);
  if (!province) return null;

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("regencies").select("id,code,name,slug,type,province_id").eq("province_id", province.id).eq("slug", regencySlug).maybeSingle();
  if (error) throw new Error(`Unable to resolve regency: ${error.message}`);
  if (!data) return null;

  const regency = mapRegency(data as DbRegency);
  const { count, error: countError } = await supabase.from("campgrounds").select("id", { count: "exact", head: true }).eq("regency_id", regency.id);
  if (countError) throw new Error(`Unable to count regency campgrounds: ${countError.message}`);

  return { ...regency, province, publishedCampgroundCount: normalizeCount(count) };
}

export async function getPublishedProvinceLandings(): Promise<ProvinceLanding[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("provinces").select("id,code,name,slug").order("name");
  if (error) throw new Error(`Unable to load provinces: ${error.message}`);
  const landings = await Promise.all(((data ?? []) as ProvinceGeography[]).map((province) => getProvinceLanding(province.slug)));
  return landings.filter((province): province is ProvinceLanding => Boolean(province && province.publishedCampgroundCount > 0));
}
