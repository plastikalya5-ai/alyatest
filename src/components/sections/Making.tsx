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
    <section id="forms" style={{ background: "#191c19", padding: "9svh var(--pad) 8svh", overflow: "hidden" }}>
      <div className="grid md:grid-cols-2 grid-cols-1" style={{ gap: "5vw" }}>
        <div className="md:sticky md:top-32 self-start">
          <span className="eyebrow reveal" style={{ color: "var(--muted)" }}>05 — ÜRETİM SÜRECİ</span>
          <div className="overflow-hidden mt-10 mb-8">
            <h2 id="making-title" className="display reveal-title" style={{ fontSize: "clamp(72px, 11vw, 170px)" }}>
              FİKİRDEN<br />RAFA.
            </h2>
          </div>
          <p className="reveal" style={{ color: "#aeb5a7", maxWidth: 270, fontSize: 15, lineHeight: 1.7 }}>
            Her ürün beş aşamadan geçerek banttan ayrılır. Kalıp tasarımından son sevkiyata.
          </p>
        </div>

        <div>
          {steps.map((s) => (
            <article key={s.num} className="making-step" style={{ minHeight: "60svh", padding: "35px 0" }}>
              <Image
                src={s.img}
                alt={s.title}
                width={400}
                height={300}
                style={{ width: "78%", height: "40svh", objectFit: "contain", margin: "10px auto 45px", maxHeight: 380 }}
              />
              <div
                className="grid"
                style={{ gridTemplateColumns: "40px 1fr", gap: 20, borderTop: "1px solid #fff3", paddingTop: 22 }}
              >
                <span style={{ fontFamily: "Courier New, monospace", fontSize: 13, color: "#aeb5a7" }}>{s.num}</span>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ maxWidth: 340, lineHeight: 1.7, fontSize: 14, color: "#aeb5a7" }}>{s.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
