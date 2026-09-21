import { IMG } from "@/data/images";

const grid = [
  { code: "ALY-601", name: "UFO",          cat: "Saksı",    img: IMG.ufo,      col: "lg:col-span-2 lg:row-span-2", ratio: "aspect-square" },
  { code: "ALY-333", name: "Dantel Sepet", cat: "Sepet",    img: IMG.dantel,   col: "",                             ratio: "aspect-[4/5]"  },
  { code: "ALY-101", name: "3D Saksı",     cat: "Saksı",    img: IMG.d3,       col: "",                             ratio: "aspect-[4/5]"  },
  { code: "ALY-441", name: "Venüs Askılı", cat: "Saksı",    img: IMG.venusAsk, col: "",                             ratio: "aspect-[4/5]"  },
  { code: "ALY-311", name: "Balkon 3D",    cat: "Saksı",    img: IMG.balkon,   col: "",                             ratio: "aspect-[4/5]"  },
];

export default function FeaturedProducts() {
  return (
    <section id="products" className="relative" style={{ background: "var(--bg2)", paddingBlock: "clamp(80px,10vw,140px)" }}>
      <div style={{ paddingInline: "var(--pad)" }}>

        {/* Head */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="eyebrow reveal-up" style={{ color: "var(--orange)", marginBottom: 14 }}>— Öne Çıkan Ürünler</p>
            <div className="clip">
              <h2 className="display reveal-up delay-1" style={{ fontSize: "clamp(48px,8vw,110px)" }}>
                KOLEKSİYON
              </h2>
            </div>
          </div>
          <a href="#collection" className="reveal-fade self-start sm:self-auto eyebrow hover:text-white transition-colors"
            style={{ color: "var(--muted)" }}>
            Tüm Ürünler →
          </a>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
          {grid.map((p, i) => (
            <a key={p.code} href="#contact"
              className={`group relative overflow-hidden img-zoom reveal-up ${p.col}`}
              style={{ transitionDelay: `${i * 80}ms` }}>

              {/* Image container */}
              <div className={`relative w-full ${p.ratio} overflow-hidden`}
                style={{ background: i % 2 === 0 ? "var(--bg3)" : "#161a15" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.name}
                  className="absolute inset-0 w-full h-full object-contain p-6 lg:p-10 transition-transform duration-700 group-hover:scale-108" />

                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: "linear-gradient(to top, rgba(10,13,11,0.95) 0%, rgba(10,13,11,0.0) 60%)" }} />

                {/* Info on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                  <p className="eyebrow mb-1" style={{ color: "var(--orange)", fontSize: 9 }}>{p.code}</p>
                  <p className="font-semibold text-white" style={{ fontSize: "clamp(14px,1.5vw,18px)" }}>{p.name}</p>
                  <p className="eyebrow mt-2" style={{ color: "var(--muted)", fontSize: 9 }}>Teklif için tıkla →</p>
                </div>

                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="eyebrow" style={{ fontSize: 9, padding: "4px 8px", background: "rgba(10,13,11,0.75)", color: "var(--muted)", backdropFilter: "blur(6px)" }}>
                    {p.cat}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
