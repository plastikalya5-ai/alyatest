"use client";
import { useEffect, useRef, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Download, Loader2, Maximize2, Minimize2 } from "lucide-react";

// react-pageflip'in TS tanımları tüm ayar alanlarını zorunlu gösteriyor (kütüphanenin bilinen bir
// eksikliği) — çalışma zamanında hepsi opsiyonel olduğu için burada gevşek tipleniyor.
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false }) as unknown as ComponentType<any>;

const OLCEK = 1.6; // render kalitesi — ekran boyutundan bağımsız sabit bir çözünürlük
// react-pageflip burada HER ZAMAN tek yaprak gösteriyor (iki ayrı sayfa yan yana DEĞİL) — bu
// katalogda "çift sayfa" görünümü aslında PDF içinde tek görsel olarak birleştirilmiş (bkz. oran
// tespiti). Bu yüzden MAX_GENISLIK kutunun TAM genişliğidir, yarısı değil.
const MAX_GENISLIK = 1300;

export default function KatalogGoruntuleyici({ pdfUrl }: { pdfUrl: string }) {
  const [sayfalar, setSayfalar] = useState<string[]>([]);
  const [oran, setOran] = useState(0.72); // genişlik/yükseklik
  const [ilerleme, setIlerleme] = useState({ yuklenen: 0, toplam: 0 });
  const [hata, setHata] = useState<string | null>(null);
  const [aktif, setAktif] = useState(0);
  const kitapRef = useRef<any>(null);
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const iptal = useRef(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [tamEkran, setTamEkran] = useState(false);

  useEffect(() => {
    iptal.current = false;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
        const belge = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
        if (iptal.current) return;
        setIlerleme({ yuklenen: 0, toplam: belge.numPages });
        const ilkSayfa = await belge.getPage(1);
        const ilkGorunum = ilkSayfa.getViewport({ scale: 1 });
        setOran(ilkGorunum.width / ilkGorunum.height); // pdf tamamen yüklenene kadar geçici tahmin (yükleniyor ekranı)

        const uretilen: string[] = [];
        const oranlar: number[] = [];
        for (let i = 1; i <= belge.numPages; i++) {
          if (iptal.current) return;
          const sayfa = await belge.getPage(i);
          const gorunum = sayfa.getViewport({ scale: OLCEK });
          oranlar.push(gorunum.width / gorunum.height);
          const canvas = document.createElement("canvas");
          canvas.width = gorunum.width; canvas.height = gorunum.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await sayfa.render({ canvasContext: ctx, viewport: gorunum }).promise;
          uretilen.push(canvas.toDataURL("image/jpeg", 0.85));
          if (iptal.current) return;
          setIlerleme({ yuklenen: i, toplam: belge.numPages });
        }
        if (!iptal.current) {
          // Kitabın kutusu TEK bir en/boy oranıyla sabitlenir (react-pageflip her sayfa için yeniden
          // boyutlanmaz); bu yüzden ilk sayfanın (genelde kapak — genellikle tek/dikey) oranı yerine,
          // sayfaların ÇOĞUNLUĞUNUN oranı kullanılır. Kapak dikey, iç sayfalar (çift sayfa birleşik
          // görsel — yatay) olduğunda eskiden kutu kapağa göre dikey sabitleniyor, iç sayfalar bu dikey
          // kutu içinde object-fit:contain ile küçülüp kutunun yaklaşık yarısını boş (beyaz) bırakıyordu.
          const sayac = new Map<string, { oran: number; adet: number }>();
          for (const o of oranlar) {
            const anahtar = o.toFixed(2);
            const kayit = sayac.get(anahtar);
            if (kayit) kayit.adet++; else sayac.set(anahtar, { oran: o, adet: 1 });
          }
          let enCok = { oran: ilkGorunum.width / ilkGorunum.height, adet: 0 };
          for (const kayit of sayac.values()) if (kayit.adet > enCok.adet) enCok = kayit;
          setOran(enCok.oran);
          setSayfalar(uretilen);
        }
      } catch (e) {
        console.error("[katalog] PDF render hatası", e);
        if (!iptal.current) setHata("Katalog yüklenirken bir sorun oluştu.");
      }
    })();
    return () => { iptal.current = true; };
  }, [pdfUrl]);

  useEffect(() => {
    const guncelle = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    guncelle();
    window.addEventListener("resize", guncelle);
    window.addEventListener("orientationchange", guncelle);
    return () => {
      window.removeEventListener("resize", guncelle);
      window.removeEventListener("orientationchange", guncelle);
    };
  }, []);

  useEffect(() => {
    const guncelle = () => setTamEkran(document.fullscreenElement === kapsayiciRef.current);
    document.addEventListener("fullscreenchange", guncelle);
    return () => document.removeEventListener("fullscreenchange", guncelle);
  }, []);

  async function tamEkranDegistir() {
    try {
      if (!document.fullscreenElement) await kapsayiciRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch (e) { console.error("[katalog] tam ekran hatası", e); }
  }

  // Mobilde çift sayfa yan yana sığmadığı için tek sayfa tam genişlikte gösterilir;
  // tam ekranda başlık/menü gizlendiğinden daha fazla dikey alan kitaba ayrılır.
  const MOBIL_ESIK = 768;
  const mobil = viewport.w > 0 && viewport.w < MOBIL_ESIK;
  const kenarBosluk = mobil ? 24 : 40;
  // Sayfa kaydırılabilir (min-h-svh) — kitabın tek ekrana sığması ZORUNLU değil (zaten sığmıyor,
  // footer ekranın altında kalıyor), bu yüzden yalnızca sabit üst alan (header) için küçük bir pay
  // bırakılır; önceki değerler (320/230) kitabı gereksiz yere küçültüyordu.
  const dikeyBosluk = tamEkran ? 100 : mobil ? 160 : 150;
  let genislik = viewport.w === 0
    ? MAX_GENISLIK
    : mobil
      ? Math.min(560, viewport.w - kenarBosluk)
      : Math.min(MAX_GENISLIK, viewport.w - kenarBosluk);
  let yukseklik = Math.round(genislik / oran);
  if (viewport.h > 0) {
    const maxYukseklik = viewport.h - dikeyBosluk;
    if (maxYukseklik > 160 && yukseklik > maxYukseklik) {
      yukseklik = maxYukseklik;
      genislik = Math.round(yukseklik * oran);
    }
  }

  if (hata) return <div style={{ paddingInline: "clamp(20px,5vw,80px)", paddingBottom: 96 }}><p className="text-[#e55f28]">{hata}</p></div>;

  return (
    <div ref={kapsayiciRef} style={{ paddingInline: "clamp(12px,4vw,80px)", paddingBottom: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, background: "#0b0e0b", ...(tamEkran ? { justifyContent: "center", minHeight: "100vh", paddingTop: 24 } : {}) }}>
      {sayfalar.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "80px 0", color: "#9aa294" }}>
          <Loader2 size={28} className="animate-spin" />
          <p className="eyebrow" style={{ fontSize: 11 }}>{ilerleme.toplam ? `Sayfalar hazırlanıyor… ${ilerleme.yuklenen}/${ilerleme.toplam}` : "Katalog yükleniyor…"}</p>
        </div>
      ) : (
        <>
          <HTMLFlipBook
            ref={kitapRef}
            width={genislik}
            height={yukseklik}
            minWidth={220} maxWidth={1400}
            minHeight={280} maxHeight={1400}
            size="fixed"
            showCover
            usePortrait
            drawShadow
            flippingTime={600}
            maxShadowOpacity={0.4}
            mobileScrollSupport
            className="katalog-flipbook"
            style={{}}
            startPage={0}
            startZIndex={0}
            autoSize={false}
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            onFlip={(e: any) => setAktif(e.data)}
          >
            {sayfalar.map((src, i) => (
              <div key={i} className="katalog-sayfa" style={{ background: "#fff" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Katalog sayfa ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              </div>
            ))}
          </HTMLFlipBook>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" aria-label="Önceki sayfa" onClick={() => kitapRef.current?.pageFlip()?.flipPrev()}
              className="text-[#eae6dd] border border-[#eae6dd]/25 hover:border-[#eae6dd]/60 rounded-full p-2.5 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="eyebrow text-[#9aa294]" style={{ fontSize: 11, minWidth: 64, textAlign: "center" }}>{aktif + 1} / {sayfalar.length}</span>
            <button type="button" aria-label="Sonraki sayfa" onClick={() => kitapRef.current?.pageFlip()?.flipNext()}
              className="text-[#eae6dd] border border-[#eae6dd]/25 hover:border-[#eae6dd]/60 rounded-full p-2.5 transition-colors">
              <ChevronRight size={16} />
            </button>
            <a href={pdfUrl} download target="_blank" rel="noopener noreferrer"
              className="eyebrow text-[#eae6dd] border border-[#eae6dd]/25 hover:border-[#eae6dd]/60 rounded-full px-4 py-2.5 flex items-center gap-2 transition-colors" style={{ fontSize: 11 }}>
              <Download size={14} />PDF indir
            </a>
            <button type="button" onClick={tamEkranDegistir}
              className="eyebrow text-[#eae6dd] border border-[#eae6dd]/25 hover:border-[#eae6dd]/60 rounded-full px-4 py-2.5 flex items-center gap-2 transition-colors" style={{ fontSize: 11 }}>
              {tamEkran ? <Minimize2 size={14} /> : <Maximize2 size={14} />}{tamEkran ? "Küçült" : "Tam Ekran"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
