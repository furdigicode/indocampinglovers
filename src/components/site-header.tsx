import Link from "next/link";
import { TentTree } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-black/5 bg-[#fbfaf6]/95">
      <div className="container-icl flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-forest-800 text-white"><TentTree size={21} /></span>
          <span>IndoCampingLovers</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link href="/camping">Jelajah Camping</Link>
          <Link href="/camping">Destinasi</Link>
          <Link href="#inspirasi">Inspirasi</Link>
          <Link href="#tentang">Tentang ICL</Link>
        </nav>
        <Link href="/tambah-tempat" className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-semibold text-white">+ Tambah Tempat</Link>
      </div>
    </header>
  );
}
