import Link from "next/link";
import { TentTree } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() { return <main><SiteHeader/><div className="container-icl grid min-h-[70vh] place-items-center py-16 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-sand text-forest-700"><TentTree size={30}/></span><p className="icl-eyebrow mt-6">404</p><h1 className="icl-title mt-2 text-4xl">Tempat ini belum ada di peta ICL.</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-black/55">Halaman yang kamu cari tidak ditemukan atau campground tersebut belum tersedia di direktori.</p><Link href="/camping" className="icl-button-primary icl-focus mt-7 px-6 py-3 text-sm">Jelajah Camping</Link></div></div></main>; }
