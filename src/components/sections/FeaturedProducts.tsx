import { IMG } from "@/data/images";

const GRID = [
  { code: "ALY-601", name: "UFO Saksı",      cat: "Saksı",    img: IMG.ufo,      big: true  },
  { code: "ALY-333", name: "Dantel Sepet",   cat: "Sepet",    img: IMG.dantel,   big: false },
  { code: "ALY-101", name: "3D Saksı",       cat: "Saksı",    img: IMG.d3,       big: false },
  { code: "ALY-441", name: "Venüs Askılı",   cat: "Saksı",    img: IMG.venusAsk, big: false },
  { code: "ALY-311", name: "3D Balkon",      cat: "Saksı",    img: IMG.balkon,   big: false },
];

export default function FeaturedProducts() {
  return (
    <section id="products" style={{ background: "var(--bg2)", paddingBlock: "clamp(72px,9vw,130px)" }}>
      <div className="pad">
        {/* Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="eyebrow mb-3" data-reveal style={{ color: "var(--orange)" }}>— Öne Çıkan Ürünler</p>
            <h2 className="heading" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
              KOLEKSİYON
            </h2>
          </div>
          <a href="#collection" className="eyebrow hover:text-white transition-colors self-start sm:self-auto" data-reveal
            style={{ color: "var(--muted)" }}>
            Tüm Ürünler →
          </a>
        </div>

        {/* Grid — mobilde 2 kolon, desktop'ta bento */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {GRID.map((p, i) => (
            <a key={p.code} href="#contact"
              className={`group zoom-wrap relative overflow-hidden ${p.big ? "lg:col-span-2 lg:row-span-2" : ""}`}
              data-reveal data-delay={String(i + 1)}
              style={{ aspectRatio: p.big ? "1/1" : "4/5", background: i % 2 === 0 ? "var(--bg3)" : "var(--bg4)", display: "block" }}>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.name}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ padding: "clamp(16px,4vw,40px)" }} />

              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(to top, rgba(11,14,11,0.95) 0%, transparent 55%)" }} />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <p className="eyebrow mb-1" style={{ color: "var(--orange)", fontSize: 9 }}>{p.code}</p>
                <p className="font-semibold" style={{ fontSize: "clamp(13px,1.5vw,17px)" }}>{p.name}</p>
              </div>

              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span className="eyebrow" style={{ fontSize: 8, padding: "3px 7px", background: "rgba(11,14,11,0.75)", color: "var(--muted)", backdropFilter: "blur(6px)" }}>
                  {p.cat}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
