import type { Campground, VerificationStatus } from "@/types/campground";
import { createPublicSupabaseClient } from "@/lib/supabase/client";
import type { CampgroundDirectoryFacets, CampgroundDirectoryQuery, CampgroundDirectoryResult } from "@/lib/campgrounds/directory-query";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=80";

type DbCampground = {
  id: string; slug: string; name: string; short_description: string | null; address: string; district: string | null;
  latitude: number | string; longitude: number | string; elevation_m: number | null;
  verification_status: "unverified" | "community_updated" | "verified" | "needs_update"; last_verified_at: string | null; featured: boolean;
  provinces: { name: string } | { name: string }[] | null; regencies: { name: string } | { name: string }[] | null;
  campground_type_relations: { campground_types: { name: string } | { name: string }[] | null }[] | null;
  campground_facilities: { is_available: boolean; facilities: { name: string } | { name: string }[] | null }[] | null;
  campground_access: { vehicle_type: string; is_accessible: boolean }[] | null;
  campground_suitable_for: { label: string }[] | null;
  campground_prices: { amount_idr: number | string; unit: string | null; sort_order: number }[] | null;
  campground_photos: { storage_path: string; is_cover: boolean; sort_order: number }[] | null;
};

const DIRECTORY_SELECT = `
  id, slug, name, short_description, address, district, latitude, longitude,
  elevation_m, verification_status, last_verified_at, featured,
  provinces(name), regencies(name), campground_type_relations(campground_types(name)),
  campground_facilities(is_available, facilities(name)), campground_access(vehicle_type, is_accessible),
  campground_suitable_for(label), campground_prices(amount_idr, unit, sort_order),
  campground_photos(storage_path, is_cover, sort_order)
`;

function one<T>(value: T | T[] | null): T | null { return Array.isArray(value) ? value[0] ?? null : value; }
function photoUrl(storagePath: string) { return createPublicSupabaseClient().storage.from("campground-photos").getPublicUrl(storagePath).data.publicUrl; }

