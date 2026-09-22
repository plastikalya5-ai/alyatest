export default function Footer() {
  const cols = [
    { title: "Ürünler",   items: ["Saksı Modelleri","Sepet Ürünleri","Depolama Sandığı","Ev Gereçleri","Özel Sipariş"] },
    { title: "Firma",     items: ["Hakkımızda","Üretim Süreci","İhracat","Sertifikalar","KVKK"] },
    { title: "İletişim",  items: ["info@alyaplastik.com","export@alyaplastik.com","+90 212 671 85 65","Başakşehir / İstanbul"] },
  ];

  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div className="pad" style={{ paddingTop: "clamp(56px,7vw,90px)", paddingBottom: "clamp(40px,5vw,64px)" }}>

        {/* Üst */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(40px,6vw,100px)", marginBottom: "clamp(40px,6vw,72px)", flexWrap: "wrap" }}>
          {/* Marka */}
          <div style={{ maxWidth: 280 }}>
            <div className="heading" style={{ fontSize: "clamp(28px,4vw,44px)", marginBottom: 14 }}>
              ALYA<span style={{ color: "var(--orange)" }}>PLASTİK</span>
            </div>
            <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.9, color: "var(--muted)", fontWeight: 300, marginBottom: 24 }}>
              1968&apos;den bu yana plastik ürün üretiminde lider.
              İstanbul Başakşehir OSB&apos;den dünyaya.
            </p>
            <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
              className="btn btn-fill" style={{ padding: "10px 20px" }}>
              WhatsApp →
            </a>
          </div>

          {/* Link kolonları */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(20px,4vw,48px)" }}>
            {cols.map(col => (
              <div key={col.title}>
                <p className="eyebrow" style={{ color: "var(--orange)", marginBottom: 16 }}>{col.title}</p>
                {col.items.map(item => (
                  <p key={item} style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Alt çizgi */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <p className="eyebrow" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} Alya Plastik San. Tic. Ltd. Şti. — Tüm hakları saklıdır.
          </p>
          <p className="eyebrow" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            İstanbul OSB · Made in Türkiye 🇹🇷
          </p>
        </div>
      </div>

      {/* Mobil responsive */}
      <style>{`
        @media (max-width: 767px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
          footer > div > div:first-child > div:last-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
