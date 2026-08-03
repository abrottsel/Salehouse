import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { villages } from "@/lib/data";
import { extractVillageUuid, fetchVillageStats } from "@/lib/village-stats";

import ZemexxFrame from "@/app/v3/_components/village/ZemexxFrame";
import MapDisclosure from "@/app/v3/_components/village/MapDisclosure";
import VillageAdvantages from "@/app/v3/_components/village/VillageAdvantages";
import VillageHero from "@/app/v3/_components/village/VillageHero";
import ViewingForm from "@/app/v3/_components/village/ViewingForm";
import { Reveal } from "@/app/v3/_components/ui/motion";
import { SectionTitle } from "@/app/v3/_components/ui/primitives";

/**
 * /v3/village/[slug] — страница посёлка нового дизайна.
 *
 * Блоки:
 *   1. VillageHero        — полноэкранная фотокарусель + пилюли цифр
 *                           и «Дорога к мечте» (RouteBadgeDark)
 *   2. VillageAdvantages  — стат-ячейки, три плитки, инфраструктура
 *   3. PlotMapDark        — карта участков (компонент готов, не трогаем)
 *   4. ViewingForm        — запись на просмотр, ничего не отправляет
 *
 * Остатки участков живые: тянем их из Земекс на сервере и раздаём в hero
 * и в блок преимуществ, чтобы цифры на странице не расходились.
 */

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return villages.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const village = villages.find((v) => v.slug === slug);
  if (!village) return { title: "Посёлок не найден" };

  return {
    title: `${village.name} — участки от ${village.priceFrom.toLocaleString("ru-RU")} ₽ за сотку`,
    description: village.description,
  };
}

// Живые остатки Земекс кешируются на 15 минут — страница обновляется в такт.
export const revalidate = 900;

export default async function V3VillagePage({ params }: Props) {
  const { slug } = await params;
  const village = villages.find((v) => v.slug === slug);
  if (!village) notFound();

  const uuid = extractVillageUuid(village.iframeMapUrl, village.mapUuid);
  const stats = uuid
    ? await fetchVillageStats(uuid, {
        plotsAvailable: village.plotsAvailable,
        plotsCount: village.plotsCount,
      })
    : { plotsAvailable: village.plotsAvailable, plotsCount: village.plotsCount };

  return (
    <main>
      <VillageHero
        name={village.name}
        direction={village.direction}
        distance={village.distance}
        readiness={village.readiness}
        description={village.description}
        priceFrom={village.priceFrom}
        plotsAvailable={stats.plotsAvailable}
        plotsCount={stats.plotsCount}
        areaFrom={village.areaFrom}
        areaTo={village.areaTo}
        photos={village.photos}
        coords={village.coords}
      />

      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <nav aria-label="Хлебные крошки" className="pt-8">
          <Link
            href="/v3/catalog"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Все посёлки
          </Link>
        </nav>

        <section className="pt-6 sm:pt-10">
          <VillageAdvantages
            name={village.name}
            direction={village.direction}
            distance={village.distance}
            readiness={village.readiness}
            priceFrom={village.priceFrom}
            plotsAvailable={stats.plotsAvailable}
            plotsCount={stats.plotsCount}
            areaFrom={village.areaFrom}
            areaTo={village.areaTo}
            features={village.features}
          />
        </section>

        <section id="plots-map" className="scroll-mt-24 pt-16 sm:pt-24">
          <Reveal>
            <SectionTitle
              eyebrow="Свободные участки"
              title="Выберите участок"
              accent="на карте"
              sub="Выбирайте участок и бронируйте прямо на карте. Колесо и палец прокручивают страницу — чтобы работать с картой, нажмите на неё."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <MapDisclosure />
            {village.iframeMapUrl ? (
              <ZemexxFrame
                src={village.iframeMapUrl}
                villageName={village.name}
                villageCoords={village.coords}
              />
            ) : (
              <div className="grid h-[320px] place-items-center rounded-[28px] bg-white/[0.03] px-6 text-center text-[15px] text-white/50 ring-1 ring-white/10">
                У посёлка пока нет карты участков — свободные предложения подскажет менеджер.
              </div>
            )}
          </Reveal>
        </section>

        <section id="viewing" className="scroll-mt-24 pt-16 sm:pt-24">
          <Reveal>
            <ViewingForm villageName={village.name} />
          </Reveal>
        </section>

        <div className="pt-16 sm:pt-24">
          <Link
            href="/v3/catalog"
            className="group flex items-center justify-between gap-4 rounded-[24px] bg-white/[0.05] px-5 py-5 ring-1 ring-white/10 transition-colors hover:bg-white/[0.09] sm:px-7 sm:py-6"
          >
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                Смотреть дальше
              </span>
              <span className="mt-1 block text-[19px] font-extrabold sm:text-[22px]">
                Все посёлки
              </span>
            </span>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25 transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
