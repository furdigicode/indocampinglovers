"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function CampingError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-sand/40">
      <div className="container-icl flex min-h-[70vh] items-center justify-center py-16">
        <div className="max-w-lg rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700"><AlertTriangle size={22}/></span>
          <h1 className="mt-5 text-2xl font-extrabold text-forest-900">Direktori belum bisa dimuat</h1>
          <p className="mt-3 text-sm leading-6 text-black/55">Terjadi kendala saat mengambil data campground. Data Anda aman; coba muat ulang halaman.</p>
          <button onClick={reset} className="icl-button-primary mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm"><RotateCcw size={16}/>Coba lagi</button>
        </div>
      </div>
    </main>
  );
}
