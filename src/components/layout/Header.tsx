"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const NAV = [
  { href: "#products",   label: "Ürünler"    },
  { href: "#collection", label: "Koleksiyon" },
  { href: "#why",        label: "Neden Alya" },
  { href: "#contact",    label: "İletişim"   },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Body scroll lock when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[80] flex items-center justify-between"
        style={{
          height: 68,
          paddingInline: "var(--pad)",
          background: scrolled || open ? "rgba(11,14,11,0.95)" : "transparent",
          backdropFilter: scrolled || open ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          transition: "background 0.4s, border-color 0.4s",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-0.5 shrink-0">
          <span className="heading text-white" style={{ fontSize: "clamp(16px,2.5vw,21px)" }}>ALYA</span>
          <span className="heading" style={{ fontSize: "clamp(16px,2.5vw,21px)", color: "var(--orange)" }}>PLASTİK</span>
        </Link>

        {/* Desktop nav — center */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV.map(l => (
            <a key={l.href} href={l.href} className="eyebrow transition-colors hover:text-white"
              style={{ color: "var(--muted)" }}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
          className="btn btn-fill hidden md:inline-flex" style={{ padding: "10px 22px", fontSize: 10 }}>
          Teklif Al →
        </a>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(p => !p)} aria-label="Menü"
          className="md:hidden flex flex-col justify-center gap-1.5 w-10 h-10 items-end ml-auto">
          <span className="block h-px bg-white transition-all duration-300"
            style={{ width: 24, transform: open ? "rotate(45deg) translate(0px, 6px)" : "none" }} />
          <span className="block h-px bg-white transition-all duration-300"
            style={{ width: open ? 0 : 16, opacity: open ? 0 : 1 }} />
          <span className="block h-px bg-white transition-all duration-300"
            style={{ width: 24, transform: open ? "rotate(-45deg) translate(0px, -6px)" : "none" }} />
        </button>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className="fixed inset-0 z-[79] md:hidden flex flex-col justify-between transition-all duration-500"
        style={{
          background: "rgba(11,14,11,0.98)",
          paddingTop: 68,
          paddingInline: "var(--pad)",
          paddingBottom: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          backdropFilter: "blur(20px)",
        }}
      >
        <nav className="flex flex-col pt-8">
          {NAV.map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="heading border-b py-5 transition-colors hover:text-white"
              style={{
                fontSize: "clamp(36px,10vw,52px)",
                color: "var(--muted)",
                borderColor: "var(--border)",
                transitionDelay: open ? `${i * 60}ms` : "0ms",
                transform: open ? "none" : "translateY(16px)",
                opacity: open ? 1 : 0,
                transition: "color 0.2s, opacity 0.4s, transform 0.4s",
              }}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
            className="btn btn-fill w-full justify-center">
            WhatsApp ile Teklif Al →
          </a>
          <a href="tel:+902126718565" className="btn btn-line w-full justify-center">
            +90 212 671 85 65
          </a>
        </div>
      </div>
    </>
  );
}
