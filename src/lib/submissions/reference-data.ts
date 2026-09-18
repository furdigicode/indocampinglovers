import { createPublicSupabaseClient } from "@/lib/supabase/client";

export type ContributionReferenceData = {
  provinces: Array<{ id: string; name: string }>;
  regencies: Array<{ id: string; provinceId: string; name: string }>;
  types: Array<{ id: string; name: string }>;
  facilities: Array<{ id: string; name: string }>;
};

export async function getContributionReferenceData(): Promise<ContributionReferenceData> {
  const supabase = createPublicSupabaseClient();
  const [provinces, regencies, types, facilities] = await Promise.all([
    supabase.from("provinces").select("id,name").order("name"),
    supabase.from("regencies").select("id,province_id,name").order("name"),
    supabase.from("campground_types").select("id,name").order("name"),
    supabase.from("facilities").select("id,name").order("sort_order").order("name"),
  ]);
  const error = provinces.error ?? regencies.error ?? types.error ?? facilities.error;
  if (error) throw new Error(`Unable to load contribution reference data: ${error.message}`);
  return {
    provinces: provinces.data ?? [],
    regencies: (regencies.data ?? []).map(x => ({ id: x.id, provinceId: x.province_id, name: x.name })),
    types: types.data ?? [],
    facilities: facilities.data ?? [],
  };
}
