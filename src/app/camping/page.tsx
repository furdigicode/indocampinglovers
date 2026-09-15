import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CampgroundCard } from "@/components/campground-card";
import { campgrounds } from "@/data/campgrounds";

export default function CampingPage() {
  return (
    <main>
      <SiteHeader />
      <div className="container-icl py-16">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-forest-700"><ArrowLeft size={16}/>Beranda</Link>
        <div className="mt-8 max-w-2xl"><p className="font-semibold text-forest-700">Jelajah Camping</p><h1 className="mt-2 text-4xl font-bold">Temukan campground di Indonesia</h1><p className="mt-4 leading-7 text-black/60">Jelajahi data awal campground berdasarkan lokasi, akses, fasilitas, dan gaya camping. Search dan filter interaktif akan dibangun pada M2.</p></div>
        <div className="mt-10 flex max-w-xl items-center gap-3 rounded-2xl border bg-white p-3"><Search className="ml-2 text-black/40"/><input className="flex-1 py-2 outline-none" placeholder="Cari daerah atau campground..." /></div>
        <div className="mt-8 flex items-center justify-between border-b border-black/10 pb-4"><p className="font-semibold">{campgrounds.length} campground</p><p className="text-xs text-black/45">Development seed data</p></div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{campgrounds.map((campground) => <CampgroundCard key={campground.id} campground={campground} />)}</div>
      </div>
    </main>
  );
}
