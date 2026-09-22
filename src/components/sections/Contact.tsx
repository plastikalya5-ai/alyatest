"use client";
import { useState } from "react";

const CONTACTS = [
  { l:"E-posta",  v:"info@alyaplastik.com",  h:"mailto:info@alyaplastik.com"   },
  { l:"İhracat",  v:"export@alyaplastik.com", h:"mailto:export@alyaplastik.com" },
  { l:"Telefon",  v:"+90 212 671 85 65",      h:"tel:+902126718565"             },
  { l:"WhatsApp", v:"+90 535 761 65 24",       h:"https://wa.me/905357616524"   },
];

function Field({ label, type, required }: { label:string; type:string; required?:boolean }) {
  return (
    <div>
      <label className="eyebrow text-[#6b7366] block mb-2.5" style={{ fontSize: 10 }}>{label}</label>
      <input type={type} required={required}
        className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-[#eae6dd] outline-none focus:border-[#e55f28] transition-colors" />
    </div>
  );
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sub,  setSub]  = useState("");

  return (
    <section id="contact" className="bg-[#111511]" style={{ paddingBlock: "clamp(72px,9vw,130px)" }}>
      <div style={{ paddingInline: "clamp(20px,5vw,80px)" }}>

        <div className="mb-12">
          <p className="eyebrow text-[#e55f28] mb-3" data-reveal>— İletişim</p>
          <h2 className="heading text-[#eae6dd]" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
            BİRLİKTE<br />ÜRETELIM.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* Sol */}
          <div>
            <p className="font-light leading-loose text-[#6b7366] mb-10" data-reveal style={{ fontSize: "clamp(14px,1.4vw,16px)", maxWidth: 360 }}>
              B2B toplu sipariş, özel kalıp talebi, ihracat ve katalog için bize ulaşın. 72 saat garantisi.
            </p>
            {CONTACTS.map((c, i) => (
              <a key={c.l} href={c.h}
                target={c.h.startsWith("http") ? "_blank" : undefined}
                rel={c.h.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center justify-between py-4 border-b border-white/8 hover:opacity-60 transition-opacity"
                data-reveal data-delay={String(i+1)}>
                <span className="eyebrow text-[#6b7366]" style={{ fontSize: 10 }}>{c.l}</span>
                <span className="text-[#eae6dd]" style={{ fontSize: 13 }}>{c.v} →</span>
              </a>
            ))}
            <address className="not-italic mt-8 text-[#6b7366] leading-loose" data-reveal style={{ fontSize: 13 }}>
              İkitelli OSB 4B Blok No:26-28 Kat:2<br />
              Başakşehir / İstanbul<br />
              <span className="text-white/20">Pzt–Cum 08:30–17:30</span>
            </address>
          </div>

          {/* Sağ — form */}
          <div data-reveal data-delay="2">
            {sent ? (
              <div className="flex flex-col justify-center min-h-[300px]">
                <div className="heading text-[#e55f28] mb-3" style={{ fontSize: 72 }}>✓</div>
                <h3 className="heading text-[#eae6dd] mb-3" style={{ fontSize: 36 }}>ALINDI.</h3>
                <p className="text-[#6b7366]" style={{ fontSize: 15, lineHeight: 1.8 }}>En kısa sürede dönüş yapılacaktır.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Ad Soyad *" type="text" required />
                  <Field label="Firma"       type="text" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="E-posta *"  type="email" required />
                  <Field label="Telefon"    type="tel" />
                </div>
                <div>
                  <label className="eyebrow text-[#6b7366] block mb-2.5" style={{ fontSize: 10 }}>Konu</label>
                  <select value={sub} onChange={e => setSub(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-3 text-sm outline-none appearance-none"
                    style={{ color: sub ? "#eae6dd" : "#6b7366" }}>
                    <option value="" disabled>Seçin</option>
                    <option value="urun">Ürün Bilgisi</option>
                    <option value="fiyat">Fiyat Talebi</option>
                    <option value="ihracat">İhracat / Export</option>
                    <option value="katalog">Katalog Talebi</option>
                    <option value="kalip">Özel Kalıp</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="eyebrow text-[#6b7366] block mb-2.5" style={{ fontSize: 10 }}>Mesajınız *</label>
                  <textarea required rows={4}
                    className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-[#eae6dd] outline-none resize-none focus:border-[#e55f28] transition-colors" />
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit"
                    className="inline-flex items-center gap-2 bg-[#e55f28] hover:bg-[#c94f1e] text-white text-[11px] font-semibold tracking-[0.14em] uppercase px-7 py-3.5 transition-colors">
                    Gönder →
                  </button>
                  <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-[#eae6dd] text-[11px] font-semibold tracking-[0.14em] uppercase px-7 py-3.5 transition-colors">
                    WhatsApp →
                  </a>
                </div>
                <p className="eyebrow text-white/20" style={{ fontSize: 10 }}>KVKK kapsamında kişisel verileriniz işlenir.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
