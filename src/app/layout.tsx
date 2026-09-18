import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
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
