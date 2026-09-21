"use client";
import { useEffect, useRef } from "react";
import { IMG } from "@/data/images";

const stats = [
  { n: 55,  s: "+",     label: "Yıl Deneyim",    desc: "1968'den bu yana kesintisiz üretim" },
  { n: 200, s: "+",     label: "Ürün Modeli",     desc: "Saksı, sepet, sandık ve daha fazlası" },
  { n: 20,  s: "+",     label: "İhracat Ülkesi",  desc: "Avrupa, Orta Doğu ve Afrika" },
  { n: 100, s: "%",     label: "Yerli Üretim",    desc: "Başakşehir OSB, İstanbul" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1600, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function Why() {
  return (
    <section id="why" style={{ background: "var(--dark)", paddingBlock: "clamp(80px,10vw,140px)" }}>
      <div style={{ paddingInline: "var(--pad)" }}>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left */}
          <div>
            <p className="eyebrow reveal" style={{ color: "var(--orange)", marginBottom: 20 }}>— Neden Alya Plastik</p>
            <div className="clip mb-8">
              <h2 className="display reveal-title" style={{ fontSize: "clamp(52px,8vw,110px)" }}>
                55 YILLIK<br />BİRİKİM.
              </h2>
            </div>
            <p className="reveal" style={{ fontSize: "clamp(14px,1.5vw,17px)", lineHeight: 1.8, color: "var(--muted)", maxWidth: 440, fontWeight: 300, marginBottom: 48 }}>
              1968&apos;de İstanbul&apos;da başlayan yolculuğumuz, bugün 20&apos;den fazla ülkeye ihracat yapan bir üretim gücüne dönüştü. Kalıp tasarımından sevkiyata tam tedarik zinciri.
            </p>

            {/* Features list */}
            {[
              "ISO sertifikalı üretim tesisi",
              "Kalıptan rafa tam tedarik",
              "72 saat içinde teklif dönüşü",
              "Özel kalıp & sipariş imkânı",
            ].map((f, i) => (
              <div key={i} className="reveal flex items-center gap-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--orange)" }} />
                <span style={{ fontSize: 15, color: "var(--light)" }}>{f}</span>
              </div>
            ))}

            <a href="#contact" className="reveal inline-flex items-center gap-3 mt-10 px-8 py-4 text-sm uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
              style={{ background: "var(--orange)", color: "var(--dark)" }}>
              Teklif Al →
            </a>
          </div>

          {/* Right — stats + image */}
          <div className="flex flex-col gap-6">
            {/* Image */}
            <div className="relative overflow-hidden reveal" style={{ aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.d3} alt="3D Saksı"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                style={{ background: "#1e2420" }} />
              <div className="absolute bottom-5 left-5">
                <span className="eyebrow text-[10px] px-3 py-1.5" style={{ background: "var(--orange)", color: "var(--dark)" }}>
                  Yeni Sezon
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map(s => (
                <div key={s.label} className="reveal p-6" style={{ background: "var(--dark2)" }}>
                  <div className="display mb-2" style={{ fontSize: "clamp(36px,5vw,56px)", color: "var(--orange)" }}>
                    <CountUp target={s.n} suffix={s.s} />
                  </div>
                  <p className="font-semibold text-sm mb-1">{s.label}</p>
                  <p style={{ fontSize: 12, color: "var(--muted)" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
