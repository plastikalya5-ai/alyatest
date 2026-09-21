export default function Footer() {
  return (
    <footer style={{ background: "var(--dark2)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ paddingInline: "var(--pad)", paddingBlock: "clamp(40px,6vw,80px) clamp(24px,4vw,48px)" }}>
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div className="display mb-4" style={{ fontSize: "clamp(28px,4vw,44px)" }}>
              ALYA<span style={{ color: "var(--orange)" }}>PLASTİK</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--muted)" }}>
              1968&apos;den bu yana plastik ürün üretiminde lider. İstanbul OSB&apos;den dünyaya.
            </p>
          </div>
          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-8">
            {[
              { title: "Ürünler", links: ["Saksı", "Sepet", "Sandık", "Ev Gereçleri"] },
              { title: "Firma", links: ["Hakkımızda", "Üretim", "İhracat", "KVKK"] },
              { title: "İletişim", links: ["info@alyaplastik.com", "+90 212 671 85 65", "Başakşehir / İstanbul"] },
            ].map(col => (
              <div key={col.title}>
                <p className="eyebrow mb-4" style={{ fontSize: 10, color: "var(--orange)" }}>{col.title}</p>
                {col.links.map(l => (
                  <p key={l} className="mb-2" style={{ fontSize: 13, color: "var(--muted)" }}>{l}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} Alya Plastik San. Tic. Ltd. Şti. — Tüm hakları saklıdır.
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            İstanbul OSB · Made in Türkiye
          </p>
        </div>
      </div>
    </footer>
  );
}
