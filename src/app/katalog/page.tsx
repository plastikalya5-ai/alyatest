import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getKatalog, getSettings } from "@/lib/supabase";
import { SITE_URL } from "@/lib/diller";
import KatalogGoruntuleyici from "@/components/katalog/KatalogGoruntuleyici";

export const revalidate = 300;

const BASLIK = "Katalog | Alya Plastik";
const ACIKLAMA = "Alya Plastik ürün kataloğunu sayfa sayfa çevirerek inceleyin.";

export const metadata: Metadata = {
  title: "Katalog",
  description: ACIKLAMA,
  alternates: { canonical: `${SITE_URL}/katalog`, languages: { "tr-TR": `${SITE_URL}/katalog`, "x-default": `${SITE_URL}/katalog` } },
  openGraph: { type: "website", locale: "tr_TR", url: `${SITE_URL}/katalog`, siteName: "Alya Plastik", title: BASLIK, description: ACIKLAMA, images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alya Plastik" }] },
  twitter: { card: "summary_large_image", title: BASLIK, description: ACIKLAMA, images: ["/og-image.jpg"] },
};

// Dijital katalog (PDF flipbook) — yalnızca Türkçe. Admin panelde (Katalog) yüklenen PDF anında burada görünür.
export default async function KatalogPage() {
  let settings: Awaited<ReturnType<typeof getSettings>> = null;
  let katalog: Awaited<ReturnType<typeof getKatalog>> = null;
  try { [settings, katalog] = await Promise.all([getSettings(), getKatalog()]); } catch (e) { console.error("Supabase fetch error:", e); }

  return (
    <div lang="tr">
      <Header settings={settings} dil="tr" />
      <main className="bg-[#0b0e0b] min-h-svh pt-[84px]">
        <div style={{ paddingInline: "clamp(20px,5vw,80px)", paddingBlock: "clamp(32px,5vw,56px)" }}>
          <p className="eyebrow text-[#e55f28] mb-3">— Katalog</p>
          <h1 className="heading text-[#eae6dd] mb-8" style={{ fontSize: "clamp(32px,5vw,56px)", lineHeight: 0.98 }}>Ürün Kataloğumuz</h1>
        </div>
        {katalog?.url ? (
          <KatalogGoruntuleyici pdfUrl={katalog.url} />
        ) : (
          <div style={{ paddingInline: "clamp(20px,5vw,80px)", paddingBottom: 96 }}>
            <p className="text-[#9aa294]" style={{ maxWidth: "60ch" }}>Katalog şu anda hazırlanıyor — kısa süre sonra burada yayınlanacak.</p>
          </div>
        )}
      </main>
      <Footer settings={settings} dil="tr" />
    </div>
  );
}
