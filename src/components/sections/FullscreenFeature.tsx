import { IMG } from "@/data/images";

export default function FullscreenFeature() {
  return (
    <section className="relative overflow-hidden" style={{ height: "85svh", minHeight: 500 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG.fikir} alt="Fikirden Forma"
        className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(14,18,16,0.92) 40%, rgba(14,18,16,0.3) 100%)" }} />

      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingInline: "var(--pad)" }}>
        <p className="eyebrow reveal" style={{ color: "var(--orange)", marginBottom: 20 }}>— Üretim Felsefemiz</p>
        <div className="clip">
          <h2 className="display reveal-title" style={{ fontSize: "clamp(52px,10vw,150px)", maxWidth: "70%", marginBottom: 32 }}>
            FİKİRDEN<br />FORMA.
          </h2>
        </div>
        <p className="reveal" style={{ maxWidth: 380, fontSize: "clamp(14px,1.5vw,18px)", lineHeight: 1.8, color: "var(--muted)", fontWeight: 300, marginBottom: 40 }}>
          Her ürün CAD tasarımından kalıba, enjeksiyondan kalite kontrole kadar İstanbul OSB&apos;deki tesisimizde üretilir.
        </p>
        <div className="flex gap-6 reveal">
          <a href="#why"
            className="px-8 py-4 text-sm uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "var(--orange)", color: "var(--dark)" }}>
            Üretim Sürecimiz
          </a>
          <a href="#contact"
            className="px-8 py-4 text-sm uppercase tracking-widest border hover:bg-white/5 transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--light)" }}>
            Teklif Al
          </a>
        </div>
      </div>
    </section>
  );
}
