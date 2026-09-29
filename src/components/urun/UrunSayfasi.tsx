import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HtmlLang from "@/components/layout/HtmlLang";
import UrunGaleri from "@/components/urun/UrunGaleri";
import TeklifModal from "@/components/urun/TeklifModal";
import { bolumYolu, dilYolu, kategoriGoster } from "@/lib/site-metin";
import type { Settings } from "@/lib/supabase";
import { DILLER, DIL_AD, HREFLANG, UI, aciklama, jsonLdMetni, kategoriAdi, mevcutDiller, ozellikEtiketi, urunJsonLd, urunLinki, urunYolu, type Dil, type UrunKaydi } from "@/lib/urun-sayfasi";

// Sunucu bileşeni: ürün detay sayfası (tüm diller için ortak). İçerik yalnızca veritabanındaki ürün kaydından gelir.
export default function UrunSayfasi({ urun, dil, settings, benzer, kategoriler = {} }: { urun: UrunKaydi; dil: Dil; settings: Settings | null; benzer: UrunKaydi[]; kategoriler?: Record<string, string> }) {
  const T = UI[dil], rtl = false;
  const kn = (x: string) => (dil === "tr" ? kategoriAdi(x, kategoriler) : kategoriGoster(dil, x, kategoriler));
  const kat = kn(urun.category), altKat = urun.subcategory && kn(urun.subcategory).toLocaleLowerCase("tr-TR") !== kat.toLocaleLowerCase("tr-TR") ? kn(urun.subcategory) : "";
  const resimler = [urun.image_url, ...(urun.images || [])].filter((x, i, a) => typeof x === "string" && x.startsWith("https://") && a.indexOf(x) === i);
  const kareler360 = (urun.gorunum_360 || []).filter(x => typeof x === "string" && x.startsWith("https://"));
  const metin = aciklama(urun, dil);
  const ozellikler = Object.entries(urun.specs || {});
  const diller = mevcutDiller(urun);
  // Dil değiştirici bu ürünün sayfasında kalmalı: çevirisi varsa o dildeki sayfaya, yoksa (kopya
  // içerik olmaması için) Türkçe sayfasına gider — önceden Header'ın varsayılanı her zaman ana
  // sayfaya yönlendiriyordu, bu ürün sayfasında yanlıştı.
  const altDiller = Object.fromEntries(DILLER.map(d => [d, urunLinki(urun, d)])) as Partial<Record<Dil, string>>;
  const wa = (settings?.whatsapp || "+90 535 761 65 24").replace(/\D/g, "");
  const waUrl = `https://wa.me/${wa}?text=${encodeURIComponent(T.wamesaj(urun.name, urun.code))}`;

  return (
    <div lang={HREFLANG[dil]} dir={rtl ? "rtl" : "ltr"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdMetni(urunJsonLd(urun, dil, kat)) }} />
      <HtmlLang dil={dil} />
      {/* Önceden bu sayfanın kendi, ayrı/sadeleştirilmiş bir header'ı vardı (eski metin logo, mega menü
          ve dil seçici yoktu) — site genelindeki Header ile senkron değildi. Artık paylaşılan Header
          kullanılıyor, böylece logo/mega menü/dil seçici güncellemeleri her sayfada aynı anda geçerli olur. */}
      <Header settings={settings} dil={dil} altDiller={altDiller} />

      <main className="pt-[68px]">
        <div style={{ paddingInline: "clamp(20px,5vw,80px)", paddingBlock: "clamp(24px,4vw,56px)" }}>
          <nav aria-label="breadcrumb" className="eyebrow text-[#6b7366] mb-6 flex flex-wrap gap-2">
            <Link href={dilYolu(dil)} className="hover:text-[#0b0e0b]">{T.anasayfa}</Link><span>/</span>
            <Link href={bolumYolu(dil, "collection")} className="hover:text-[#0b0e0b]">{T.urunler}</Link><span>/</span>
            <span className="text-[#0b0e0b]">{urun.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <UrunGaleri model3dUrl={urun.model_3d_url} kareler360={kareler360} resimler={resimler} renkler={urun.renkler} alt={`${urun.name} — ${urun.code}`} />

            <div>
              <p className="eyebrow text-[#e55f28] mb-3">{kat}{altKat ? ` · ${altKat}` : ""}{urun.is_new && <span className="ms-2 text-white bg-[#e55f28] px-1.5">{T.yeni}</span>}</p>
              <h1 className="heading text-[#0b0e0b]" style={{ fontSize: "clamp(38px,6vw,76px)", lineHeight: 0.95 }}><span lang="tr" dir="ltr">{urun.name}</span></h1>
              <p className="eyebrow text-[#6b7366] mt-3">{T.kod}: <span dir="ltr" className="text-[#0b0e0b]">{urun.code}</span></p>
              {metin && <p className="text-[#3c4238] leading-relaxed mt-6" style={{ fontSize: "clamp(15px,1.6vw,17px)", maxWidth: "60ch", whiteSpace: "pre-line" }}>{metin}</p>}

              {ozellikler.length > 0 && (
                <div className="mt-8">
                  <h2 className="eyebrow text-[#6b7366] mb-3">{T.ozellikler}</h2>
                  <dl className="border-t border-[#0b0e0b]/15">
                    {ozellikler.slice(0, 20).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-6 py-2.5 border-b border-[#0b0e0b]/15 text-sm"><dt className="text-[#6b7366]">{ozellikEtiketi(k, dil)}</dt><dd dir="ltr" className="text-[#0b0e0b] font-medium text-end">{v}</dd></div>))}
                  </dl>
                </div>)}

              {urun.tags?.length > 0 && <p className="mt-6 flex flex-wrap gap-2">{urun.tags.slice(0, 12).map(t => <span key={t} className="eyebrow text-[#6b7366] border border-[#0b0e0b]/15 px-2 py-1">{t}</span>)}</p>}

              <div className="mt-10 p-5 bg-[#0b0e0b] text-[#eae6dd]">
                <p className="text-sm mb-4 opacity-80">{T.b2b}</p>
                <div className="flex flex-wrap gap-3">
                  <TeklifModal urun={urun} dil={dil} className="eyebrow text-white bg-[#e55f28] hover:bg-[#c94f1e] px-5 py-3 transition-colors">{T.teklif}</TeklifModal>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer nofollow" className="eyebrow text-white border border-white/30 hover:border-white px-5 py-3 transition-colors">{T.whatsapp}</a>
                </div>
              </div>

              {diller.length > 1 && (
                <p className="mt-6 flex flex-wrap items-center gap-3 text-sm"><span className="eyebrow text-[#6b7366]">{T.dil}:</span>
                  {DILLER.filter(d => diller.includes(d)).map(d => d === dil
                    ? <span key={d} className="font-semibold">{DIL_AD[d]}</span>
                    : <Link key={d} href={urunYolu(d, urun.slug)} hrefLang={HREFLANG[d]} lang={HREFLANG[d]} className="text-[#6b7366] hover:text-[#e55f28] underline">{DIL_AD[d]}</Link>)}
                </p>)}
            </div>
          </div>

          {benzer.length > 0 && (
            <section className="mt-20" aria-labelledby="benzer">
              <h2 id="benzer" className="heading text-[#0b0e0b] mb-6" style={{ fontSize: "clamp(28px,4vw,48px)" }}>{T.benzer}</h2>
              <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {benzer.map(b => (
                  <li key={b.id}>
                    <Link href={urunYolu(mevcutDiller(b).includes(dil) ? dil : "tr", b.slug)} className="block bg-[#e3ddcf] hover:bg-[#d8d1c1] transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.image_url} alt={b.name} loading="lazy" className="w-full aspect-square object-contain p-4" />
                      <span className="block p-3"><span className="eyebrow text-[#e55f28] block">{b.code}</span><span lang="tr" className="block font-semibold mt-1">{b.name}</span></span>
                    </Link>
                  </li>))}
              </ul>
            </section>)}
        </div>
      </main>
      <Footer settings={settings} dil={dil} />
    </div>
  );
}
