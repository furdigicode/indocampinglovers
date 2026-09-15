import type { Campground, VerificationStatus } from "@/types/campground";
import { createPublicSupabaseClient } from "@/lib/supabase/client";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=80";

type DbCampground = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  address: string;
  district: string | null;
  latitude: number | string;
  longitude: number | string;
  elevation_m: number | null;
  verification_status: "unverified" | "community_updated" | "verified" | "needs_update";
  last_verified_at: string | null;
  featured: boolean;
  provinces: { name: string } | { name: string }[] | null;
  regencies: { name: string } | { name: string }[] | null;
  campground_type_relations: { campground_types: { name: string } | { name: string }[] | null }[] | null;
  campground_facilities: { is_available: boolean; facilities: { name: string } | { name: string }[] | null }[] | null;
  campground_access: { vehicle_type: string; is_accessible: boolean }[] | null;
  campground_suitable_for: { label: string }[] | null;
  campground_prices: { amount_idr: number | string; unit: string | null; sort_order: number }[] | null;
  campground_photos: { storage_path: string; source_url: string | null; is_cover: boolean; sort_order: number }[] | null;
};

const DIRECTORY_SELECT = `
  id, slug, name, short_description, address, district, latitude, longitude,
  elevation_m, verification_status, last_verified_at, featured,
  provinces(name), regencies(name),
  campground_type_relations(campground_types(name)),
  campground_facilities(is_available, facilities(name)),
  campground_access(vehicle_type, is_accessible),
  campground_suitable_for(label),
  campground_prices(amount_idr, unit, sort_order),
  campground_photos(storage_path, source_url, is_cover, sort_order)
`;

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function photoUrl(storagePath: string, sourceUrl: string | null) {
  if (sourceUrl) return sourceUrl;
  return createPublicSupabaseClient().storage.from("campground-photos").getPublicUrl(storagePath).data.publicUrl;
}

function mapCampground(row: DbCampground): Campground {
  const prices = [...(row.campground_prices ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const price = prices[0];
  const photos = [...(row.campground_photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
  const photo = photos[0];
  const verificationStatus: VerificationStatus = row.verification_status === "unverified" ? "needs_update" : row.verification_status;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "Informasi campground sedang dilengkapi oleh IndoCampingLovers.",
    province: one(row.provinces)?.name ?? "Indonesia",
    regency: one(row.regencies)?.name ?? "",
    district: row.district ?? undefined,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    elevationM: row.elevation_m ?? undefined,
    types: (row.campground_type_relations ?? []).map((item) => one(item.campground_types)?.name).filter((name): name is string => Boolean(name)),
    priceFrom: price ? Number(price.amount_idr) : 0,
    priceUnit: price?.unit ?? "kunjungan",
    facilities: (row.campground_facilities ?? []).filter((item) => item.is_available).map((item) => one(item.facilities)?.name).filter((name): name is string => Boolean(name)),
    access: (row.campground_access ?? []).filter((item) => item.is_accessible).map((item) => item.vehicle_type),
    suitableFor: (row.campground_suitable_for ?? []).map((item) => item.label),
    image: photo ? photoUrl(photo.storage_path, photo.source_url) : FALLBACK_IMAGE,
    verificationStatus,
    lastVerifiedAt: (row.last_verified_at ?? new Date(0).toISOString()).slice(0, 10),
    featured: row.featured
  };
}

export async function getPublishedCampgrounds(): Promise<Campground[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("campgrounds").select(DIRECTORY_SELECT).order("featured", { ascending: false }).order("name");
  if (error) throw new Error(`Unable to load published campgrounds: ${error.message}`);
  return ((data ?? []) as unknown as DbCampground[]).map(mapCampground);
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
