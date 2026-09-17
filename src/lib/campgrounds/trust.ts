import type { VerificationStatus } from "@/types/campground";

export type DataFreshness = "fresh" | "aging" | "stale" | "unknown";

export type CampgroundTrust = {
  statusLabel: string;
  statusDescription: string;
  freshness: DataFreshness;
  freshnessLabel: string;
  freshnessDescription: string;
  shouldConfirm: boolean;
};

const DAY_MS = 86_400_000;

function ageInDays(date: string, now: Date): number | null {
  if (!date || date === "1970-01-01") return null;
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((now.getTime() - timestamp) / DAY_MS));
}

export function getCampgroundTrust(
  status: VerificationStatus,
  lastVerifiedAt: string,
  now = new Date(),
): CampgroundTrust {
  const age = ageInDays(lastVerifiedAt, now);
  const freshness: DataFreshness = age === null ? "unknown" : age <= 90 ? "fresh" : age <= 180 ? "aging" : "stale";

  const statusCopy: Record<VerificationStatus, Pick<CampgroundTrust, "statusLabel" | "statusDescription">> = {
    verified: {
      statusLabel: "Terverifikasi ICL",
      statusDescription: "Informasi campground ini telah diperiksa oleh ICL berdasarkan data yang tersedia saat verifikasi.",
    },
    community_updated: {
      statusLabel: "Diperbarui komunitas",
      statusDescription: "Informasi campground ini mencakup pembaruan dari komunitas dan belum berarti setiap detail telah diverifikasi ulang oleh ICL.",
    },
    needs_update: {
      statusLabel: "Perlu diperbarui",
      statusDescription: "Sebagian informasi campground ini mungkin belum lengkap atau perlu diperiksa kembali.",
    },
  };

  const freshnessCopy: Record<DataFreshness, Pick<CampgroundTrust, "freshnessLabel" | "freshnessDescription">> = {
    fresh: {
      freshnessLabel: "Data masih baru",
      freshnessDescription: "Pemeriksaan terakhir dilakukan dalam 90 hari terakhir.",
    },
    aging: {
      freshnessLabel: "Sebaiknya konfirmasi kembali",
      freshnessDescription: "Pemeriksaan terakhir sudah lebih dari 90 hari. Harga, akses, fasilitas, atau kondisi operasional dapat berubah.",
    },
    stale: {
      freshnessLabel: "Data sudah cukup lama",
      freshnessDescription: "Pemeriksaan terakhir sudah lebih dari 180 hari. Konfirmasi informasi penting kepada pengelola sebelum berangkat.",
    },
    unknown: {
      freshnessLabel: "Tanggal pemeriksaan belum tersedia",
      freshnessDescription: "Kami belum memiliki tanggal pemeriksaan publik untuk data ini. Konfirmasi informasi penting sebelum berangkat.",
    },
  };

  return {
    ...statusCopy[status],
    freshness,
    ...freshnessCopy[freshness],
    shouldConfirm: status === "needs_update" || freshness === "aging" || freshness === "stale" || freshness === "unknown",
  };
}
