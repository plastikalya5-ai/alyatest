import { IMG } from "@/data/images";

export default function FullscreenFeature() {
  return (
    <section className="relative overflow-hidden grain" style={{ height: "90svh", minHeight: 520, background: "var(--bg)" }}>
      {/* BG */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG.hero2} alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-35"
        style={{ objectPosition: "center 40%" }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(105deg, rgba(10,13,11,0.97) 0%, rgba(10,13,11,0.75) 45%, rgba(10,13,11,0.5) 100%)"
      }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center" style={{ paddingInline: "var(--pad)" }}>
        <p className="eyebrow reveal-up" style={{ color: "var(--orange)", marginBottom: 20 }}>— Üretim Felsefemiz</p>
        <div className="clip mb-8">
          <h2 className="display reveal-up delay-1" style={{ fontSize: "clamp(56px,11vw,160px)", maxWidth: "75%", lineHeight: 0.86 }}>
            FİKİRDEN<br />
            <span className="serif-italic" style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(229,98,42,0.5)", fontSize: "0.92em" }}>
              Forma.
            </span>
          </h2>
        </div>
        <p className="reveal-up delay-2" style={{ maxWidth: 400, fontSize: "clamp(14px,1.5vw,17px)", lineHeight: 1.85, color: "var(--muted)", fontWeight: 300, marginBottom: 48 }}>
          CAD tasarımdan enjeksiyona, kalite kontrolden sevkiyata — her adım İstanbul OSB&apos;deki tesisimizde.
        </p>
        <div className="flex gap-4 flex-wrap reveal-up delay-3">
          <a href="#why" className="btn-orange">Üretim Sürecimiz →</a>
          <a href="#contact" className="btn-outline">Teklif Al</a>
        </div>
      </div>

      {/* Side stats */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-0"
        style={{ paddingRight: "var(--pad)" }}>
        {[
          { n: "ISO", l: "Sertifikalı Tesis" },
          { n: "72h", l: "Teklif Dönüşü" },
          { n: "B2B", l: "Toplu Sipariş" },
        ].map((s, i) => (
          <div key={i} className="reveal-up py-6 pl-8 border-l" style={{ borderColor: "rgba(229,98,42,0.3)", transitionDelay: `${i*100}ms` }}>
            <div className="display mb-1" style={{ fontSize: 36, color: "var(--orange)" }}>{s.n}</div>
            <div className="eyebrow" style={{ color: "var(--muted)", fontSize: 9 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
