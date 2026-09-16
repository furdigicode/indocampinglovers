"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { Campground } from "@/types/campground";

const INDONESIA_CENTER: [number, number] = [117.5, -2.5];

const rasterStyle = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors"
    }
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }]
};

export function CampgroundMap({ campgrounds }: { campgrounds: Campground[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || campgrounds.length === 0) return;
    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;
    const markers: import("maplibre-gl").Marker[] = [];

    async function mountMap() {
      const maplibre = await import("maplibre-gl");
      if (disposed || !containerRef.current) return;

      map = new maplibre.Map({
        container: containerRef.current,
        style: rasterStyle,
        center: INDONESIA_CENTER,
        zoom: 4,
        attributionControl: { compact: true }
      });
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      const bounds = new maplibre.LngLatBounds();
      for (const campground of campgrounds) {
        const lngLat: [number, number] = [campground.longitude, campground.latitude];
        bounds.extend(lngLat);
        const marker = new maplibre.Marker({ color: "#174d35" }).setLngLat(lngLat).addTo(map);
        markers.push(marker);
      }

      map.once("load", () => {
        if (!map || disposed) return;
        if (campgrounds.length === 1) {
          map.flyTo({ center: [campgrounds[0].longitude, campgrounds[0].latitude], zoom: 12, duration: 0 });
        } else if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 56, maxZoom: 12, duration: 0 });
        }
      });
    }

    void mountMap();
    return () => {
      disposed = true;
      markers.forEach((marker) => marker.remove());
      map?.remove();
    };
  }, [campgrounds]);

  if (campgrounds.length === 0) {
    return <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8 text-center md:p-12"><h2 className="text-xl font-extrabold">Belum ada lokasi yang bisa ditampilkan di peta</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/55">Hasil pencarian ini belum memiliki koordinat peta yang valid. Coba ubah atau reset filter.</p></div>;
  }

  return <div className="mt-8 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"><div ref={containerRef} className="h-[520px] w-full md:h-[620px]" aria-label={`Peta ${campgrounds.length} campground`}/></div>;
}
