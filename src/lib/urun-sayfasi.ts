import { supabase, type Product } from "@/lib/supabase";

export const SITE_URL = "https://alyatest-alyis.vercel.app";
export const DILLER = ["tr", "en", "de", "fr", "ar", "ru"] as const;
export type Dil = (typeof DILLER)[number];
export const DIL_AD: Record<Dil, string> = { tr: "Türkçe", en: "English", de: "Deutsch", fr: "Français", ar: "العربية", ru: "Русский" };
export const HREFLANG: Record<Dil, string> = { tr: "tr-TR", en: "en", de: "de", fr: "fr", ar: "ar", ru: "ru" };
export const isDil = (x: string): x is Dil => (DILLER as readonly string[]).includes(x);

export type UrunKaydi = Product & { description_i18n: Partial<Record<Dil, string>> | null };
const SUTUNLAR = "id,code,name,slug,category,subcategory,description,image_url,images,specs,tags,is_featured,is_new,sort_order,created_at,updated_at,description_i18n";

/** Slug yalnızca küçük harf, rakam ve tire içerir; başka bir şey veritabanı sorgusuna hiç girmez. */
export const slugGecerli = (s: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 120;

export async function getUrun(slug: string): Promise<UrunKaydi | null> {
  if (!slugGecerli(slug)) return null;
  const { data } = await supabase.from("products").select(SUTUNLAR).eq("slug", slug).maybeSingle();
  return (data as UrunKaydi) ?? null;
}

export async function getTumUrunler(): Promise<(UrunKaydi & { updated_at?: string })[]> {
  const { data } = await supabase.from("products").select(SUTUNLAR).order("sort_order", { ascending: true }).limit(2000);
  return (data as any[]) ?? [];
}

/** Kategori slug'ı → görünen ad (categories tablosu). Bulunamazsa slug'ın baş harfi büyütülür. */
export async function getKategoriAdlari(): Promise<Record<string, string>> {
  const { data } = await supabase.from("categories").select("slug,name").limit(200);
  return Object.fromEntries((data || []).map((c: any) => [c.slug, c.name]));
}
export const kategoriAdi = (slug: string | null | undefined, harita: Record<string, string>) => (slug ? harita[slug] || slug.charAt(0).toLocaleUpperCase("tr-TR") + slug.slice(1) : "");

/** Teknik özellik anahtarları (veride ASCII, ör. "cap", "agirlik") için görünen etiketler. */
const OZ: Record<string, Record<Dil, string>> = {
  cap: { tr: "Çap", en: "Diameter", de: "Durchmesser", fr: "Diamètre", ar: "القطر", ru: "Диаметр" },
  hacim: { tr: "Hacim", en: "Volume", de: "Volumen", fr: "Volume", ar: "الحجم", ru: "Объём" },
  agirlik: { tr: "Ağırlık", en: "Weight", de: "Gewicht", fr: "Poids", ar: "الوزن", ru: "Вес" },
  malzeme: { tr: "Malzeme", en: "Material", de: "Material", fr: "Matériau", ar: "المادة", ru: "Материал" },
  yukseklik: { tr: "Yükseklik", en: "Height", de: "Höhe", fr: "Hauteur", ar: "الارتفاع", ru: "Высота" },
  genislik: { tr: "Genişlik", en: "Width", de: "Breite", fr: "Largeur", ar: "العرض", ru: "Ширина" },
  uzunluk: { tr: "Uzunluk", en: "Length", de: "Länge", fr: "Longueur", ar: "الطول", ru: "Длина" },
  renk: { tr: "Renk", en: "Colour", de: "Farbe", fr: "Couleur", ar: "اللون", ru: "Цвет" },
  boyut: { tr: "Boyut", en: "Size", de: "Größe", fr: "Taille", ar: "الحجم", ru: "Размер" },
  kapasite: { tr: "Kapasite", en: "Capacity", de: "Fassungsvermögen", fr: "Capacité", ar: "السعة", ru: "Вместимость" },
  ebat: { tr: "Ebat", en: "Dimensions", de: "Abmessungen", fr: "Dimensions", ar: "الأبعاد", ru: "Размеры" },
};
const anahtar = (k: string) => k.toLocaleLowerCase("tr-TR").replace(/[çğıöşü]/g, c => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" } as Record<string, string>)[c]).replace(/[^a-z0-9]/g, "");
export const ozellikEtiketi = (k: string, d: Dil) => OZ[anahtar(k)]?.[d] || (k.charAt(0).toLocaleUpperCase(d === "tr" ? "tr-TR" : undefined) + k.slice(1));

export async function getBenzer(u: UrunKaydi, n = 4): Promise<UrunKaydi[]> {
  const { data } = await supabase.from("products").select(SUTUNLAR).eq("category", u.category).neq("id", u.id).order("sort_order", { ascending: true }).limit(n);
  return (data as UrunKaydi[]) ?? [];
}

/** Bu üründe hangi dillerde içerik var: Türkçe her zaman; diğerleri yalnızca çevirisi girilmişse. */
export function mevcutDiller(u: Pick<UrunKaydi, "description_i18n">): Dil[] {
  const i = u.description_i18n || {};
  return DILLER.filter(d => d === "tr" || (typeof i[d] === "string" && i[d]!.trim().length > 0));
}
export const aciklama = (u: UrunKaydi, d: Dil) => (d === "tr" ? u.description || "" : (u.description_i18n?.[d] || "")).trim();
export const urunYolu = (d: Dil, slug: string) => (d === "tr" ? `/urun/${slug}` : `/${d}/urun/${slug}`);
export const urunUrl = (d: Dil, slug: string) => `${SITE_URL}${urunYolu(d, slug)}`;
export const kisalt = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");

/** Arayüz metinleri. */
export const UI: Record<Dil, { anasayfa: string; urunler: string; kod: string; kategori: string; ozellikler: string; etiketler: string; teklif: string; whatsapp: string; benzer: string; b2b: string; yeni: string; dil: string; wamesaj: (ad: string, kod: string) => string }> = {
  tr: { anasayfa: "Ana sayfa", urunler: "Ürünler", kod: "Ürün kodu", kategori: "Kategori", ozellikler: "Özellikler", etiketler: "Etiketler", teklif: "Teklif iste", whatsapp: "WhatsApp ile sor", benzer: "Benzer ürünler", b2b: "Toptan ve ihracat siparişleri için özel fiyat ve sevkiyat bilgisi alın.", yeni: "Yeni", dil: "Dil", wamesaj: (a, k) => `Merhaba, ${a} (${k}) ürünü için toptan fiyat teklifi almak istiyorum.` },
  en: { anasayfa: "Home", urunler: "Products", kod: "Product code", kategori: "Category", ozellikler: "Specifications", etiketler: "Tags", teklif: "Request a quote", whatsapp: "Ask on WhatsApp", benzer: "Related products", b2b: "Get wholesale and export pricing and shipping information.", yeni: "New", dil: "Language", wamesaj: (a, k) => `Hello, I would like a wholesale quotation for ${a} (${k}).` },
  de: { anasayfa: "Startseite", urunler: "Produkte", kod: "Artikelnummer", kategori: "Kategorie", ozellikler: "Eigenschaften", etiketler: "Schlagwörter", teklif: "Angebot anfragen", whatsapp: "Per WhatsApp fragen", benzer: "Ähnliche Produkte", b2b: "Fordern Sie Großhandels- und Exportpreise sowie Versandinformationen an.", yeni: "Neu", dil: "Sprache", wamesaj: (a, k) => `Guten Tag, ich möchte ein Großhandelsangebot für ${a} (${k}) anfragen.` },
  fr: { anasayfa: "Accueil", urunler: "Produits", kod: "Référence", kategori: "Catégorie", ozellikler: "Caractéristiques", etiketler: "Mots-clés", teklif: "Demander un devis", whatsapp: "Demander sur WhatsApp", benzer: "Produits similaires", b2b: "Obtenez les prix de gros et export ainsi que les informations d'expédition.", yeni: "Nouveau", dil: "Langue", wamesaj: (a, k) => `Bonjour, je souhaite recevoir un devis de gros pour ${a} (${k}).` },
  ar: { anasayfa: "الرئيسية", urunler: "المنتجات", kod: "رمز المنتج", kategori: "الفئة", ozellikler: "المواصفات", etiketler: "الوسوم", teklif: "اطلب عرض سعر", whatsapp: "اسأل عبر واتساب", benzer: "منتجات مشابهة", b2b: "احصل على أسعار الجملة والتصدير ومعلومات الشحن.", yeni: "جديد", dil: "اللغة", wamesaj: (a, k) => `مرحباً، أرغب في الحصول على عرض سعر بالجملة للمنتج ${a} (${k}).` },
  ru: { anasayfa: "Главная", urunler: "Продукция", kod: "Артикул", kategori: "Категория", ozellikler: "Характеристики", etiketler: "Теги", teklif: "Запросить цену", whatsapp: "Написать в WhatsApp", benzer: "Похожие товары", b2b: "Получите оптовые и экспортные цены и информацию о доставке.", yeni: "Новинка", dil: "Язык", wamesaj: (a, k) => `Здравствуйте, я хочу получить оптовое коммерческое предложение на ${a} (${k}).` },
};

/** JSON-LD içine gömülürken HTML kapatma karakterlerini kaçırır (XSS önlemi). */
export const jsonLdMetni = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

export function urunJsonLd(u: UrunKaydi, d: Dil, kategori?: string) {
  const resimler = [u.image_url, ...(u.images || [])].filter((x, i, a) => typeof x === "string" && x.startsWith("https://") && a.indexOf(x) === i);
  const ozellik = Object.entries(u.specs || {}).slice(0, 20).map(([k, v]) => ({ "@type": "PropertyValue", name: ozellikEtiketi(String(k), d).slice(0, 80), value: String(v).slice(0, 200) }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Product", "@id": `${urunUrl(d, u.slug)}#product`, name: u.name, sku: u.code, category: kategori || u.category, description: kisalt(aciklama(u, d), 500), image: resimler, url: urunUrl(d, u.slug), inLanguage: HREFLANG[d],
        brand: { "@type": "Brand", name: "Alya Plastik" }, manufacturer: { "@type": "Organization", name: "Alya Plastik", url: SITE_URL }, ...(ozellik.length ? { additionalProperty: ozellik } : {}) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: UI[d].anasayfa, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: UI[d].urunler, item: `${SITE_URL}/#collection` },
        { "@type": "ListItem", position: 3, name: u.name, item: urunUrl(d, u.slug) },
      ] },
    ],
  };
}
