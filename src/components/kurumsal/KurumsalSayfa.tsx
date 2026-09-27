import type { ReactNode } from "react";
import type { Settings } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Kurumsal içerik sayfaları (Hakkımızda, Üretim Süreci, Sertifikalar, KVKK) için ortak sayfa
// iskeleti — anasayfayla aynı Header/Footer'ı kullanır, şimdilik yalnızca Türkçe.
export default function KurumsalSayfa({ settings, etiket, baslik, children }: { settings: Settings | null; etiket: string; baslik: string; children: ReactNode }) {
  return (
    <div lang="tr">
      <Header settings={settings} dil="tr" />
      <main className="bg-[#eae6dd] min-h-svh pt-[68px]">
        <div style={{ paddingInline: "clamp(20px,5vw,80px)", paddingBlock: "clamp(48px,7vw,96px)" }}>
          <p className="eyebrow text-[#e55f28] mb-3">{etiket}</p>
          <h1 className="heading text-[#0b0e0b] mb-10" style={{ fontSize: "clamp(36px,6vw,68px)", lineHeight: 0.98, maxWidth: "18ch" }}>{baslik}</h1>
          <div className="flex flex-col gap-5 text-[#3c4238]" style={{ maxWidth: "72ch", fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.85 }}>
            {children}
          </div>
        </div>
      </main>
      <Footer settings={settings} dil="tr" />
    </div>
  );
}
