"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { CampgroundPhotoDetail } from "@/types/campground";

type CampgroundGalleryProps = { name: string; photos: CampgroundPhotoDetail[] };

export function CampgroundGallery({ name, photos }: CampgroundGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : photos[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex(index => index === null ? null : (index - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") setActiveIndex(index => index === null ? null : (index + 1) % photos.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [activeIndex, photos.length]);

  if (photos.length === 0) return null;
  const visible = photos.slice(0, 5);

  return <>
    <div className="grid gap-2 overflow-hidden rounded-[24px] md:grid-cols-2 md:grid-rows-2 md:gap-3">
      {visible.map((photo, index) => <button key={photo.id} type="button" onClick={() => setActiveIndex(index)} className={`icl-focus group relative overflow-hidden bg-forest-100 ${index === 0 ? "aspect-[16/10] md:row-span-2 md:aspect-auto" : "hidden aspect-[16/10] md:block"}`}>
        <Image src={photo.url} alt={photo.altText || `Foto ${name} ${index + 1}`} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes={index === 0 ? "(min-width:768px) 50vw, 100vw" : "25vw"}/>
        {index === visible.length - 1 && photos.length > 1 && <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur"><Images size={15}/>Lihat {photos.length} foto</span>}
      </button>)}
    </div>

    {active && activeIndex !== null && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label={`Galeri foto ${name}`} onClick={() => setActiveIndex(null)}>
      <button type="button" onClick={() => setActiveIndex(null)} className="icl-focus absolute right-5 top-5 z-10 rounded-full bg-white/10 p-3 text-white" aria-label="Tutup galeri"><X size={22}/></button>
      {photos.length > 1 && <><button type="button" onClick={event => { event.stopPropagation(); setActiveIndex((activeIndex - 1 + photos.length) % photos.length); }} className="icl-focus absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white md:left-8" aria-label="Foto sebelumnya"><ChevronLeft size={26}/></button><button type="button" onClick={event => { event.stopPropagation(); setActiveIndex((activeIndex + 1) % photos.length); }} className="icl-focus absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white md:right-8" aria-label="Foto berikutnya"><ChevronRight size={26}/></button></>}
      <div className="relative h-[78vh] w-full max-w-6xl" onClick={event => event.stopPropagation()}><Image src={active.url} alt={active.altText || `Foto ${name}`} fill className="object-contain" sizes="100vw"/></div>
      <div className="absolute bottom-5 left-1/2 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 text-center text-white"><p className="text-xs font-bold text-white/60">{activeIndex + 1} / {photos.length}</p>{active.caption && <p className="mt-1 text-sm">{active.caption}</p>}{active.creditName && <p className="mt-1 text-xs text-white/50">Foto: {active.creditName}</p>}</div>
    </div>}
  </>;
}
