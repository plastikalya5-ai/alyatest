import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import Collection from "@/components/sections/Collection";
import Products from "@/components/sections/Products";
import Export from "@/components/sections/Export";
import Why from "@/components/sections/Why";
import Making from "@/components/sections/Making";
import History from "@/components/sections/History";
import Contact from "@/components/sections/Contact";
import WhatsAppFab from "@/components/ui/WhatsAppFab";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Story />
        <Collection />
        <Products />
        <Making />
        <Export />
        <Why />
        <History />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
