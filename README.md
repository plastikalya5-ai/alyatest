# Alya Plastik

Alya Plastik'in tanıtım sitesi ve yönetim paneli (mini ERP). Next.js (App Router) + Supabase, Vercel'de yayında.

- **Site:** tek sayfalık B2B vitrin (ürünler, ihracat, iletişim formu), Supabase'den beslenir.
- **Admin (`/admin`):** site yönetimi, muhasebe, stok, üretim, satış/satınalma/sevkiyat, kalite, kullanıcı ve roller.
- **Yetkilendirme:** Supabase Auth + `roller.moduller` (RLS: `private.has_module`). Yönetici rolü `*` modülüne sahiptir.

## AI özellikleri (OpenAI)

`OPENAI_API_KEY` tanımlıysa açılır; yoksa hepsi kapalıdır ve site/panel normal çalışır.

- **Site sohbet asistanı** (`/api/chat`): katalog bilgili, IP başına saatte 15 mesaj + günlük toplam tavan.
- **Başvuru analizi:** yeni başvurular otomatik sınıflandırılır (kategori, öncelik, dil, spam) ve taslak cevap üretilir.
- **Ürünler:** AI ile açıklama + 5 dil çevirisi + SEO önerisi, görselden etiket önerisi.
- **AI Asistan** (`/admin/dashboard/asistan`) ve dashboard **AI Durum Özeti**: yalnızca yetkili kullanıcının oturumuyla, hazır `rpc_*`/görünüm araçlarıyla okur; yazma yapmaz.
- **Banka ekstresi:** eşleşmeyen satırlar için cari/kategori önerisi (IBAN maskelenir).
- **Faturalar:** fatura/irsaliye fotoğrafı veya PDF'inden form doldurma (kaydı kullanıcı onaylar).

Yönetici uçları `/api/admin/ai` altındadır; kullanıcı başına saatte 80 istek sınırı vardır. Veriler OpenAI'a gönderilir: hassas alanları (vergi no vb.) göndermeyin, KVKK aydınlatmanızı buna göre güncelleyin.

## Kurulum

```bash
npm install
cp .env.example .env.local   # değerleri doldur
npm run dev
```

Ortam değişkenleri `.env.example` içinde açıklanmıştır. Bildirimler (SMTP / n8n) tanımlı değilse ilgili kanal sessizce atlanır.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run lint` | ESLint |
| `npm run smoke-test [url]` | Yayındaki sitede temel erişim/güvenlik kontrolleri |

## Notlar

- Next.js 16: `middleware` yerine `proxy.ts` kullanılır (`/admin/dashboard` oturum koruması).
- Tüm ERP/muhasebe istekleri `/api/erp` ve `/api/muhasebe` proxy'leri üzerinden gider; tablo izin listesi + RLS ile korunur.
- `FIELD_ENCRYPTION_KEY` kaybedilirse şifreli alanlar (cari vergi no) çözülemez; güvenli bir yerde yedekleyin.
