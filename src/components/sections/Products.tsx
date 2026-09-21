import Image from "next/image";
import { editorialProducts } from "@/data/products";

export default function Products() {
  return (
    <section
      id="products"
      style={{
        background: "var(--light)",
        color: "var(--dark)",
        padding: "90px 0 100px",
      }}
    >
      <div style={{ paddingInline: "var(--pad)" }}>
        {/* Head */}
        <div
          className="grid items-end"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "5vw" }}
        >
          <div>
            <p className="eyebrow" style={{ color: "#727768" }}>05 — ÜRÜN YELPAZESİ</p>
            <h2
              id="products-title"
              className="display"
              style={{ fontSize: "clamp(75px, 11vw, 165px)", marginTop: 25 }}
            >
              TÜM MODELLER
            </h2>
          </div>
          <p
            style={{
              maxWidth: 250,
              justifySelf: "end",
              fontSize: 15,
              lineHeight: 1.7,
              color: "#62675e",
            }}
          >
            Saksı, sepet, sandık ve banyo kategorilerinde 200&apos;den fazla model. Tüm ürünler B2B fiyatlandırması ile sunulmaktadır.
          </p>
        </div>

        {/* Grid */}
        <div
          className="grid mt-24"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "0 2.5vw",
            alignItems: "start",
          }}
        >
          {editorialProducts.map((p, i) => {
            const colPatterns = [
              "1 / 8", "9 / 13", "2 / 6", "7 / 13", "1 / 6", "7 / 12",
            ];
            const marginPatterns = [0, 160, -50, 70, 0, 150];
            return (
              <article
                key={p.code}
                style={{
                  gridColumn: colPatterns[i % 6],
                  marginTop: marginPatterns[i % 6],
                  marginBottom: 90,
                }}
              >
                <div
                  className="group relative overflow-hidden"
                  style={{
                    aspectRatio: i % 2 === 0 ? "1.1" : "0.8",
                    background: i % 2 === 0 ? "#dedfd4" : "#ddd8ca",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <span
                    className="absolute top-5 left-5"
                    style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#727768" }}
                  >
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
                <div className="flex justify-between gap-4 mt-5">
                  <div>
                    <h3 style={{ fontSize: 21, fontWeight: 400, lineHeight: 1.2 }}>{p.name}</h3>
                    <p style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#707569", marginTop: 8 }}>
                      B2B · TOPLU SİPARİŞ
                    </p>
                  </div>
                  <a href="#contact" style={{ fontSize: 22 }} aria-label="İncele">↗</a>
                </div>
              </article>
            );
          })}
        </div>

        {/* More */}
        <a
          href="#contact"
          className="flex justify-between w-full"
          style={{
            borderTop: "1px solid #1b241a50",
            borderBottom: "1px solid #1b241a50",
            padding: "25px 0",
            fontSize: 16,
          }}
        >
          <span>TÜM KATALOĞU GÖRÜNTÜLE</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}
