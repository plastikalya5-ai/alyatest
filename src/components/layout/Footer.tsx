export default function Footer() {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ paddingInline: "var(--pad)", paddingBlock: "clamp(64px,8vw,100px) 40px" }}>

        {/* Top */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">
          {/* Brand */}
          <div style={{ maxWidth: 300 }}>
            <div className="display mb-5" style={{ fontSize: "clamp(32px,5vw,52px)" }}>
              ALYA<span style={{ color: "var(--orange)" }}>PLASTİK</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--muted)", fontWeight: 300 }}>
              1968&apos;den bu yana plastik ürün üretiminde lider. İstanbul Başakşehir OSB&apos;den dünyaya.
            </p>
            <div className="flex gap-3 mt-8">
              <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer" className="btn-orange" style={{ padding: "10px 20px", fontSize: 9 }}>
                WhatsApp →
              </a>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-10">
            {[
              {
                title: "Ürünler",
                items: ["Saksı Modelleri","Sepet Ürünleri","Depolama Sandığı","Ev Gereçleri","Özel Sipariş"],
              },
              {
                title: "Firma",
                items: ["Hakkımızda","Üretim Süreci","İhracat","Sertifikalar","KVKK"],
              },
              {
                title: "İletişim",
                items: ["info@alyaplastik.com","export@alyaplastik.com","+90 212 671 85 65","Başakşehir / İstanbul"],
              },
            ].map(col => (
              <div key={col.title}>
                <p className="eyebrow mb-5" style={{ color: "var(--orange)", fontSize: 9 }}>{col.title}</p>
                {col.items.map(item => (
                  <p key={item} className="mb-3 hover:text-white transition-colors cursor-pointer"
                    style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="section-rule pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
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
