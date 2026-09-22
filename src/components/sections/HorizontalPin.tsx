import type { Product } from "@/lib/supabase";

export default function HorizontalPin({ products }: { products: Product[] }) {
  const items = products.slice(0, 6);

  return (
    <>
      {/* Desktop: horizontal pin */}
      <section id="h-pin" className="relative bg-[#eae6dd] hidden md:block"
        data-bg="#eae6dd"
        style={{ height: "100svh" }}>

        {/* Sol sabit başlık */}
        <div className="absolute left-0 top-0 bottom-0 z-10 flex flex-col justify-center"
          style={{ width: "clamp(200px,22vw,320px)", paddingLeft: "clamp(20px,5vw,80px)", paddingRight: 40 }}>
          <p className="anim-eyebrow eyebrow text-[#6b7366] mb-4">— Sürükle</p>
          <h2 className="heading text-[#0b0e0b]" style={{ fontSize: "clamp(40px,5vw,72px)" }}>
            TÜM<br />FORM<br />LAR.
          </h2>
          <div className="mt-8 w-full h-px bg-[#0b0e0b]/20" />
          <p className="mt-4 text-[#6b7366] font-light text-sm">{items.length}+ ürün</p>
        </div>

        {/* Track */}
        <div className="h-pin-track absolute top-0 bottom-0 flex items-center"
          style={{ left: "clamp(200px,22vw,320px)", paddingRight: 60, gap: 16 }}>
          {items.map((p, i) => (
            <div key={p.id}
              className="tilt-card relative flex-none overflow-hidden group"
              style={{
                width: i === 0 ? "clamp(320px,36vw,500px)" : "clamp(240px,26vw,360px)",
                height: "70svh",
                background: i % 2 === 0 ? "#0b0e0b" : "#111511",
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt={p.name}
                className="tilt-card-inner absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                style={{ padding: "clamp(20px,4vw,48px)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-6"
                style={{ background: "linear-gradient(to top, rgba(11,14,11,0.95), transparent)" }}>
                <p className="eyebrow text-[#e55f28] text-[9px] mb-1">{p.code}</p>
                <h3 className="heading text-[#eae6dd]" style={{ fontSize: "clamp(20px,3vw,32px)" }}>
                  {p.name.toUpperCase()}
                </h3>
                {p.is_new && <span className="inline-block mt-2 eyebrow bg-[#e55f28] text-white px-2 py-0.5 text-[8px]">YENİ</span>}
              </div>
              <div className="absolute top-5 right-5">
                <span className="eyebrow text-white/20 text-[9px]">{String(i+1).padStart(2,"0")}</span>
              </div>
            </div>
          ))}

          <a href="#contact"
            className="relative flex-none flex flex-col items-start justify-end p-8 bg-[#e55f28]"
            style={{ width: "clamp(200px,22vw,300px)", height: "70svh" }}>
            <p className="eyebrow text-white/60 mb-3 text-[10px]">B2B Teklif</p>
            <h3 className="heading text-white mb-6" style={{ fontSize: "clamp(28px,4vw,44px)" }}>
              KATALOG<br />İSTE
            </h3>
            <span className="eyebrow text-white border-b border-white/50 pb-1 text-[10px]">
              Formu Doldur →
            </span>
          </a>
        </div>
      </section>

      {/* Mobil: normal grid */}
      <section className="md:hidden bg-[#eae6dd]" data-bg="#eae6dd"
        style={{ paddingBlock: "clamp(56px,8vw,100px)", paddingInline: "clamp(20px,5vw,80px)" }}>
        <p className="anim-eyebrow eyebrow text-[#6b7366] mb-3">— Koleksiyon</p>
        <h2 className="anim-split-heading heading text-[#0b0e0b] mb-8"
          style={{ fontSize: "clamp(44px,10vw,72px)" }}>
          TÜM FORMLAR.
        </h2>
        <div className="anim-stagger-parent grid grid-cols-2 gap-3">
          {items.map((p, i) => (
            <a key={p.id} href="#contact"
              className="anim-stagger-child relative overflow-hidden aspect-[3/4]"
              style={{ background: i % 2 === 0 ? "#0b0e0b" : "#111511" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt={p.name}
                className="absolute inset-0 w-full h-full object-contain p-4" />
              <div className="absolute bottom-0 left-0 right-0 p-3"
                style={{ background: "linear-gradient(to top, rgba(11,14,11,0.9), transparent)" }}>
                <p className="eyebrow text-[#e55f28] text-[8px] mb-0.5">{p.code}</p>
                <p className="heading text-[#eae6dd] text-[14px]">{p.name}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
