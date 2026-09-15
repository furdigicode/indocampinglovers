import Link from "next/link";
import { ArrowRight, Car, MapPin, Mountain, Search, TentTree, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const categories = [
  { name: "Family Camping", icon: Users },
  { name: "Campervan", icon: Car },
  { name: "Mountain Camp", icon: Mountain },
  { name: "Glamping", icon: TentTree }
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-sand py-20 md:py-28">
        <div className="container-icl text-center">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest-700 shadow-sm">Database Camping Indonesia oleh IndoCampingLovers</span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-forest-900 md:text-6xl">Temukan tempat camping yang cocok untuk perjalananmu.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-black/60">Jelajahi campground di seluruh Indonesia berdasarkan lokasi, fasilitas, akses kendaraan, harga, dan gaya campingmu.</p>
          <form action="/camping" className="mx-auto mt-9 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-3 shadow-xl shadow-black/5">
            <Search className="ml-2 text-black/40" />
            <input name="q" aria-label="Cari lokasi camping" placeholder="Mau camping di mana? Bandung, Bogor, Dieng..." className="min-w-0 flex-1 bg-transparent px-1 py-3 outline-none" />
            <button className="rounded-xl bg-forest-800 px-6 py-3 font-semibold text-white">Cari Camping</button>
          </form>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {categories.map(({ name, icon: Icon }) => (
              <Link key={name} href={`/camping?type=${encodeURIComponent(name)}`} className="flex items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white/70 p-5 font-semibold transition hover:bg-white">
                <Icon size={20} className="text-forest-700" />{name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-icl">
          <div className="flex items-end justify-between gap-6">
            <div><p className="font-semibold text-forest-700">Mulai menjelajah</p><h2 className="mt-2 text-3xl font-bold">Camping populer</h2></div>
            <Link href="/camping" className="flex items-center gap-2 font-semibold text-forest-700">Lihat semua <ArrowRight size={18} /></Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {["Bandung, Jawa Barat", "Bogor, Jawa Barat", "Dieng, Jawa Tengah"].map((location) => (
              <div key={location} className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
                <div className="grid aspect-[4/3] place-items-center bg-forest-100 text-forest-700"><TentTree size={42} /></div>
                <div className="p-6"><div className="flex items-center gap-2 text-sm text-black/50"><MapPin size={16} />{location}</div><h3 className="mt-3 text-xl font-bold">Contoh Campground</h3><p className="mt-2 text-sm leading-6 text-black/55">Data contoh untuk fondasi UI. Data campground asli akan masuk pada milestone database.</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tentang" className="bg-forest-900 py-20 text-white">
        <div className="container-icl grid gap-10 md:grid-cols-2 md:items-center">
          <div><p className="font-semibold text-white/60">Tentang ICL</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">Direktori camping yang tumbuh bersama komunitas.</h2></div>
          <p className="leading-8 text-white/70">IndoCampingLovers membangun database tempat camping Indonesia yang membantu camper menemukan informasi lokasi, fasilitas, akses, harga, dan kontak pengelola dengan lebih mudah.</p>
        </div>
      </section>
    </main>
  );
}
