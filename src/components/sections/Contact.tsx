"use client";
import { useState } from "react";

export default function Contact() {
  const [subject, setSubject] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" style={{ background: "#161a17", color: "var(--light)", padding: "100px 0 80px" }}>
      <div style={{ paddingInline: "var(--pad)" }}>

        {/* Top */}
        <div className="grid md:grid-cols-[1.2fr_1fr] grid-cols-1" style={{ gap: "8vw" }}>
          <div>
            <p className="eyebrow" style={{ color: "var(--muted)" }}>09 — İLETİŞİM</p>
            <h2 className="display" style={{ fontSize: "clamp(72px, 10.2vw, 180px)", marginTop: 28 }}>
              BİRLİKTE<br />KONUŞALIM.
            </h2>
          </div>

          <div style={{ paddingTop: 62 }}>
            <a href="mailto:info@alyaplastik.com" className="block hover:opacity-70 transition-opacity"
              style={{ fontSize: "clamp(18px, 2.2vw, 34px)", letterSpacing: "-0.035em", marginBottom: 12 }}>
              info@alyaplastik.com ↗
            </a>
            <a href="mailto:export@alyaplastik.com" className="block hover:opacity-70 transition-opacity"
              style={{ fontSize: "clamp(18px, 2.2vw, 34px)", letterSpacing: "-0.035em", marginBottom: 12 }}>
              export@alyaplastik.com ↗
            </a>

            <div className="grid grid-cols-2 mt-8" style={{ gap: 25 }}>
              <div>
                <p style={{ fontSize: 13, lineHeight: 1.9, color: "#b2b8a9" }}>
                  <strong style={{ color: "var(--light)" }}>Türkiye</strong><br />
                  +90 212 671 85 65<br />
                  +90 535 761 65 24<br />
                  <strong style={{ color: "var(--light)" }}>İhracat</strong><br />
                  +90 532 399 70 31
                </p>
              </div>
              <address style={{ fontStyle: "normal" }}>
                <p style={{ fontSize: 13, lineHeight: 1.9, color: "#b2b8a9" }}>
                  İkitelli OSB 4B Blok<br />
                  No:26-28 Kat:2<br />
                  Başakşehir / İstanbul
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.9, color: "#b2b8a9", marginTop: 12 }}>
                  Pzt–Cum 08:30–17:30
                </p>
              </address>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ marginTop: 80, maxWidth: 680 }}>
          <p className="eyebrow" style={{ color: "var(--muted)", marginBottom: 32 }}>TEKLİF / BİLGİ TALEBİ</p>

          {sent ? (
            <div style={{ border: "1px solid var(--orange)", padding: "32px", fontSize: 16, lineHeight: 1.7 }}>
              Talebiniz alındı. En kısa sürede dönüş yapılacaktır.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                <InputField label="Ad Soyad *" type="text" required />
                <InputField label="Firma Adı" type="text" />
              </div>
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                <InputField label="E-posta *" type="email" required />
                <InputField label="Telefon" type="tel" />
              </div>

              <div>
                <label className="eyebrow" style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 8 }}>
                  Konu Seçin
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent border-b py-3 text-sm outline-none appearance-none"
                  style={{ borderColor: "#ffffff20", color: subject ? "var(--light)" : "var(--muted)" }}
                >
                  <option value="" disabled>Konu Seçin</option>
                  <option value="urun">Ürün Bilgisi</option>
                  <option value="fiyat">Fiyat Talebi</option>
                  <option value="ihracat">İhracat / Export</option>
                  <option value="katalog">Katalog Talebi</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <InputField label="İlgilendiğiniz Ürün / Kod" type="text" />

              <div>
                <label className="eyebrow" style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 8 }}>
                  Mesajınız *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-transparent border-b py-3 text-sm outline-none resize-none"
                  style={{ borderColor: "#ffffff20" }}
                />
              </div>

              <button
                type="submit"
                className="self-start flex items-center gap-4 text-sm uppercase tracking-widest border-b pb-3 hover:opacity-70 transition-opacity mt-4"
                style={{ borderColor: "#ffffff40" }}
              >
                GÖNDER <span style={{ color: "var(--orange)" }}>→</span>
              </button>

              <p style={{ fontSize: 11, color: "#657060", marginTop: 8 }}>
                Formu göndererek KVKK kapsamında kişisel verilerinizin işlenmesine onay vermiş olursunuz.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function InputField({ label, type, required }: { label: string; type: string; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow" style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 8 }}>
        {label}
      </label>
      <input
        type={type}
        required={required}
        className="w-full bg-transparent border-b py-3 text-sm outline-none focus:border-orange-400 transition-colors"
        style={{ borderColor: "#ffffff20" }}
      />
    </div>
  );
}
