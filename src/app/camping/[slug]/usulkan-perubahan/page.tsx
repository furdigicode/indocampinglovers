import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SuggestEditForm } from "@/components/suggest-edit-form";
import { getCampgroundBySlug } from "@/lib/campgrounds/repository";
type Props={params:Promise<{slug:string}>};
export const metadata={title:"Usulkan Perubahan | IndoCampingLovers",robots:{index:false,follow:true}};
export default async function SuggestEditPage({params}:Props){const {slug}=await params;const campground=await getCampgroundBySlug(slug);if(!campground)notFound();return <main><SiteHeader/><div className="container-icl py-8 md:py-12"><Link href={`/camping/${campground.slug}`} className="icl-focus inline-flex items-center gap-2 rounded text-sm font-semibold text-forest-700"><ArrowLeft size={16}/>Kembali ke {campground.name}</Link><div className="mx-auto mt-7 max-w-3xl"><p className="icl-eyebrow">Kontribusi Komunitas</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Usulkan perubahan</h1><p className="mt-3 mb-7 leading-7 text-black/60">Menemukan informasi yang sudah berubah atau kurang tepat di <strong>{campground.name}</strong>? Kirim koreksi. Usulan akan diperiksa sebelum mengubah data direktori.</p><SuggestEditForm campgroundId={campground.id} campgroundName={campground.name}/></div></div></main>}
