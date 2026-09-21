"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#product-story", label: "Ürünler" },
    { href: "#collection", label: "Koleksiyon" },
    { href: "#history", label: "Alya" },
    { href: "#contact", label: "İletişim ↗" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[80] flex items-center justify-between transition-all duration-300 ${
          scrolled ? "border-b border-white/10" : "border-b border-transparent"
        }`}
        style={{
          height: 78,
          paddingInline: "var(--pad)",
          background: scrolled ? "#151d15ee" : "transparent",
        }}
      >
        <Link href="/" className="flex items-center">
          <span
            className="font-black uppercase tracking-tight"
            style={{ fontFamily: "Impact, Arial Narrow, sans-serif", fontSize: 22, letterSpacing: -1 }}
          >
            ALYA<span style={{ color: "var(--orange)" }}>PLASTİK</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="py-2 transition-colors duration-200 hover:text-orange-400"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/905357616524"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-white px-4 py-2"
            style={{ background: "#25D366" }}
          >
            WhatsApp
          </a>
          <button
            className="md:hidden text-xs uppercase tracking-widest py-3"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            {menuOpen ? "✕" : "MENÜ"}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-x-0 z-[79] flex flex-col border-b border-white/10 transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
        style={{
          top: 78,
          background: "#151d15f0",
          backdropFilter: "blur(16px)",
          paddingInline: "var(--pad)",
          paddingBlock: "16px 28px",
        }}
      >
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setMenuOpen(false)}
            className="py-4 text-base border-b border-white/5 last:border-0 hover:text-orange-400 transition-colors"
          >
            {l.label}
          </a>
        ))}
        <a
          href="https://wa.me/905357616524"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 py-3 text-center text-sm text-white font-semibold"
          style={{ background: "#25D366" }}
        >
          WhatsApp ile Ulaşın
        </a>
      </div>
    </>
  );
}
