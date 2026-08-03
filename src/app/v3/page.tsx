import { villages } from "@/lib/data";
import { fetchAllVillageStats } from "@/lib/village-stats";
import AdvantagesSection from "./_components/home/AdvantagesSection";
import CatalogPreview from "./_components/home/CatalogPreview";
import Hero from "./_components/home/Hero";
import QuizSection from "./_components/home/QuizSection";
import ReviewsSection from "./_components/home/ReviewsSection";
import StepsSection from "./_components/home/StepsSection";
import TrustBar from "./_components/home/TrustBar";

/**
 * Главная /v3 — витрина нового дизайна («тёмный премиум»).
 *
 * Порядок секций повторяет боевую главную: первый экран → доверие →
 * каталог → преимущества → шаги → отзывы → форма подбора.
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
      <ReviewsSection />
      <QuizSection />
    </main>
  );
}
