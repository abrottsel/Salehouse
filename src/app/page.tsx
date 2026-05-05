import Header from "@/components/Header";
import HeroTiles from "@/components/HeroTiles";
import Catalog from "@/components/Catalog";
import MortgageCalculator from "@/components/MortgageCalculator";
import Advantages from "@/components/Advantages";
import Steps from "@/components/Steps";
import FAQ from "@/components/FAQ";
import Reviews from "@/components/Reviews";
import QuizSection from "@/components/QuizSection";
import Footer from "@/components/Footer";
import GlassSections from "@/components/GlassSections";
import { villages } from "@/lib/data";
import { fetchAllVillageStats } from "@/lib/village-stats";

// Revalidate the homepage every 15 minutes so plot counts stay fresh
export const revalidate = 900;

export default async function Home() {
  // Fetch live plot counts from zemexx in parallel, fall back to data.ts
  // on any error. Cached for 15 min via fetch() revalidate in helper.
  const liveStats = await fetchAllVillageStats(villages);

  return (
    <>
      <Header />
      <main>
        <HeroTiles />
        <Catalog liveStats={liveStats} />

        <GlassSections
          cards={[
            {
              id: "faq-block",
              title: "Частые вопросы",
              subtitle: "Ответы на главное",
              icon: "HelpCircle",
              photo: "/villages/favorit/03.jpg",
              children: <FAQ />,
            },
            {
              id: "steps-block",
              title: "Как купить участок",
              subtitle: "6 шагов до ключей",
              icon: "ListChecks",
              photo: "/villages/lesnoy-ostrov/01.jpg",
              children: <Steps />,
            },
            {
              id: "reviews-block",
              title: "Отзывы клиентов",
              subtitle: "Реальный опыт",
              icon: "MessageSquare",
              photo: "/villages/novoe-sonino/01.jpg",
              children: <Reviews />,
            },
          ]}
        />

        <Advantages />
        <MortgageCalculator />
        <QuizSection />
      </main>
      <Footer />
    </>
  );
}
