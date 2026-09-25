import type { MetadataRoute } from "next";

const BASE = "https://alyatest-alyis.vercel.app";

// Tek sayfalık site: #hash adresleri ayrı URL sayılmaz, bu yüzden yalnızca kök adres listelenir.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
