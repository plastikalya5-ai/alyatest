import { IMG } from "@/data/images";

export default function Hero() {
  return (
    <section id="hero" className="relative grain overflow-hidden flex flex-col justify-end min-h-svh bg-[#0b0e0b]"
      data-bg="#0b0e0b">

      {/* BG */}
      <div className="js-hero-bg absolute inset-0 origin-center" style={{ transform: "scale(1.06)", willChange: "transform" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.fikir} alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          style={{ objectPosition: "55% center" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(11,14,11,0.5) 0%, rgba(11,14,11,0.1) 40%, rgba(11,14,11,0.97) 100%)" }} />
      </div>

      {/* Ürün görseli */}
      <div className="absolute right-0 top-[6%] w-[clamp(160px,42%,500px)] h-[80%] z-[2] pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.kordon} alt="Kordon Saksı"
          className="js-hero-product w-full h-full object-contain"
          style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.8))", willChange: "transform" }} />
      </div>

      {/* Sol turuncu çizgi */}
      <div className="anim-line-expand absolute left-0 top-[15%] bottom-[15%] w-px z-[3]"
        style={{ background: "linear-gradient(to bottom, transparent, #e55f28 30%, #e55f28 70%, transparent)" }} />

      {/* İçerik */}
      <div className="relative z-[5]"
        style={{ paddingInline: "clamp(20px,5vw,80px)", paddingBottom: "clamp(48px,8vh,100px)", paddingTop: 90 }}>

        {/* Overline */}
        <div className="anim-hero-sub flex items-center gap-3 mb-6">
          <div className="anim-line-expand w-8 h-px bg-[#e55f28]" />
          <span className="anim-eyebrow eyebrow text-[#e55f28]">Plastik Ürün Üreticisi · 1968</span>
        </div>

        {/* Başlık — clip ile maskeli */}
        <div className="overflow-hidden mb-2">
          <h1 className="anim-hero-line heading text-[#eae6dd]"
            style={{ fontSize: "clamp(64px,13vw,196px)" }}>FORM</h1>
        </div>
        <div className="overflow-hidden mb-10">
          <h1 className="anim-hero-line heading italic"
            style={{ fontSize: "clamp(64px,13vw,196px)", color: "transparent", WebkitTextStroke: "1.5px rgba(229,95,40,0.55)" }}>
            &amp; FONKSİYON
          </h1>
        </div>

        {/* Alt */}
        <div className="anim-hero-sub flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16 mb-10">
          <p className="text-[#6b7366] font-light leading-relaxed max-w-[340px]"
            style={{ fontSize: "clamp(14px,1.4vw,16px)" }}>
            55 yıllık üretim deneyimi. Saksı, sepet, sandık ve ev ürünlerinde 200+ model. 20+ ülke ihracatı.
          </p>
          <div className="flex gap-8 sm:gap-12">
            {[{n:55,s:"+",l:"Yıl"},{n:200,s:"+",l:"Model"},{n:20,s:"+",l:"Ülke"}].map(st => (
              <div key={st.l}>
                <div className="heading text-[#e55f28]" style={{ fontSize: "clamp(32px,5vw,60px)", lineHeight: 1 }}>
                  <span data-count={st.n} data-suffix={st.s}>{st.n}{st.s}</span>
                </div>
                <div className="eyebrow text-[#6b7366] mt-1.5">{st.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="anim-hero-sub flex flex-wrap gap-3">
          <a href="#products"
            className="anim-magnetic inline-flex items-center gap-2 bg-[#e55f28] hover:bg-[#c94f1e] text-white text-[11px] font-semibold tracking-[0.14em] uppercase px-7 py-3.5 transition-colors">
            Ürünleri Keşfet →
          </a>
          <a href="#contact"
            className="anim-magnetic inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-[#eae6dd] text-[11px] font-semibold tracking-[0.14em] uppercase px-7 py-3.5 transition-colors">
            Teklif Al
          </a>
        </div>
      </div>

      <div className="anim-line-expand absolute bottom-0 left-0 w-32 h-px bg-[#e55f28] z-[5]" />
    </section>
  );
}
