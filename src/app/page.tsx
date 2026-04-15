import Header from "@/components/Header";
import HeroTiles from "@/components/HeroTiles";
import Catalog from "@/components/Catalog";
import MortgageCalculator from "@/components/MortgageCalculator";
import Advantages from "@/components/Advantages";
import Steps from "@/components/Steps";
import FAQ from "@/components/FAQ";
import Reviews from "@/components/Reviews";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroTiles />
        <Catalog />
        <MortgageCalculator />
        <Advantages />

        <section className="py-4 lg:py-6 bg-white">
          <CollapsibleSection
            id="steps-block"
            title="Как купить участок"
            icon="ListChecks"
          >
            <Steps />
          </CollapsibleSection>

          <CollapsibleSection
            id="faq-block"
            title="Частые вопросы"
            icon="HelpCircle"
          >
            <FAQ />
          </CollapsibleSection>

          <CollapsibleSection
            id="reviews-block"
            title="Отзывы клиентов"
            icon="MessageSquare"
          >
            <Reviews />
          </CollapsibleSection>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
