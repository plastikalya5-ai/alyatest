export default function Footer() {
  const cols = [
    { title:"Ürünler",  items:["Saksı Modelleri","Sepet Ürünleri","Depolama Sandığı","Ev Gereçleri","Özel Sipariş"] },
    { title:"Firma",    items:["Hakkımızda","Üretim Süreci","İhracat","Sertifikalar","KVKK"] },
    { title:"İletişim", items:["info@alyaplastik.com","export@alyaplastik.com","+90 212 671 85 65","Başakşehir / İstanbul"] },
  ];
  return (
    <footer className="bg-[#0b0e0b] border-t border-white/8" style={{ paddingBlock: "clamp(56px,7vw,90px) clamp(32px,4vw,48px)" }}>
      <div style={{ paddingInline: "clamp(20px,5vw,80px)" }}>

        {/* Üst */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-20 mb-14">
          <div>
            <div className="heading text-[#eae6dd] mb-4" style={{ fontSize: "clamp(28px,4vw,44px)" }}>
              ALYA<span className="text-[#e55f28]">PLASTİK</span>
            </div>
            <p className="text-[#6b7366] font-light leading-loose mb-6" style={{ fontSize: 13 }}>
              1968&apos;den bu yana plastik ürün üretiminde lider.
              İstanbul Başakşehir OSB&apos;den dünyaya.
            </p>
            <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#e55f28] hover:bg-[#c94f1e] text-white text-[10px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5 transition-colors">
              WhatsApp →
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-8">
            {cols.map(col => (
              <div key={col.title}>
                <p className="eyebrow text-[#e55f28] mb-4" style={{ fontSize: 10 }}>{col.title}</p>
                {col.items.map(item => (
                  <p key={item} className="text-[#6b7366] hover:text-white transition-colors mb-2.5 leading-snug" style={{ fontSize: 13 }}>
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Alt çizgi */}
        <div className="border-t border-white/8 pt-6 flex flex-wrap justify-between items-center gap-3">
          <p className="eyebrow text-white/20" style={{ fontSize: 10 }}>
            © {new Date().getFullYear()} Alya Plastik San. Tic. Ltd. Şti. — Tüm hakları saklıdır.
          </p>
          <p className="eyebrow text-white/20" style={{ fontSize: 10 }}>
            İstanbul OSB · Made in Türkiye 🇹🇷
          </p>
        </div>
      </div>
    </footer>
  );
}
