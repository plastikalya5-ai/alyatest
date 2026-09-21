import Image from "next/image";
import { editorialProducts } from "@/data/products";

export default function Products() {
  return (
    <section id="products" style={{ background: "var(--light)", color: "var(--dark)", padding: "90px 0 100px" }}>
      <div style={{ paddingInline: "var(--pad)" }}>

        {/* Head */}
        <div className="grid md:grid-cols-2 grid-cols-1 items-end" style={{ gap: "5vw" }}>
          <div>
            <p className="eyebrow" style={{ color: "#727768" }}>05 — ÜRÜN YELPAZESİ</p>
            <h2 id="products-title" className="display" style={{ fontSize: "clamp(64px, 11vw, 165px)", marginTop: 25 }}>
              TÜM MODELLER
            </h2>
          </div>
          <p className="md:justify-self-end" style={{ maxWidth: 250, fontSize: 15, lineHeight: 1.7, color: "#62675e" }}>
            Saksı, sepet, sandık ve banyo kategorilerinde 200&apos;den fazla model. Tüm ürünler B2B fiyatlandırması ile sunulmaktadır.
          </p>
        </div>

        {/* Mobil: 2 kolon grid; Desktop: editorial offsets */}
        <div className="hidden md:grid mt-24"
          style={{ gridTemplateColumns: "repeat(12, 1fr)", gap: "0 2.5vw", alignItems: "start" }}>
          {editorialProducts.map((p, i) => {
            const cols = ["1 / 8", "9 / 13", "2 / 6", "7 / 13", "1 / 6", "7 / 12"];
            const tops = [0, 160, -50, 70, 0, 150];
            return (
              <article key={p.code} style={{ gridColumn: cols[i % 6], marginTop: tops[i % 6], marginBottom: 90 }}>
                <ProductCard p={p} i={i} />
              </article>
            );
          })}
        </div>

        {/* Mobil grid */}
        <div className="grid md:hidden grid-cols-2 gap-6 mt-12">
          {editorialProducts.map((p, i) => (
            <article key={p.code}>
              <ProductCard p={p} i={i} />
            </article>
          ))}
        </div>

        <a href="#contact" className="flex justify-between w-full mt-8"
          style={{ borderTop: "1px solid #1b241a50", borderBottom: "1px solid #1b241a50", padding: "25px 0", fontSize: 16 }}>
          <span>TÜM KATALOĞU GÖRÜNTÜLE</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}

function ProductCard({ p, i }: { p: { code: string; name: string; image: string }; i: number }) {
  return (
    <>
      <div
        className="group relative overflow-hidden"
        style={{
          aspectRatio: i % 2 === 0 ? "1.1" : "0.8",
          background: i % 2 === 0 ? "#dedfd4" : "#ddd8ca",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span className="absolute top-4 left-4" style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#727768" }}>
          {p.code}
        </span>
        <Image
          src={p.image}
          alt={p.name}
          width={300}
          height={360}
          className="transition-transform duration-500 group-hover:scale-105"
          style={{ width: "72%", height: "75%", objectFit: "contain" }}
        />
      </div>
      <div className="flex justify-between gap-3 mt-4">
        <div>
          <h3 style={{ fontSize: "clamp(16px, 2vw, 21px)", fontWeight: 400, lineHeight: 1.2 }}>{p.name}</h3>
          <p style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#707569", marginTop: 6 }}>
            B2B · TOPLU SİPARİŞ
          </p>
        </div>
        <a href="#contact" style={{ fontSize: 20 }} aria-label="İncele">↗</a>
      </div>
    </>
  );
}
