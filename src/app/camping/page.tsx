import Link from "next/link";
import { ArrowLeft, Search, TentTree } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function CampingPage() {
  return <main><SiteHeader /><div className="container-icl py-16"><Link href="/" className="flex items-center gap-2 text-sm font-semibold text-forest-700"><ArrowLeft size={16}/>Beranda</Link><div className="mt-8 max-w-2xl"><p className="font-semibold text-forest-700">Jelajah Camping</p><h1 className="mt-2 text-4xl font-bold">Temukan campground di Indonesia</h1><p className="mt-4 leading-7 text-black/60">Fondasi halaman directory sudah aktif. Search, filter, list, dan map akan dikembangkan pada M2.</p></div><div className="mt-10 flex max-w-xl items-center gap-3 rounded-2xl border bg-white p-3"><Search className="ml-2 text-black/40"/><input className="flex-1 py-2 outline-none" placeholder="Cari daerah atau campground..." /></div><div className="mt-12 grid min-h-64 place-items-center rounded-3xl border border-dashed border-black/15 bg-white text-center"><div><TentTree className="mx-auto text-forest-700" size={40}/><p className="mt-4 font-semibold">Directory foundation ready</p><p className="mt-2 text-sm text-black/50">Campground data akan ditambahkan pada milestone berikutnya.</p></div></div></div></main>;
}
