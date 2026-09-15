"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { CampgroundDirectoryFacets, CampgroundDirectoryQuery } from "@/lib/campgrounds/directory-query";

export function DirectoryFilters({ query, facets }: { query: CampgroundDirectoryQuery; facets: CampgroundDirectoryFacets }) {
  const [province, setProvince] = useState(query.province ?? "");
  const [regency, setRegency] = useState(query.regency ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const regencies = province ? facets.regencies.filter((option) => option.province === province) : facets.regencies;
  const activeCount = Number(Boolean(query.q)) + Number(Boolean(query.province)) + Number(Boolean(query.regency)) + query.types.length + query.facilities.length + query.access.length + Number(query.minPrice !== undefined) + Number(query.maxPrice !== undefined);

  function changeProvince(nextProvince: string) {
    setProvince(nextProvince);
    // A regency belongs to exactly one province. Reset it immediately whenever the
    // parent province changes so an invalid province/regency pair cannot be submitted.
    setRegency("");
  }

  return (
    <form action="/camping" method="get" className="mt-6 rounded-3xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
      {query.q && <input type="hidden" name="q" value={query.q}/>} 
      <div className="flex items-center justify-between gap-4 font-bold text-forest-900">
        <span className="flex items-center gap-2"><SlidersHorizontal size={18}/>Filter {activeCount > 0 && <span className="rounded-full bg-forest-800 px-2 py-0.5 text-xs text-white">{activeCount}</span>}</span>
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="text-xs font-semibold text-forest-700 md:hidden" aria-expanded={mobileOpen}>{mobileOpen ? "Tutup" : "Buka filter"}</button>
      </div>

      <div className={`${mobileOpen || activeCount > 0 ? "block" : "hidden"} md:block`}>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold">Provinsi<select name="province" value={province} onChange={(event) => changeProvince(event.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal"><option value="">Semua provinsi</option>{facets.provinces.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-sm font-semibold">Kabupaten/Kota<select name="regency" value={regency} onChange={(event) => setRegency(event.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal"><option value="">Semua kabupaten/kota</option>{regencies.map((option) => <option key={`${option.province}-${option.value}`} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-sm font-semibold">Harga minimum<input name="min_price" type="number" min="0" step="1000" defaultValue={query.minPrice ?? ""} placeholder="Rp 0" className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
          <label className="text-sm font-semibold">Harga maksimum<input name="max_price" type="number" min="0" step="1000" defaultValue={query.maxPrice ?? ""} placeholder="Tanpa batas" className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <fieldset><legend className="text-sm font-bold">Tipe camping</legend><div className="mt-2 flex flex-wrap gap-2">{facets.types.map((option) => <label key={option.value} className="cursor-pointer rounded-full border px-3 py-2 text-xs transition has-[:checked]:border-forest-700 has-[:checked]:bg-forest-50 has-[:checked]:text-forest-800"><input className="mr-2 accent-forest-800" type="checkbox" name="type" value={option.value} defaultChecked={query.types.includes(option.value)}/>{option.label}</label>)}</div></fieldset>
          <fieldset><legend className="text-sm font-bold">Fasilitas</legend><div className="mt-2 flex flex-wrap gap-2">{facets.facilities.map((option) => <label key={option.value} className="cursor-pointer rounded-full border px-3 py-2 text-xs transition has-[:checked]:border-forest-700 has-[:checked]:bg-forest-50 has-[:checked]:text-forest-800"><input className="mr-2 accent-forest-800" type="checkbox" name="facility" value={option.value} defaultChecked={query.facilities.includes(option.value)}/>{option.label}</label>)}</div></fieldset>
          <fieldset><legend className="text-sm font-bold">Akses kendaraan</legend><div className="mt-2 flex flex-wrap gap-2">{facets.access.map((option) => <label key={option.value} className="cursor-pointer rounded-full border px-3 py-2 text-xs transition has-[:checked]:border-forest-700 has-[:checked]:bg-forest-50 has-[:checked]:text-forest-800"><input className="mr-2 accent-forest-800" type="checkbox" name="access" value={option.value} defaultChecked={query.access.includes(option.value)}/>{option.label}</label>)}</div></fieldset>
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:items-center"><button type="submit" className="icl-button-primary px-5 py-3 text-sm">Terapkan filter</button>{activeCount > 0 && <Link href="/camping" className="icl-button-secondary px-5 py-3 text-center text-sm">Reset semua</Link>}<label className="text-sm sm:ml-auto">Urutkan <select name="sort" defaultValue={query.sort} className="ml-2 rounded-xl border p-2"><option value="recommended">Rekomendasi</option><option value="name">Nama A–Z</option><option value="price_asc">Harga terendah</option><option value="price_desc">Harga tertinggi</option><option value="recently_verified">Terbaru diverifikasi</option></select></label></div>
      </div>
    </form>
  );
}
