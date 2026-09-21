import Image from "next/image";

const slides = [
  {
    eyebrow: "01 — ÜRÜN HİKÂYESİ",
    title: "VENÜS",
    desc: "Venüs saksısı, organik kıvrımlı yapısıyla doğadan ilham alır. Dayanıklı PP malzemesi, iç ve dış mekân kullanımı için uygundur.",
    img: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927643/ven%C3%BCs_menek%C5%9Fe_saks%C4%B1_kznhop.webp",
    code: "ALY-201",
    specs: [
      { dt: "Çap", dd: "Ø28cm" },
      { dt: "Malzeme", dd: "PP" },
      { dt: "Hacim", dd: "8 lt" },
      { dt: "Ağırlık", dd: "0.42 kg" },
    ],
  },
  {
    eyebrow: "02 — ÜRÜN HİKÂYESİ",
    title: "3D SAKSI",
    desc: "Geometrik yüzeyi ile her açıdan farklı görünen 3D Saksı, modern iç mekân tasarımının vazgeçilmezi.",
    img: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927645/3d_rwe9u7.webp",
    code: "ALY-101",
    specs: [
      { dt: "Çap", dd: "Ø24cm" },
      { dt: "Malzeme", dd: "PP" },
      { dt: "Hacim", dd: "6 lt" },
      { dt: "Ağırlık", dd: "0.38 kg" },
    ],
  },
];

export default function Story() {
  return (
    <section id="product-story" style={{ background: "var(--light)", color: "var(--dark)" }}>
      <div style={{ paddingInline: "var(--pad)", paddingTop: 100 }}>
        <div className="flex justify-between items-center reveal">
          <span className="eyebrow" style={{ color: "#727768" }}>ÜRÜN HİKÂYELERİ</span>
          <span className="eyebrow" style={{ color: "#727768" }}>01 — 04</span>
        </div>
      </div>

      {slides.map((s, i) => (
        <div
          key={i}
          className="grid md:grid-cols-[1.05fr_1fr] grid-cols-1 items-center"
          style={{ minHeight: "90svh", padding: "70px var(--pad)", gap: "7vw" }}
        >
          {/* Resim */}
          <div
            className="relative story-img-wrap md:order-none order-first"
            style={{ height: "50svh", maxHeight: 500, display: "grid", placeItems: "center" }}
          >
            <Image
              src={s.img}
              alt={s.title}
              width={500}
              height={600}
              style={{ width: "80%", height: "85%", objectFit: "contain" }}
            />
            <span className="absolute bottom-0 right-0 eyebrow" style={{ fontSize: 11, color: "#70776b" }}>
              {s.code}
            </span>
          </div>

          {/* Copy */}
          <div className="story-copy">
            <span className="eyebrow" style={{ color: "#727768" }}>{s.eyebrow}</span>
            <div className="overflow-hidden mt-6 mb-8">
              <h2 className="display reveal-title" style={{ fontSize: "clamp(72px, 12vw, 175px)" }}>
                {s.title}
              </h2>
            </div>
            <p style={{ maxWidth: 260, fontSize: 15, lineHeight: 1.7, color: "#62675e" }}>{s.desc}</p>
            <dl
              className="flex flex-wrap gap-8 border-t reveal"
              style={{ borderColor: "#929b873e", paddingTop: 20, marginTop: 30 }}
            >
              {s.specs.map((sp) => (
                <div key={sp.dt}>
                  <dt style={{ fontSize: 10, letterSpacing: "0.1em", marginBottom: 9, color: "#727768", textTransform: "uppercase" }}>
                    {sp.dt}
                  </dt>
                  <dd style={{ margin: 0, font: "20px 'Courier New', monospace" }}>{sp.dd}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ))}
    </section>
  );
}
