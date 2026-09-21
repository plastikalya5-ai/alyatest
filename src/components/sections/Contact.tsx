"use client";
import { useState } from "react";

const CONTACT_ITEMS = [
  { l: "E-posta",  v: "info@alyaplastik.com",   h: "mailto:info@alyaplastik.com"       },
  { l: "İhracat",  v: "export@alyaplastik.com",  h: "mailto:export@alyaplastik.com"     },
  { l: "Telefon",  v: "+90 212 671 85 65",        h: "tel:+902126718565"                 },
  { l: "WhatsApp", v: "+90 535 761 65 24",        h: "https://wa.me/905357616524"        },
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sub,  setSub]  = useState("");

  return (
    <section id="contact" style={{ background: "var(--bg2)", paddingBlock: "clamp(72px,9vw,130px)" }}>
      <div className="pad">

        {/* Başlık */}
        <div className="mb-14">
          <p className="eyebrow mb-3" data-reveal style={{ color: "var(--orange)" }}>— İletişim</p>
          <h2 className="heading" data-reveal data-delay="1" style={{ fontSize: "clamp(44px,7vw,96px)" }}>
            BİRLİKTE<br />ÜRETELIM.
          </h2>
        </div>

        {/* İki kolon */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Sol — bilgiler */}
          <div>
            <p data-reveal style={{ maxWidth: 360, fontSize: "clamp(14px,1.4vw,16px)", lineHeight: 1.9, color: "var(--muted)", fontWeight: 300, marginBottom: 40 }}>
              B2B toplu sipariş, özel kalıp talebi, ihracat
              ve katalog için bize ulaşın. 72 saat garantisi.
            </p>

            {CONTACT_ITEMS.map((c, i) => (
              <a key={c.l} href={c.h}
                target={c.h.startsWith("http") ? "_blank" : undefined}
                rel={c.h.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center justify-between py-4 border-b hover:opacity-60 transition-opacity"
                data-reveal data-delay={String(i + 1)}
                style={{ borderColor: "var(--border)" }}>
                <span className="eyebrow" style={{ color: "var(--muted)" }}>{c.l}</span>
                <span style={{ fontSize: "clamp(12px,1.3vw,14px)" }}>{c.v} →</span>
              </a>
            ))}

            <address data-reveal className="not-italic mt-8"
              style={{ fontSize: 13, lineHeight: 2, color: "var(--muted)" }}>
              İkitelli OSB 4B Blok No:26-28 Kat:2<br />
              Başakşehir / İstanbul<br />
              <span style={{ color: "rgba(255,255,255,0.2)" }}>Pzt–Cum 08:30–17:30</span>
            </address>
          </div>

          {/* Sağ — form */}
          <div data-reveal data-delay="2">
            {sent ? (
              <div className="flex flex-col justify-center h-full min-h-[300px]">
                <div className="heading mb-3" style={{ fontSize: 72, color: "var(--orange)" }}>✓</div>
                <h3 className="heading mb-3" style={{ fontSize: 36 }}>ALINDI.</h3>
                <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8 }}>
                  En kısa sürede dönüş yapılacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Ad Soyad *" type="text"  required />
                  <Field label="Firma"       type="text" />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="E-posta *"  type="email" required />
                  <Field label="Telefon"    type="tel" />
                </div>

                {/* Konu */}
                <div>
                  <label className="eyebrow block mb-2.5" style={{ fontSize: 9, color: "var(--muted)" }}>Konu</label>
                  <select value={sub} onChange={e => setSub(e.target.value)}
                    className="w-full bg-transparent border-b py-3 text-sm outline-none appearance-none"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: sub ? "var(--light)" : "var(--muted)" }}>
                    <option value="" disabled>Seçin</option>
                    <option value="urun">Ürün Bilgisi</option>
                    <option value="fiyat">Fiyat Talebi</option>
                    <option value="ihracat">İhracat / Export</option>
                    <option value="katalog">Katalog Talebi</option>
                    <option value="kalip">Özel Kalıp</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>

                {/* Mesaj */}
                <div>
                  <label className="eyebrow block mb-2.5" style={{ fontSize: 9, color: "var(--muted)" }}>Mesajınız *</label>
                  <textarea required rows={4}
                    className="w-full bg-transparent border-b py-3 text-sm outline-none resize-none"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" className="btn btn-fill">Gönder →</button>
                  <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
                    className="btn btn-line">WhatsApp →</a>
                </div>

                <p className="eyebrow" style={{ fontSize: 9, color: "rgba(255,255,255,0.18)" }}>
                  KVKK kapsamında kişisel verileriniz işlenir.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, type, required }: { label: string; type: string; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow block mb-2.5" style={{ fontSize: 9, color: "var(--muted)" }}>{label}</label>
      <input type={type} required={required}
        className="w-full bg-transparent border-b py-3 text-sm outline-none transition-colors"
        style={{ borderColor: "rgba(255,255,255,0.1)" }} />
    </div>
  );
}
