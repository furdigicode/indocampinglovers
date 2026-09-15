import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CampgroundCard } from "@/components/campground-card";
import { parseCampgroundDirectoryQuery, type DirectorySearchParams } from "@/lib/campgrounds/directory-query";
import { getCampgroundDirectory } from "@/lib/campgrounds/repository";

export const dynamic = "force-dynamic";

type CampingPageProps = { searchParams: Promise<DirectorySearchParams> };

export default async function CampingPage({ searchParams }: CampingPageProps) {
  const query = parseCampgroundDirectoryQuery(await searchParams);
  const result = await getCampgroundDirectory(query);

  return (
    <main>
      <SiteHeader />
      <div className="container-icl py-16">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-forest-700"><ArrowLeft size={16}/>Beranda</Link>
        <div className="mt-8 max-w-2xl"><p className="font-semibold text-forest-700">Jelajah Camping</p><h1 className="mt-2 text-4xl font-bold">Temukan campground di Indonesia</h1><p className="mt-4 leading-7 text-black/60">Cari campground berdasarkan nama atau lokasi. Filter lengkap lokasi, tipe camping, fasilitas, harga, dan akses sedang dibangun di atas URL query yang dapat dibagikan.</p></div>

        <form action="/camping" method="get" className="mt-10 flex max-w-xl items-center gap-3 rounded-2xl border bg-white p-3">
          <Search className="ml-2 text-black/40"/>
          <input name="q" defaultValue={query.q ?? ""} className="flex-1 py-2 outline-none" placeholder="Cari nama, kecamatan, atau alamat..." />
          <button className="icl-button-primary px-4 py-2 text-sm" type="submit">Cari</button>
        </form>

        <div className="mt-8 flex items-center justify-between border-b border-black/10 pb-4"><p className="font-semibold">{result.total} campground</p><p className="text-xs text-black/45">Halaman {result.page} dari {result.totalPages} · {result.pageSize} per halaman</p></div>
        {result.items.length > 0 ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.items.map((campground) => <CampgroundCard key={campground.id} campground={campground} />)}</div> : <div className="mt-8 rounded-3xl border border-black/5 bg-white p-10 text-center"><h2 className="text-xl font-extrabold">Tidak ada campground yang cocok</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/55">Coba ubah kata pencarian atau hapus filter. Database hanya menampilkan campground yang sudah dipublikasikan.</p>{query.q && <Link href="/camping" className="icl-button-secondary mt-5 inline-flex px-5 py-3 text-sm">Hapus pencarian</Link>}</div>}
      </div>
    </main>
  );
}
