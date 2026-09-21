const blocks = [
  {
    year: "1968",
    title: "Kuruluş",
    desc: "Alya Plastik, İstanbul'da küçük bir atölye olarak kuruldu. İlk ürünlerimiz ile sektörde adımızı duyurduk.",
  },
  {
    year: "2000",
    title: "Büyüme",
    desc: "Yeni üretim tesisi ve modern ekipmanlar ile kapasite 10 katına çıkarıldı. İlk ihracat adımları atıldı.",
  },
  {
    year: "2014",
    title: "İhracat",
    desc: "Uluslararası pazarlara açılım. Avrupa ve Orta Doğu'ya düzenli ihracat başladı.",
  },
  {
    year: "2024",
    title: "Bugün",
    desc: "200+ ürün modeli, 20+ ülke ihracatı. İstanbul Başakşehir OSB'deki modern tesisimizde üretim devam ediyor.",
  },
];

export default function History() {
  return (
    <section id="history" style={{ background: "#d9dbcb", color: "var(--dark)", overflow: "hidden" }}>
      <div style={{ position: "relative", minHeight: "100svh", padding: "90px var(--pad) 65px" }}>
        {/* Background word */}
        <div
          aria-hidden
          className="absolute pointer-events-none select-none hidden md:block"
          style={{
            fontFamily: "Impact, Arial Narrow, sans-serif",
            fontSize: "48vw",
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            left: "2vw",
            top: "9%",
            color: "#c6cbb8",
            zIndex: 0,
          }}
        >
          ALY
        </div>

        <p className="eyebrow relative z-10" style={{ color: "#727768" }}>07 — TARİHÇE</p>

        <div className="relative z-10">
          {blocks.map((b, i) => (
            <div
              key={b.year}
              className="grid md:grid-cols-[1.1fr_1fr] grid-cols-1 items-center"
              style={{
                gap: "8vw",
                padding: "60px 0",
                borderBottom: i < blocks.length - 1 ? "1px solid #0000001a" : "none",
              }}
            >
              <div
                className="display"
                style={{ fontSize: "clamp(100px, 18vw, 320px)", lineHeight: 1, letterSpacing: "-0.04em", color: "#c6cbb8" }}
              >
                {b.year}
              </div>
              <div style={{ maxWidth: 270 }}>
                <h3 style={{ fontSize: 25, fontWeight: 400, marginBottom: 20 }}>{b.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "#5c6654" }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
