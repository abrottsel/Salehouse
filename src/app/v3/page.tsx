import { villages } from "@/lib/data";
import { fetchAllVillageStats } from "@/lib/village-stats";
import AdvantagesSection from "./_components/home/AdvantagesSection";
import CatalogPreview from "./_components/home/CatalogPreview";
import Hero from "./_components/home/Hero";
import QuizSection from "./_components/home/QuizSection";
import ReviewsTeaser from "./_components/home/ReviewsTeaser";
import StepsSection from "./_components/home/StepsSection";
import TrustBar from "./_components/home/TrustBar";

/**
 * Главная /v3 — витрина нового дизайна («тёмный премиум»).
 *
 * Порядок секций: первый экран → доверие → каталог → преимущества →
 * шаги → строка доверия по отзывам → форма подбора.
 *
 * Карточки отзывов с главной убраны — они живут в разделе /v3/reviews,
 * здесь только рейтинг и ссылка туда.
 *
 * Прод не затронут: страница ничего не импортирует из боевых компонентов,
 * только данные (src/lib/data.ts) и собственный фундамент /v3.
 * Шапка и подвал живут в layout.tsx, здесь их нет.
 */
// Остатки участков обновляем раз в 15 минут — как на боевой главной.
export const revalidate = 900;

export default async function V3HomePage() {
  const stats = await fetchAllVillageStats(villages);
  const liveAvailable = Object.fromEntries(
    Object.entries(stats).map(([slug, s]) => [slug, s.plotsAvailable]),
  );
  const totalAvailable = Object.values(stats).reduce((sum, s) => sum + s.plotsAvailable, 0);

  return (
    <main className="pb-24">
      <Hero plotsAvailable={totalAvailable} />
      <TrustBar />
      <CatalogPreview liveAvailable={liveAvailable} />
      <AdvantagesSection />
      <StepsSection />
      <ReviewsTeaser />
      <QuizSection />
    </main>
  );
}
