"use client";
import Image from "next/image";

const stats = [
  { num: "55", suffix: "+", label: "Yıl Deneyim" },
  { num: "20", suffix: "+", label: "Ülke İhracat" },
  { num: "200", suffix: "+", label: "Ürün Modeli" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{ height: "100svh", minHeight: 730, background: "#191c19" }}
    >
      {/* Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 68% 53%, #384136 0, transparent 57%)",
          opacity: 0.55,
        }}
      />

      {/* Kicker */}
      <p
        className="absolute eyebrow reveal"
        style={{ top: 115, left: "var(--pad)", color: "#adb2a5", fontSize: 11 }}
      >
        ALYAPLAS PLASTİK SAN. TİC. LTD. ŞTİ. — İSTANBUL OSB
        <br />
        1968&apos;DEN BERİ &nbsp;·&nbsp; 20+ ÜLKE İHRACAT &nbsp;·&nbsp; B2B TOPLU SİPARİŞ
      </p>

      {/* Title */}
      <h1
        className="absolute display"
        style={{
          top: "23%",
          left: "var(--pad)",
          fontSize: "clamp(86px, min(12.4vw, 18.5svh), 205px)",
          width: "70%",
          zIndex: 2,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {["GÜNLÜK", "HAYATA", "YENİ BİR", "FORM."].map((word, i) => (
          <span key={i} className="block overflow-hidden" style={{ paddingBottom: "0.07em", marginBottom: "-0.07em" }}>
            <span
              className="hero-line block"
              style={i === 1 ? { WebkitTextStroke: "1px #d4d6c8", color: "transparent" } : {}}
            >
              {word}
            </span>
          </span>
        ))}
      </h1>

      {/* Product */}
      <div
        className="absolute"
        style={{ inset: "14% 3% 5% 40%", zIndex: 3, pointerEvents: "none", display: "grid", placeItems: "center" }}
      >
        <Image
          src="https://res.cloudinary.com/dy7dekame/image/upload/v1789927643/Kordon_Dik_Ayakli_Sak_hf24qs.webp"
          alt="Kordon Saksı ALY-10/03"
          width={600}
          height={800}
          priority
          className="hero-product-img"
          style={{
            width: "auto",
            height: "100%",
            maxHeight: 850,
            objectFit: "contain",
            transform: "rotate(-8deg)",
            willChange: "transform",
          }}
        />
      </div>

      {/* Label */}
      <p
        className="absolute eyebrow hero-bottom-el"
        style={{ right: "var(--pad)", top: "34%", writingMode: "vertical-rl", zIndex: 4, color: "#c6cbbd", fontSize: 11 }}
      >
        KORDON / ALY-10/03
      </p>

      {/* Stats */}
      <div className="absolute flex gap-8" style={{ bottom: 110, left: "var(--pad)", zIndex: 5 }}>
        {stats.map((s) => (
          <div key={s.label} className="hero-stat">
            <div
              className="display"
              style={{ fontSize: "clamp(32px, 4vw, 52px)", color: "var(--orange)" }}
            >
              <span data-target={s.num} className="count-up">{s.num}</span>{s.suffix}
            </div>
            <div className="eyebrow" style={{ fontSize: 10, color: "#adb2a5" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div
        className="absolute flex justify-between items-end"
        style={{ bottom: 36, left: "var(--pad)", right: "var(--pad)", zIndex: 5 }}
      >
        <a
          href="#product-story"
          className="hero-bottom-el flex items-center gap-10 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          <span className="text-2xl">↓</span>
          KAYDIR &amp; KEŞFET
        </a>
        <p
          className="hero-bottom-el"
          style={{ fontSize: 13, lineHeight: 1.6, width: 190, marginRight: "12%", color: "#adb2a5" }}
        >
          Bir saksıdan fazlası. Yaşamın içindeki formlar.
        </p>
      </div>
    </section>
  );
}
