import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, getStats } from "@/lib/supabase";
import { SITE_URL } from "@/lib/diller";
import KurumsalSayfa from "@/components/kurumsal/KurumsalSayfa";

export const revalidate = 3600;

const BASLIK = "Hakkımızda | Alya Plastik"; // OG/Twitter'da olduğu gibi kullanılır (şablon uygulanmaz)
const ACIKLAMA = "1968'den bu yana İstanbul'da plastik saksı, sepet, sandık ve ev ürünleri üreten Alya Plastik hakkında.";

export const metadata: Metadata = {
  // Kök layout'un title template'i ("%s | Alya Plastik") otomatik ekleneceği için burada marka adı TEKRAR eklenmez.
  title: "Hakkımızda",
  description: ACIKLAMA,
  alternates: { canonical: `${SITE_URL}/hakkimizda`, languages: { "tr-TR": `${SITE_URL}/hakkimizda`, "x-default": `${SITE_URL}/hakkimizda` } },
  openGraph: { type: "website", locale: "tr_TR", url: `${SITE_URL}/hakkimizda`, siteName: "Alya Plastik", title: BASLIK, description: ACIKLAMA, images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alya Plastik" }] },
  twitter: { card: "summary_large_image", title: BASLIK, description: ACIKLAMA, images: ["/og-image.jpg"] },
};

export default async function HakkimizdaPage() {
  let settings: Awaited<ReturnType<typeof getSettings>> = null;
  let stats: Awaited<ReturnType<typeof getStats>> = null;
  try { [settings, stats] = await Promise.all([getSettings(), getStats()]); } catch (e) { console.error("Supabase fetch error:", e); }

  const kurulus = settings?.founded ?? 1968;
  const yil = stats?.years ?? new Date().getFullYear() - kurulus;
  const model = stats?.models ?? 200;
  const ulke = stats?.countries ?? 20;
  const adres = settings?.address ?? "İkitelli OSB 4B Blok No:26-28 Kat:2, Başakşehir, İstanbul";

  return (
    <KurumsalSayfa settings={settings} etiket="— Hakkımızda" baslik="1968'DEN BU YANA ÜRETİYORUZ.">
      <p>
        Alya Plastik, {kurulus} yılından bu yana İstanbul&apos;da plastik enjeksiyon ürünleri üretiyor. Saksı, sepet,
        depolama sandığı ve ev gereçleri kategorilerinde {model}+ ürün modelini kendi kalıp ve enjeksiyon hatlarımızda
        tasarlıyor ve üretiyoruz.
      </p>
      <p>
        Üretim tesisimiz {adres} adresinde yer alıyor. Yurt içi toptan satışın yanı sıra {ulke}+ ülkeye ihracat
        yapıyor, B2B müşterilerimize toplu sipariş ve özel kalıp imkânı sunuyoruz.
      </p>
      <p>
        {yil}+ yıllık üretim tecrübemizle kalite ve teslim güvenilirliğini önceliğimiz olarak görüyoruz — ürün
        geliştirmeden kalıp üretimine, enjeksiyondan sevkiyata kadar tüm süreci kendi bünyemizde yönetiyoruz.
      </p>
      <p className="text-sm text-[#6b7366]">
        Toptan sipariş, özel kalıp veya ihracat iş birlikleri için{" "}
        <Link href="/#contact" className="underline hover:text-[#0b0e0b]">bizimle iletişime geçebilirsiniz</Link>.
      </p>
    </KurumsalSayfa>
  );
}
