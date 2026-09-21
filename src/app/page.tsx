import Header         from "@/components/layout/Header";
import Footer         from "@/components/layout/Footer";
import Animations     from "@/components/layout/Animations";
import WhatsAppFab    from "@/components/ui/WhatsAppFab";
import Hero           from "@/components/sections/Hero";
import Marquee        from "@/components/sections/Marquee";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import Collection     from "@/components/sections/Collection";
import FullscreenFeature from "@/components/sections/FullscreenFeature";
import Why            from "@/components/sections/Why";
import Export         from "@/components/sections/Export";
import Contact        from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Animations />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <FeaturedProducts />
        <Collection />
        <FullscreenFeature />
        <Why />
        <Export />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
