import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IndoCampingLovers — Direktori Camping Indonesia",
    template: "%s | IndoCampingLovers"
  },
  description: "Temukan tempat camping di seluruh Indonesia berdasarkan lokasi, fasilitas, akses, harga, dan gaya campingmu."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
