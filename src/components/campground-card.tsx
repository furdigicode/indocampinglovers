import Image from "next/image";
import Link from "next/link";
import { Car, CheckCircle2, MapPin, ShowerHead } from "lucide-react";
import type { Campground } from "@/types/campground";

const rupiah = new Intl.NumberFormat("id-ID");

const verificationLabel = {
  verified: "Terverifikasi ICL",
  community_updated: "Community Updated",
  needs_update: "Perlu diperbarui"
};

export function CampgroundCard({ campground }: { campground: Campground }) {
  return (
    <Link href={`/camping/${campground.slug}`} className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-100">
        <Image src={campground.image} alt={`Foto ${campground.name}`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-forest-800 shadow-sm"><CheckCircle2 size={14} />{verificationLabel[campground.verificationStatus]}</span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-sm text-black/50"><MapPin size={15} />{campground.regency}, {campground.province}</div>
        <h3 className="mt-2 text-xl font-bold text-forest-900">{campground.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/55">{campground.shortDescription}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-black/65">
          {campground.access.includes("Mobil") && <span className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-1.5"><Car size={13}/>Mobil masuk</span>}
          {campground.facilities.includes("Toilet") && <span className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-1.5"><ShowerHead size={13}/>Toilet</span>}
          <span className="rounded-full bg-sand px-2.5 py-1.5">{campground.types[0]}</span>
        </div>
        <div className="mt-5 border-t border-black/5 pt-4"><span className="text-xs text-black/45">Mulai</span><p className="font-bold text-forest-900">Rp{rupiah.format(campground.priceFrom)} <span className="text-xs font-normal text-black/45">/ {campground.priceUnit}</span></p></div>
      </div>
    </Link>
  );
}
