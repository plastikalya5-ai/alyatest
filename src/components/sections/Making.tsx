import Image from "next/image";

const steps = [
  {
    num: "01",
    title: "Kalıp Tasarımı",
    desc: "CAD modelinden prototip kalıba. Milimetrik hassasiyet ile her detay tasarlanır.",
    img: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927645/3d_rwe9u7.webp",
  },
  {
    num: "02",
    title: "Enjeksiyon",
    desc: "Yüksek basınçlı plastik enjeksiyon ile seri üretim. Tutarlı kalite her üründe.",
    img: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927645/dantel_d47fze.webp",
  },
  {
    num: "03",
    title: "Kalite & Sevkiyat",
    desc: "Her parti görsel ve ölçüsel denetimden geçer. Müşteriye özel paketleme ile sevkiyat.",
    img: "https://res.cloudinary.com/dy7dekame/image/upload/v1789927643/kozalak_saks%C4%B1_bdnagp.webp",
  },
];

export default function Making() {
  return (
    <section
      id="forms"
      style={{ background: "#191c19", padding: "9svh var(--pad) 8svh", overflow: "hidden" }}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "5vw" }}
      >
        {/* Sticky title */}
        <div style={{ position: "sticky", top: 130, alignSelf: "start" }}>
          <span className="eyebrow" style={{ color: "var(--muted)" }}>
            05 — ÜRETİM SÜRECİ
          </span>
          <h2
            id="making-title"
            className="display"
            style={{ fontSize: "clamp(80px, 11vw, 170px)", marginTop: 38 }}
          >
            FİKİRDEN<br />RAFA.
          </h2>
          <p style={{ color: "#aeb5a7", maxWidth: 270, fontSize: 15, lineHeight: 1.7, marginTop: 30 }}>
            Her ürün beş aşamadan geçerek banttan ayrılır. Kalıp tasarımından son sevkiyata.
          </p>
        </div>

        {/* Steps */}
        <div>
          {steps.map((s) => (
            <article
              key={s.num}
              style={{ minHeight: "75svh", position: "relative", padding: "35px 0" }}
            >
              <Image
                src={s.img}
                alt={s.title}
                width={400}
                height={300}
                style={{
                  width: "78%",
                  height: "44svh",
                  objectFit: "contain",
                  margin: "10px auto 45px",
                  maxHeight: 380,
                }}
              />
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "40px 1fr",
                  gap: 20,
                  borderTop: "1px solid #fff3",
                  paddingTop: 22,
                }}
              >
                <span style={{ fontFamily: "Courier New, monospace", fontSize: 13, color: "#aeb5a7" }}>
                  {s.num}
                </span>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ maxWidth: 340, lineHeight: 1.7, fontSize: 14, color: "#aeb5a7" }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
