import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CampgroundCard } from "@/components/campground-card";
import { JsonLd, breadcrumbJsonLd, campgroundItemListJsonLd } from "@/components/json-ld";
import { parseCampgroundDirectoryQuery } from "@/lib/campgrounds/directory-query";
import { getCampgroundDirectory } from "@/lib/campgrounds/repository";
import type { ProvinceLanding, RegencyLanding } from "@/lib/campgrounds/geography";

function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-black/50">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={14} />}
          {item.href ? <Link className="icl-focus rounded font-semibold hover:text-forest-800" href={item.href}>{item.label}</Link> : <span className="font-semibold text-black/75">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export async function ProvinceGeographicLanding({ province }: { province: ProvinceLanding }) {
  const usefulRegencies = province.regencies.filter((item) => item.publishedCampgroundCount > 0);
  const directory = await getCampgroundDirectory(parseCampgroundDirectoryQuery({ province: province.slug }));

  return (
    <main>
      <JsonLd data={breadcrumbJsonLd([{ name: "Camping", path: "/camping" }, { name: province.name, path: `/camping/${province.slug}` }])} />
      {directory.items.length > 0 && <JsonLd data={campgroundItemListJsonLd(`Campground di ${province.name}`, `/camping/${province.slug}`, directory.items.slice(0, 6))} />}
      <SiteHeader />
      <div className="container-icl py-8 md:py-12">
        <Breadcrumb items={[{ label: "Camping", href: "/camping" }, { label: province.name }]} />

        <section className="mt-7 rounded-[28px] bg-forest-900 px-6 py-10 text-white md:px-10 md:py-14">
          <p className="icl-eyebrow !text-white/65">Direktori Camping Indonesia</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-extrabold tracking-tight md:text-5xl">Tempat Camping di {province.name}</h1>
          <p className="mt-4 max-w-2xl text-white/75">Jelajahi {province.publishedCampgroundCount} campground yang tersedia di direktori IndoCampingLovers untuk {province.name}.</p>
          <Link href={`/camping?province=${province.slug}`} className="icl-button-primary icl-focus mt-7 inline-flex bg-white text-forest-900 hover:bg-white/90">Lihat semua campground</Link>
        </section>

        <section className="mt-10">
          <p className="icl-eyebrow">Kabupaten & kota</p>
          <h2 className="mt-2 text-2xl font-extrabold">Jelajahi berdasarkan wilayah</h2>
          {usefulRegencies.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {usefulRegencies.map((regency) => (
                <Link key={regency.id} href={`/camping/${province.slug}/${regency.slug}`} className="icl-focus rounded-2xl border border-black/10 bg-white p-5 transition hover:border-forest-700">
                  <MapPin size={18} className="text-forest-700" />
                  <h3 className="mt-3 font-extrabold">{regency.name}</h3>
                  <p className="mt-1 text-sm text-black/50">{regency.publishedCampgroundCount} campground</p>
                </Link>
              ))}
            </div>
          ) : <p className="mt-5 rounded-2xl bg-sand p-5 text-sm text-black/60">Belum ada campground terpublikasi di wilayah ini.</p>}
        </section>

        <section className="mt-14 border-t border-black/10 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div><p className="icl-eyebrow">Pilihan campground</p><h2 className="mt-2 text-2xl font-extrabold">Campground di {province.name}</h2></div>
            <p className="text-sm font-semibold text-black/50">{directory.total} campground</p>
          </div>
          {directory.items.length ? (
            <>
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{directory.items.slice(0, 6).map((campground) => <CampgroundCard key={campground.id} campground={campground} />)}</div>
              {directory.total > 6 && <div className="mt-8 text-center"><Link href={`/camping?province=${province.slug}`} className="icl-button-secondary inline-flex px-5 py-3 text-sm">Lihat semua {directory.total} campground</Link></div>}
            </>
          ) : <p className="mt-6 rounded-2xl bg-sand p-5 text-sm text-black/60">Belum ada campground terpublikasi di {province.name}.</p>}
        </section>
      </div>
    </main>
  );
}

export async function RegencyGeographicLanding({ regency }: { regency: RegencyLanding }) {
  const directory = await getCampgroundDirectory(parseCampgroundDirectoryQuery({ province: regency.province.slug, regency: regency.slug }));

  return (
    <main>
      <JsonLd data={breadcrumbJsonLd([{ name: "Camping", path: "/camping" }, { name: regency.province.name, path: `/camping/${regency.province.slug}` }, { name: regency.name, path: `/camping/${regency.province.slug}/${regency.slug}` }])} />
      {directory.items.length > 0 && <JsonLd data={campgroundItemListJsonLd(`Campground di ${regency.name}, ${regency.province.name}`, `/camping/${regency.province.slug}/${regency.slug}`, directory.items)} />}
      <SiteHeader />
      <div className="container-icl py-8 md:py-12">
        <Breadcrumb items={[{ label: "Camping", href: "/camping" }, { label: regency.province.name, href: `/camping/${regency.province.slug}` }, { label: regency.name }]} />

        <section className="mt-7 rounded-[28px] bg-forest-900 px-6 py-10 text-white md:px-10 md:py-14">
          <p className="icl-eyebrow !text-white/65">Direktori Camping Indonesia</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-extrabold tracking-tight md:text-5xl">Tempat Camping di {regency.name}, {regency.province.name}</h1>
          <p className="mt-4 max-w-2xl text-white/75">Ada {regency.publishedCampgroundCount} campground terpublikasi di direktori IndoCampingLovers untuk wilayah {regency.name}.</p>
          <Link href={`/camping?province=${regency.province.slug}&regency=${regency.slug}`} className="icl-button-primary icl-focus mt-7 inline-flex bg-white text-forest-900 hover:bg-white/90">Lihat campground di {regency.name}</Link>
        </section>

        <section className="mt-12 border-t border-black/10 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div><p className="icl-eyebrow">Direktori wilayah</p><h2 className="mt-2 text-2xl font-extrabold">Campground di {regency.name}</h2></div>
            <p className="text-sm font-semibold text-black/50">{directory.total} campground</p>
          </div>
          {directory.items.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{directory.items.map((campground) => <CampgroundCard key={campground.id} campground={campground} />)}</div> : <p className="mt-6 rounded-2xl bg-sand p-5 text-sm text-black/60">Belum ada campground terpublikasi di {regency.name}.</p>}
        </section>
      </div>
    </main>
  );
}
