"use client";
import { useEffect, useRef } from "react";
import { IMG } from "@/data/images";

const FEATURES = [
  "ISO sertifikalı üretim tesisi",
  "Kalıptan rafa tam tedarik zinciri",
  "72 saat içinde teklif dönüşü garantisi",
  "Özel kalıp ve sipariş imkânı",
  "Tüm lojistik ve gümrük dokümantasyon desteği",
];
const STATS = [
  { n:55,  s:"+", label:"Yıl Deneyim",   desc:"1968'den bu yana" },
  { n:200, s:"+", label:"Ürün Modeli",    desc:"Geniş portföy"    },
  { n:20,  s:"+", label:"İhracat Ülkesi", desc:"Global erişim"    },
  { n:100, s:"%", label:"Yerli Üretim",   desc:"Made in Türkiye"  },
];

function CountUp({ n, s }: { n:number; s:string }) {
  const ref  = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const dur = 1400, t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now-t0)/dur, 1);
        el.textContent = Math.round((1-Math.pow(1-p,3))*n) + s;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick); obs.disconnect();
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [n, s]);
  return <span ref={ref}>0{s}</span>;
}

export default function Why() {
  return (
    <section id="why" className="bg-[#111511]" style={{ paddingBlock: "clamp(72px,9vw,130px)" }}>
      <div style={{ paddingInline: "clamp(20px,5vw,80px)" }}>

        {/* Başlık */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-14">
          <div>
            <p className="eyebrow text-[#e55f28] mb-3" data-reveal>— Neden Alya Plastik</p>
            <h2 className="heading text-[#eae6dd]" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
              55 YILLIK<br />BİRİKİM.
            </h2>
          </div>
          <p className="font-light leading-relaxed text-[#6b7366]" data-reveal data-delay="2" style={{ maxWidth: 260, fontSize: 14 }}>
            1968&apos;de İstanbul&apos;da başlayan yolculuğumuz bugün 20+ ülkeye ihracat yapan bir üretim gücüne dönüştü.
          </p>
        </div>

        {/* 2 kolon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">

          {/* Sol */}
          <div>
            <div className="mb-10">
              {FEATURES.map((f, i) => (
                <div key={i} data-reveal data-delay={String(i+1)}
                  className="flex items-center gap-4 py-4 border-b border-white/8">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e55f28] shrink-0" />
                  <span className="text-[#eae6dd] flex-1" style={{ fontSize: 14 }}>{f}</span>
                  <span className="eyebrow text-[#6b7366]" style={{ fontSize: 10 }}>{String(i+1).padStart(2,"0")}</span>
                </div>
              ))}
            </div>
            <a href="#contact" data-reveal
              className="inline-flex items-center gap-2 bg-[#e55f28] hover:bg-[#c94f1e] text-white text-[11px] font-semibold tracking-[0.14em] uppercase px-7 py-3.5 transition-colors">
              Teklif Al →
            </a>
          </div>

          {/* Sağ */}
          <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden bg-[#181d18]" data-reveal style={{ aspectRatio:"4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.ufo} alt="UFO Saksı"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ padding: "clamp(20px,4vw,48px)" }} />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 pt-12"
                style={{ background: "linear-gradient(to top, rgba(11,14,11,0.92), transparent)" }}>
                <div>
                  <p className="eyebrow text-[#e55f28] mb-1" style={{ fontSize: 9 }}>ALY-601</p>
                  <p className="font-semibold text-[#eae6dd]" style={{ fontSize: 14 }}>UFO Saksı</p>
                </div>
                <span className="eyebrow text-white bg-[#e55f28] px-2 py-1" style={{ fontSize: 9 }}>Yeni</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s, i) => (
                <div key={s.label} data-reveal data-delay={String(i+1)}
                  className="bg-[#181d18] flex flex-col justify-between p-5 min-h-[110px]">
                  <div className="heading text-[#e55f28]" style={{ fontSize: "clamp(28px,4vw,48px)", lineHeight: 1 }}>
                    <CountUp n={s.n} s={s.s} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#eae6dd]" style={{ fontSize: 13 }}>{s.label}</p>
                    <p className="eyebrow text-[#6b7366] mt-1" style={{ fontSize: 10 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
