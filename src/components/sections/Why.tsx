const reasons = [
  {
    num: "55 yıl+",
    title: "Sektör Deneyimi",
    desc: "1968'den bu yana plastik ürün üretimindeki kesintisiz birikim.",
  },
  {
    num: "20 ülke+",
    title: "İhracat Ağı",
    desc: "Avrupa, Orta Doğu ve Afrika'ya düzenli ihracat. Uluslararası lojistik desteği.",
  },
  {
    num: "200+",
    title: "Ürün Yelpazesi",
    desc: "Saksı, sepet, sandık ve depolama kategorilerinde geniş model portföyü.",
  },
  {
    num: "100%",
    title: "Yerli Üretim",
    desc: "İstanbul Başakşehir'deki tesisimizde tasarlanan ve üretilen ürünler.",
  },
  {
    num: "72 sa",
    title: "Hızlı Yanıt",
    desc: "Teklif taleplerinize 72 saat içinde dönüş garantisi.",
  },
  {
    num: "B2B",
    title: "Toplu Sipariş",
    desc: "Kalıptan rafa tam tedarik zinciri. Minimum sipariş miktarı ile esnek çözümler.",
  },
];

export default function Why() {
  return (
    <section
      id="why"
      style={{ background: "#1a1f1a", padding: "100px 0" }}
    >
      <div style={{ paddingInline: "var(--pad)" }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>07 — NEDEN ALYA</p>
        <h2
          id="why-title"
          className="display"
          style={{ fontSize: "clamp(80px, 11vw, 170px)", margin: "30px 0 60px" }}
        >
          GÜVEN<br />
          <span style={{ color: "var(--orange)" }}>RAKAMDA.</span>
        </h2>
        <p style={{ color: "#aeb5a7", maxWidth: 500, fontSize: 15, lineHeight: 1.7, marginBottom: 70 }}>
          1968&apos;den gelen üretim birikimi. 20+ ülkede ihracat deneyimi. Kalıptan rafa tam tedarik zinciri.
        </p>

        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1px", background: "#ffffff10" }}
        >
          {reasons.map((r) => (
            <div
              key={r.num}
              style={{ background: "#1a1f1a", padding: "40px 32px" }}
            >
              <div
                className="display"
                style={{ fontSize: "clamp(40px, 5vw, 72px)", color: "var(--orange)", marginBottom: 12 }}
              >
                {r.num}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>{r.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#aeb5a7" }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
