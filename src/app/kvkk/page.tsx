import type { Metadata } from "next";
import { getSettings } from "@/lib/supabase";
import { SITE_URL } from "@/lib/diller";
import KurumsalSayfa from "@/components/kurumsal/KurumsalSayfa";

export const revalidate = 3600;

const BASLIK = "KVKK Aydınlatma Metni | Alya Plastik";
const ACIKLAMA = "Alya Plastik 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.";

export const metadata: Metadata = {
  title: BASLIK,
  description: ACIKLAMA,
  alternates: { canonical: `${SITE_URL}/kvkk`, languages: { "tr-TR": `${SITE_URL}/kvkk`, "x-default": `${SITE_URL}/kvkk` } },
  openGraph: { type: "website", locale: "tr_TR", url: `${SITE_URL}/kvkk`, siteName: "Alya Plastik", title: BASLIK, description: ACIKLAMA, images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alya Plastik" }] },
  twitter: { card: "summary_large_image", title: BASLIK, description: ACIKLAMA, images: ["/og-image.jpg"] },
};

export default async function KvkkPage() {
  let settings: Awaited<ReturnType<typeof getSettings>> = null;
  try { settings = await getSettings(); } catch (e) { console.error("Supabase fetch error:", e); }
  const sirket = settings?.company ?? "Alya Plastik San. Tic. Ltd. Şti.";
  const adres = settings?.address ?? "İkitelli OSB 4B Blok No:26-28 Kat:2, Başakşehir, İstanbul";
  const email = settings?.email ?? "info@alyaplastik.com";
  const telefon = settings?.phone ?? "+90 212 671 85 65";

  return (
    <KurumsalSayfa settings={settings} etiket="— KVKK" baslik="KİŞİSEL VERİLERİN KORUNMASI HAKKINDA AYDINLATMA METNİ">
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla {sirket}{" "}
        (&quot;Alya Plastik&quot;) olarak, web sitemiz üzerinden veya diğer kanallardan bizimle paylaştığınız kişisel
        verilerinizin işlenmesine ilişkin sizi aşağıda bilgilendiriyoruz.
      </p>

      <h2 className="font-semibold text-[#0b0e0b] text-lg mt-2">1. Veri Sorumlusu</h2>
      <p>
        {sirket}<br />
        Adres: {adres}<br />
        E-posta: {email}<br />
        Telefon: {telefon}
      </p>

      <h2 className="font-semibold text-[#0b0e0b] text-lg mt-2">2. İşlenen Kişisel Veriler</h2>
      <p>
        Web sitemizdeki iletişim/teklif formunu kullandığınızda; ad-soyad, firma unvanı, e-posta adresi, telefon
        numarası ve form aracılığıyla ilettiğiniz mesaj içeriği gibi kişisel verileriniz işlenmektedir.
      </p>

      <h2 className="font-semibold text-[#0b0e0b] text-lg mt-2">3. İşleme Amaçları</h2>
      <p>
        Kişisel verileriniz; talebinizin ve teklif isteğinizin değerlendirilmesi, sizinle iletişime geçilmesi,
        ürün/hizmetlerimiz hakkında bilgilendirme yapılması, ticari ilişkilerin yürütülmesi ve yasal
        yükümlülüklerimizin yerine getirilmesi amaçlarıyla işlenmektedir.
      </p>

      <h2 className="font-semibold text-[#0b0e0b] text-lg mt-2">4. Hukuki Sebep ve Toplama Yöntemi</h2>
      <p>
        Kişisel verileriniz, web sitemizdeki iletişim formu, e-posta veya telefon yoluyla, KVKK&apos;nın 5. maddesinde
        yer alan &quot;ilgili kişinin talebi üzerine sözleşme kurulması/ifası&quot; ve &quot;veri sorumlusunun meşru
        menfaati&quot; hukuki sebeplerine dayanılarak toplanmaktadır.
      </p>

      <h2 className="font-semibold text-[#0b0e0b] text-lg mt-2">5. Aktarım</h2>
      <p>
        Kişisel verileriniz, yalnızca hizmet aldığımız barındırma (hosting), e-posta ve benzeri teknik altyapı
        sağlayıcılarımızla ve yasal olarak yetkili kamu kurum ve kuruluşlarıyla, mevzuatın izin verdiği ölçüde
        paylaşılabilir; ticari amaçla üçüncü kişilerle paylaşılmaz.
      </p>

      <h2 className="font-semibold text-[#0b0e0b] text-lg mt-2">6. Saklama Süresi</h2>
      <p>
        Kişisel verileriniz, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen zamanaşımı süreleri
        boyunca saklanır; bu sürelerin sonunda silinir, yok edilir veya anonim hale getirilir.
      </p>

      <h2 className="font-semibold text-[#0b0e0b] text-lg mt-2">7. Haklarınız</h2>
      <p>KVKK&apos;nın 11. maddesi uyarınca bize başvurarak;</p>
      <ul className="list-disc list-inside flex flex-col gap-1">
        <li>kişisel verinizin işlenip işlenmediğini öğrenme,</li>
        <li>işlenmişse buna ilişkin bilgi talep etme,</li>
        <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>eksik/yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>KVKK&apos;da öngörülen şartlarda silinmesini/yok edilmesini isteme,</li>
        <li>düzeltme/silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme,</li>
        <li>işlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
        <li>kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
      </ul>
      <p>haklarına sahipsiniz.</p>

      <h2 className="font-semibold text-[#0b0e0b] text-lg mt-2">8. Başvuru Yöntemi</h2>
      <p>
        Yukarıdaki haklarınızı kullanmak için taleplerinizi kimliğinizi tevsik edici belgelerle birlikte{" "}
        <a href={`mailto:${email}`} className="underline hover:text-[#0b0e0b]">{email}</a> adresine yazılı olarak
        iletebilirsiniz. Talebiniz, niteliğine göre en kısa sürede ve en geç 30 gün içinde sonuçlandırılır.
      </p>

      <p className="text-sm text-[#6b7366] mt-4">
        Bu metin genel bir aydınlatma taslağıdır; şirketinizin veri işleme faaliyetlerine göre gözden geçirilmesi
        için hukuk danışmanınıza kontrol ettirmenizi öneririz.
      </p>
    </KurumsalSayfa>
  );
}
