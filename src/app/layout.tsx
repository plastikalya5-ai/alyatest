import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alya Plastik | Plastik Saksı & Sepet Üreticisi — 1968'den Beri",
  description:
    "İstanbul OSB'de 55 yıllık üretim deneyimi. Saksı, sepet, sandık ve banyo ürünleri. 20+ ülke ihracat. B2B toplu sipariş.",
  keywords: "plastik saksı, plastik sepet, plastik üretici, toptan saksı, ihracat, alya plastik",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head />
      <body>{children}</body>
    </html>
  );
}
