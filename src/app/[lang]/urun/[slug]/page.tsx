import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UrunSayfasi from "@/components/urun/UrunSayfasi";
import { getSettings } from "@/lib/supabase";
import { getKategoriAdlari, HREFLANG, SITE_URL, aciklama, getBenzer, getTumUrunler, getUrun, isDil, kisalt, mevcutDiller, urunUrl, type Dil } from "@/lib/urun-sayfasi";

export const revalidate = 300;
const LOCALE: Record<string, string> = { en: "en_US", ru: "ru_RU", zh: "zh_CN" };

// Yalnızca ÇEVİRİSİ girilmiş ürünler için yabancı dil sayfası üretilir (çevirisiz içeriği başka dilde yayınlamak kopya içerik olur).
export async function generateStaticParams() {
  try { return (await getTumUrunler()).flatMap(u => mevcutDiller(u).filter(d => d !== "tr").map(d => ({ lang: d, slug: u.slug }))); } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isDil(lang) || lang === "tr") return { robots: { index: false } };
  const u = await getUrun(slug);
  if (!u || !mevcutDiller(u).includes(lang)) return { title: "Not found", robots: { index: false } };
  const desc = kisalt(aciklama(u, lang), 155);
  const languages: Record<string, string> = Object.fromEntries(mevcutDiller(u).map(d => [HREFLANG[d], urunUrl(d, u.slug)]));
  languages["x-default"] = urunUrl("tr", u.slug);
  return {
    title: `${u.name} — ${u.code}`, description: desc,
    alternates: { canonical: urunUrl(lang, u.slug), languages },
    openGraph: { type: "website", locale: LOCALE[lang], url: urunUrl(lang, u.slug), siteName: "Alya Plastik", title: `${u.name} | Alya Plastik`, description: desc, images: u.image_url ? [{ url: u.image_url, alt: u.name }] : [{ url: `${SITE_URL}/og-image.jpg` }] },
    twitter: { card: "summary_large_image", title: `${u.name} | Alya Plastik`, description: desc, images: u.image_url ? [u.image_url] : undefined },
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isDil(lang) || lang === "tr") notFound();
  const dil = lang as Dil;
  const u = await getUrun(slug);
  if (!u || !mevcutDiller(u).includes(dil)) notFound();
  const [settings, benzer, kategoriler] = await Promise.all([getSettings().catch(() => null), getBenzer(u).catch(() => []), getKategoriAdlari().catch(() => ({}))]);
  return <UrunSayfasi urun={u} dil={dil} settings={settings} benzer={benzer} kategoriler={kategoriler} />;
}
