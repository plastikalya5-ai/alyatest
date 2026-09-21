"use client";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("");

  return (
    <section id="contact" style={{ background: "var(--dark)", paddingBlock: "clamp(80px,10vw,140px)" }}>
      <div style={{ paddingInline: "var(--pad)" }}>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left */}
          <div>
            <p className="eyebrow reveal" style={{ color: "var(--orange)", marginBottom: 20 }}>— İletişim</p>
            <div className="clip mb-8">
              <h2 className="display reveal-title" style={{ fontSize: "clamp(52px,8vw,110px)" }}>
                BİRLİKTE<br />ÜRETELIM.
              </h2>
            </div>
            <p className="reveal" style={{ fontSize: "clamp(14px,1.5vw,17px)", lineHeight: 1.8, color: "var(--muted)", fontWeight: 300, marginBottom: 48 }}>
              B2B toplu sipariş, özel kalıp talebi, ihracat ve katalog için bize ulaşın. 72 saat içinde dönüş garantisi.
            </p>

            <div className="reveal flex flex-col gap-4 mb-10">
              {[
                { label: "E-posta", val: "info@alyaplastik.com", href: "mailto:info@alyaplastik.com" },
                { label: "İhracat", val: "export@alyaplastik.com", href: "mailto:export@alyaplastik.com" },
                { label: "Telefon", val: "+90 212 671 85 65", href: "tel:+902126718565" },
                { label: "WhatsApp", val: "+90 535 761 65 24", href: "https://wa.me/905357616524" },
              ].map(c => (
                <a key={c.label} href={c.href} className="flex items-center justify-between py-4 border-b hover:opacity-70 transition-opacity group"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="eyebrow text-[10px]" style={{ color: "var(--muted)" }}>{c.label}</span>
                  <span className="text-sm group-hover:text-white transition-colors" style={{ color: "var(--light)" }}>{c.val} →</span>
                </a>
              ))}
            </div>

            <address className="reveal not-italic" style={{ fontSize: 13, lineHeight: 1.9, color: "var(--muted)" }}>
              İkitelli OSB 4B Blok No:26-28 Kat:2<br />
              Başakşehir / İstanbul<br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Pzt–Cum 08:30–17:30</span>
            </address>
          </div>

          {/* Right — Form */}
          <div className="reveal">
            <p className="eyebrow mb-8" style={{ color: "var(--muted)" }}>Teklif / Bilgi Talebi</p>
            {sent ? (
              <div className="p-8 border" style={{ borderColor: "var(--orange)" }}>
                <p className="display mb-4" style={{ fontSize: 36, color: "var(--orange)" }}>✓</p>
                <p style={{ fontSize: 16, lineHeight: 1.7 }}>Talebiniz alındı. En kısa sürede dönüş yapılacaktır.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Ad Soyad *" type="text" required />
                  <Field label="Firma" type="text" />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="E-posta *" type="email" required />
                  <Field label="Telefon" type="tel" />
                </div>
                <div>
                  <label className="eyebrow block mb-3" style={{ fontSize: 10, color: "var(--muted)" }}>Konu</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full bg-transparent border-b py-3 text-sm outline-none appearance-none"
                    style={{ borderColor: "rgba(255,255,255,0.12)", color: subject ? "var(--light)" : "var(--muted)" }}>
                    <option value="" disabled>Seçin</option>
                    <option value="urun">Ürün Bilgisi</option>
                    <option value="fiyat">Fiyat Talebi</option>
                    <option value="ihracat">İhracat</option>
                    <option value="katalog">Katalog</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="eyebrow block mb-3" style={{ fontSize: 10, color: "var(--muted)" }}>Mesaj *</label>
                  <textarea required rows={4} className="w-full bg-transparent border-b py-3 text-sm outline-none resize-none"
                    style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                </div>
                <button type="submit"
                  className="self-start px-10 py-4 text-sm uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity mt-2"
                  style={{ background: "var(--orange)", color: "var(--dark)" }}>
                  Gönder →
                </button>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
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
      <label className="eyebrow block mb-3" style={{ fontSize: 10, color: "var(--muted)" }}>{label}</label>
      <input type={type} required={required}
        className="w-full bg-transparent border-b py-3 text-sm outline-none"
        style={{ borderColor: "rgba(255,255,255,0.12)" }} />
    </div>
  );
}
