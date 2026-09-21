"use client";
import { useEffect, useRef } from "react";

const COUNTRIES = ["Almanya","Fransa","İtalya","Polonya","Romanya","İngiltere","Hollanda","İspanya","Irak","İran","Suudi Arabistan","BAE","Libya","Mısır","Fas","Kazakistan","Azerbaycan","Nijerya"];

export default function Export() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0;
    let raf: number;
    const half = el.scrollWidth / 2;
    const tick = () => {
      x -= 0.42;
      if (Math.abs(x) >= half) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section style={{ background: "var(--bg)", paddingBlock: "clamp(72px,9vw,130px)", overflow: "hidden" }}>
      <div className="pad mb-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-end">
          <div>
            <p className="eyebrow mb-3" data-reveal style={{ color: "var(--orange)" }}>— Global Erişim</p>
            <h2 className="heading" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
              20+ ÜLKE.
            </h2>
          </div>
          <div data-reveal data-delay="2">
            <p style={{ fontSize: "clamp(14px,1.4vw,16px)", lineHeight: 1.85, color: "var(--muted)", fontWeight: 300, marginBottom: 24 }}>
              Avrupa&apos;dan Orta Doğu&apos;ya, Afrika&apos;dan Orta Asya&apos;ya.
              Tüm lojistik ve gümrük dokümantasyon desteği ile kapıdan kapıya teslimat.
            </p>
            <a href="#contact" className="eyebrow hover:text-white transition-colors"
              style={{ color: "var(--muted)", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 6, display: "inline-block" }}>
              İhracat hakkında bilgi al →
            </a>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="overflow-hidden border-y" style={{ borderColor: "var(--border)", paddingBlock: 18 }}>
        <div ref={ref} className="flex whitespace-nowrap" style={{ width: "max-content" }}>
          {[...COUNTRIES, ...COUNTRIES].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-4 eyebrow"
              style={{ color: "var(--muted)", fontSize: 11 }}>
              {c} <span style={{ color: "var(--orange)", opacity: 0.4, fontSize: 6 }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
