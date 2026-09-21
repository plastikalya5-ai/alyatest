export default function Footer() {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div className="pad" style={{ paddingBlock: "clamp(56px,7vw,90px) 36px" }}>
        <div className="flex flex-col lg:flex-row justify-between gap-14 mb-14">
          {/* Marka */}
          <div style={{ maxWidth: 280 }}>
            <div className="heading mb-4" style={{ fontSize: "clamp(28px,4vw,44px)" }}>
              ALYA<span style={{ color: "var(--orange)" }}>PLASTİK</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.9, color: "var(--muted)", fontWeight: 300, marginBottom: 24 }}>
              1968&apos;den bu yana plastik ürün üretiminde lider.
              İstanbul Başakşehir OSB&apos;den dünyaya.
            </p>
            <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
              className="btn btn-fill" style={{ padding: "10px 20px", fontSize: 10 }}>
              WhatsApp →
            </a>
          </div>

          {/* Linkler */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-8">
            {[
              { title: "Ürünler", items: ["Saksı Modelleri","Sepet Ürünleri","Depolama Sandığı","Ev Gereçleri","Özel Sipariş"] },
              { title: "Firma",   items: ["Hakkımızda","Üretim Süreci","İhracat","Sertifikalar","KVKK"] },
              { title: "İletişim",items: ["info@alyaplastik.com","export@alyaplastik.com","+90 212 671 85 65","Başakşehir / İstanbul"] },
            ].map(col => (
              <div key={col.title}>
                <p className="eyebrow mb-4" style={{ fontSize: 9, color: "var(--orange)" }}>{col.title}</p>
                {col.items.map(item => (
                  <p key={item} className="mb-2.5 hover:text-white transition-colors"
                    style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Alt çizgi */}
        <div className="border-t flex flex-col sm:flex-row justify-between items-center gap-3 pt-6"
          style={{ borderColor: "var(--border)" }}>
          <p className="eyebrow" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} Alya Plastik San. Tic. Ltd. Şti. — Tüm hakları saklıdır.
          </p>
          <p className="eyebrow" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
            İstanbul OSB · Made in Türkiye 🇹🇷
          </p>
        </div>
      </div>
    </footer>
  );
}
