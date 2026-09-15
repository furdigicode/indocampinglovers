import Link from "next/link";
import type { CampgroundDirectoryFacets, CampgroundDirectoryQuery } from "@/lib/campgrounds/directory-query";

function hiddenLists(query: CampgroundDirectoryQuery) {
  return <>{query.types.map(v => <input key={`t-${v}`} type="hidden" name="type" value={v}/>)}{query.facilities.map(v => <input key={`f-${v}`} type="hidden" name="facility" value={v}/>)}{query.access.map(v => <input key={`a-${v}`} type="hidden" name="access" value={v}/>)}</>;
}

export function DirectoryFilters({ query, facets }: { query: CampgroundDirectoryQuery; facets: CampgroundDirectoryFacets }) {
  const regencies = query.province ? facets.regencies.filter(r => r.province === query.province) : facets.regencies;
  const activeCount = Number(Boolean(query.q)) + Number(Boolean(query.province)) + Number(Boolean(query.regency)) + query.types.length + query.facilities.length + query.access.length + Number(query.minPrice !== undefined) + Number(query.maxPrice !== undefined);
  return (
    <form action="/camping" method="get" className="mt-8 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      {hiddenLists(query)}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold">Provinsi<select name="province" defaultValue={query.province ?? ""} className="mt-2 w-full rounded-xl border p-3 font-normal"><option value="">Semua provinsi</option>{facets.provinces.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
        <label className="text-sm font-semibold">Kabupaten/Kota<select name="regency" defaultValue={query.regency ?? ""} className="mt-2 w-full rounded-xl border p-3 font-normal"><option value="">Semua kabupaten/kota</option>{regencies.map(o => <option key={`${o.province}-${o.value}`} value={o.value}>{o.label}</option>)}</select></label>
        <label className="text-sm font-semibold">Harga minimum<input name="min_price" type="number" min="0" step="1000" defaultValue={query.minPrice ?? ""} placeholder="Rp 0" className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-semibold">Harga maksimum<input name="max_price" type="number" min="0" step="1000" defaultValue={query.maxPrice ?? ""} placeholder="Tanpa batas" className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <fieldset><legend className="text-sm font-bold">Tipe camping</legend><div className="mt-2 flex flex-wrap gap-2">{facets.types.map(o => <label key={o.value} className="rounded-full border px-3 py-2 text-xs"><input className="mr-2" type="checkbox" name="type" value={o.value} defaultChecked={query.types.includes(o.value)}/>{o.label}</label>)}</div></fieldset>
        <fieldset><legend className="text-sm font-bold">Fasilitas</legend><div className="mt-2 flex flex-wrap gap-2">{facets.facilities.map(o => <label key={o.value} className="rounded-full border px-3 py-2 text-xs"><input className="mr-2" type="checkbox" name="facility" value={o.value} defaultChecked={query.facilities.includes(o.value)}/>{o.label}</label>)}</div></fieldset>
        <fieldset><legend className="text-sm font-bold">Akses kendaraan</legend><div className="mt-2 flex flex-wrap gap-2">{facets.access.map(o => <label key={o.value} className="rounded-full border px-3 py-2 text-xs"><input className="mr-2" type="checkbox" name="access" value={o.value} defaultChecked={query.access.includes(o.value)}/>{o.label}</label>)}</div></fieldset>
      </div>
      {query.q && <input type="hidden" name="q" value={query.q}/>} 
      <div className="mt-6 flex flex-wrap items-center gap-3"><button type="submit" className="icl-button-primary px-5 py-3 text-sm">Terapkan filter</button>{activeCount > 0 && <Link href="/camping" className="icl-button-secondary px-5 py-3 text-sm">Reset {activeCount} filter</Link>}<label className="ml-auto text-sm">Urutkan <select name="sort" defaultValue={query.sort} className="ml-2 rounded-xl border p-2"><option value="recommended">Rekomendasi</option><option value="name">Nama A–Z</option><option value="price_asc">Harga terendah</option><option value="price_desc">Harga tertinggi</option><option value="recently_verified">Terbaru diverifikasi</option></select></label></div>
    </form>
  );
}
