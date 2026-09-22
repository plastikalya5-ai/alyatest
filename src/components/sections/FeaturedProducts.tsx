import { IMG } from "@/data/images";

const GRID = [
  { code: "ALY-601", name: "UFO Saksı",    cat: "Saksı", img: IMG.ufo,      big: true  },
  { code: "ALY-333", name: "Dantel Sepet", cat: "Sepet", img: IMG.dantel,   big: false },
  { code: "ALY-101", name: "3D Saksı",     cat: "Saksı", img: IMG.d3,       big: false },
  { code: "ALY-441", name: "Venüs Askılı", cat: "Saksı", img: IMG.venusAsk, big: false },
  { code: "ALY-311", name: "3D Balkon",    cat: "Saksı", img: IMG.balkon,   big: false },
];

export default function FeaturedProducts() {
  return (
    <section id="products" style={{ background: "var(--bg2)", paddingBlock: "clamp(72px,9vw,130px)" }}>
      <div className="pad">
        {/* Başlık */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 48 }}>
          <div>
            <p className="eyebrow" data-reveal style={{ color: "var(--orange)", marginBottom: 12 }}>
              — Öne Çıkan Ürünler
            </p>
            <h2 className="heading" data-reveal data-delay="1"
              style={{ fontSize: "clamp(44px,7vw,96px)" }}>
              KOLEKSİYON
            </h2>
          </div>
          <a href="#collection" className="eyebrow" data-reveal
            style={{ color: "var(--muted)", transition: "color 0.2s" }}>
            Tüm Ürünler →
          </a>
        </div>

        {/* Bento grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {GRID.map((p, i) => (
            <a key={p.code} href="#contact"
              data-reveal data-delay={String(i + 1)}
              style={{
                position: "relative",
                display: "block",
                gridColumn: p.big ? "span 2" : "span 1",
                gridRow:    p.big ? "span 2" : "span 1",
                aspectRatio: "1/1",
                background: i % 2 === 0 ? "var(--bg3)" : "var(--bg4)",
                overflow: "hidden",
              }}
              className="group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.name}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "contain",
                  padding: "clamp(12px,4vw,36px)",
                  transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
                }} />

              {/* Hover overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(11,14,11,0.92) 0%, transparent 50%)",
                opacity: 0,
                transition: "opacity 0.3s",
              }} className="group-hover:opacity-100" />

              {/* Info — hover'da çıkar */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "clamp(12px,2vw,20px)",
                transform: "translateY(4px)",
                opacity: 0,
                transition: "opacity 0.3s, transform 0.3s",
              }} className="group-hover:opacity-100 group-hover:translate-y-0">
                <p className="eyebrow" style={{ color: "var(--orange)", fontSize: 9, marginBottom: 4 }}>{p.code}</p>
                <p style={{ fontWeight: 600, fontSize: "clamp(12px,1.4vw,16px)", color: "#fff" }}>{p.name}</p>
              </div>

              {/* Kategori badge */}
              <div style={{ position: "absolute", top: 10, left: 10 }}>
                <span className="eyebrow" style={{
                  fontSize: 9, padding: "3px 7px",
                  background: "rgba(11,14,11,0.7)",
                  color: "var(--muted)",
                  backdropFilter: "blur(6px)",
                }}>
                  {p.cat}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Mobil fallback grid */}
        <style>{`
          @media (max-width: 639px) {
            #products-grid { grid-template-columns: repeat(2, 1fr) !important; }
            #products-grid > *[style*="span 2"] { grid-column: span 2 !important; grid-row: span 1 !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
