import Link from "next/link";
import { Menu, Plus, TentTree } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fbfaf7]/90 backdrop-blur-xl">
      <div className="container-icl flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="icl-focus flex items-center gap-2.5 rounded-xl font-extrabold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-forest-800 text-white md:size-10"><TentTree size={20} /></span>
          <span className="text-[15px] md:text-base">IndoCampingLovers</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-black/70 lg:flex" aria-label="Navigasi utama">
          <Link className="transition hover:text-forest-700" href="/camping">Jelajah Camping</Link>
          <Link className="transition hover:text-forest-700" href="/camping">Destinasi</Link>
          <Link className="transition hover:text-forest-700" href="/#inspirasi">Inspirasi</Link>
          <Link className="transition hover:text-forest-700" href="/#tentang">Tentang ICL</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/tambah-tempat" className="icl-button-primary icl-focus hidden px-5 py-2.5 text-sm sm:inline-flex"><Plus size={16}/>Tambah Tempat</Link>
          <Link href="/camping" aria-label="Buka jelajah camping" className="icl-focus grid size-10 place-items-center rounded-full border border-black/10 bg-white lg:hidden"><Menu size={19}/></Link>
        </div>
      </div>
    </header>
  );
}
