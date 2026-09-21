"use client";
import { useRef, useState } from "react";
import { IMG } from "@/data/images";

const items = [
  { code: "ALY-201", name: "VENÜS",        sub: "Menekşe Saksı",   img: IMG.venus,    cat: "Saksı"     },
  { code: "ALY-601", name: "UFO",          sub: "Yuvarlak Saksı",  img: IMG.ufo,      cat: "Saksı"     },
  { code: "ALY-333", name: "DANTEL",       sub: "Örgü Sepet",      img: IMG.orgu,     cat: "Sepet"     },
  { code: "ALY-101", name: "3D MAVİ",      sub: "3D Geometrik",    img: IMG.d3mavi,   cat: "Saksı"     },
  { code: "ALY-441", name: "VENÜS ASKILI", sub: "Askılı Saksı",    img: IMG.venusAsk, cat: "Saksı"     },
  { code: "ALY-311", name: "BALKON 3D",    sub: "Balkon Saksısı",  img: IMG.balkon,   cat: "Saksı"     },
  { code: "ALY-502", name: "SANDIK",       sub: "Depolama Sandığı",img: IMG.sandik,   cat: "Depolama"  },
  { code: "ALY-711", name: "ÇAMAŞIR",      sub: "Çamaşır Sepeti",  img: IMG.camasir,  cat: "Ev"        },
  { code: "ALY-212", name: "KRISTAL",      sub: "Kristal Saksı",   img: IMG.kristal,  cat: "Saksı"     },
  { code: "ALY-555", name: "KAKTÜS",       sub: "Kozalak Saksı",   img: IMG.kaktus,   cat: "Saksı"     },
];

export default function Collection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isDrag = useRef(false);
  const startX = useRef(0);
  const scrollL = useRef(0);

  const onDown  = (e: React.MouseEvent) => { isDrag.current = true; startX.current = e.pageX; scrollL.current = ref.current!.scrollLeft; };
  const onMove  = (e: React.MouseEvent) => { if (!isDrag.current || !ref.current) return; e.preventDefault(); ref.current.scrollLeft = scrollL.current - (e.pageX - startX.current); };
  const onUp    = () => { isDrag.current = false; };

  return (
    <section id="collection" style={{ background: "var(--bg)", paddingBlock: "clamp(80px,10vw,140px)" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12" style={{ paddingInline: "var(--pad)" }}>
        <div>
          <p className="eyebrow reveal-up" style={{ color: "var(--orange)", marginBottom: 14 }}>— Tüm Koleksiyon</p>
          <div className="clip">
            <h2 className="display reveal-up delay-1" style={{ fontSize: "clamp(48px,8vw,110px)" }}>200+ MODEL</h2>
          </div>
        </div>
        <p className="reveal-fade" style={{ fontSize: 13, color: "var(--muted)", maxWidth: 180, lineHeight: 1.7 }}>
          Sürükle veya parmakla kaydır
        </p>
      </div>

      {/* Track */}
      <div ref={ref}
        className="flex no-scrollbar overflow-x-auto reveal-fade"
        style={{
          paddingInline: "var(--pad)",
          gap: 10,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          cursor: "grab",
        }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      >
        {items.map((item, i) => (
          <a key={item.code} href="#contact"
            className="group relative flex-none overflow-hidden"
            style={{
              width: "clamp(240px, 32vw, 400px)",
              aspectRatio: "0.75",
              scrollSnapAlign: "start",
              background: i % 3 === 0 ? "var(--bg3)" : i % 3 === 1 ? "#141814" : "#131713",
              display: "block",
            }}
            onMouseEnter={() => setActive(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt={item.name}
              className="absolute inset-0 w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105" />

            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,13,11,1) 0%, rgba(10,13,11,0.5) 40%, transparent 100%)" }} />

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="eyebrow mb-2" style={{ color: "var(--orange)", fontSize: 9 }}>{item.code} · {item.cat}</p>
              <h3 className="display" style={{ fontSize: "clamp(24px,4vw,38px)", color: "var(--light)", marginBottom: 4 }}>{item.name}</h3>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>{item.sub}</p>
            </div>

            {/* Index */}
            <div className="absolute top-5 right-5">
              <span className="eyebrow" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Hover CTA */}
            <div className="absolute top-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="eyebrow" style={{ fontSize: 9, padding: "5px 10px", background: "var(--orange)", color: "#fff" }}>
                Teklif →
              </span>
            </div>
          </a>
        ))}

        {/* Last card — CTA */}
        <div className="flex-none flex flex-col items-start justify-end p-8"
          style={{ width: "clamp(180px, 22vw, 280px)", aspectRatio: "0.75", scrollSnapAlign: "start", background: "var(--orange)" }}>
          <p className="eyebrow mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>Tüm Katalog</p>
          <h3 className="display" style={{ fontSize: "clamp(28px,4vw,44px)", color: "#fff", marginBottom: 24 }}>
            200+<br />ÜRÜN
          </h3>
          <a href="#contact" className="eyebrow" style={{ color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.5)", paddingBottom: 4 }}>
            Katalog İste →
          </a>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8" style={{ paddingInline: "var(--pad)" }}>
        {items.map((_, i) => (
          <button key={i} onClick={() => {
            setActive(i);
            const el = ref.current?.children[i] as HTMLElement;
            el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
          }}
            style={{ width: i === active ? 28 : 6, height: 6, borderRadius: 3, background: i === active ? "var(--orange)" : "rgba(255,255,255,0.15)", transition: "all 0.3s", border: 0, cursor: "pointer", padding: 0 }} />
        ))}
      </div>
    </section>
  );
}
