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

## Yönetici güvenliği
- **İki adımlı doğrulama (TOTP):** kenar çubuğu → “İki adımlı doğrulama”. Açık olan kullanıcı, kodu girmeden panele ve veriye erişemez: zorunluluk `private.mfa_tamam()` ile `has_module/is_staff/user_modules` içinde, yani tüm RLS politikalarında uygulanır (`aal2` gerekir).
- **Kurtarma:** telefonunu kaybeden kullanıcının doğrulaması, tam yetkili başka bir yönetici tarafından Kullanıcılar → kullanıcı → “2FA sıfırla” ile kaldırılır. Tek yönetici kilitlenirse Supabase paneli → Authentication → Users → kullanıcı → MFA faktörünü silin. Bu yüzden yedek bir tam yetkili yönetici hesabı bulundurun.
- **Güvenlik bildirimleri:** Bildirimler sayfasındaki “Yönetici Güvenlik Olayı” alıcılarına şifre/2FA değişikliği, kullanıcı davet-silme-pasife alma ve rol değişikliği bildirilir.

## Satınalma
Panel: Satış / Lojistik → Satınalma Siparişleri (sipariş, kısmi teslim, stok girişi, alış faturası), Talepler / Teklifler (talep → tedarikçi teklifleri → karşılaştırma → `rpc_satinalma_teklif_siparise_cevir` ile tek işlemde siparişe çevirme) ve Tedarikçiler (cari “tedarikçi” kartları için zamanında teslim, ortalama termin, fiyat geçmişi). Teslim alma `rpc_satinalma_teslim_al` ile tek işlemde yapılır. Muhasebe AI'da okunan alış faturası, `SiparisEslestir` ile tedarikçinin siparişleriyle karşılaştırılır (tutar/miktar/fiyat, teslim alınan mal esas; sistemin oluşturduğu `ALIS-…` faturasıyla çifte kayıt uyarısı) ve `faturalar.satinalma_siparis_id` ile bağlanır.

**Satınalma v2:** çok kalemli talep (kritik stoktan tek tıkla talep, teklif karşılaştırma matrisi), sipariş onay kuralı (Onay kuralı düğmesi; varsayılan kapalı, limit üstü siparişleri yalnızca `satinalma_onay` modülü onaylar), döviz/ithalat (para birimi + kur + masraf; landed cost sipariş değeri oranında dağıtılır), teslimde ret ve tedarikçiye iade (`rpc_satinalma_iade`, İade / Ret sayfası), alış faturasının teslimle atomik oluşması, tedarikçiye e-posta (SMTP_HOST/USER/PASS gerekir) ve WhatsApp (wa.me) gönderimi (`/api/admin/satinalma-gonder`), günlük özette yaklaşan teslimler ve onay bekleyenler.


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


## Çok dilli site (TR · EN · RU · ZH)
Ana sayfa `/` Türkçe; `/en`, `/ru`, `/zh` aynı içeriğin çevirileridir (`src/app/[lang]/page.tsx`, ortak gövde `src/components/Anasayfa.tsx`). Arayüz metinleri tek dosyada: `src/lib/site-metin.ts` (yeni dil eklemek için `src/lib/diller.ts` içindeki `DILLER` + bu sözlük). Ürün adları/kodları çevrilmez; ürün açıklamaları `products.description_i18n` içinden gelir (panelde Ürünler → "AI ile doldur" en/ru/zh çevirisini üretir; çevirisi olmayan üründe kart Türkçe sayfaya gider). Kategori adları sözlükteki `kategori` haritasından çevrilir (yeni kategori için ekleyin, yoksa veritabanındaki ad gösterilir). Sağ üstteki dil seçici, `hreflang` bağlantıları ve sitemap otomatik. Not: kök layout tek olduğundan `<html lang>` istemcide ayarlanır.

## n8n bağlantıları
Panel → Bildirimler sayfasındaki "n8n / Webhook bağlantıları" kartı, n8n'e girilecek adresleri (kopyalanabilir) ve her bağlantının hazır/eksik durumunu gösterir. Gizli değerler yalnızca Vercel ortam değişkenlerinde tutulur.
