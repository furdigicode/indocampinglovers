import { CheckCircle2, CircleAlert, Clock3, RefreshCw } from "lucide-react";
import { getCampgroundTrust } from "@/lib/campgrounds/trust";
import type { VerificationStatus } from "@/types/campground";

const tone: Record<VerificationStatus, string> = {
  verified: "bg-[#eaf2ec] text-forest-800",
  community_updated: "bg-[#eef3e7] text-forest-800",
  needs_update: "bg-[#fff3dd] text-[#76531c]",
};

const freshnessTone = {
  fresh: "bg-[#eaf2ec] text-forest-800",
  aging: "bg-[#fff8e8] text-[#76531c]",
  stale: "bg-[#fff3dd] text-[#76531c]",
  unknown: "bg-black/[0.04] text-black/65",
};

export function CampgroundTrustPanel({
  status,
  lastVerifiedAt,
}: {
  status: VerificationStatus;
  lastVerifiedAt: string;
}) {
  const trust = getCampgroundTrust(status, lastVerifiedAt);
  const hasDate = lastVerifiedAt !== "1970-01-01" && Number.isFinite(Date.parse(`${lastVerifiedAt}T00:00:00Z`));
  const formattedDate = hasDate
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${lastVerifiedAt}T00:00:00Z`))
    : null;

  return (
    <section className="mt-12 border-t border-black/10 pt-10">
      <p className="icl-eyebrow">Keandalan data</p>
      <h2 className="mb-6 mt-2 text-2xl font-extrabold tracking-tight">Status & keandalan data</h2>
      <div className="rounded-[24px] border border-black/10 bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-sand p-4">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${tone[status]}`}>
              {status === "needs_update" ? <CircleAlert size={15}/> : <CheckCircle2 size={15}/>}
              {trust.statusLabel}
            </span>
            <p className="mt-3 text-sm leading-6 text-black/60">{trust.statusDescription}</p>
          </div>
          <div className="rounded-2xl bg-sand p-4">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${freshnessTone[trust.freshness]}`}>
              {trust.freshness === "fresh" ? <Clock3 size={15}/> : <RefreshCw size={15}/>}
              {trust.freshnessLabel}
            </span>
            <p className="mt-3 text-sm leading-6 text-black/60">{trust.freshnessDescription}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-black/10 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-black/65">
            {formattedDate ? `Terakhir diperiksa ${formattedDate}` : "Tanggal pemeriksaan belum tersedia"}
          </p>
          {trust.shouldConfirm && <p className="font-bold text-[#76531c]">Konfirmasi kembali sebelum berangkat</p>}
        </div>
        <p className="mt-3 text-xs leading-5 text-black/45">Status ini membantu menilai kebaruan informasi, bukan jaminan bahwa kondisi lapangan tidak berubah. Harga, akses, fasilitas, dan operasional tetap dapat berubah sewaktu-waktu.</p>
      </div>
    </section>
  );
}
