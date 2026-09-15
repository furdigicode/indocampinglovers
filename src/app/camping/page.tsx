import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CampgroundCard } from "@/components/campground-card";
import { DirectoryFilters } from "@/components/directory-filters";
import { parseCampgroundDirectoryQuery, type DirectorySearchParams } from "@/lib/campgrounds/directory-query";
import { getCampgroundDirectory, getCampgroundDirectoryFacets } from "@/lib/campgrounds/repository";

export const dynamic = "force-dynamic";
type CampingPageProps = { searchParams: Promise<DirectorySearchParams> };
type ActiveFilterChip = { key: string; label: string; value?: string };

function hrefWithout(params: DirectorySearchParams, key: string, value?: string) {
  const search = new URLSearchParams();
  for (const [currentKey, currentValue] of Object.entries(params)) {
    if (currentKey === "page" || currentValue === undefined) continue;
    for (const item of Array.isArray(currentValue) ? currentValue : [currentValue]) {
      if (currentKey === key && (value === undefined || item === value)) continue;
      search.append(currentKey, item);
    }
  }
  const text = search.toString();
  return text ? `/camping?${text}` : "/camping";
}

function pageHref(params: DirectorySearchParams, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) search.append(key, item);
  }
  if (page > 1) search.set("page", String(page));
  const text = search.toString();
  return text ? `/camping?${text}` : "/camping";
}

export default async function CampingPage({ searchParams }: CampingPageProps) {
  const raw = await searchParams;
  const query = parseCampgroundDirectoryQuery(raw);
  const [result, facets] = await Promise.all([getCampgroundDirectory(query), getCampgroundDirectoryFacets()]);
  const labels = new Map([...facets.provinces, ...facets.regencies, ...facets.types, ...facets.facilities, ...facets.access].map((item) => [item.value, item.label]));
  const chips: ActiveFilterChip[] = [
    ...(query.q ? [{ key: "q", label: `“${query.q}”` }] : []),
    ...(query.province ? [{ key: "province", label: labels.get(query.province) ?? query.province }] : []),
    ...(query.regency ? [{ key: "regency", label: labels.get(query.regency) ?? query.regency }] : []),
    ...query.types.map((value) => ({ key: "type", value, label: labels.get(value) ?? value })),
    ...query.facilities.map((value) => ({ key: "facility", value, label: labels.get(value) ?? value })),
    ...query.access.map((value) => ({ key: "access", value, label: labels.get(value) ?? value })),
    ...(query.minPrice !== undefined ? [{ key: "min_price", label: `Min Rp${query.minPrice.toLocaleString("id-ID")}` }] : []),
    ...(query.maxPrice !== undefined ? [{ key: "max_price", label: `Maks Rp${query.maxPrice.toLocaleString("id-ID")}` }] : [])
  ];

  return <main><SiteHeader/><div className="container-icl py-10 md:py-16">
    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-forest-700"><ArrowLeft size={16}/>Beranda</Link>
    <div className="mt-7 max-w-2xl"><p className="font-semibold text-forest-700">Jelajah Camping</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">Temukan campground di Indonesia</h1><p className="mt-4 leading-7 text-black/60">Cari dan saring tempat camping berdasarkan lokasi, tipe, fasilitas, harga, serta akses kendaraan.</p></div>
    <form action="/camping" method="get" className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border bg-white p-2 shadow-sm md:gap-3 md:p-3"><Search className="ml-2 shrink-0 text-black/40" size={20}/><input aria-label="Cari campground" name="q" defaultValue={query.q??""} className="min-w-0 flex-1 py-2 outline-none" placeholder="Nama, kota, kecamatan..."/><button className="icl-button-primary px-4 py-2 text-sm" type="submit">Cari</button></form>
    <DirectoryFilters query={query} facets={facets}/>
    {chips.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-bold uppercase tracking-wide text-black/40">Aktif</span>{chips.map((chip, index) => <Link key={`${chip.key}-${chip.value??index}`} href={hrefWithout(raw, chip.key, chip.value)} className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-2 text-xs font-semibold text-forest-800 transition hover:bg-forest-100">{chip.label}<X size={13}/></Link>)}<Link href="/camping" className="px-2 py-2 text-xs font-bold text-forest-700">Hapus semua</Link></div>}
    <div className="mt-8 flex flex-col gap-1 border-b border-black/10 pb-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-bold text-forest-900">{result.total} campground ditemukan</p>{query.q && <p className="mt-1 text-xs text-black/45">Hasil pencarian untuk “{query.q}”</p>}</div><p className="text-xs text-black/45">Halaman {result.page} dari {result.totalPages} · {result.pageSize} per halaman</p></div>
    {result.items.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.items.map(c=><CampgroundCard key={c.id} campground={c}/>)}</div> : <div className="mt-8 rounded-3xl border border-black/5 bg-white p-8 text-center md:p-12"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand"><Search size={20} className="text-forest-700"/></div><h2 className="mt-5 text-xl font-extrabold">Belum menemukan tempat yang cocok</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/55">Coba gunakan lokasi yang lebih luas, naikkan rentang harga, atau kurangi fasilitas yang dipilih.</p><Link href="/camping" className="icl-button-secondary mt-5 inline-flex px-5 py-3 text-sm">Reset pencarian & filter</Link></div>}
    {result.totalPages > 1 && <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">{result.page>1&&<Link className="icl-button-secondary px-4 py-3 text-sm" href={pageHref(raw,result.page-1)}>← Sebelumnya</Link>}{Array.from({length:result.totalPages},(_,i)=>i+1).filter(page=>page===1||page===result.totalPages||Math.abs(page-result.page)<=1).map((page,index,pages)=><span key={page} className="contents">{index>0&&page-pages[index-1]>1&&<span className="px-1 text-black/35">…</span>}<Link aria-current={page===result.page?"page":undefined} className={page===result.page?"rounded-xl bg-forest-800 px-4 py-3 text-sm font-bold text-white":"rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold"} href={pageHref(raw,page)}>{page}</Link></span>)}{result.page<result.totalPages&&<Link className="icl-button-secondary px-4 py-3 text-sm" href={pageHref(raw,result.page+1)}>Berikutnya →</Link>}</nav>}
  </div></main>;
}
