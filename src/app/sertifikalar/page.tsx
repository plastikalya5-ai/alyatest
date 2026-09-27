import type { Metadata } from "next";
import { getSettings } from "@/lib/supabase";
import { SITE_URL } from "@/lib/diller";
import KurumsalSayfa from "@/components/kurumsal/KurumsalSayfa";

export const revalidate = 3600;

const BASLIK = "Sertifikalar | Alya Plastik";
const ACIKLAMA = "Alya Plastik kalite ve uygunluk sertifikaları.";

export const metadata: Metadata = {
  title: BASLIK,
  description: ACIKLAMA,
  alternates: { canonical: `${SITE_URL}/sertifikalar`, languages: { "tr-TR": `${SITE_URL}/sertifikalar`, "x-default": `${SITE_URL}/sertifikalar` } },
  openGraph: { type: "website", locale: "tr_TR", url: `${SITE_URL}/sertifikalar`, siteName: "Alya Plastik", title: BASLIK, description: ACIKLAMA, images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alya Plastik" }] },
  twitter: { card: "summary_large_image", title: BASLIK, description: ACIKLAMA, images: ["/og-image.jpg"] },
};

export default async function SertifikalarPage() {
  let settings: Awaited<ReturnType<typeof getSettings>> = null;
  try { settings = await getSettings(); } catch (e) { console.error("Supabase fetch error:", e); }
  const email = settings?.email ?? "info@alyaplastik.com";

  return (
    <KurumsalSayfa settings={settings} etiket="— Sertifikalar" baslik="KALİTE VE UYGUNLUK BELGELERİMİZ.">
      <p>
        Bu sayfada üretim ve kalite süreçlerimize ilişkin sertifikalarımızı yakında yayınlayacağız.
      </p>
      <p>
        Belirli bir sertifika veya uygunluk belgesine acil ihtiyacınız varsa, güncel kopyasını doğrudan{" "}
        <a href={`mailto:${email}`} className="underline hover:text-[#0b0e0b]">{email}</a> adresine yazarak talep edebilirsiniz.
      </p>
    </KurumsalSayfa>
  );
}
