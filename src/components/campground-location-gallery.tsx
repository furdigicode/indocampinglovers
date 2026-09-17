import { MapPin, Navigation } from "lucide-react";
import type { CampgroundPhotoDetail } from "@/types/campground";
import { CampgroundGallery } from "@/components/campground-gallery";
import { CampgroundDetailMap } from "@/components/campground-detail-map";

type Props = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: CampgroundPhotoDetail[];
};

export function CampgroundLocationGallery({ name, address, latitude, longitude, photos }: Props) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;

  return <>
    {photos.length > 0 && <section className="mt-12 border-t border-black/10 pt-10">
      <p className="icl-eyebrow">Galeri</p>
      <div className="mb-6 flex items-end justify-between gap-4"><div><h2 className="mt-2 text-2xl font-extrabold tracking-tight">Lihat suasana campground</h2><p className="mt-2 text-sm text-black/50">Foto yang telah disetujui untuk ditampilkan di IndoCampingLovers.</p></div><p className="hidden text-xs font-bold text-black/40 sm:block">{photos.length} foto</p></div>
      <CampgroundGallery name={name} photos={photos}/>
    </section>}

    <section className="mt-12 border-t border-black/10 pt-10">
      <p className="icl-eyebrow">Lokasi</p>
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end"><div><h2 className="mt-2 text-2xl font-extrabold tracking-tight">Temukan lokasi campground</h2><p className="mt-3 flex max-w-2xl items-start gap-2 text-sm leading-6 text-black/55"><MapPin className="mt-0.5 shrink-0" size={17}/>{address}</p></div>{hasCoordinates&&<a href={mapsUrl} target="_blank" rel="noreferrer" className="icl-button-secondary icl-focus px-5 py-3 text-sm"><Navigation size={17}/>Petunjuk arah</a>}</div>
      {hasCoordinates ? <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white"><CampgroundDetailMap name={name} latitude={latitude} longitude={longitude}/></div> : <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/50">Koordinat lokasi belum tersedia.</div>}
      <p className="mt-3 text-xs leading-5 text-black/45">Posisi marker berdasarkan koordinat yang tersimpan di database. Pastikan kembali akses masuk dan titik kedatangan dengan pengelola.</p>
    </section>
  </>;
}
