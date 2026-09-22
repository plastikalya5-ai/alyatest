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
  { n: 55,  s: "+", label: "Yıl Deneyim",    desc: "1968'den bu yana"  },
  { n: 200, s: "+", label: "Ürün Modeli",     desc: "Geniş portföy"     },
  { n: 20,  s: "+", label: "İhracat Ülkesi",  desc: "Global erişim"     },
  { n: 100, s: "%", label: "Yerli Üretim",    desc: "Made in Türkiye"   },
];

function CountUp({ n, s }: { n: number; s: string }) {
  const ref  = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const dur = 1400, t0 = performance.now();
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
    <section id="why" style={{ background: "var(--bg2)", paddingBlock: "clamp(72px,9vw,130px)" }}>
      <div className="pad">
        {/* Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
          <div>
            <p className="eyebrow mb-3" data-reveal style={{ color: "var(--orange)" }}>— Neden Alya Plastik</p>
            <h2 className="heading" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
              55 YILLIK<br />BİRİKİM.
            </h2>
          </div>
          <p data-reveal style={{ maxWidth: 240, fontSize: 14, lineHeight: 1.8, color: "var(--muted)", fontWeight: 300 }}>
            1968&apos;de İstanbul&apos;da başlayan yolculuğumuz bugün global bir tedarikçiye dönüştü.
          </p>
        </div>

        {/* 2 kolon */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Sol — özellikler + CTA */}
          <div>
            <div className="mb-10">
              {FEATURES.map((f, i) => (
                <div key={i} data-reveal data-delay={String(i + 1)}
                  className="flex items-center gap-4 py-4 border-b"
                  style={{ borderColor: "var(--border)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--orange)", flexShrink: 0 }} />
                  <span style={{ fontSize: "clamp(13px,1.4vw,15px)" }}>{f}</span>
                  <span className="eyebrow ml-auto" style={{ fontSize: 9, color: "var(--muted)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
            <a href="#contact" className="btn btn-fill" data-reveal>Teklif Al →</a>
          </div>

          {/* Sağ — görsel + stats */}
          <div className="flex flex-col gap-3">
            {/* Görsel */}
            <div className="zoom-wrap relative overflow-hidden" data-reveal
              style={{ aspectRatio: "4/3", background: "var(--bg3)", minHeight: 200 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.ufo} alt="UFO Saksı"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ padding: "clamp(20px,5vw,48px)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between"
                style={{ background: "linear-gradient(to top, rgba(11,14,11,0.95), transparent)", paddingTop: 40 }}>
                <div>
                  <p className="eyebrow mb-0.5" style={{ color: "var(--orange)", fontSize: 9 }}>ALY-601</p>
                  <p className="font-semibold" style={{ fontSize: 14 }}>UFO Saksı</p>
                </div>
                <span className="eyebrow" style={{ fontSize: 8, padding: "4px 8px", background: "var(--orange)", color: "#fff" }}>
                  Yeni Sezon
                </span>
              </div>
            </div>

            {/* Stats 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s, i) => (
                <div key={s.label} data-reveal data-delay={String(i + 1)}
                  className="flex flex-col justify-between p-5"
                  style={{ background: "var(--bg3)", minHeight: 110 }}>
                  <div className="heading" style={{ fontSize: "clamp(28px,4vw,48px)", color: "var(--orange)", lineHeight: 1 }}>
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
