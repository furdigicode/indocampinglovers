"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

const MARKER_COLOR = "#174d35";

// Keep the detail page on the same proven OSM raster basemap used by M2.4.
// This avoids depending on a separate remote MapLibre style endpoint.
const rasterStyle = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};

type CampgroundDetailMapProps = {
  name: string;
  latitude: number;
  longitude: number;
};

export function CampgroundDetailMap({ name, latitude, longitude }: CampgroundDetailMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;
    let marker: import("maplibre-gl").Marker | undefined;

    async function mountMap() {
      const maplibre = await import("maplibre-gl");
      if (disposed || !containerRef.current) return;

      map = new maplibre.Map({
        container: containerRef.current,
        style: rasterStyle,
        center: [longitude, latitude],
        zoom: 13,
        attributionControl: { compact: true },
      });

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      const popup = new maplibre.Popup({
        offset: 24,
        closeButton: false,
        closeOnClick: false,
      }).setText(name);

      marker = new maplibre.Marker({ color: MARKER_COLOR })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

      map.once("load", () => {
        if (!map || disposed) return;
        map.resize();
        marker?.togglePopup();
      });
    }

    void mountMap();

    return () => {
      disposed = true;
      marker?.remove();
      map?.remove();
    };
  }, [latitude, longitude, name]);

  return (
    <div
      ref={containerRef}
      className="h-[320px] w-full md:h-[380px]"
      aria-label={`Peta lokasi ${name}`}
      role="region"
    />
  );
}
