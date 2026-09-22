"use client";
import { useRef, useState } from "react";
import { IMG } from "@/data/images";

const ITEMS = [
  { code:"ALY-201", name:"VENÜS",        sub:"Menekşe Saksı",    img:IMG.venus,    bg:"#181d18" },
  { code:"ALY-601", name:"UFO",          sub:"Yuvarlak Saksı",   img:IMG.ufo,      bg:"#1e241e" },
  { code:"ALY-333", name:"DANTEL",       sub:"Örgü Sepet",       img:IMG.orgu,     bg:"#181d18" },
  { code:"ALY-101", name:"3D MAVİ",      sub:"3D Geometrik",     img:IMG.d3mavi,   bg:"#1e241e" },
  { code:"ALY-441", name:"VENÜS ASKILI", sub:"Askılı Saksı",     img:IMG.venusAsk, bg:"#181d18" },
  { code:"ALY-311", name:"BALKON 3D",    sub:"Balkon Saksısı",   img:IMG.balkon,   bg:"#1e241e" },
  { code:"ALY-502", name:"SANDIK",       sub:"Depolama Sandığı", img:IMG.sandik,   bg:"#181d18" },
  { code:"ALY-212", name:"KRİSTAL",      sub:"Kristal Saksı",    img:IMG.kristal,  bg:"#1e241e" },
  { code:"ALY-555", name:"KAKTÜS",       sub:"Kozalak Saksı",    img:IMG.kaktus,   bg:"#181d18" },
  { code:"ALY-711", name:"ÇAMAŞIR",      sub:"Çamaşır Sepeti",   img:IMG.camasir,  bg:"#1e241e" },
];

export default function Collection() {
  const ref  = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const drag = useRef({ on: false, sx: 0, sl: 0 });

  const onDown = (e: React.MouseEvent) => {
    drag.current = { on: true, sx: e.pageX, sl: ref.current!.scrollLeft };
    if (ref.current) ref.current.style.cursor = "grabbing";
  };
  const onMove = (e: React.MouseEvent) => {
    if (!drag.current.on || !ref.current) return;
    e.preventDefault();
    ref.current.scrollLeft = drag.current.sl - (e.pageX - drag.current.sx);
  };
  const onUp = () => {
    drag.current.on = false;
    if (ref.current) ref.current.style.cursor = "grab";
  };

  return (
    <section id="collection" className="bg-[#0b0e0b]" style={{ paddingBlock: "clamp(72px,9vw,130px)" }}>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-10" style={{ paddingInline: "clamp(20px,5vw,80px)" }}>
        <div>
          <p className="eyebrow text-[#e55f28] mb-3" data-reveal>— Tüm Koleksiyon</p>
          <h2 className="heading text-[#eae6dd]" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
            200+ MODEL
          </h2>
        </div>
        <p className="eyebrow text-[#6b7366]" data-reveal="fade">Sürükle veya kaydır</p>
      </div>

      {/* Track */}
      <div ref={ref}
        className="flex overflow-x-auto"
        style={{ paddingInline: "clamp(20px,5vw,80px)", gap: 10, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", cursor: "grab" }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onScroll={() => {
          if (!ref.current) return;
          setIdx(Math.round(ref.current.scrollLeft / (ref.current.clientWidth * 0.68)));
        }}>

        {ITEMS.map((item, i) => (
          <a key={item.code} href="#contact"
            className="group relative flex-none overflow-hidden"
            style={{ width: "clamp(220px,65vw,380px)", aspectRatio: "0.72", scrollSnapAlign: "start", background: item.bg, display: "block" }}>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt={item.name}
              className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              style={{ padding: "clamp(20px,5vw,48px)" }} />

            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,14,11,0.95) 0%, rgba(11,14,11,0.25) 45%, transparent 100%)" }} />

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <p className="eyebrow text-[#e55f28] mb-1.5" style={{ fontSize: 9 }}>{item.code}</p>
              <h3 className="heading text-[#eae6dd]" style={{ fontSize: "clamp(22px,5vw,36px)", marginBottom: 3 }}>{item.name}</h3>
              <p className="text-[#6b7366]" style={{ fontSize: 12 }}>{item.sub}</p>
            </div>

            <div className="absolute top-4 right-4">
              <span className="eyebrow text-white/20" style={{ fontSize: 9 }}>{String(i+1).padStart(2,"0")}</span>
            </div>
          </a>
        ))}

        {/* CTA kartı */}
        <a href="#contact"
          className="relative flex-none flex flex-col justify-end p-6 sm:p-8 bg-[#e55f28]"
          style={{ width: "clamp(160px,48vw,260px)", aspectRatio: "0.72", scrollSnapAlign: "start" }}>
          <p className="eyebrow text-white/60 mb-3">Tüm Katalog</p>
          <h3 className="heading text-white mb-5" style={{ fontSize: "clamp(26px,5vw,40px)" }}>KATALOG<br />İSTE</h3>
          <span className="eyebrow text-white border-b border-white/50 pb-1 inline-block" style={{ fontSize: 10 }}>
            Formu Doldur →
          </span>
        </a>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {ITEMS.map((_, i) => (
          <button key={i} onClick={() => {
            setIdx(i);
            const el = ref.current?.children[i] as HTMLElement;
            el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
          }}
            className="h-1.5 rounded-sm transition-all duration-300"
            style={{ width: i === idx ? 24 : 6, background: i === idx ? "#e55f28" : "rgba(255,255,255,0.15)" }} />
        ))}
      </div>
    </section>
  );
}
