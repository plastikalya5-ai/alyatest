import { IMG } from "@/data/images";

const GRID = [
  { code:"ALY-601", name:"UFO Saksı",    cat:"Saksı", img:IMG.ufo,      big:true  },
  { code:"ALY-333", name:"Dantel Sepet", cat:"Sepet", img:IMG.dantel,   big:false },
  { code:"ALY-101", name:"3D Saksı",     cat:"Saksı", img:IMG.d3,       big:false },
  { code:"ALY-441", name:"Venüs Askılı", cat:"Saksı", img:IMG.venusAsk, big:false },
  { code:"ALY-311", name:"3D Balkon",    cat:"Saksı", img:IMG.balkon,   big:false },
];

export default function FeaturedProducts() {
  return (
    <section id="products" className="bg-[#111511]" data-bg="#111511"
      style={{ paddingBlock: "clamp(72px,9vw,130px)" }}>
      <div style={{ paddingInline: "clamp(20px,5vw,80px)" }}>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <p className="anim-eyebrow eyebrow text-[#e55f28] mb-3">— Öne Çıkan Ürünler</p>
            <h2 className="anim-split-heading heading text-[#eae6dd]"
              style={{ fontSize: "clamp(44px,7vw,96px)" }}>KOLEKSİYON</h2>
          </div>
          <a href="#collection" className="anim-up eyebrow text-[#6b7366] hover:text-white transition-colors">
            Tüm Ürünler →
          </a>
        </div>

        <div className="anim-stagger-parent grid grid-cols-2 md:grid-cols-4 gap-2">
          {GRID.map((p, i) => (
            <a key={p.code} href="#contact"
              className={`anim-stagger-child group relative overflow-hidden aspect-square ${p.big ? "md:col-span-2 md:row-span-2" : ""}`}
              style={{ background: i % 2 === 0 ? "#181d18" : "#1e241e" }}>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.name}
                className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                style={{ padding: "clamp(12px,4vw,36px)" }} />

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: "linear-gradient(to top, rgba(11,14,11,0.95) 0%, transparent 55%)" }} />

              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                <p className="eyebrow text-[#e55f28] text-[9px] mb-1">{p.code}</p>
                <p className="font-semibold text-white" style={{ fontSize: "clamp(12px,1.4vw,16px)" }}>{p.name}</p>
              </div>

              <div className="absolute top-3 left-3">
                <span className="eyebrow text-[#6b7366] text-[9px] px-[7px] py-[3px]"
                  style={{ background: "rgba(11,14,11,0.7)", backdropFilter: "blur(6px)" }}>
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
