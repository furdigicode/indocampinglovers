import type { Campground } from "@/types/campground";

// M0.4 development seed data only. Names and commercial details below are fictional
// so they are never mistaken for verified ICL directory information.
export const campgrounds: Campground[] = [
  {
    id: "camp-001", slug: "pinus-ranca-camp", name: "Pinus Ranca Camp",
    shortDescription: "Area camping bernuansa hutan pinus untuk keluarga dan camper pemula.",
    province: "Jawa Barat", regency: "Bandung", district: "Ciwidey", address: "Ciwidey, Kabupaten Bandung, Jawa Barat",
    latitude: -7.09, longitude: 107.44, elevationM: 1600,
    types: ["Family Camping", "Forest"], priceFrom: 75000, priceUnit: "orang",
    facilities: ["Toilet", "Air bersih", "Musala", "Warung"], access: ["Motor", "Mobil"], suitableFor: ["Keluarga", "Pemula", "Grup"],
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
    verificationStatus: "verified", lastVerifiedAt: "2026-09-08", featured: true
  },
  {
    id: "camp-002", slug: "lembah-pancar-camp", name: "Lembah Pancar Camp",
    shortDescription: "Campground hijau dekat kawasan pegunungan dengan akses kendaraan yang mudah.",
    province: "Jawa Barat", regency: "Bogor", address: "Kabupaten Bogor, Jawa Barat",
    latitude: -6.59, longitude: 106.88, elevationM: 650,
    types: ["Family Camping", "Campervan"], priceFrom: 60000, priceUnit: "orang",
    facilities: ["Toilet", "Air bersih", "Listrik", "Warung"], access: ["Motor", "Mobil", "Campervan"], suitableFor: ["Keluarga", "Pemula", "Campervan"],
    image: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=1200&q=80",
    verificationStatus: "community_updated", lastVerifiedAt: "2026-08-22", featured: true
  },
  {
    id: "camp-003", slug: "dieng-sunrise-basecamp", name: "Dieng Sunrise Basecamp",
    shortDescription: "Camping dataran tinggi dengan udara dingin dan panorama pegunungan.",
    province: "Jawa Tengah", regency: "Wonosobo", district: "Kejajar", address: "Kejajar, Kabupaten Wonosobo, Jawa Tengah",
    latitude: -7.20, longitude: 109.91, elevationM: 2050,
    types: ["Mountain Camp"], priceFrom: 50000, priceUnit: "orang",
    facilities: ["Toilet", "Air bersih", "Warung"], access: ["Motor", "Mobil"], suitableFor: ["Grup", "Solo camper"],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    verificationStatus: "verified", lastVerifiedAt: "2026-09-01", featured: true
  },
  {
    id: "camp-004", slug: "merbabu-view-camp", name: "Merbabu View Camp",
    shortDescription: "Area berkemah dengan pemandangan gunung untuk camper yang mencari suasana sejuk.",
    province: "Jawa Tengah", regency: "Semarang", address: "Kabupaten Semarang, Jawa Tengah",
    latitude: -7.39, longitude: 110.42, elevationM: 1300,
    types: ["Mountain Camp", "Family Camping"], priceFrom: 65000, priceUnit: "orang",
    facilities: ["Toilet", "Air bersih", "Musala"], access: ["Motor", "Mobil"], suitableFor: ["Keluarga", "Grup"],
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80",
    verificationStatus: "needs_update", lastVerifiedAt: "2025-06-12"
  },
  {
    id: "camp-005", slug: "bromo-savana-camp", name: "Bromo Savana Camp",
    shortDescription: "Basecamp bernuansa savana untuk menikmati lanskap pegunungan Jawa Timur.",
    province: "Jawa Timur", regency: "Probolinggo", address: "Kabupaten Probolinggo, Jawa Timur",
    latitude: -7.94, longitude: 112.95, elevationM: 2100,
    types: ["Mountain Camp"], priceFrom: 85000, priceUnit: "orang",
    facilities: ["Toilet", "Warung"], access: ["Motor", "4x4"], suitableFor: ["Grup", "Solo camper"],
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    verificationStatus: "community_updated", lastVerifiedAt: "2026-08-15"
  },
  {
    id: "camp-006", slug: "bedugul-lakeside-camp", name: "Bedugul Lakeside Camp",
    shortDescription: "Camping tepi danau dengan suasana tenang dan udara dataran tinggi Bali.",
    province: "Bali", regency: "Tabanan", address: "Bedugul, Kabupaten Tabanan, Bali",
    latitude: -8.28, longitude: 115.16, elevationM: 1200,
    types: ["Lakeside", "Family Camping"], priceFrom: 100000, priceUnit: "orang",
    facilities: ["Toilet", "Air bersih", "Listrik", "Warung"], access: ["Motor", "Mobil"], suitableFor: ["Keluarga", "Pemula", "Grup"],
    image: "https://images.unsplash.com/photo-1496545672447-f699b503d270?auto=format&fit=crop&w=1200&q=80",
    verificationStatus: "verified", lastVerifiedAt: "2026-09-05"
  }
];

export const featuredCampgrounds = campgrounds.filter((campground) => campground.featured);
