"use client";
import { useRef, useState } from "react";
import { IMG } from "@/data/images";

const items = [
  { code: "ALY-201", name: "VENÜS", sub: "Menekşe Saksı", img: IMG.venus, cat: "Saksı" },
  { code: "ALY-601", name: "UFO", sub: "Yuvarlak Saksı", img: IMG.ufo, cat: "Saksı" },
  { code: "ALY-333", name: "DANTEL", sub: "Örgü Sepet", img: IMG.dantel, cat: "Sepet" },
  { code: "ALY-101", name: "3D MAVİ", sub: "3D Saksı", img: IMG.d3mavi, cat: "Saksı" },
  { code: "ALY-441", name: "VENÜS ASKILI", sub: "Askılı Saksı", img: IMG.venusAsk, cat: "Saksı" },
  { code: "ALY-311", name: "BALKON", sub: "3D Balkon", img: IMG.balkon, cat: "Saksı" },
  { code: "ALY-502", name: "SANDIK", sub: "Depolama Sandığı", img: IMG.sandik, cat: "Depolama" },
  { code: "ALY-711", name: "ÇAMAŞIR", sub: "Çamaşır Sepeti", img: IMG.camasir, cat: "Ev" },
];

export default function Collection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollL = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0);
    scrollL.current = ref.current?.scrollLeft ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = scrollL.current - (x - startX.current);
  };
  const onMouseUp = () => setIsDragging(false);

  return (
    <section id="collection" style={{ background: "var(--dark)", paddingBlock: "clamp(80px,10vw,140px)" }}>
      <div style={{ paddingInline: "var(--pad)", marginBottom: 48 }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow reveal" style={{ color: "var(--orange)", marginBottom: 16 }}>— Tüm Ürünler</p>
            <div className="clip">
              <h2 className="display reveal-title" style={{ fontSize: "clamp(52px,8vw,120px)" }}>
                200+ MODEL
              </h2>
            </div>
          </div>
          <p className="hidden md:block reveal" style={{ maxWidth: 220, fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>
            Sürükle veya kaydır
          </p>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div ref={ref}
        className="flex overflow-x-auto gap-3 select-none"
        style={{
          paddingInline: "var(--pad)",
          paddingBottom: 8,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {items.map((item, i) => (
          <div key={item.code}
            className="relative flex-none overflow-hidden group"
            style={{
              width: "clamp(260px,35vw,420px)",
              aspectRatio: "0.78",
              scrollSnapAlign: "start",
              background: i % 3 === 0 ? "#1e2420" : i % 3 === 1 ? "#1a1c1b" : "#191e1a",
            }}
            onMouseEnter={() => setActive(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt={item.name}
              className="absolute inset-0 w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700" />

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-6"
              style={{ background: "linear-gradient(to top, rgba(14,18,16,0.95) 0%, transparent 100%)", paddingTop: 80 }}>
              <div className="flex justify-between items-end">
                <div>
                  <p className="eyebrow mb-1" style={{ color: "var(--orange)", fontSize: 10 }}>{item.code} · {item.cat}</p>
                  <h3 className="display text-white" style={{ fontSize: "clamp(28px,4vw,42px)" }}>{item.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{item.sub}</p>
                </div>
                <a href="#contact"
                  className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                  style={{ width: 44, height: 44, background: "var(--orange)", color: "var(--dark)", fontSize: 18, flexShrink: 0 }}>
                  ↗
                </a>
              </div>
            </div>

            {/* Index */}
            <div className="absolute top-5 right-5">
              <span className="eyebrow" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>0{i + 1}</span>
            </div>
          </div>
        ))}

        {/* CTA card */}
        <div className="relative flex-none flex flex-col items-center justify-center"
          style={{ width: "clamp(200px,25vw,300px)", aspectRatio: "0.78", background: "var(--orange)", scrollSnapAlign: "start" }}>
          <p className="display text-center" style={{ fontSize: "clamp(28px,4vw,42px)", color: "var(--dark)", marginBottom: 24 }}>
            TÜMÜNÜ<br />KEŞFEDİN
          </p>
          <a href="#contact"
            className="px-6 py-3 text-xs uppercase tracking-widest font-semibold border border-current hover:bg-black hover:text-white transition-colors"
            style={{ color: "var(--dark)" }}>
            Katalog İste →
          </a>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-8" style={{ paddingInline: "var(--pad)" }}>
        {items.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 24 : 6,
              height: 6,
              background: i === active ? "var(--orange)" : "rgba(255,255,255,0.15)",
            }} />
        ))}
      </div>
    </section>
  );
}
