"use client";
import { useEffect, useRef } from "react";

const countries = ["Almanya","Fransa","İtalya","Polonya","Romanya","Ukrayna","İngiltere","Hollanda","Belçika","İspanya","Irak","İran","Suudi Arabistan","BAE","Libya","Mısır","Fas","Tunus","Kazakistan","Azerbaycan","Gürcistan","Nijerya","Gana"];

export default function Export() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0;
    const half = el.scrollWidth / 2;
    let raf: number;
    const tick = () => {
      x -= 0.45;
      if (Math.abs(x) >= half) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section style={{ background: "var(--bg)", paddingBlock: "clamp(80px,10vw,140px)", overflow: "hidden" }}>
      <div style={{ paddingInline: "var(--pad)", marginBottom: 60 }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <div>
            <p className="eyebrow reveal-up" style={{ color: "var(--orange)", marginBottom: 14 }}>— Global Erişim</p>
            <div className="clip">
              <h2 className="display reveal-up delay-1" style={{ fontSize: "clamp(48px,8vw,110px)" }}>
                20+<br />ÜLKE.
              </h2>
            </div>
          </div>
          <div className="reveal-up delay-2">
            <p style={{ fontSize: "clamp(14px,1.5vw,17px)", lineHeight: 1.85, color: "var(--muted)", fontWeight: 300, marginBottom: 32 }}>
              Avrupa&apos;dan Orta Doğu&apos;ya, Afrika&apos;dan Orta Asya&apos;ya uzanan ihracat ağımız. Tüm lojistik ve gümrük dokümantasyon desteği.
            </p>
            <a href="#contact" className="eyebrow hover:text-white transition-colors"
              style={{ color: "var(--muted)", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 8, display: "inline-block" }}>
              İhracat hakkında bilgi al →
            </a>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="overflow-hidden section-rule" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBlock: 20 }}>
        <div ref={ref} className="flex whitespace-nowrap" style={{ width: "max-content" }}>
          {[...countries, ...countries].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-5 px-5 eyebrow"
              style={{ color: "var(--muted)", fontSize: 11 }}>
              {c}<span style={{ color: "var(--orange)", opacity: 0.4, fontSize: 6 }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
