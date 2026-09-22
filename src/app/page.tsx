import { getFeaturedProducts, getAllProducts, getStats, getSettings, getExportCountries } from "@/lib/supabase";
import Header           from "@/components/layout/Header";
import Footer           from "@/components/layout/Footer";
import Animations       from "@/components/layout/Animations";
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
  const [featured, all, stats, settings, countries] = await Promise.all([
    getFeaturedProducts(),
    getAllProducts(),
    getStats(),
    getSettings(),
    getExportCountries(),
  ]);

  return (
    <>
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
