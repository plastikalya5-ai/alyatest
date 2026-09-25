import { guvenliUrl, type Settings } from "@/lib/supabase";

export default function Footer({ settings }: { settings: Settings | null }) {
  const s = settings;
  const cols = [
    { title:"Ürünler",  items:["Saksı Modelleri","Sepet Ürünleri","Depolama Sandığı","Ev Gereçleri","Özel Sipariş"] },
    { title:"Firma",    items:["Hakkımızda","Üretim Süreci","İhracat","Sertifikalar","KVKK"] },
    { title:"İletişim", items:[s?.email ?? "info@alyaplastik.com", s?.export_email ?? "export@alyaplastik.com", s?.phone ?? "+90 212 671 85 65", "Başakşehir / İstanbul"] },
  ];
  const wa = s?.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\D/g,"")}` : "https://wa.me/905357616524";

  const sosyal = [
    { ad: "LinkedIn", url: guvenliUrl(s?.linkedin) },
    { ad: "Instagram", url: guvenliUrl(s?.instagram) },
    { ad: "Facebook", url: guvenliUrl(s?.facebook) },
  ].filter((x): x is { ad: string; url: string } => !!x.url);

  return (
    <footer className="bg-[#e3ddcf] border-t border-[#0b0e0b]/10" style={{ paddingTop:"clamp(56px,7vw,90px)", paddingBottom:"clamp(32px,4vw,48px)" }}>
      <div style={{ paddingInline:"clamp(20px,5vw,80px)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-20 mb-14">
          <div>
            <div className="heading text-[#0b0e0b] mb-4" style={{ fontSize:"clamp(28px,4vw,44px)" }}>
              ALYA<span className="text-[#e55f28]">PLASTİK</span>
            </div>
            <p className="text-[#6b7366] font-light leading-loose text-sm mb-2">
              {s?.founded ?? 1968}&apos;den bu yana plastik ürün üretiminde lider.
            </p>
            <p className="text-[#6b7366] font-light text-sm mb-6">
              {s?.address?.split(",")[1]?.trim() ?? "İstanbul Başakşehir OSB"}&apos;den dünyaya.
            </p>
            <a href={wa} target="_blank" rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 bg-[#e55f28] hover:bg-[#c94f1e] text-white text-[10px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5 transition-colors">
              WhatsApp →
            </a>
            {sosyal.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
                {sosyal.map(x => (
                  <a key={x.ad} href={x.url} target="_blank" rel="noopener noreferrer me" aria-label={`Alya Plastik ${x.ad}`}
                    className="eyebrow text-[10px] text-[#0b0e0b]/60 hover:text-[#e55f28] transition-colors">{x.ad} ↗</a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-8">
            {cols.map(col => (
              <div key={col.title}>
                <p className="eyebrow text-[#e55f28] text-[10px] mb-4">{col.title}</p>
                {col.items.map(item => (
                  <p key={item} className="text-[#6b7366] hover:text-[#0b0e0b] transition-colors text-sm mb-2.5 leading-snug">{item}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#0b0e0b]/10 pt-6 flex flex-wrap justify-between items-center gap-3">
          <p className="eyebrow text-[#0b0e0b]/40 text-[10px]">
            © {new Date().getFullYear()} {s?.company ?? "Alya Plastik San. Tic. Ltd. Şti."} — Tüm hakları saklıdır.
          </p>
          <p className="eyebrow text-[#0b0e0b]/40 text-[10px]">İstanbul OSB · Made in Türkiye 🇹🇷</p>
        </div>
      </div>
    </footer>
  );
}
