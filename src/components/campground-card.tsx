import Image from "next/image";
import Link from "next/link";
import { Car, CheckCircle2, MapPin, ShowerHead } from "lucide-react";
import type { Campground } from "@/types/campground";

const rupiah = new Intl.NumberFormat("id-ID");
const verificationLabel = { verified: "Terverifikasi ICL", community_updated: "Diperbarui komunitas", needs_update: "Perlu diperbarui" };

export function CampgroundCard({ campground }: { campground: Campground }) {
  const hasPrice = campground.priceFrom > 0;
  return (
    <Link href={`/camping/${campground.slug}`} aria-label={`Lihat detail ${campground.name}`} className="icl-card icl-focus group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--icl-shadow-md)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-100">
        <Image src={campground.image} alt={`Foto ${campground.name}`} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-forest-800 shadow-sm backdrop-blur"><CheckCircle2 size={13}/>{verificationLabel[campground.verificationStatus]}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-black/50"><MapPin size={14}/><span className="truncate">{campground.regency}, {campground.province}</span></div>
        <h3 className="mt-2 text-xl font-extrabold tracking-tight text-forest-900 transition group-hover:text-forest-700">{campground.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-black/55">{campground.shortDescription}</p>
        <div className="mt-4 flex min-h-8 flex-wrap gap-2 text-[11px] font-semibold text-black/65">
          {campground.access.some((value) => value.toLowerCase().includes("mobil")) && <span className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-1.5"><Car size={12}/>Mobil masuk</span>}
          {campground.facilities.some((value) => value.toLowerCase().includes("toilet")) && <span className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-1.5"><ShowerHead size={12}/>Toilet</span>}
          {campground.types[0] && <span className="rounded-full bg-sand px-2.5 py-1.5">{campground.types[0]}</span>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-black/5 pt-4"><div><span className="text-[11px] text-black/45">{hasPrice ? "Mulai" : "Harga"}</span><p className="font-extrabold text-forest-900">{hasPrice ? <>Rp{rupiah.format(campground.priceFrom)} <span className="text-xs font-normal text-black/45">/ {campground.priceUnit}</span></> : <span className="text-sm">Hubungi pengelola</span>}</p></div><span className="shrink-0 text-xs font-bold text-forest-700">Lihat detail →</span></div>
      </div>
    </Link>
  );
}
