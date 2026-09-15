import Link from "next/link";
import { ArrowRight, Car, Mountain, Search, TentTree, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CampgroundCard } from "@/components/campground-card";
import { getFeaturedCampgrounds } from "@/lib/campgrounds/repository";

const categories = [
  { name: "Family Camping", slug: "family-camping", icon: Users },
  { name: "Campervan", slug: "campervan", icon: Car },
  { name: "Mountain Camp", slug: "mountain-camp", icon: Mountain },
  { name: "Glamping", slug: "glamping", icon: TentTree }
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredCampgrounds = await getFeaturedCampgrounds(3);
  return <main><SiteHeader/>
    <section className="bg-sand py-20 md:py-28"><div className="container-icl text-center">
      <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest-700 shadow-sm">Database Camping Indonesia oleh IndoCampingLovers</span>
      <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-forest-900 md:text-6xl">Temukan tempat camping yang cocok untuk perjalananmu.</h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-black/60">Jelajahi campground di seluruh Indonesia berdasarkan lokasi, fasilitas, akses kendaraan, harga, dan gaya campingmu.</p>
      <form action="/camping" className="mx-auto mt-9 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-3 shadow-xl shadow-black/5"><Search className="ml-2 text-black/40"/><input name="q" aria-label="Cari lokasi camping" placeholder="Mau camping di mana? Bandung, Bogor, Dieng..." className="min-w-0 flex-1 bg-transparent px-1 py-3 outline-none"/><button className="rounded-xl bg-forest-800 px-6 py-3 font-semibold text-white">Cari Camping</button></form>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-4">{categories.map(({name,slug,icon:Icon})=><Link key={slug} href={`/camping?type=${slug}`} className="flex items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white/70 p-5 font-semibold transition hover:bg-white"><Icon size={20} className="text-forest-700"/>{name}</Link>)}</div>
    </div></section>
    <section className="py-20"><div className="container-icl"><div className="flex items-end justify-between gap-6"><div><p className="font-semibold text-forest-700">Pilihan untuk dijelajahi</p><h2 className="mt-2 text-3xl font-bold">Camping pilihan ICL</h2><p className="mt-3 text-sm text-black/50">Listing di bawah berasal dari database publik IndoCampingLovers.</p></div><Link href="/camping" className="hidden items-center gap-2 font-semibold text-forest-700 sm:flex">Lihat semua <ArrowRight size={18}/></Link></div>{featuredCampgrounds.length>0?<div className="mt-8 grid gap-5 md:grid-cols-3">{featuredCampgrounds.map(c=><CampgroundCard key={c.id} campground={c}/>)}</div>:<div className="mt-8 rounded-3xl border border-black/5 bg-white p-8 text-sm leading-6 text-black/55">Belum ada campground pilihan yang dipublikasikan. Data akan muncul otomatis setelah listing berstatus published dan featured tersedia.</div>}</div></section>
    <section id="tentang" className="bg-forest-900 py-20 text-white"><div className="container-icl grid gap-10 md:grid-cols-2 md:items-center"><div><p className="font-semibold text-white/60">Tentang ICL</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">Direktori camping yang tumbuh bersama komunitas.</h2></div><p className="leading-8 text-white/70">IndoCampingLovers membangun database tempat camping Indonesia yang membantu camper menemukan informasi lokasi, fasilitas, akses, harga, dan kontak pengelola dengan lebih mudah.</p></div></section>
  </main>;
}
