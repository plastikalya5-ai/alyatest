"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const links = [
  { href: "#products",    label: "Ürünler" },
  { href: "#collection",  label: "Koleksiyon" },
  { href: "#why",         label: "Neden Alya" },
  { href: "#contact",     label: "İletişim" },
];

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* ── Main header ───────────────────────────────── */}
      <header
        className="fixed inset-x-0 top-0 z-[80] flex items-center justify-between transition-all duration-500"
        style={{
          height: scrolled ? 64 : 80,
          paddingInline: "var(--pad)",
          background:    scrolled ? "rgba(10,13,11,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          borderBottom:  scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        {/* Logo */}
        <Link href="/" aria-label="Alya Plastik" className="flex items-baseline gap-px">
          <span className="display text-white" style={{ fontSize: "clamp(17px,2.2vw,22px)", letterSpacing: "-0.04em" }}>
            ALYA
          </span>
          <span className="display" style={{ fontSize: "clamp(17px,2.2vw,22px)", letterSpacing: "-0.04em", color: "var(--orange)" }}>
            PLASTİK
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <a key={l.href} href={l.href}
              className="eyebrow transition-colors duration-200 hover:text-white"
              style={{ color: "var(--muted)" }}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
          className="btn-orange hidden md:inline-flex" style={{ padding: "11px 24px", fontSize: 10 }}>
          Teklif Al →
        </a>

        {/* Hamburger */}
        <button onClick={() => setMenuOpen(p => !p)} aria-label="Menü"
          className="md:hidden relative w-8 h-8 flex flex-col justify-center gap-[6px]">
          {[0, 1, 2].map(i => (
            <span key={i} className="block h-px transition-all duration-300 origin-center"
              style={{
                background: "var(--light)",
                width: i === 1 ? (menuOpen ? 0 : 20) : 26,
                opacity:    i === 1 ? (menuOpen ? 0 : 1) : 1,
                transform:  i === 0 && menuOpen ? "rotate(45deg) translate(4px,4px)"
                          : i === 2 && menuOpen ? "rotate(-45deg) translate(4px,-4px)"
                          : "none",
              }} />
          ))}
        </button>
      </header>

      {/* ── Mobile menu ───────────────────────────────── */}
      <div
        className="fixed inset-x-0 z-[79] md:hidden transition-all duration-500 overflow-hidden"
        style={{
          top: 64,
          maxHeight: menuOpen ? "100svh" : 0,
          background: "rgba(10,13,11,0.98)",
          backdropFilter: "blur(24px)",
          borderBottom: menuOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div style={{ paddingInline: "var(--pad)", paddingBlock: 24 }}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block py-5 border-b transition-colors hover:text-white"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                color: "var(--muted)",
                fontSize: "clamp(26px,7vw,38px)",
                fontFamily: "var(--display)",
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                transitionDelay: menuOpen ? `${i * 55}ms` : "0ms",
              }}>
              {l.label}
            </a>
          ))}
          <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
            className="btn-orange w-full justify-center mt-6">
            WhatsApp ile Teklif Al →
          </a>
        </div>
      </div>
    </>
  );
}
