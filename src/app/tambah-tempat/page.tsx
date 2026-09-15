import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function AddCampgroundPage() {
  return <main><SiteHeader/><div className="container-icl py-16"><Link href="/" className="flex items-center gap-2 text-sm font-semibold text-forest-700"><ArrowLeft size={16}/>Beranda</Link><div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-black/5 bg-white p-8 shadow-sm md:p-12"><p className="font-semibold text-forest-700">Kontribusi Komunitas</p><h1 className="mt-2 text-3xl font-bold">Tambahkan tempat camping</h1><p className="mt-4 leading-7 text-black/60">Punya informasi campground yang belum ada di IndoCampingLovers? Form submission lengkap akan dibangun pada M5. Halaman ini disiapkan sejak awal agar arsitektur URL tetap konsisten.</p><div className="mt-8 rounded-2xl bg-sand p-5 text-sm leading-6 text-black/60">Status: halaman placeholder M0.2 — belum menerima submission.</div></div></div></main>;
}
