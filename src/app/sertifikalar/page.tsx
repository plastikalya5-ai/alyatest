import type { Metadata } from "next";
import { getSettings } from "@/lib/supabase";
import { SITE_URL } from "@/lib/diller";
import KurumsalSayfa from "@/components/kurumsal/KurumsalSayfa";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sertifikalar | Alya Plastik",
  description: "Alya Plastik kalite ve uygunluk sertifikaları.",
  alternates: { canonical: `${SITE_URL}/sertifikalar` },
  robots: { index: false }, // Sertifika listesi eklenene kadar arama motorlarına kapalı
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
