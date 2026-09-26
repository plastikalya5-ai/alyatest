// Saf sabitler ve yardımcılar — istemci bileşenleri de kullanır; bu yüzden veritabanı istemcisini (supabase) İÇE AKTARMAZ.
export const SITE_URL = "https://alyatest-alyis.vercel.app";
export const DILLER = ["tr", "en", "ru", "zh"] as const;
export type Dil = (typeof DILLER)[number];
export const DIL_AD: Record<Dil, string> = { tr: "Türkçe", en: "English", ru: "Русский", zh: "中文" };
export const HREFLANG: Record<Dil, string> = { tr: "tr-TR", en: "en", ru: "ru", zh: "zh-Hans" };
export const isDil = (x: string): x is Dil => (DILLER as readonly string[]).includes(x);

/** Bu üründe hangi dillerde içerik var: Türkçe her zaman; diğerleri yalnızca çevirisi girilmişse. */
export function mevcutDiller(u: { description_i18n?: Partial<Record<Dil, string>> | null }): Dil[] {
  const i = u.description_i18n || {};
  return DILLER.filter(d => d === "tr" || (typeof i[d] === "string" && i[d]!.trim().length > 0));
}
export const urunYolu = (d: Dil, slug: string) => (d === "tr" ? `/urun/${slug}` : `/${d}/urun/${slug}`);
/** Ürün kartı bağlantısı: o dilde çeviri varsa çevrilmiş sayfa, yoksa Türkçe sayfa. */
export const urunLinki = (p: { slug: string; description_i18n?: unknown }, d: Dil) => urunYolu(mevcutDiller({ description_i18n: (p.description_i18n as any) ?? null }).includes(d) ? d : "tr", p.slug);
export const urunUrl = (d: Dil, slug: string) => `${SITE_URL}${urunYolu(d, slug)}`;
