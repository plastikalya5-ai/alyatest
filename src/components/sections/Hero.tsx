import { IMG } from "@/data/images";

export default function Hero() {
  return (
    <section id="hero" className="relative grain overflow-hidden"
      style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>

      {/* BG görseli — parallax ile hareket eder */}
      <div className="js-hero-bg absolute inset-0"
        style={{ transform: "scale(1.06)", willChange: "transform", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.fikir} alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "55% center", opacity: 0.35 }} />
        <div className="absolute inset-0" style={{
          background:
            "linear-gradient(to bottom, rgba(11,14,11,0.55) 0%, rgba(11,14,11,0.2) 40%, rgba(11,14,11,0.92) 100%)"
        }} />
      </div>

      {/* Ürün görseli — hem mobil hem desktop */}
      <div className="absolute z-[2]"
        style={{
          right: 0,
          top: "6%",
          width: "clamp(180px, 45%, 520px)",
          height: "80%",
          pointerEvents: "none",
        }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.kordon} alt="Kordon Saksı ALY-10/03"
          className="js-hero-product w-full h-full object-contain"
          style={{
            filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.7))",
            willChange: "transform",
          }} />
      </div>

      {/* İnce turuncu çizgi — sol */}
      <div className="absolute left-0 top-[15%] bottom-[15%] w-px z-[3]"
        style={{ background: "linear-gradient(to bottom, transparent, var(--orange) 30%, var(--orange) 70%, transparent)" }} />

      {/* İçerik */}
      <div className="relative z-[5] pad" style={{ paddingBottom: "clamp(48px, 8vh, 100px)", paddingTop: 90 }}>

        {/* Overline */}
        <div className="flex items-center gap-3 mb-6" data-reveal data-delay="1">
          <div style={{ width: 32, height: 1, background: "var(--orange)" }} />
          <span className="eyebrow" style={{ color: "var(--orange)" }}>Plastik Ürün Üreticisi · 1968</span>
        </div>

        {/* Başlık */}
        <div className="clip mb-4" data-reveal data-delay="2">
          <h1 className="heading" style={{ fontSize: "clamp(64px, 14vw, 200px)", color: "var(--light)", maxWidth: "65%" }}>
            FORM
          </h1>
        </div>
        <div className="clip mb-10" data-reveal data-delay="3">
          <h1 className="heading" style={{
            fontSize: "clamp(64px, 14vw, 200px)",
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(229,95,40,0.55)",
            maxWidth: "65%",
            fontStyle: "italic",
          }}>
            &amp; FONKSİYON
          </h1>
        </div>

        {/* Alt satır: metin + stats */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16 mb-10" data-reveal data-delay="4">
          <p style={{ maxWidth: 340, fontSize: "clamp(14px,1.4vw,16px)", lineHeight: 1.8, color: "var(--muted)", fontWeight: 300 }}>
            55 yıllık üretim deneyimi. Saksı, sepet,
            sandık ve ev ürünlerinde 200+ model.
            20+ ülke ihracatı.
          </p>

          <div className="flex gap-8 sm:gap-12">
            {[
              { n: 55,  s: "+", l: "Yıl"   },
              { n: 200, s: "+", l: "Model" },
              { n: 20,  s: "+", l: "Ülke"  },
            ].map(st => (
              <div key={st.l}>
                <div className="heading" style={{ fontSize: "clamp(32px,5vw,60px)", color: "var(--orange)", lineHeight: 1 }}>
                  <span data-count={st.n} data-suffix={st.s}>{st.n}{st.s}</span>
                </div>
                <div className="eyebrow mt-1.5" style={{ color: "var(--muted)" }}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA'lar */}
        <div className="flex flex-wrap gap-3" data-reveal data-delay="5">
          <a href="#products" className="btn btn-fill">Ürünleri Keşfet →</a>
          <a href="#contact"  className="btn btn-line">Teklif Al</a>
        </div>
      </div>

      {/* Alt çizgi */}
      <div className="absolute bottom-0 left-0 w-32 h-px z-[5]"
        style={{ background: "var(--orange)" }} />
    </section>
  );
}
