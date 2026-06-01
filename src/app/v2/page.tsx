import Header from "@/components/Header";
import HeroTiles from "@/components/HeroTiles";
import Catalog from "@/components/Catalog";
import MortgageCalculator from "@/components/MortgageCalculator";
import Advantages from "@/components/Advantages";
import Steps from "@/components/Steps";
import FAQv2 from "@/components/FAQv2";
import Reviews from "@/components/Reviews";
import QuizSection from "@/components/QuizSection";
import Footer from "@/components/Footer";
import GlassSectionsV2 from "@/components/GlassSectionsV2";
import { villages } from "@/lib/data";
import { fetchAllVillageStats } from "@/lib/village-stats";

/**
 * /v2 — текущий прод + доработки на ревью (не индексируется).
 * Отличия от главной (/):
 *   - FAQv2: premium editorial, все ответы открыты, без радужных карточек
 *   - GlassSectionsV2: плавающая кнопка «Свернуть» (видна пока читаешь)
 * Главная (/) остаётся неизменной до промоушена этой версии.
 */

export const metadata = {
  title: "ЗемПлюс v2 — ревью доработок",
  robots: { index: false, follow: false },
};

export const revalidate = 900;

export default async function HomeV2() {
  const liveStats = await fetchAllVillageStats(villages);

  return (
    <>
      <Header />
      <main>
        <HeroTiles />
        <Catalog liveStats={liveStats} />

        <GlassSectionsV2
          cards={[
            {
              id: "faq-block",
              title: "Частые вопросы",
              subtitle: "Ответы на главное",
              icon: "HelpCircle",
              photo: "/villages/favorit/03.jpg",
              children: <FAQv2 />,
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
