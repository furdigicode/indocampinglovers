import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AddCampgroundWizard } from "@/components/add-campground-wizard";
import { getContributionReferenceData } from "@/lib/submissions/reference-data";

export const metadata = {
  title: "Tambah Tempat Camping | IndoCampingLovers",
  description: "Bantu komunitas melengkapi direktori camping Indonesia dengan mengusulkan tempat camping.",
  robots: { index: false, follow: true },
};

export default async function AddCampgroundPage() {
  const reference = await getContributionReferenceData();
  return <main><SiteHeader/><div className="container-icl py-8 md:py-12"><Link href="/camping" className="icl-focus inline-flex items-center gap-2 rounded text-sm font-semibold text-forest-700"><ArrowLeft size={16}/>Jelajah Camping</Link><div className="mx-auto mt-7 max-w-3xl"><div className="mb-7"><p className="icl-eyebrow">Kontribusi Komunitas</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Tambahkan tempat camping</h1><p className="mt-3 max-w-2xl leading-7 text-black/60">Punya informasi tempat camping yang belum ada di ICL? Ceritakan yang kamu tahu. Usulan akan diperiksa sebelum tampil di direktori.</p></div><AddCampgroundWizard reference={reference}/></div></div></main>;
}
