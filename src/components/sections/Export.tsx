"use client";
import { useEffect, useRef } from "react";

const countries = ["Almanya","Fransa","İtalya","Polonya","Romanya","Ukrayna","İngiltere","Hollanda","Irak","İran","Suudi Arabistan","BAE","Libya","Mısır","Fas","Kazakistan","Azerbaycan","Nijerya"];

export default function Export() {
  const tickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let x = 0;
    const half = el.scrollWidth / 2;
    const tick = () => {
      x -= 0.5;
      if (Math.abs(x) >= half) x = 0;
      el.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section style={{ background: "var(--dark2)", paddingBlock: "clamp(80px,10vw,140px)", overflow: "hidden" }}>
      <div style={{ paddingInline: "var(--pad)", marginBottom: 60 }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow reveal" style={{ color: "var(--orange)", marginBottom: 20 }}>— Global Erişim</p>
            <div className="clip">
              <h2 className="display reveal-title" style={{ fontSize: "clamp(52px,8vw,110px)" }}>
                20+<br />ÜLKE.
              </h2>
            </div>
          </div>
          <div className="reveal">
            <p style={{ fontSize: "clamp(14px,1.5vw,17px)", lineHeight: 1.8, color: "var(--muted)", fontWeight: 300, marginBottom: 32 }}>
              Avrupa&apos;dan Orta Doğu&apos;ya, Afrika&apos;dan Orta Asya&apos;ya. Tüm lojistik ve gümrük dokümantasyon desteği ile kapıdan kapıya teslimat.
            </p>
            <a href="#contact" className="inline-flex items-center gap-3 text-sm uppercase tracking-widest border-b pb-2 hover:opacity-70 transition-opacity"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--muted)" }}>
              İhracat hakkında bilgi al <span style={{ color: "var(--orange)" }}>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Countries ticker */}
      <div className="overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBlock: 18 }}>
        <div ref={tickerRef} className="flex whitespace-nowrap" style={{ width: "max-content" }}>
          {[...countries, ...countries].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6 eyebrow" style={{ color: "var(--muted)", fontSize: 12 }}>
              {c} <span style={{ color: "var(--orange)", opacity: 0.5 }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
