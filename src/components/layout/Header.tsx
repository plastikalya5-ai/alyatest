"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Settings } from "@/lib/supabase";

const NAV = [
  { href: "#products",   label: "Ürünler"    },
  { href: "#collection", label: "Koleksiyon" },
  { href: "#why",        label: "Neden Alya" },
  { href: "#contact",    label: "İletişim"   },
];

export default function Header({ settings }: { settings: Settings | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const wa = settings?.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g,"")}` : "https://wa.me/905357616524";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-80 flex items-center justify-between h-[68px] bg-[#0b0e0b] transition-all duration-500 ${
        scrolled || open ? "shadow-[0_8px_24px_rgba(11,14,11,0.18)] border-b border-white/8" : "border-b border-transparent"
      }`} style={{ paddingInline: "clamp(20px,5vw,80px)" }}>

        <Link href="/" className="flex items-baseline shrink-0">
          <span className="heading text-white" style={{ fontSize: "clamp(17px,2.5vw,22px)" }}>ALYA</span>
          <span className="heading text-[#e55f28]" style={{ fontSize: "clamp(17px,2.5vw,22px)" }}>PLASTİK</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {NAV.map(l => (
            <a key={l.href} href={l.href} className="eyebrow text-[#6b7366] hover:text-white transition-colors duration-200">
              {l.label}
            </a>
          ))}
        </nav>

        <a href={wa} target="_blank" rel="noopener noreferrer nofollow"
          className="hidden md:inline-flex items-center gap-2 bg-[#e55f28] hover:bg-[#c94f1e] text-white text-[10px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5 transition-colors shrink-0">
          Teklif Al →
        </a>

        <button onClick={() => setOpen(p => !p)} aria-label="Menü"
          className="md:hidden flex flex-col items-end justify-center gap-1.5 w-10 h-10 shrink-0">
          {[0,1,2].map(i => (
            <span key={i} className="block h-[1.5px] bg-[#eae6dd] rounded-sm transition-all duration-300"
              style={{ width: i===1?(open?0:18):26, opacity:i===1&&open?0:1,
                transform: i===0&&open?"rotate(45deg) translate(5px,5px)":i===2&&open?"rotate(-45deg) translate(5px,-5px)":"none" }} />
          ))}
        </button>
      </header>

      <div className={`fixed inset-0 z-79 md:hidden flex flex-col justify-between transition-opacity duration-350 ${open?"opacity-100 pointer-events-auto":"opacity-0 pointer-events-none"}`}
        style={{ paddingTop:68, paddingInline:"clamp(20px,5vw,80px)", paddingBottom:32, background:"rgba(11,14,11,0.97)", backdropFilter:"blur(20px)" }}>
        <nav className="pt-6">
          {NAV.map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="heading block border-b border-white/8 py-4 text-[#6b7366] hover:text-white transition-colors"
              style={{ fontSize:"clamp(36px,9vw,52px)", opacity:open?1:0, transform:open?"none":"translateY(10px)",
                transition:`color .2s, opacity .35s ${i*.06}s, transform .35s ${i*.06}s` }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <a href={wa} target="_blank" rel="noopener noreferrer nofollow"
            className="flex items-center justify-center gap-2 bg-[#e55f28] text-white text-[10px] font-semibold tracking-[0.14em] uppercase py-4">
            WhatsApp ile Teklif Al →
          </a>
          <a href={`tel:${settings?.phone?.replace(/\D/g,"") ?? "902126718565"}`}
            className="flex items-center justify-center border border-white/20 text-[#eae6dd] text-[10px] font-semibold tracking-[0.14em] uppercase py-4">
            {settings?.phone ?? "+90 212 671 85 65"}
          </a>
        </div>
      </div>
    </>
  );
}
