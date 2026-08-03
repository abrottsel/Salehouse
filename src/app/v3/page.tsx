import { villages } from "@/lib/data";
import { extractVillageUuid } from "@/lib/village-stats";
import PlotMapDark from "./_components/PlotMapDark";

/**
 * /v3 — стенд нового дизайна. Первый собранный кусок: карта участков.
 * Прод не затронут: ничего не импортируется из боевых страниц и
 * ничего отсюда в них не используется.
 */
export default function V3Page() {
  const village = villages.find((v) => v.slug === "favorit") ?? villages[0];
  const uuid = extractVillageUuid(village.iframeMapUrl, village.mapUuid);

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-400/25">
          демо · v3
        </div>
        <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          Карта участков,
          <br />
          <span className="bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">
            на которой видно свободные
          </span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-white/55">
          Данные и бронирование — из системы Земекс, как и раньше. Изменилось
          то, как это показано: проданные уходят в фон, свободные светятся,
          появился фильтр по площади и бюджету и карточка участка с кадастром.
        </p>
      </header>

      {uuid ? (
        <PlotMapDark uuid={uuid} bookingUrl={village.iframeMapUrl} />
      ) : (
        <p className="text-white/50">У посёлка нет карты Земекс.</p>
      )}
    </main>
  );
}
