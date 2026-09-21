"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { products } from "@/data/products";

export default function Collection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const scroll = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(products.length - 1, current + dir));
    setCurrent(next);
    if (!viewportRef.current) return;
    const panel = viewportRef.current.children[next] as HTMLElement;
    panel?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section id="collection" style={{ background: "#dedfcf", color: "var(--dark)", overflow: "hidden" }}>

      {/* Head */}
      <div className="flex justify-between items-end" style={{ paddingInline: "var(--pad)", paddingTop: 70 }}>
        <div>
          <p className="eyebrow" style={{ color: "#727768", marginBottom: 8 }}>KOLEKSİYON</p>
          <h2 id="gallery-title" className="display" style={{ fontSize: "clamp(52px, 8vw, 120px)" }}>
            TÜM FORMLAR
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => scroll(-1)}
            disabled={current === 0}
            className="border rounded-full grid place-items-center transition-opacity disabled:opacity-30"
            style={{ width: 42, height: 42, borderColor: "#191c1950", fontSize: 22 }}
            aria-label="Önceki"
          >←</button>
          <button
            onClick={() => scroll(1)}
            disabled={current === products.length - 1}
            className="border rounded-full grid place-items-center transition-opacity disabled:opacity-30"
            style={{ width: 42, height: 42, borderColor: "#191c1950", fontSize: 22 }}
            aria-label="Sonraki"
          >→</button>
        </div>
      </div>

      {/* Scrollable track */}
      <div
        ref={viewportRef}
        className="flex overflow-x-auto"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {products.map((p) => (
          <article
            key={p.id}
            className="relative flex-none overflow-hidden"
            style={{
              width: "clamp(300px, 82vw, 900px)",
              height: "76svh",
              minHeight: 560,
              scrollSnapAlign: "start",
              borderRight: "1px solid #191c1925",
              padding: "40px var(--pad)",
            }}
          >
            <span className="absolute top-10 eyebrow" style={{ left: "var(--pad)", fontSize: 12, color: "#5b6250" }}>
              {p.code}
            </span>

            <Image
              src={p.image}
              alt={p.name}
              width={400}
              height={500}
              className="absolute"
              style={{ width: "51%", height: "73%", objectFit: "contain", right: "7%", top: "2%", zIndex: 2 }}
            />

            <div className="absolute" style={{ bottom: 50, left: "var(--pad)", zIndex: 3 }}>
              <span className="block eyebrow" style={{ color: "#5b6250", marginBottom: 20 }}>ÜRÜN / {p.panelNum}</span>
              <h3 className="display" style={{ fontSize: "clamp(72px, 13vw, 220px)" }}>{p.name}</h3>
            </div>

            <a
              href="#contact"
              className="absolute hover:opacity-70 transition-opacity"
              style={{ right: "5vw", bottom: 55, borderBottom: "1px solid currentColor", paddingBottom: 9, fontSize: 13, zIndex: 5 }}
            >
              YAKINDAN İNCELE ↗
            </a>
          </article>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between" style={{ paddingInline: "var(--pad)", paddingBlock: "12px 25px", fontSize: 11, letterSpacing: "0.12em" }}>
        <span>{current + 1} / {products.length}</span>
        <span style={{ color: "#5b6250" }}>SÜRÜKLE &amp; KAYDIR</span>
      </div>
    </section>
  );
}
