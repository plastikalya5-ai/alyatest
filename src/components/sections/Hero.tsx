import { IMG } from "@/data/images";

export default function Hero() {
  return (
    <section id="hero" className="relative grain overflow-hidden grid-overlay"
      style={{ height: "100svh", minHeight: 680, background: "var(--bg)" }}>

      {/* ── Background image ─────────────────────── */}
      <div className="hero-bg absolute inset-0 origin-center"
        style={{ transform: "scale(1.08)", willChange: "transform", transition: "transform 0.1s linear" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.fikir} alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "60% center", opacity: 0.22 }} />
        {/* Multi-layer gradient */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(to right,  rgba(10,13,11,0.98) 0%, rgba(10,13,11,0.6) 55%, rgba(10,13,11,0.85) 100%),
            linear-gradient(to bottom, rgba(10,13,11,0.0)  0%, rgba(10,13,11,0.0) 50%, rgba(10,13,11,1.0)  100%)
          `
        }} />
      </div>

      {/* ── Floating product image ───────────────── */}
      <div className="hidden lg:block absolute"
        style={{ right: "4%", top: "8%", width: "38%", height: "88%", zIndex: 4, pointerEvents: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.kordon} alt="Kordon Saksı"
          className="hero-product w-full h-full object-contain"
          style={{
            transform: "rotate(-6deg)",
            filter: "drop-shadow(0 60px 120px rgba(0,0,0,0.8)) drop-shadow(0 0 40px rgba(229,98,42,0.08))",
            willChange: "transform",
          }} />
      </div>

      {/* ── Orange vertical accent ───────────────── */}
      <div className="absolute hidden lg:block" style={{ left: "calc(var(--pad) - 1px)", top: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, transparent 0%, var(--orange) 30%, var(--orange) 70%, transparent 100%)", opacity: 0.3 }} />

      {/* ── Content ──────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col justify-end" style={{ paddingInline: "var(--pad)", paddingBottom: "clamp(48px,7vh,100px)" }}>

        {/* Overline */}
        <div className="flex items-center gap-4 mb-8 reveal-up">
          <div style={{ width: 40, height: 1, background: "var(--orange)" }} />
          <span className="eyebrow" style={{ color: "var(--orange)", letterSpacing: "0.3em" }}>
            Plastik Ürün Üreticisi · 1968
          </span>
        </div>

        {/* Headline */}
        <div className="mb-10">
          <div className="clip reveal-up delay-1">
            <h1 className="display" style={{ fontSize: "clamp(76px, 14vw, 210px)", lineHeight: 0.84, color: "var(--light)" }}>
              FORM
            </h1>
          </div>
          <div className="clip reveal-up delay-2">
            <h1 className="display serif-italic" style={{ fontSize: "clamp(76px, 14vw, 210px)", lineHeight: 0.84, color: "transparent", WebkitTextStroke: "1.5px rgba(229,98,42,0.6)", letterSpacing: "-0.03em" }}>
              &amp; Fonksiyon
            </h1>
          </div>
        </div>

        {/* Sub + Stats row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 reveal-up delay-3">
          <p style={{ maxWidth: 360, fontSize: "clamp(14px,1.4vw,17px)", lineHeight: 1.8, color: "var(--muted)", fontWeight: 300 }}>
            55 yıllık üretim deneyimi.<br className="hidden sm:block" />
            200+ model · 20+ ülke ihracatı.
          </p>

          {/* Stats */}
          <div className="flex items-end gap-8 sm:gap-12">
            {[
              { n: 55,  s: "+", l: "Yıl"   },
              { n: 200, s: "+", l: "Model" },
              { n: 20,  s: "+", l: "Ülke"  },
            ].map(st => (
              <div key={st.l}>
                <div className="display" style={{ fontSize: "clamp(34px,5vw,64px)", color: "var(--orange)", lineHeight: 1 }}>
                  <span data-count={st.n} data-suffix={st.s}>{st.n}{st.s}</span>
                </div>
                <div className="eyebrow mt-2" style={{ color: "var(--muted)" }}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Row */}
        <div className="flex items-center gap-6 mt-10 reveal-up delay-4">
          <a href="#products" className="btn-orange">
            Ürünleri Keşfet →
          </a>
          <a href="#contact" className="btn-outline">
            Teklif Al
          </a>
        </div>
      </div>

      {/* ── Bottom gradient ───────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, var(--orange), transparent)" }} />
    </section>
  );
}
