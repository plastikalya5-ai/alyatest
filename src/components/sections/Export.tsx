"use client";
import { useEffect, useRef } from "react";

const COUNTRIES = ["Almanya","Fransa","İtalya","Polonya","Romanya","İngiltere","Hollanda","İspanya","Irak","İran","Suudi Arabistan","BAE","Libya","Mısır","Fas","Kazakistan","Azerbaycan","Nijerya","Gürcistan"];

export default function Export() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let x = 0, raf: number;
    const half = el.scrollWidth / 2;
    const tick = () => { x -= 0.4; if (Math.abs(x) >= half) x = 0; el.style.transform = `translateX(${x}px)`; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="bg-[#0b0e0b] overflow-hidden" style={{ paddingBlock: "clamp(72px,9vw,130px)" }}>
      <div className="mb-12" style={{ paddingInline: "clamp(20px,5vw,80px)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-end">
          <div>
            <p className="eyebrow text-[#e55f28] mb-3" data-reveal>— Global Erişim</p>
            <h2 className="heading text-[#eae6dd]" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
              20+ ÜLKE.
            </h2>
          </div>
          <div data-reveal data-delay="2">
            <p className="font-light leading-loose text-[#6b7366] mb-6" style={{ fontSize: "clamp(14px,1.4vw,16px)" }}>
              Avrupa&apos;dan Orta Doğu&apos;ya, Afrika&apos;dan Orta Asya&apos;ya. Tüm lojistik ve gümrük dokümantasyon desteği ile kapıdan kapıya teslimat.
            </p>
            <a href="#contact" className="eyebrow text-[#6b7366] hover:text-white transition-colors border-b border-white/12 pb-1.5 inline-block">
              İhracat hakkında bilgi al →
            </a>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-y border-white/8 py-[18px]">
        <div ref={ref} className="flex whitespace-nowrap w-max">
          {[...COUNTRIES, ...COUNTRIES].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-4 eyebrow text-[#6b7366] text-[11px]">
              {c} <span className="text-[#e55f28] opacity-40 text-[6px]">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
