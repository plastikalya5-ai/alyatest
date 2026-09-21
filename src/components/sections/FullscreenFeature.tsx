import { IMG } from "@/data/images";

export default function FullscreenFeature() {
  return (
    <section className="relative grain overflow-hidden" style={{ minHeight: "85svh", background: "var(--bg)", display: "flex", alignItems: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG.hero2} alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 35%", opacity: 0.3 }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(100deg, rgba(11,14,11,0.96) 0%, rgba(11,14,11,0.7) 50%, rgba(11,14,11,0.5) 100%)"
      }} />

      <div className="relative z-10 pad w-full" style={{ paddingBlock: "clamp(80px,10vw,140px)" }}>
        <p className="eyebrow mb-5" data-reveal style={{ color: "var(--orange)" }}>— Üretim Felsefemiz</p>
        <h2 className="heading mb-8" data-reveal data-delay="1"
          style={{ fontSize: "clamp(52px,10vw,150px)", maxWidth: "70%", lineHeight: 0.88 }}>
          FİKİRDEN<br />
          <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(229,95,40,0.5)", fontStyle: "italic" }}>
            FORMA.
          </span>
        </h2>
        <p className="mb-10" data-reveal data-delay="2"
          style={{ maxWidth: 400, fontSize: "clamp(14px,1.5vw,16px)", lineHeight: 1.85, color: "var(--muted)", fontWeight: 300 }}>
          CAD tasarımdan enjeksiyona, kalite kontrolden sevkiyata —
          her adım İstanbul OSB&apos;deki tesisimizde gerçekleşir.
        </p>
        <div className="flex flex-wrap gap-3" data-reveal data-delay="3">
          <a href="#why"     className="btn btn-fill">Üretim Sürecimiz →</a>
          <a href="#contact" className="btn btn-line">Teklif Al</a>
        </div>
      </div>

      {/* Sağ stat paneli — sadece geniş ekran */}
      <div className="absolute right-0 top-0 bottom-0 hidden xl:flex flex-col justify-center gap-0"
        style={{ paddingRight: "var(--pad)", paddingLeft: 40 }}>
        {[["ISO","Sertifikalı"],["72h","Teklif Dönüşü"],["B2B","Toplu Sipariş"]].map(([n, l], i) => (
          <div key={i} data-reveal data-delay={String(i + 2)}
            className="py-6 pl-6 border-l" style={{ borderColor: "rgba(229,95,40,0.3)" }}>
            <div className="heading mb-1" style={{ fontSize: 34, color: "var(--orange)" }}>{n}</div>
            <div className="eyebrow" style={{ fontSize: 9, color: "var(--muted)" }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
