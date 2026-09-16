"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { Campground, VerificationStatus } from "@/types/campground";

const INDONESIA_CENTER: [number, number] = [117.5, -2.5];
const MARKER_COLOR = "#174d35";

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

const verificationLabels: Record<VerificationStatus, string> = {
  verified: "Terverifikasi",
  community_updated: "Diperbarui komunitas",
  needs_update: "Perlu diperbarui"
};

function formatPrice(campground: Campground) {
  if (campground.priceFrom <= 0) return "Hubungi pengelola";
  return `Mulai Rp${campground.priceFrom.toLocaleString("id-ID")}/${campground.priceUnit}`;
}

function createPopupContent(campground: Campground) {
  const root = document.createElement("div");
  root.className = "icl-map-popup";

  const meta = document.createElement("p");
  meta.className = "icl-map-popup-meta";
  meta.textContent = [campground.regency, campground.province].filter(Boolean).join(", ");

  const title = document.createElement("h3");
  title.className = "icl-map-popup-title";
  title.textContent = campground.name;

  const chips = document.createElement("div");
  chips.className = "icl-map-popup-chips";
  if (campground.types[0]) {
    const type = document.createElement("span");
    type.textContent = campground.types[0];
    chips.appendChild(type);
  }
  const verification = document.createElement("span");
  verification.textContent = verificationLabels[campground.verificationStatus];
  chips.appendChild(verification);

  const price = document.createElement("p");
  price.className = "icl-map-popup-price";
  price.textContent = formatPrice(campground);

  const detail = document.createElement("a");
  detail.className = "icl-map-popup-link";
  detail.href = `/camping/${encodeURIComponent(campground.slug)}`;
  detail.textContent = "Lihat detail →";

  root.append(meta, title, chips, price, detail);
  return root;
}

function setMarkerSelected(marker: import("maplibre-gl").Marker, selected: boolean) {
  marker.getElement().classList.toggle("icl-map-marker-selected", selected);
}

export function CampgroundMap({ campgrounds }: { campgrounds: Campground[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || campgrounds.length === 0) return;
    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;
    let activeMarker: import("maplibre-gl").Marker | undefined;
    let activePopup: import("maplibre-gl").Popup | undefined;
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

      const resetActiveMarker = () => {
        if (activeMarker) setMarkerSelected(activeMarker, false);
        activeMarker = undefined;
        activePopup = undefined;
      };

      const bounds = new maplibre.LngLatBounds();
      for (const campground of campgrounds) {
        const lngLat: [number, number] = [campground.longitude, campground.latitude];
        bounds.extend(lngLat);
        const marker = new maplibre.Marker({ color: MARKER_COLOR }).setLngLat(lngLat).addTo(map);
        const element = marker.getElement();
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-label", `Lihat ${campground.name}`);

        const openPreview = () => {
          if (!map) return;
          activePopup?.remove();
          if (activeMarker && activeMarker !== marker) setMarkerSelected(activeMarker, false);
          setMarkerSelected(marker, true);
          activeMarker = marker;

          const popup = new maplibre.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: "300px",
            offset: 28
          })
            .setLngLat(lngLat)
            .setDOMContent(createPopupContent(campground))
            .addTo(map);
          activePopup = popup;
          popup.once("close", () => {
            if (activePopup === popup) resetActiveMarker();
          });
        };

        element.addEventListener("click", openPreview);
        element.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPreview();
          }
        });
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
      activePopup?.remove();
      markers.forEach((marker) => marker.remove());
      map?.remove();
    };
  }, [campgrounds]);

  if (campgrounds.length === 0) {
    return <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8 text-center md:p-12"><h2 className="text-xl font-extrabold">Belum ada lokasi yang bisa ditampilkan di peta</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/55">Hasil pencarian ini belum memiliki koordinat peta yang valid. Coba ubah atau reset filter.</p></div>;
  }

  return <div className="mt-8 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"><div ref={containerRef} className="h-[520px] w-full md:h-[620px]" aria-label={`Peta ${campgrounds.length} campground`}/></div>;
}
