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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[80]"
        style={{
          height: 68,
          paddingInline: "var(--pad)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled || open ? "rgba(11,14,11,0.94)" : "transparent",
          backdropFilter: scrolled || open ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          transition: "background 0.4s, border-color 0.4s",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 0, flexShrink: 0 }}>
          <span className="heading" style={{ fontSize: "clamp(17px,2.5vw,22px)", color: "#fff" }}>ALYA</span>
          <span className="heading" style={{ fontSize: "clamp(17px,2.5vw,22px)", color: "var(--orange)" }}>PLASTİK</span>
        </Link>

        {/* Desktop nav — ortalanmış */}
        <nav className="hidden md:flex items-center gap-10"
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          {NAV.map(l => (
            <a key={l.href} href={l.href}
              className="eyebrow transition-colors duration-200 hover:text-white"
              style={{ color: "var(--muted)" }}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
          className="btn btn-fill hidden md:inline-flex"
          style={{ padding: "10px 22px", fontSize: 10, flexShrink: 0 }}>
          Teklif Al →
        </a>

        {/* Mobile — sadece hamburger */}
        <button
          onClick={() => setOpen(p => !p)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          className="md:hidden"
          style={{ width: 40, height: 40, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 6, flexShrink: 0 }}
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: "block",
              height: 1.5,
              background: "var(--light)",
              borderRadius: 2,
              width: i === 1 ? (open ? 0 : 18) : 26,
              opacity: i === 1 && open ? 0 : 1,
              transform:
                i === 0 && open ? "rotate(45deg) translate(5.5px, 5.5px)" :
                i === 2 && open ? "rotate(-45deg) translate(5.5px, -5.5px)" :
                "none",
              transition: "all 0.3s ease",
            }} />
          ))}
        </button>
      </header>

      {/* Mobile tam ekran menü */}
      <div
        className="md:hidden fixed inset-0 z-[79]"
        style={{
          background: "rgba(11,14,11,0.97)",
          backdropFilter: "blur(20px)",
          paddingTop: 68,
          paddingInline: "var(--pad)",
          paddingBottom: 32,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      >
        {/* Nav linkleri */}
        <nav style={{ paddingTop: 24 }}>
          {NAV.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="heading block border-b hover:text-white"
              style={{
                fontSize: "clamp(38px,10vw,56px)",
                color: "var(--muted)",
                borderColor: "var(--border)",
                padding: "16px 0",
                transform: open ? "translateY(0)" : "translateY(12px)",
                opacity: open ? 1 : 0,
                transition: `color 0.2s, opacity 0.35s ${i * 0.06}s ease, transform 0.35s ${i * 0.06}s ease`,
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Alt butonlar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
            className="btn btn-fill" style={{ justifyContent: "center" }}>
            WhatsApp ile Teklif Al →
          </a>
          <a href="tel:+902126718565" className="btn btn-line" style={{ justifyContent: "center" }}>
            +90 212 671 85 65
          </a>
        </div>
      </div>
    </>
  );
}
