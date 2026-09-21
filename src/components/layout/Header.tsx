"use client";
import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { href: "#products", label: "Ürünler" },
    { href: "#collection", label: "Koleksiyon" },
    { href: "#why", label: "Neden Alya" },
    { href: "#contact", label: "İletişim" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[90] flex items-center justify-between transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          paddingInline: "var(--pad)",
          background: scrolled ? "rgba(14,18,16,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}>

        {/* Logo */}
        <a href="/" className="flex items-baseline gap-1 group">
          <span className="font-black text-white tracking-tighter" style={{ fontSize: "clamp(15px,2vw,19px)", fontFamily: "var(--display)", letterSpacing: "-0.04em" }}>
            ALYA
          </span>
          <span className="font-black tracking-tighter" style={{ fontSize: "clamp(15px,2vw,19px)", fontFamily: "var(--display)", letterSpacing: "-0.04em", color: "var(--orange)" }}>
            PLASTİK
          </span>
          <span className="text-[10px] tracking-widest uppercase ml-2 hidden sm:inline" style={{ color: "var(--muted)", fontWeight: 400 }}>
            1968
          </span>
        </a>

        {/* Nav - desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href}
              className="text-xs uppercase tracking-widest transition-colors duration-200 hover:text-white"
              style={{ color: "var(--muted)" }}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest font-semibold px-5 py-2.5 transition-all duration-200 hover:opacity-90"
            style={{ background: "var(--orange)", color: "var(--dark)" }}>
            Teklif Al
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center gap-1.5 p-2 w-10 h-10"
            aria-label="Menü">
            <span className={`block h-px transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              style={{ background: "var(--light)", width: 22 }} />
            <span className={`block h-px transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              style={{ background: "var(--light)", width: 16 }} />
            <span className={`block h-px transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              style={{ background: "var(--light)", width: 22 }} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-x-0 z-[89] flex flex-col transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ top: 65, background: "rgba(14,18,16,0.98)", backdropFilter: "blur(20px)", paddingInline: "var(--pad)", paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {links.map((l, i) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
            className="py-4 text-2xl font-light border-b transition-colors hover:text-white"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "var(--muted)", transitionDelay: menuOpen ? `${i*60}ms` : "0ms" }}>
            {l.label}
          </a>
        ))}
        <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
          className="mt-6 py-3.5 text-center text-sm font-semibold uppercase tracking-widest"
          style={{ background: "var(--orange)", color: "var(--dark)" }}>
          WhatsApp ile Teklif Al
        </a>
      </div>
    </>
  );
}
