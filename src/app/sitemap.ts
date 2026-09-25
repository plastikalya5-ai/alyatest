import type { MetadataRoute } from "next";
import { HREFLANG, SITE_URL, getTumUrunler, mevcutDiller, urunUrl } from "@/lib/urun-sayfasi";

export const revalidate = 3600;

// Ana sayfa + her ürün sayfası. Yabancı dil adresleri yalnızca çevirisi girilmiş ürünler için listelenir (hreflang karşılıklı).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const kok: MetadataRoute.Sitemap = [{ url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
  try {
    const urunler = await getTumUrunler();
    const liste: MetadataRoute.Sitemap = [];
    for (const u of urunler) {
      const diller = mevcutDiller(u);
      const languages = Object.fromEntries(diller.map(d => [HREFLANG[d], urunUrl(d, u.slug)]));
      for (const d of diller) liste.push({ url: urunUrl(d, u.slug), lastModified: u.updated_at ? new Date(u.updated_at) : new Date(), changeFrequency: "monthly", priority: d === "tr" ? 0.8 : 0.6, alternates: diller.length > 1 ? { languages } : undefined });
    }
    return [...kok, ...liste];
  } catch { return kok; }
}
