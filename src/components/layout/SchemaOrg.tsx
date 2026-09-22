// Schema.org yapılandırılmış veri — JSON-LD (Google'ın tercih ettiği format)
// seo-schema skill kuralı: server-rendered HTML içinde, JS ile inject ETMEYİN

import type { Settings, Stats } from "@/lib/supabase";

const SITE_URL = "https://alyatest-alyis.vercel.app";

export default function SchemaOrg({
  settings,
  stats,
}: {
  settings: Settings | null;
  stats: Stats | null;
}) {
  const phone   = settings?.phone   ?? "+90 212 671 85 65";
  const email   = settings?.email   ?? "info@alyaplastik.com";
  const address = settings?.address ?? "İkitelli OSB 4B Blok No:26-28 Kat:2, Başakşehir, İstanbul";
  const founded = settings?.founded ?? 1968;
  const years   = stats?.years      ?? 55;
  const models  = stats?.models     ?? 200;
  const countries = stats?.countries ?? 20;

  // ── Organization + LocalBusiness ──────────────────────
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: "Alya Plastik San. Tic. Ltd. Şti.",
    alternateName: "Alya Plastik",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 200,
      height: 60,
    },
    image: `${SITE_URL}/og-image.jpg`,
    description: `${founded}'den bu yana plastik ürün üretiminde lider. Saksı, sepet, sandık ve ev ürünleri. ${models}+ model, ${countries}+ ülke ihracatı.`,
    foundingDate: String(founded),
    numberOfEmployees: { "@type": "QuantitativeValue", value: 50 },
    telephone: phone,
    email: email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "İkitelli OSB 4B Blok No:26-28 Kat:2",
      addressLocality: "Başakşehir",
      addressRegion: "İstanbul",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.0628,
      longitude: 28.7828,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        opens: "08:30",
        closes: "17:30",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "customer service",
        availableLanguage: ["Turkish", "English"],
        areaServed: "TR",
      },
      {
        "@type": "ContactPoint",
        telephone: settings?.export_phone ?? "+90 532 399 70 31",
        contactType: "sales",
        availableLanguage: ["Turkish", "English"],
        areaServed: "Worldwide",
      },
    ],
    sameAs: [
      "https://wa.me/905357616524",
    ],
    areaServed: {
      "@type": "Place",
      name: "Worldwide",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Plastik Ürün Kataloğu",
      numberOfItems: models,
    },
  };

  // ── WebSite ─────────────────────────────────────────────
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Alya Plastik",
    description: "Plastik Saksı, Sepet ve Depolama Ürünleri Üreticisi",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "tr-TR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/#collection?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // ── Product (Manufacturer) ──────────────────────────────
  const manufacturerSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Plastik Saksı Koleksiyonu",
    description: `${models}+ farklı plastik saksı modeli. Venüs, UFO, 3D, Kristal ve daha fazlası. Toptan B2B satış ve ihracat.`,
    brand: {
      "@type": "Brand",
      name: "Alya Plastik",
    },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    audience: {
      "@type": "BusinessAudience",
      audienceType: "B2B",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TRY",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };

  // ── BreadcrumbList ──────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Ürünler",   item: `${SITE_URL}/#products` },
      { "@type": "ListItem", position: 3, name: "Koleksiyon",item: `${SITE_URL}/#collection` },
      { "@type": "ListItem", position: 4, name: "İletişim",  item: `${SITE_URL}/#contact` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(manufacturerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
