import type { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("campgrounds")
    .select("slug,updated_at,provinces(slug),regencies(slug)")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Unable to build sitemap: ${error.message}`);

  const provinceSlugs = new Set<string>();
  const regencyKeys = new Set<string>();
  const details: MetadataRoute.Sitemap = [];

  for (const row of data ?? []) {
    const province = Array.isArray(row.provinces) ? row.provinces[0] : row.provinces;
    const regency = Array.isArray(row.regencies) ? row.regencies[0] : row.regencies;
    if (province?.slug) provinceSlugs.add(province.slug);
    if (province?.slug && regency?.slug) regencyKeys.add(`${province.slug}/${regency.slug}`);
    details.push({ url: `/camping/${row.slug}`, lastModified: row.updated_at ? new Date(row.updated_at) : undefined, changeFrequency: "weekly", priority: 0.8 });
  }

  return [
    { url: "/", changeFrequency: "weekly", priority: 1 },
    { url: "/camping", changeFrequency: "daily", priority: 0.9 },
    ...[...provinceSlugs].sort().map((slug) => ({ url: `/camping/${slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...[...regencyKeys].sort().map((key) => ({ url: `/camping/${key}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...details,
  ];
}
