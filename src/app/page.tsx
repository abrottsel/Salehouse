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
import GlassSections from "@/components/GlassSections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroTiles />
        <Catalog />
        <MortgageCalculator />
        <Advantages />

        <GlassSections
          cards={[
            {
              id: "steps-block",
              title: "Как купить участок",
              subtitle: "6 шагов до ключей",
              icon: "ListChecks",
              children: <Steps />,
            },
            {
              id: "faq-block",
              title: "Частые вопросы",
              subtitle: "Ответы на главное",
              icon: "HelpCircle",
              children: <FAQ />,
            },
            {
              id: "reviews-block",
              title: "Отзывы клиентов",
              subtitle: "Реальный опыт",
              icon: "MessageSquare",
              children: <Reviews />,
            },
          ]}
        />

        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
