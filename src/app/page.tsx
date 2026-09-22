import { getFeaturedProducts, getAllProducts, getStats, getSettings, getExportCountries } from "@/lib/supabase";
import Header           from "@/components/layout/Header";
import Footer           from "@/components/layout/Footer";
import Animations       from "@/components/layout/Animations";
import SchemaOrg        from "@/components/layout/SchemaOrg";
import WhatsAppFab      from "@/components/ui/WhatsAppFab";
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

export const revalidate = 60;

export default async function Home() {
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
      <SchemaOrg settings={settings} stats={stats} />
      <Animations />
      <ProgressDots />
      <Header settings={settings} />
      <main>
        <Hero stats={stats} settings={settings} />
        <Marquee />
        <FeaturedProducts products={featured} />
        <HorizontalPin products={all} />
        <Collection products={all} />
        <FullscreenFeature />
        <Why stats={stats} />
        <Export countries={countries} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} />
      <WhatsAppFab settings={settings} />
    </>
  );
}
