import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/supabase";
import { SITE_URL } from "@/lib/diller";
import KurumsalSayfa from "@/components/kurumsal/KurumsalSayfa";

export const revalidate = 3600;

const BASLIK = "Üretim Süreci | Alya Plastik";
const ACIKLAMA = "Alya Plastik'te kalıp tasarımından sevkiyata kadar plastik enjeksiyon üretim sürecimiz.";

export const metadata: Metadata = {
  title: BASLIK,
  description: ACIKLAMA,
  alternates: { canonical: `${SITE_URL}/uretim-sureci`, languages: { "tr-TR": `${SITE_URL}/uretim-sureci`, "x-default": `${SITE_URL}/uretim-sureci` } },
  openGraph: { type: "website", locale: "tr_TR", url: `${SITE_URL}/uretim-sureci`, siteName: "Alya Plastik", title: BASLIK, description: ACIKLAMA, images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alya Plastik" }] },
  twitter: { card: "summary_large_image", title: BASLIK, description: ACIKLAMA, images: ["/og-image.jpg"] },
};

const ADIMLAR = [
  { b: "Kalıp Tasarımı", a: "Ürün talebine veya kendi koleksiyonumuza göre kalıp tasarımını kendi mühendislik ekibimizle yapıyor, kalıpları kendi atölyemizde üretiyoruz." },
  { b: "Hammadde Seçimi", a: "Ürünün kullanım amacına uygun plastik hammadde (PP, PE vb.) ve renk reçetesi seçilir." },
  { b: "Enjeksiyon", a: "Hammadde, kendi enjeksiyon hatlarımızda ısıtılıp kalıba basılarak nihai ürün şekli oluşturulur." },
  { b: "Kalite Kontrol", a: "Her üretim partisinden numuneler alınarak ölçü, dayanıklılık ve yüzey kalitesi kontrol edilir." },
  { b: "Paketleme", a: "Onaylanan ürünler sevkiyat türüne (yurt içi / ihracat) uygun şekilde paketlenir." },
  { b: "Sevkiyat", a: "Toptan siparişler yurt içi teslimat veya ihracat için sevkiyata hazırlanır." },
];

export default async function UretimSureciPage() {
  let settings: Awaited<ReturnType<typeof getSettings>> = null;
  try { settings = await getSettings(); } catch (e) { console.error("Supabase fetch error:", e); }

  return (
    <KurumsalSayfa settings={settings} etiket="— Üretim Süreci" baslik="KALIPTAN SEVKİYATA TÜM SÜREÇ BİZDE.">
      <p>
        Alya Plastik&apos;te ürün geliştirmeden sevkiyata kadar tüm üretim adımlarını kendi tesisimizde yönetiyoruz.
        Bu sayede kaliteyi ve teslim sürelerini uçtan uca kontrol edebiliyoruz.
      </p>
      <ol className="flex flex-col gap-4 mt-2">
        {ADIMLAR.map((s, i) => (
          <li key={s.b} className="flex gap-4 pb-4 border-b border-[#0b0e0b]/10">
            <span className="eyebrow text-[#e55f28] shrink-0" style={{ fontSize: 13 }}>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="font-semibold text-[#0b0e0b] text-sm mb-1">{s.b}</p>
              <p className="text-sm text-[#6b7366] leading-relaxed">{s.a}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-sm text-[#6b7366]">
        Özel kalıp veya numune talepleriniz için{" "}
        <Link href="/#contact" className="underline hover:text-[#0b0e0b]">iletişim formunu</Link> kullanabilirsiniz.
      </p>
    </KurumsalSayfa>
  );
}
