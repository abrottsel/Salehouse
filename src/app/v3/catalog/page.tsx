import type { Metadata } from "next";
import { villages } from "@/lib/data";
import { fetchAllVillageStats } from "@/lib/village-stats";
import CatalogBrowser from "../_components/catalog/CatalogBrowser";
import CatalogStats from "../_components/catalog/CatalogStats";
import {
  ALL,
  DIRECTIONS,
  STAT_PRICE_MIN,
  STAT_VILLAGES,
  money,
  plural,
  shortDirection,
} from "../_components/catalog/data";
import { Accent, Eyebrow } from "../_components/ui/primitives";

const DIRECTION_LIST = DIRECTIONS.filter((d) => d !== ALL)
  .map(shortDirection)
  .join(", ");

export const metadata: Metadata = {
  title: "Каталог посёлков",
  description:
    `${STAT_VILLAGES} ${plural(
      STAT_VILLAGES,
      "коттеджный посёлок",
      "коттеджных посёлка",
      "коттеджных посёлков",
    )} в Подмосковье от ${money(STAT_PRICE_MIN)} ₽ за сотку. ` +
    `Направления: ${DIRECTION_LIST}. Фильтр по цене, площади участка и готовности посёлка.`,
};

// Остатки участков обновляем раз в 15 минут — как на боевой главной.
export const revalidate = 900;

export default async function V3CatalogPage() {
  // Живые остатки из Земекс. В data.ts цифры местами устарели (у Фаворита
  // там 12 свободных, в системе — 42), а на странице посёлка показывается
  // живое число: без этого каталог и посёлок противоречили бы друг другу.
  const stats = await fetchAllVillageStats(villages);
  const liveAvailable = Object.fromEntries(
    Object.entries(stats).map(([slug, s]) => [slug, s.plotsAvailable]),
  );
  const totalAvailable = Object.values(stats).reduce((sum, s) => sum + s.plotsAvailable, 0);

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 sm:mb-10">
        <div className="mb-4">
          <Eyebrow>Каталог посёлков</Eyebrow>
        </div>
        <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          Найдите свой
          <br className="sm:hidden" />{" "}
          <Accent>идеальный участок</Accent>
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-white/55 sm:text-[17px]">
          Все посёлки ЗемПлюс на одной странице. Отфильтруйте по направлению, цене за
          сотку, площади и готовности — и переходите в посёлок, чтобы посмотреть
          свободные участки на карте.
        </p>

        <div className="mt-6">
          <CatalogStats plotsAvailable={totalAvailable} />
        </div>
      </header>

      <CatalogBrowser liveAvailable={liveAvailable} />
    </main>
  );
}
