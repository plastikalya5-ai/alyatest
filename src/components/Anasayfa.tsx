import { getFeaturedProducts, getAllProducts, getStats, getSettings, getExportCountries } from "@/lib/supabase";
import type { Dil } from "@/lib/urun-sayfasi";
import HtmlLang         from "@/components/layout/HtmlLang";
import Header           from "@/components/layout/Header";
import Footer           from "@/components/layout/Footer";
import Animations       from "@/components/layout/Animations";
import SchemaOrg        from "@/components/layout/SchemaOrg";
import WhatsAppFab      from "@/components/ui/WhatsAppFab";
import ChatAsistan      from "@/components/ui/ChatAsistan";
import ProgressDots     from "@/components/ui/ProgressDots";
import Hero             from "@/components/sections/Hero";
import Marquee          from "@/components/sections/Marquee";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import HorizontalPin    from "@/components/sections/HorizontalPin";
import Collection       from "@/components/sections/Collection";
import FullscreenFeature from "@/components/sections/FullscreenFeature";
import Why              from "@/components/sections/Why";
import Export           from "@/components/sections/Export";
import Contact          from "@/components/sections/Contact";

// Ana sayfa gövdesi — tüm diller için ortak (tr: "/", diğerleri: "/en", "/ru", "/zh").
export default async function Anasayfa({ dil }: { dil: Dil }) {
  // Env yoksa graceful fallback
  let featured: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let all:      Awaited<ReturnType<typeof getAllProducts>>      = [];
  let stats:    Awaited<ReturnType<typeof getStats>>           = null;
  let settings: Awaited<ReturnType<typeof getSettings>>        = null;
  let countries: string[] = [];

  try {
    [featured, all, stats, settings, countries] = await Promise.all([
      getFeaturedProducts(),
      getAllProducts(),
      getStats(),
      getSettings(),
      getExportCountries(),
    ]);
  } catch (e) {
    console.error("Supabase fetch error:", e);
  }

  return (
    <>
      <HtmlLang dil={dil} />
      <SchemaOrg settings={settings} stats={stats} />
      <Animations />
      <ProgressDots />
      <Header settings={settings} dil={dil} />
      <main>
        <Hero stats={stats} settings={settings} dil={dil} />
        <Marquee dil={dil} />
        <FeaturedProducts products={featured} dil={dil} />
        <HorizontalPin products={all} dil={dil} />
        <Collection products={all} dil={dil} />
        <FullscreenFeature dil={dil} />
        <Why stats={stats} dil={dil} />
        <Export countries={countries} dil={dil} />
        <Contact settings={settings} dil={dil} />
      </main>
      <Footer settings={settings} dil={dil} />
      <WhatsAppFab settings={settings} dil={dil} />
      <ChatAsistan dil={dil} />
    </>
  );
}
