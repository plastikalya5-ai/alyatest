"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { kategoriYolu, bolumYolu } from "@/lib/site-metin";
import type { Dil } from "@/lib/urun-sayfasi";

// Kategori görselleri statik olarak tutuluyor — Header, sayfa başına ürün verisi çekmiyor
// (birçok sayfada kullanılıyor, ekstra sorgu maliyeti istenmiyor). Nadiren değişir.
const KATEGORILER: { slug: string; gorsel: string; yeni?: boolean }[] = [
  { slug: "saksi", gorsel: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927644/Ven%C3%BCs_Askili_Saksi_No2_avphmd.webp" },
  { slug: "sepet", gorsel: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927645/dantel_d47fze.webp" },
  { slug: "sandik", gorsel: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927644/sand%C4%B1k_g7bwpa.webp" },
  { slug: "ev", gorsel: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927642/%C3%A7ama%C5%9F%C4%B1r_selesi_fq5gvj.webp" },
  { slug: "bahce", gorsel: "/urunler/bahce/cesme-saksi-130l.jpg", yeni: true },
];

const METIN: Record<Dil, { baslik: string; alt: string; tumu: string; yeni: string }> = {
  tr: { baslik: "ÜRÜN KATEGORİLERİ", alt: "55+ yıllık üretim tecrübesiyle 200'den fazla model", tumu: "Tüm Ürünleri Gör", yeni: "YENİ" },
  en: { baslik: "PRODUCT CATEGORIES", alt: "200+ models, backed by 55+ years of manufacturing", tumu: "See All Products", yeni: "NEW" },
  ru: { baslik: "КАТЕГОРИИ ТОВАРОВ", alt: "200+ моделей и более 55 лет производственного опыта", tumu: "Все товары", yeni: "НОВОЕ" },
  zh: { baslik: "产品分类", alt: "55年以上生产经验，200多款产品", tumu: "查看全部产品", yeni: "新品" },
};

export default function MegaMenu({ dil, kategoriAd, label }: { dil: Dil; kategoriAd: Record<string, string>; label: string }) {
  const [acik, setAcik] = useState(false);
  const kutuRef = useRef<HTMLDivElement>(null);
  const kapatZamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = METIN[dil];

  useEffect(() => {
    if (!acik) return;
    const disaTikla = (e: MouseEvent) => { if (kutuRef.current && !kutuRef.current.contains(e.target as Node)) setAcik(false); };
    const escTusu = (e: KeyboardEvent) => { if (e.key === "Escape") setAcik(false); };
    document.addEventListener("mousedown", disaTikla);
    document.addEventListener("keydown", escTusu);
    return () => { document.removeEventListener("mousedown", disaTikla); document.removeEventListener("keydown", escTusu); };
  }, [acik]);

  // Fareyle diğer nav linklerine geçerken menünün anında kapanmaması için küçük bir gecikme.
  const ac = () => { if (kapatZamanlayici.current) clearTimeout(kapatZamanlayici.current); setAcik(true); };
  const kapatGecikmeli = () => { kapatZamanlayici.current = setTimeout(() => setAcik(false), 140); };

  return (
    <div ref={kutuRef} className="relative" onMouseEnter={ac} onMouseLeave={kapatGecikmeli}>
      <button type="button" onClick={() => setAcik(p => !p)} aria-expanded={acik} aria-haspopup="true"
        className="eyebrow text-[#6b7366] hover:text-white transition-colors duration-200 flex items-center gap-1.5">
        {label}
      </button>

      {/* Header'daki "Ürünler" linki nav grubunun en solunda; panel ona göre değil, viewport'a göre
          ortalanıyor (position:fixed) — yoksa geniş panel sol kenardan taşardı (bkz. ürün sayfası testi). */}
      <div role="menu" aria-label={label}
        className="fixed top-[92px] left-1/2 w-[min(760px,86vw)] p-6 bg-[#0b0e0b] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.5)] origin-top transition-all duration-200 z-10"
        style={{ opacity: acik ? 1 : 0, transform: `translateX(-50%) scale(${acik ? 1 : 0.97}) translateY(${acik ? 0 : -6}px)`, pointerEvents: acik ? "auto" : "none" }}>
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="eyebrow text-[#e55f28]">{t.baslik}</span>
            <p className="text-[#9aa294] text-xs mt-1.5">{t.alt}</p>
          </div>
          {/* Düz <a>: Collection bileşeni ?kategori= parametresini yalnızca mount anında okuyor
              (bkz. Collection.tsx). Next <Link> ile aynı sayfada kalınarak yapılan bir geçiş bu
              effect'i yeniden tetiklemediğinden seçili kategori güncellenmiyordu — tam sayfa
              yenilemesi (<a>) her tıklamada doğru filtrelenmiş listeyle mount olmasını garantiler. */}
          <a href={bolumYolu(dil, "collection")}
            className="eyebrow text-white/70 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors">
            {t.tumu} <ArrowRight size={12} />
          </a>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {KATEGORILER.map(k => (
            <a key={k.slug} href={kategoriYolu(dil, k.slug)}
              className="group flex flex-col gap-2.5">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={k.gorsel} alt={kategoriAd[k.slug] || k.slug}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.08]" />
                {k.yeni && (
                  <span className="absolute top-2 start-2 bg-[#e55f28] text-white text-[8.5px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full">
                    {t.yeni}
                  </span>
                )}
              </div>
              <span className="eyebrow text-[#9aa294] group-hover:text-white transition-colors text-center" style={{ fontSize: 9.5 }}>
                {kategoriAd[k.slug] || k.slug}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