function mapCampground(row: DbCampground): Campground {
  const prices = [...(row.campground_prices ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const price = prices[0];
  const photos = [...(row.campground_photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
  const photo = photos[0];
  const verificationStatus: VerificationStatus = row.verification_status === "unverified" ? "needs_update" : row.verification_status;
  return {
    id: row.id, slug: row.slug, name: row.name,
    shortDescription: row.short_description ?? "Informasi campground sedang dilengkapi oleh IndoCampingLovers.",
    province: one(row.provinces)?.name ?? "Indonesia", regency: one(row.regencies)?.name ?? "", district: row.district ?? undefined,
    address: row.address, latitude: Number(row.latitude), longitude: Number(row.longitude), elevationM: row.elevation_m ?? undefined,
    types: (row.campground_type_relations ?? []).map((item) => one(item.campground_types)?.name).filter((name): name is string => Boolean(name)),
    priceFrom: price ? Number(price.amount_idr) : 0, priceUnit: price?.unit ?? "kunjungan",
    facilities: (row.campground_facilities ?? []).filter((item) => item.is_available).map((item) => one(item.facilities)?.name).filter((name): name is string => Boolean(name)),
    access: (row.campground_access ?? []).filter((item) => item.is_accessible).map((item) => item.vehicle_type),
    suitableFor: (row.campground_suitable_for ?? []).map((item) => item.label), image: photo ? photoUrl(photo.storage_path) : FALLBACK_IMAGE,
    verificationStatus, lastVerifiedAt: (row.last_verified_at ?? new Date(0).toISOString()).slice(0, 10), featured: row.featured
  };
}

function escapeLike(value: string) { return value.replace(/[%,()]/g, " ").replace(/\s+/g, " ").trim(); }

export async function getCampgroundDirectory(query: CampgroundDirectoryQuery): Promise<CampgroundDirectoryResult<Campground>> {
  const supabase = createPublicSupabaseClient();
  let request = supabase.from("campgrounds").select(DIRECTORY_SELECT, { count: "exact" });
  if (query.q) {
    const q = escapeLike(query.q);
    if (q) request = request.or(`name.ilike.%${q}%,address.ilike.%${q}%,district.ilike.%${q}%`);
  }
  if (query.province) request = request.eq("provinces.slug", query.province);
  if (query.regency) request = request.eq("regencies.slug", query.regency);
  if (query.sort === "name") request = request.order("name", { ascending: true });
  else if (query.sort === "recently_verified") request = request.order("last_verified_at", { ascending: false, nullsFirst: false }).order("name");
  else request = request.order("featured", { ascending: false }).order("name");
  const from = (query.page - 1) * query.pageSize;
  request = request.range(from, from + query.pageSize - 1);
  const { data, error, count } = await request;
  if (error) throw new Error(`Unable to load campground directory: ${error.message}`);

  // Relationship-heavy facets (type/facility/access/price) are applied in M2.2 using database-native filters.
  // The contract is already frozen here so URLs and UI do not need to change when those filters land.
  let items = ((data ?? []) as unknown as DbCampground[]).map(mapCampground);
  if (query.types.length) items = items.filter((item) => query.types.every((type) => item.types.includes(type)));
  if (query.facilities.length) items = items.filter((item) => query.facilities.every((facility) => item.facilities.includes(facility)));
  if (query.access.length) items = items.filter((item) => query.access.every((access) => item.access.includes(access)));
  if (query.minPrice !== undefined) items = items.filter((item) => item.priceFrom >= query.minPrice!);
  if (query.maxPrice !== undefined) items = items.filter((item) => item.priceFrom > 0 && item.priceFrom <= query.maxPrice!);
  if (query.sort === "price_asc") items.sort((a, b) => (a.priceFrom || Number.MAX_SAFE_INTEGER) - (b.priceFrom || Number.MAX_SAFE_INTEGER));
  if (query.sort === "price_desc") items.sort((a, b) => b.priceFrom - a.priceFrom);

  const total = count ?? 0;
  return { items, total, page: query.page, pageSize: query.pageSize, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
}

export async function getCampgroundDirectoryFacets(): Promise<CampgroundDirectoryFacets> {
  const supabase = createPublicSupabaseClient();
  const [provinces, regencies, types, facilities, access] = await Promise.all([
    supabase.from("provinces").select("name,slug").order("name"),
    supabase.from("regencies").select("name,slug,provinces(slug)").order("name"),
    supabase.from("campground_types").select("name,slug").order("name"),
    supabase.from("facilities").select("name,slug").order("sort_order").order("name"),
    supabase.from("campground_access").select("vehicle_type").eq("is_accessible", true)
  ]);
  const error = provinces.error ?? regencies.error ?? types.error ?? facilities.error ?? access.error;
  if (error) throw new Error(`Unable to load directory facets: ${error.message}`);
  return {
    provinces: (provinces.data ?? []).map((item) => ({ value: item.slug, label: item.name })),
    regencies: (regencies.data ?? []).map((item: any) => ({ value: item.slug, label: item.name, province: one(item.provinces)?.slug ?? "" })),
    types: (types.data ?? []).map((item) => ({ value: item.slug, label: item.name })),
    facilities: (facilities.data ?? []).map((item) => ({ value: item.slug, label: item.name })),
    access: [...new Set((access.data ?? []).map((item) => item.vehicle_type))].sort().map((value) => ({ value, label: value }))
  };
}

export async function getPublishedCampgrounds(): Promise<Campground[]> {
  const result = await getCampgroundDirectory({ types: [], facilities: [], access: [], sort: "recommended", page: 1, pageSize: 100 });
  return result.items;
}
export async function getFeaturedCampgrounds(limit = 3): Promise<Campground[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("campgrounds").select(DIRECTORY_SELECT).eq("featured", true).order("name").limit(limit);
  if (error) throw new Error(`Unable to load featured campgrounds: ${error.message}`);
  return ((data ?? []) as unknown as DbCampground[]).map(mapCampground);
}
export async function getCampgroundBySlug(slug: string): Promise<Campground | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("campgrounds").select(DIRECTORY_SELECT).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Unable to load campground: ${error.message}`);
  return data ? mapCampground(data as unknown as DbCampground) : null;
}
export async function getRelatedCampgrounds(campground: Campground, limit = 3): Promise<Campground[]> {
  const all = await getPublishedCampgrounds();
  return all.filter((item) => item.slug !== campground.slug && (item.province === campground.province || item.types.some((type) => campground.types.includes(type)))).slice(0, limit);
}
