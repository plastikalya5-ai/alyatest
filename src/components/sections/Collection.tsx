"use client";
import { useRef, useState } from "react";
import type { Product } from "@/lib/supabase";

export default function Collection({ products }: { products: Product[] }) {
  const ref  = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const drag = useRef({ on:false, sx:0, sl:0 });

  const onDown = (e: React.MouseEvent) => { drag.current = { on:true, sx:e.pageX, sl:ref.current!.scrollLeft }; if(ref.current) ref.current.style.cursor="grabbing"; };
  const onMove = (e: React.MouseEvent) => { if(!drag.current.on||!ref.current) return; e.preventDefault(); ref.current.scrollLeft = drag.current.sl-(e.pageX-drag.current.sx); };
  const onUp   = () => { drag.current.on=false; if(ref.current) ref.current.style.cursor="grab"; };

  const BG = ["#181d18","#1e241e","#161b16","#1a1f1a"];

  return (
    <section id="collection" className="bg-[#eae6dd]" data-bg="#eae6dd" style={{ paddingBlock:"clamp(72px,9vw,130px)" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10" style={{ paddingInline:"clamp(20px,5vw,80px)" }}>
        <div>
          <h2 className="anim-split-heading heading text-[#0b0e0b]" style={{ fontSize:"clamp(44px,7vw,96px)" }}>
            {products.length}+ MODEL
          </h2>
        </div>
        <p className="anim-up eyebrow text-[#6b7366]">Sürükle veya kaydır</p>
      </div>

      <div ref={ref} className="flex overflow-x-auto" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        style={{ paddingInline:"clamp(20px,5vw,80px)", gap:10, scrollSnapType:"x mandatory", WebkitOverflowScrolling:"touch", scrollbarWidth:"none", cursor:"grab" }}
        onScroll={() => { if(!ref.current) return; setIdx(Math.round(ref.current.scrollLeft/(ref.current.clientWidth*0.68))); }}>

        {products.map((item, i) => (
          <a key={item.id} href="#contact"
            className="group relative flex-none overflow-hidden"
            style={{ width:"clamp(220px,65vw,380px)", aspectRatio:"0.72", scrollSnapAlign:"start", background:BG[i%4], display:"block" }}>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.name}
              className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              style={{ padding:"clamp(20px,5vw,48px)" }} />

            <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(11,14,11,0.95) 0%, rgba(11,14,11,0.25) 45%, transparent 100%)" }} />

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <div className="flex gap-1.5 mb-2">
                <p className="eyebrow text-[#e55f28] text-[9px]">{item.code}</p>
                {item.is_new && <span className="eyebrow text-white bg-[#e55f28] text-[9px] px-1.5">Yeni</span>}
              </div>
              <h3 className="heading text-[#eae6dd]" style={{ fontSize:"clamp(22px,5vw,36px)", marginBottom:3 }}>{item.name.toUpperCase()}</h3>
              <p className="text-[#6b7366] text-xs">{item.category}</p>
            </div>

            <div className="absolute top-4 right-4">
              <span className="eyebrow text-white/20 text-[9px]">{String(i+1).padStart(2,"0")}</span>
            </div>
          </a>
        ))}

        <a href="#contact" className="relative flex-none flex flex-col justify-end p-6 sm:p-8 bg-[#e55f28]"
          style={{ width:"clamp(160px,48vw,260px)", aspectRatio:"0.72", scrollSnapAlign:"start" }}>
          <p className="eyebrow text-white/60 mb-3">Tüm Katalog</p>
          <h3 className="heading text-white mb-5" style={{ fontSize:"clamp(26px,5vw,40px)" }}>KATALOG<br />İSTE</h3>
          <span className="eyebrow text-white border-b border-white/50 pb-1 inline-block text-[10px]">Formu Doldur →</span>
        </a>
      </div>

      <div className="flex justify-center gap-1.5 mt-6">
        {products.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); const el=ref.current?.children[i] as HTMLElement; el?.scrollIntoView({behavior:"smooth",inline:"start",block:"nearest"}); }}
            className="h-1.5 rounded-sm transition-all duration-300"
            style={{ width:i===idx?24:6, background:i===idx?"#e55f28":"rgba(255,255,255,0.15)" }} />
        ))}
      </div>
    </section>
  );
}
