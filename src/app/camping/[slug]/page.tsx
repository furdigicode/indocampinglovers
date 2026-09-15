import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, Car, Check, CheckCircle2, MapPin, Mountain, Navigation, TentTree } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CampgroundCard } from "@/components/campground-card";
import { campgrounds } from "@/data/campgrounds";

const rupiah = new Intl.NumberFormat("id-ID");
const verificationLabel = { verified: "Terverifikasi ICL", community_updated: "Community Updated", needs_update: "Perlu diperbarui" };

export function generateStaticParams() { return campgrounds.map(({ slug }) => ({ slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const campground = campgrounds.find((item) => item.slug === params.slug);
  if (!campground) return { title: "Campground tidak ditemukan" };
  return { title: campground.name, description: campground.shortDescription, openGraph: { title: campground.name, description: campground.shortDescription, images: [campground.image] } };
}

export default function CampgroundDetailPage({ params }: { params: { slug: string } }) {
  const campground = campgrounds.find((item) => item.slug === params.slug);
  if (!campground) notFound();
  const related = campgrounds.filter((item) => item.slug !== campground.slug && (item.province === campground.province || item.types.some((type) => campground.types.includes(type)))).slice(0, 3);
  const verifiedDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${campground.lastVerifiedAt}T00:00:00`));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${campground.latitude},${campground.longitude}`;

  return <main><SiteHeader/>
    <div className="container-icl py-8 md:py-10">
      <Link href="/camping" className="icl-focus inline-flex items-center gap-2 rounded-lg text-sm font-bold text-forest-700"><ArrowLeft size={16}/>Kembali ke Jelajah Camping</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-forest-100 md:aspect-[2/1]"><Image src={campground.image} alt={`Foto ${campground.name}`} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 820px"/></div>
          <div className="mt-7 flex flex-wrap items-center gap-2 text-sm"><span className="flex items-center gap-1.5 rounded-full bg-[#eaf2ec] px-3 py-1.5 font-bold text-forest-800"><CheckCircle2 size={15}/>{verificationLabel[campground.verificationStatus]}</span>{campground.types.map(type => <span key={type} className="rounded-full bg-sand px-3 py-1.5 font-semibold text-black/65">{type}</span>)}</div>
          <h1 className="icl-title mt-5 text-4xl md:text-5xl">{campground.name}</h1>
          <p className="mt-3 flex items-center gap-2 text-black/55"><MapPin size={18}/>{campground.address}</p>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-black/65">{campground.shortDescription}</p>

          <section className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Fact icon={<Mountain size={20}/>} label="Elevasi" value={campground.elevationM ? `${campground.elevationM.toLocaleString("id-ID")} mdpl` : "—"}/>
            <Fact icon={<Car size={20}/>} label="Akses" value={campground.access.includes("Mobil") ? "Mobil masuk" : campground.access[0]}/>
            <Fact icon={<TentTree size={20}/>} label="Tipe" value={campground.types[0]}/>
            <Fact icon={<CalendarCheck size={20}/>} label="Data" value={verifiedDate}/>
          </section>

          <section className="mt-12 border-t border-black/10 pt-10"><p className="icl-eyebrow">Fasilitas</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">Yang tersedia di lokasi</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">{campground.facilities.map(item => <div key={item} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-full bg-[#eaf2ec] text-forest-700"><Check size={15}/></span>{item}</div>)}</div></section>

          <section className="mt-12 border-t border-black/10 pt-10"><p className="icl-eyebrow">Akses & kecocokan</p><div className="mt-6 grid gap-8 md:grid-cols-2"><div><h2 className="text-xl font-extrabold">Akses kendaraan</h2><div className="mt-4 flex flex-wrap gap-2">{campground.access.map(item => <span key={item} className="rounded-full bg-sand px-3 py-2 text-sm font-semibold">{item}</span>)}</div></div><div><h2 className="text-xl font-extrabold">Cocok untuk</h2><div className="mt-4 flex flex-wrap gap-2">{campground.suitableFor.map(item => <span key={item} className="rounded-full bg-sand px-3 py-2 text-sm font-semibold">{item}</span>)}</div></div></div></section>
        </div>

        <aside className="icl-card p-6 lg:sticky lg:top-28"><p className="text-xs font-semibold text-black/45">Harga mulai</p><p className="mt-1 text-3xl font-extrabold text-forest-900">Rp{rupiah.format(campground.priceFrom)}</p><p className="text-sm text-black/45">per {campground.priceUnit}</p><div className="my-6 border-t border-black/10"/><p className="text-sm font-bold">Lokasi</p><p className="mt-2 text-sm leading-6 text-black/55">{campground.address}</p><a href={mapsUrl} target="_blank" rel="noreferrer" className="icl-button-primary icl-focus mt-5 w-full px-5 py-3 text-sm"><Navigation size={17}/>Buka Petunjuk Arah</a><p className="mt-5 text-xs leading-5 text-black/45">Data M0 masih berupa seed development. Informasi komersial belum merupakan data campground terverifikasi di dunia nyata.</p></aside>
      </div>

      {related.length > 0 && <section className="mt-20 border-t border-black/10 pt-12"><p className="icl-eyebrow">Lanjut menjelajah</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Campground terkait</h2><div className="mt-7 grid gap-5 md:grid-cols-3">{related.map(item => <CampgroundCard key={item.id} campground={item}/>)}</div></section>}
    </div>
  </main>;
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-black/5 bg-white p-4"><span className="text-forest-700">{icon}</span><p className="mt-3 text-xs text-black/45">{label}</p><p className="mt-1 text-sm font-extrabold">{value}</p></div>; }
