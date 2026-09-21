import { IMG } from "@/data/images";

const products = [
  { code: "ALY-601", name: "UFO Saksı", cat: "Saksı", img: IMG.ufo, span: "lg:col-span-2 lg:row-span-2" },
  { code: "ALY-333", name: "Dantel Sepet", cat: "Sepet", img: IMG.dantel, span: "" },
  { code: "ALY-101", name: "3D Saksı", cat: "Saksı", img: IMG.d3, span: "" },
  { code: "ALY-201", name: "Venüs Saksı", cat: "Saksı", img: IMG.venus, span: "" },
  { code: "ALY-441", name: "Venüs Askılı", cat: "Saksı", img: IMG.venusAsk, span: "" },
];

export default function FeaturedProducts() {
  return (
    <section id="products" style={{ background: "var(--dark2)", paddingBlock: "clamp(80px,10vw,140px)" }}>
      <div style={{ paddingInline: "var(--pad)" }}>

        {/* Head */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow reveal" style={{ color: "var(--orange)", marginBottom: 16 }}>— Öne Çıkan Ürünler</p>
            <div className="clip">
              <h2 className="display reveal-title" style={{ fontSize: "clamp(52px,8vw,120px)" }}>
                KOLEKSİYON
              </h2>
            </div>
          </div>
          <a href="#collection" className="reveal flex items-center gap-3 text-sm uppercase tracking-widest border-b pb-2 self-start sm:self-auto hover:opacity-70 transition-opacity"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--muted)" }}>
            Tümünü Gör <span style={{ color: "var(--orange)" }}>→</span>
          </a>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {products.map((p, i) => (
            <a key={p.code} href="#contact"
              className={`group relative overflow-hidden ${p.span} reveal`}
              style={{
                aspectRatio: i === 0 ? "1" : "0.85",
                background: i % 2 === 0 ? "#1e2420" : "#1a1f1b",
                display: "block",
              }}>

              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.name}
                className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-700" />

              {/* Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(to top, rgba(14,18,16,0.9) 0%, transparent 60%)" }} />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <p className="eyebrow mb-1" style={{ color: "var(--orange)", fontSize: 10 }}>{p.code}</p>
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Teklif İçin Tıkla →</p>
              </div>

              {/* Category badge */}
              <div className="absolute top-4 left-4">
                <span className="eyebrow text-[9px] px-2 py-1" style={{ background: "rgba(14,18,16,0.7)", color: "var(--muted)", backdropFilter: "blur(8px)" }}>
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
