"use client";
import { useEffect, useRef } from "react";
import { IMG } from "@/data/images";

const stats = [
  { n: 55,  s: "+", label: "Yıl Deneyim",   desc: "1968'den bu yana" },
  { n: 200, s: "+", label: "Ürün Modeli",    desc: "Geniş portföy" },
  { n: 20,  s: "+", label: "İhracat Ülkesi", desc: "Global erişim" },
  { n: 100, s: "%", label: "Yerli Üretim",   desc: "Made in Türkiye" },
];

const features = [
  "ISO sertifikalı üretim tesisi",
  "Kalıptan rafa tam tedarik zinciri",
  "72 saat içinde teklif dönüşü",
  "Özel kalıp ve sipariş imkânı",
  "Tüm lojistik ve gümrük desteği",
];

function CountUp({ n, s }: { n: number; s: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const dur = 1500;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * n) + s;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [n, s]);
  return <span ref={ref}>0{s}</span>;
}

export default function Why() {
  return (
    <section id="why" style={{ background: "var(--bg2)", paddingBlock: "clamp(80px,10vw,140px)" }}>
      <div style={{ paddingInline: "var(--pad)" }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-20">
          <div>
            <p className="eyebrow reveal-up" style={{ color: "var(--orange)", marginBottom: 14 }}>— Neden Alya Plastik</p>
            <div className="clip">
              <h2 className="display reveal-up delay-1" style={{ fontSize: "clamp(48px,8vw,110px)" }}>
                55 YILLIK<br />BİRİKİM.
              </h2>
            </div>
          </div>
          <p className="reveal-fade" style={{ maxWidth: 260, fontSize: 14, lineHeight: 1.8, color: "var(--muted)", fontWeight: 300 }}>
            1968&apos;de İstanbul&apos;da başlayan yolculuğumuz, bugün global bir tedarikçiye dönüştü.
          </p>
        </div>

        {/* Two-col layout */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-start">

          {/* Left */}
          <div>
            {/* Feature list */}
            <div className="mb-12">
              {features.map((f, i) => (
                <div key={i} className="reveal-up flex items-center gap-5 py-5 section-rule"
                  style={{ transitionDelay: `${i * 60}ms` }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange)", flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: "var(--light)" }}>{f}</span>
                  <span className="ml-auto eyebrow" style={{ color: "var(--muted)", fontSize: 9 }}>0{i + 1}</span>
                </div>
              ))}
            </div>

            <a href="#contact" className="btn-orange reveal-up">Teklif Al →</a>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-4">
            {/* Product showcase */}
            <div className="relative overflow-hidden img-zoom reveal-fade" style={{ aspectRatio: "4/3", background: "var(--bg3)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.ufo} alt="UFO Saksı" className="w-full h-full object-contain p-8" />
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-5"
                style={{ background: "linear-gradient(to top, rgba(10,13,11,0.95) 0%, transparent 100%)", paddingTop: 48 }}>
                <div>
                  <p className="eyebrow mb-1" style={{ color: "var(--orange)", fontSize: 9 }}>ALY-601</p>
                  <p className="font-semibold" style={{ fontSize: 15 }}>UFO Saksı</p>
                </div>
                <span className="eyebrow" style={{ fontSize: 9, padding: "5px 10px", background: "var(--orange)", color: "#fff" }}>Yeni</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              {stats.map((s, i) => (
                <div key={s.label} className="reveal-up p-6 flex flex-col justify-between"
                  style={{ background: "var(--bg3)", minHeight: 120, transitionDelay: `${i * 70}ms` }}>
                  <div className="display" style={{ fontSize: "clamp(32px,5vw,52px)", color: "var(--orange)", lineHeight: 1 }}>
                    <CountUp n={s.n} s={s.s} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="eyebrow mt-1" style={{ fontSize: 9, color: "var(--muted)" }}>{s.desc}</p>
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
