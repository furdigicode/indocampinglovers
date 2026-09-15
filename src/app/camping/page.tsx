import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CampgroundCard } from "@/components/campground-card";
import { DirectoryFilters } from "@/components/directory-filters";
import { parseCampgroundDirectoryQuery, type DirectorySearchParams } from "@/lib/campgrounds/directory-query";
import { getCampgroundDirectory, getCampgroundDirectoryFacets } from "@/lib/campgrounds/repository";

export const dynamic = "force-dynamic";
type CampingPageProps = { searchParams: Promise<DirectorySearchParams> };

function pageHref(params: DirectorySearchParams, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) search.append(key, item);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/camping?${query}` : "/camping";
}

export default async function CampingPage({ searchParams }: CampingPageProps) {
  const raw = await searchParams;
  const query = parseCampgroundDirectoryQuery(raw);
  const [result, facets] = await Promise.all([getCampgroundDirectory(query), getCampgroundDirectoryFacets()]);
  return <main><SiteHeader/><div className="container-icl py-16">
    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-forest-700"><ArrowLeft size={16}/>Beranda</Link>
    <div className="mt-8 max-w-2xl"><p className="font-semibold text-forest-700">Jelajah Camping</p><h1 className="mt-2 text-4xl font-bold">Temukan campground di Indonesia</h1><p className="mt-4 leading-7 text-black/60">Cari dan saring tempat camping berdasarkan lokasi, tipe, fasilitas, harga, serta akses kendaraan.</p></div>
    <form action="/camping" method="get" className="mt-10 flex max-w-xl items-center gap-3 rounded-2xl border bg-white p-3"><Search className="ml-2 text-black/40"/><input name="q" defaultValue={query.q??""} className="flex-1 py-2 outline-none" placeholder="Cari nama, kota, kecamatan, atau alamat..."/><button className="icl-button-primary px-4 py-2 text-sm" type="submit">Cari</button></form>
    <DirectoryFilters query={query} facets={facets}/>
    <div className="mt-8 flex items-center justify-between border-b border-black/10 pb-4"><p className="font-semibold">{result.total} campground</p><p className="text-xs text-black/45">Halaman {result.page} dari {result.totalPages} · {result.pageSize} per halaman</p></div>
    {result.items.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.items.map(c=><CampgroundCard key={c.id} campground={c}/>)}</div> : <div className="mt-8 rounded-3xl border border-black/5 bg-white p-10 text-center"><h2 className="text-xl font-extrabold">Tidak ada campground yang cocok</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/55">Coba ubah pencarian atau kurangi filter.</p><Link href="/camping" className="icl-button-secondary mt-5 inline-flex px-5 py-3 text-sm">Reset pencarian & filter</Link></div>}
    {result.totalPages > 1 && <nav aria-label="Pagination" className="mt-10 flex justify-center gap-3">{result.page>1&&<Link className="icl-button-secondary px-5 py-3 text-sm" href={pageHref(raw,result.page-1)}>← Sebelumnya</Link>}<span className="flex items-center px-3 text-sm text-black/55">{result.page} / {result.totalPages}</span>{result.page<result.totalPages&&<Link className="icl-button-secondary px-5 py-3 text-sm" href={pageHref(raw,result.page+1)}>Berikutnya →</Link>}</nav>}
  </div></main>;
}
