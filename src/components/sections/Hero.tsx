"use client";
import { useEffect, useRef } from "react";
import { IMG } from "@/data/images";

export default function Hero() {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      el.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="relative overflow-hidden noise" style={{ height: "100svh", minHeight: 700, background: "var(--dark)" }}>

      {/* BG Image — parallax */}
      <div ref={videoRef} className="absolute inset-0 transition-transform duration-700 ease-out" style={{ willChange: "transform" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.hero1} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" style={{ objectPosition: "center 30%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(14,18,16,0.95) 0%, rgba(14,18,16,0.5) 50%, rgba(14,18,16,0.8) 100%)" }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "80px 80px"
      }} />

      {/* Top bar */}
      <div className="absolute top-24 left-0 right-0 flex justify-between items-center" style={{ paddingInline: "var(--pad)" }}>
        <span className="eyebrow" style={{ color: "var(--muted)" }}>1968 — 2026</span>
        <span className="eyebrow" style={{ color: "var(--muted)" }}>İSTANBUL OSB</span>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 flex flex-col justify-end" style={{ paddingInline: "var(--pad)", paddingBottom: "clamp(60px,8vh,120px)" }}>

        {/* Overline */}
        <div className="flex items-center gap-4 mb-6 hero-line">
          <div className="h-px w-12" style={{ background: "var(--orange)" }} />
          <span className="eyebrow" style={{ color: "var(--orange)" }}>Plastik Ürün Üreticisi</span>
        </div>

        {/* Title */}
        <h1 className="display hero-line" style={{ fontSize: "clamp(72px,12vw,200px)", maxWidth: "80%", marginBottom: 32 }}>
          FORM<br />
          <span style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.3)", color: "transparent" }}>VE</span><br />
          FONKSİYON.
        </h1>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <p className="hero-line" style={{ maxWidth: 340, fontSize: "clamp(14px,1.5vw,17px)", lineHeight: 1.7, color: "var(--muted)", fontWeight: 300 }}>
            55 yıllık üretim deneyimi. Saksı, sepet, sandık ve depolama ürünlerinde 200+ model. 20+ ülke ihracat.
          </p>

          {/* Stats */}
          <div className="flex gap-8 sm:gap-12 hero-line">
            {[
              { n: "55+", l: "Yıl" },
              { n: "200+", l: "Model" },
              { n: "20+", l: "Ülke" },
            ].map(s => (
              <div key={s.l} className="text-center sm:text-left">
                <div className="display" style={{ fontSize: "clamp(28px,4vw,52px)", color: "var(--orange)" }}>{s.n}</div>
                <div className="eyebrow mt-1" style={{ color: "var(--muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="flex items-center gap-3 mt-10 hero-line">
          <div className="relative w-6 h-10 rounded-full border flex justify-center pt-2" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
            <div className="w-1 h-2 rounded-full animate-bounce" style={{ background: "var(--orange)" }} />
          </div>
          <span className="eyebrow" style={{ color: "var(--muted)", fontSize: 10 }}>Kaydır</span>
        </div>
      </div>

      {/* Hero product — right side */}
      <div className="absolute hidden lg:block" style={{ right: "6%", top: "12%", bottom: "8%", width: "36%", zIndex: 5 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.kordon} alt="Kordon Saksı"
          className="hero-product-img w-full h-full object-contain"
          style={{ transform: "rotate(-6deg)", filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.6))", willChange: "transform" }} />
      </div>

      {/* Orange accent line */}
      <div className="absolute bottom-0 left-0 h-1" style={{ width: "clamp(80px,15vw,200px)", background: "var(--orange)" }} />
    </section>
  );
}
