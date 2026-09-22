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
  { n: 55,  s: "+", label: "Yıl Deneyim",   desc: "1968'den bu yana"  },
  { n: 200, s: "+", label: "Ürün Modeli",    desc: "Geniş portföy"     },
  { n: 20,  s: "+", label: "İhracat Ülkesi", desc: "Global erişim"     },
  { n: 100, s: "%", label: "Yerli Üretim",   desc: "Made in Türkiye"   },
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
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 56 }}>
          <div>
            <p className="eyebrow" data-reveal style={{ color: "var(--orange)", marginBottom: 12 }}>— Neden Alya Plastik</p>
            <h2 className="heading" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
              55 YILLIK<br />BİRİKİM.
            </h2>
          </div>
          <p data-reveal data-delay="2" style={{ maxWidth: 260, fontSize: "var(--text-sm)", lineHeight: 1.8, color: "var(--muted)", fontWeight: 300 }}>
            1968&apos;de İstanbul&apos;da başlayan yolculuğumuz, bugün 20+ ülkeye ihracat yapan bir üretim gücüne dönüştü.
          </p>
        </div>

        {/* İçerik grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "start" }}>

          {/* Sol — feature list */}
          <div>
            <div style={{ marginBottom: 40 }}>
              {FEATURES.map((f, i) => (
                <div key={i} data-reveal data-delay={String(i + 1)}
                  style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--orange)", flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--light)", flex: 1 }}>{f}</span>
                  <span className="eyebrow" style={{ fontSize: 10, color: "var(--muted)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
            <a href="#contact" className="btn btn-fill" data-reveal>Teklif Al →</a>
          </div>

          {/* Sağ — görsel + stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Ürün görseli */}
            <div data-reveal style={{
              position: "relative",
              aspectRatio: "4/3",
              background: "var(--bg3)",
              overflow: "hidden",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.ufo} alt="UFO Saksı" style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "contain",
                padding: "clamp(20px,4vw,48px)",
              }} />
              {/* Alt bilgi */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "16px",
                background: "linear-gradient(to top, rgba(11,14,11,0.92), transparent)",
                paddingTop: 48,
                display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              }}>
                <div>
                  <p className="eyebrow" style={{ color: "var(--orange)", fontSize: 9, marginBottom: 3 }}>ALY-601</p>
                  <p style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>UFO Saksı</p>
                </div>
                <span className="eyebrow" style={{ fontSize: 9, padding: "4px 8px", background: "var(--orange)", color: "#fff" }}>
                  Yeni
                </span>
              </div>
            </div>

            {/* Stats 2×2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {STATS.map((s, i) => (
                <div key={s.label} data-reveal data-delay={String(i + 1)}
                  style={{ background: "var(--bg3)", padding: "clamp(16px,2.5vw,24px)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 110 }}>
                  <div className="heading" style={{ fontSize: "clamp(28px,4vw,48px)", color: "var(--orange)", lineHeight: 1 }}>
                    <CountUp n={s.n} s={s.s} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 2 }}>{s.label}</p>
                    <p className="eyebrow" style={{ fontSize: 10, color: "var(--muted)" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobil: 1 kolon */}
        <style>{`
          @media (max-width: 767px) {
            #why-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
