"use client";
import { useEffect, useRef } from "react";

const countries = [
  "Almanya", "Fransa", "Polonya", "Romanya", "Ukrayna", "İtalya",
  "Irak", "İran", "Suudi Arabistan", "BAE", "Libya", "Mısır",
  "Fas", "Kazakistan", "Azerbaycan", "Nijerya", "İngiltere", "Hollanda",
];

const stats = [
  { num: "20+", label: "İhracat Ülkesi" },
  { num: "55+", label: "Yıl Deneyim" },
  { num: "200+", label: "Ürün Modeli" },
  { num: "B2B", label: "Tam Tedarik" },
];

export default function Export() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let x = 0;
    let raf: number;
    const animate = () => {
      x -= 0.6;
      const half = el.scrollWidth / 2;
      if (Math.abs(x) >= half) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="ihracat"
      style={{ background: "#161a17", color: "var(--light)", overflow: "hidden", padding: "100px 0 80px" }}
    >
      <div style={{ paddingInline: "var(--pad)" }}>
        <p className="eyebrow" style={{ color: "var(--muted)", marginBottom: 30 }}>
          06.5 — GLOBAL ERİŞİM
        </p>
        <h2
          id="map-title"
          className="display"
          style={{ fontSize: "clamp(70px, 11vw, 180px)", marginBottom: 20 }}
        >
          20+ ÜLKE.
          <br />
          <span style={{ color: "var(--orange)" }}>TEK KAYNAK.</span>
        </h2>
        <p style={{ color: "#aeb5a7", maxWidth: 420, fontSize: 15, lineHeight: 1.7, marginBottom: 60 }}>
          Avrupa&apos;dan Orta Doğu&apos;ya, Afrika&apos;dan Orta Asya&apos;ya. Tüm lojistik ve dokümantasyon desteği.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-12 mb-16">
          {stats.map((s) => (
            <div key={s.label}>
              <div
                className="display"
                style={{ fontSize: "clamp(48px, 7vw, 96px)", color: "var(--orange)" }}
              >
                {s.num}
              </div>
              <div className="eyebrow" style={{ fontSize: 11, color: "var(--muted)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker */}
      <div className="overflow-hidden" style={{ borderTop: "1px solid #fff2", borderBottom: "1px solid #fff2", padding: "18px 0" }}>
        <div ref={tickerRef} className="flex gap-12 whitespace-nowrap" style={{ width: "max-content" }}>
          {[...countries, ...countries].map((c, i) => (
            <span key={i} className="eyebrow" style={{ fontSize: 13, color: "var(--muted)" }}>
              {c} <span style={{ color: "var(--orange)" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ paddingInline: "var(--pad)", marginTop: 60 }}>
        <a
          href="#contact"
          className="inline-flex items-center gap-4 text-sm uppercase tracking-widest border-b pb-3 hover:opacity-70 transition-opacity"
          style={{ borderColor: "#ffffff40" }}
        >
          İHRACAT HAKKINDA BİLGİ AL
          <span style={{ color: "var(--orange)" }}>→</span>
        </a>
      </div>
    </section>
  );
}
