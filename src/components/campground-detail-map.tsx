"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

type CampgroundDetailMapProps = {
  name: string;
  latitude: number;
  longitude: number;
};

export function CampgroundDetailMap({ name, latitude, longitude }: CampgroundDetailMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [longitude, latitude],
      zoom: 13,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setText(name);
    const marker = new maplibregl.Marker().setLngLat([longitude, latitude]).setPopup(popup).addTo(map);

    map.on("load", () => {
      map.resize();
      marker.togglePopup();
    });

    return () => map.remove();
  }, [latitude, longitude, name]);

  return <div ref={containerRef} className="h-[320px] w-full md:h-[380px]" aria-label={`Peta lokasi ${name}`} role="region" />;
}
