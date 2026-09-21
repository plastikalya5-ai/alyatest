"use client";
import { useRef, useState } from "react";
import { IMG } from "@/data/images";

const ITEMS = [
  { code: "ALY-201", name: "VENÜS",         sub: "Menekşe Saksı",    img: IMG.venus    },
  { code: "ALY-601", name: "UFO",           sub: "Yuvarlak Saksı",   img: IMG.ufo      },
  { code: "ALY-333", name: "DANTEL",        sub: "Örgü Sepet",       img: IMG.orgu     },
  { code: "ALY-101", name: "3D MAVİ",       sub: "3D Geometrik",     img: IMG.d3mavi   },
  { code: "ALY-441", name: "VENÜS ASKILI",  sub: "Askılı Saksı",     img: IMG.venusAsk },
  { code: "ALY-311", name: "BALKON 3D",     sub: "Balkon Saksısı",   img: IMG.balkon   },
  { code: "ALY-502", name: "SANDIK",        sub: "Depolama Sandığı", img: IMG.sandik   },
  { code: "ALY-212", name: "KRİSTAL",       sub: "Kristal Saksı",    img: IMG.kristal  },
  { code: "ALY-555", name: "KAKTÜS",        sub: "Kozalak Saksı",    img: IMG.kaktus   },
  { code: "ALY-711", name: "ÇAMAŞIR",       sub: "Çamaşır Sepeti",   img: IMG.camasir  },
];

export default function Collection() {
  const ref    = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const drag   = useRef({ active: false, startX: 0, scrollL: 0 });

  const onDown = (e: React.MouseEvent) => {
    drag.current = { active: true, startX: e.pageX, scrollL: ref.current!.scrollLeft };
    ref.current!.style.cursor = "grabbing";
  };
  const onMove = (e: React.MouseEvent) => {
    if (!drag.current.active || !ref.current) return;
    e.preventDefault();
    ref.current.scrollLeft = drag.current.scrollL - (e.pageX - drag.current.startX);
  };
  const onUp = () => {
    drag.current.active = false;
    if (ref.current) ref.current.style.cursor = "grab";
  };

  const goTo = (i: number) => {
    setIdx(i);
    const el = ref.current?.children[i] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section id="collection" style={{ background: "var(--bg)", paddingBlock: "clamp(72px,9vw,130px)" }}>
      {/* Başlık */}
      <div className="pad flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-3" data-reveal style={{ color: "var(--orange)" }}>— Tüm Koleksiyon</p>
          <h2 className="heading" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
            200+ MODEL
          </h2>
        </div>
        <p className="eyebrow" data-reveal style={{ color: "var(--muted)" }}>Sürükle veya kaydır</p>
      </div>

      {/* Scroll track */}
      <div
        ref={ref}
        className="flex overflow-x-auto"
        style={{
          paddingInline: "var(--pad)",
          gap: 10,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          cursor: "grab",
        }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onScroll={() => {
          if (!ref.current) return;
          const { scrollLeft, clientWidth } = ref.current;
          const w = clientWidth * 0.72;
          setIdx(Math.round(scrollLeft / w));
        }}
      >
        {ITEMS.map((item, i) => (
          <div key={item.code}
            className="group relative flex-none overflow-hidden"
            style={{
              width: "clamp(220px, 68vw, 380px)",
              aspectRatio: "0.72",
              scrollSnapAlign: "start",
              background: i % 2 === 0 ? "var(--bg3)" : "var(--bg4)",
            }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt={item.name}
              className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              style={{ padding: "clamp(20px,5vw,48px)" }} />

            {/* Gradient */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to top, rgba(11,14,11,0.95) 0%, rgba(11,14,11,0.3) 45%, transparent 100%)"
            }} />

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <p className="eyebrow mb-1.5" style={{ color: "var(--orange)", fontSize: 9 }}>{item.code}</p>
              <h3 className="heading" style={{ fontSize: "clamp(22px,5vw,36px)", color: "var(--light)", marginBottom: 3 }}>
                {item.name}
              </h3>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>{item.sub}</p>
            </div>

            {/* Index */}
            <div className="absolute top-4 right-4">
              <span className="eyebrow" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}

        {/* Son kart — CTA */}
        <a href="#contact"
          className="relative flex-none flex flex-col justify-end p-6 sm:p-8"
          style={{ width: "clamp(160px, 50vw, 260px)", aspectRatio: "0.72", scrollSnapAlign: "start", background: "var(--orange)" }}>
          <p className="eyebrow mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>Tüm Katalog</p>
          <h3 className="heading" style={{ fontSize: "clamp(26px,5vw,40px)", color: "#fff", marginBottom: 20 }}>
            KATALOG<br />İSTE
          </h3>
          <span className="eyebrow" style={{ color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.5)", paddingBottom: 4, display: "inline-block" }}>
            Formu Doldur →
          </span>
        </a>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {ITEMS.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Ürün ${i + 1}`}
            style={{
              width: i === idx ? 24 : 6, height: 6, borderRadius: 3,
              background: i === idx ? "var(--orange)" : "rgba(255,255,255,0.15)",
              transition: "all 0.3s", border: 0, padding: 0, cursor: "pointer"
            }} />
        ))}
      </div>
    </section>
  );
}
