"use client";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sub,  setSub]  = useState("");

  return (
    <section id="contact" style={{ background: "var(--bg2)", paddingBlock: "clamp(80px,10vw,140px)" }}>
      <div style={{ paddingInline: "var(--pad)" }}>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left */}
          <div>
            <p className="eyebrow reveal-up" style={{ color: "var(--orange)", marginBottom: 14 }}>— İletişim</p>
            <div className="clip mb-8">
              <h2 className="display reveal-up delay-1" style={{ fontSize: "clamp(48px,8vw,110px)" }}>
                BİRLİKTE<br />ÜRETELIM.
              </h2>
            </div>
            <p className="reveal-up delay-2" style={{ maxWidth: 380, fontSize: "clamp(14px,1.5vw,16px)", lineHeight: 1.9, color: "var(--muted)", fontWeight: 300, marginBottom: 48 }}>
              B2B toplu sipariş, özel kalıp talebi, ihracat ve katalog için ulaşın. 72 saat garantisi.
            </p>

            {/* Contact links */}
            <div className="reveal-up delay-3 flex flex-col mb-10">
              {[
                { l: "E-posta",   v: "info@alyaplastik.com",   h: "mailto:info@alyaplastik.com" },
                { l: "İhracat",   v: "export@alyaplastik.com", h: "mailto:export@alyaplastik.com" },
                { l: "Telefon",   v: "+90 212 671 85 65",      h: "tel:+902126718565" },
                { l: "WhatsApp",  v: "+90 535 761 65 24",      h: "https://wa.me/905357616524" },
              ].map(c => (
                <a key={c.l} href={c.h} target={c.h.startsWith("http") ? "_blank" : undefined}
                  rel={c.h.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between py-5 section-rule hover:opacity-70 transition-opacity">
                  <span className="eyebrow" style={{ color: "var(--muted)" }}>{c.l}</span>
                  <span style={{ fontSize: "clamp(12px,1.3vw,15px)" }}>{c.v} →</span>
                </a>
              ))}
            </div>

            <address className="reveal-up not-italic" style={{ fontSize: 13, lineHeight: 2, color: "var(--muted)" }}>
              İkitelli OSB 4B Blok No:26-28 Kat:2<br />
              Başakşehir / İstanbul<br />
              <span style={{ color: "rgba(255,255,255,0.25)" }}>Pzt–Cum 08:30–17:30</span>
            </address>
          </div>

          {/* Right — form */}
          <div className="reveal-up delay-2">
            {sent ? (
              <div className="h-full flex flex-col justify-center items-start">
                <div className="display mb-4" style={{ fontSize: 80, color: "var(--orange)" }}>✓</div>
                <h3 className="display mb-4" style={{ fontSize: 36 }}>ALINDI.</h3>
                <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8 }}>
                  En kısa sürede size dönüş yapılacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <F label="Ad Soyad *"  type="text"  required />
                  <F label="Firma Adı"   type="text" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <F label="E-posta *"   type="email" required />
                  <F label="Telefon"     type="tel" />
                </div>

                <div>
                  <label className="eyebrow block mb-3" style={{ fontSize: 9, color: "var(--muted)" }}>Konu</label>
                  <select value={sub} onChange={e => setSub(e.target.value)}
                    className="w-full bg-transparent border-b py-3 text-sm outline-none appearance-none transition-colors"
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
                <div>
                  <label className="eyebrow block mb-3" style={{ fontSize: 9, color: "var(--muted)" }}>Mesajınız *</label>
                  <textarea required rows={4} className="w-full bg-transparent border-b py-3 text-sm outline-none resize-none transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <button type="submit" className="btn-orange">Gönder →</button>
                  <a href="https://wa.me/905357616524" target="_blank" rel="noopener noreferrer"
                    className="btn-outline" style={{ fontSize: 10 }}>
                    WhatsApp →
                  </a>
                </div>
                <p className="eyebrow" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
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

function F({ label, type, required }: { label: string; type: string; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow block mb-3" style={{ fontSize: 9, color: "var(--muted)" }}>{label}</label>
      <input type={type} required={required}
        className="w-full bg-transparent border-b py-3 text-sm outline-none transition-colors focus:border-orange-500"
        style={{ borderColor: "rgba(255,255,255,0.1)" }} />
    </div>
  );
}
