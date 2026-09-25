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
- **Muhasebe AI** (`/admin/dashboard/muhasebe/ai`, yalnızca `muhasebe` modülü): (1) mevzuat sorularına yalnızca `muhasebe_mevzuat` tablosundaki kaynaklı, tarihli kayıtlardan cevap verir (modelin eski hafızası kullanılmaz; tek kaynaklı/bayat/süresi dolmuş kayıtlar cevapta uyarıyla belirtilir), (2) tüm aritmetiği deterministik hesap aracıyla yapar, (3) şirket verisini (fatura, işlem, KDV, yaşlandırma...) kullanıcının yetkisiyle okur, (4) yüklenen belgeden kullanıcının istediği alanları/tabloları çıkarır (CSV/kopyala, belgeyle sohbet). Mevzuat kayıtları aynı sayfadaki "Güncel mevzuat" sekmesinden güncellenir; yeni tebliğ/karar çıktığında güncellemek ve "Bugün doğruladım" ile işaretlemek gerekir.
  - **Otomatik kaynak takibi:** `vercel.json` içindeki cron her gün `/api/cron/mevzuat`'ı çağırır (`CRON_SECRET` gerekir); en uzun süredir kontrol edilmeyen 8 kaydın kaynak sayfası çekilir, kayıttaki rakamlar sayfada aranır, uyuşmazlıkta (OPENAI_API_KEY varsa) AI karşılaştırır. Değişiklik olası kayıtlar "Kaynakta değişiklik olası" olarak işaretlenir, ajan cevabında uyarır ve `mevzuat_uyari` bildirimi gider (Bildirimler sayfasından açılır).
  - **Belgeden kayda dönüştürme:** okunan belge fatura TASLAĞI veya gelir/gider işlemi olarak (onay ekranıyla) kaydedilebilir; mükerrer, cari eşleşmesi, toplam ve dengeli yevmiye kontrolü yapılır. Yevmiye önerisi sisteme işlenmez.
  - **Raporlar:** KDV beyan hazırlık özeti ve aylık yönetim raporu (rakamlar doğrudan kayıtlardan), Excel indirme, PDF/yazdır, isteğe bağlı AI yorumu. **Sohbet geçmişi** yalnızca kullanıcının kendisine görünür (RLS).

Yönetici uçları `/api/admin/ai` altındadır; kullanıcı başına saatte 80 istek sınırı vardır. Veriler OpenAI'a gönderilir: hassas alanları (vergi no vb.) göndermeyin, KVKK aydınlatmanızı buna göre güncelleyin.

## Sosyal medya + n8n
Panel: Ürün Yönetimi → Sosyal Medya (AI içerik, takvim, görsel şablonlar). Otomatik paylaşım n8n'de kurulur:
- **n8n → site** (çekme): `GET /api/webhooks/sosyal` tarihi gelmiş "planlandı" gönderileri verir; paylaşım sonrası `POST /api/webhooks/sosyal` `{"id","durum":"paylasildi","paylasim_url"}` ile işaretlenir (hata için `{"id","durum":"hata","mesaj"}`). Başlık: `Authorization: Bearer <N8N_SOSYAL_API_TOKEN>`.
- **site → n8n** (itme): Takvim'de "n8n" düğmesi gönderiyi `N8N_SOSYAL_WEBHOOK_URL` adresine yollar (`x-alya-secret` başlığıyla).
Gizli değerler yalnızca Vercel ortam değişkenlerindedir; ayrıntı `.env.example`.

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
