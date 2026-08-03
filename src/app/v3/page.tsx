import { villages } from "@/lib/data";
import MapStage from "./_components/MapStage";

/**
 * /v3 — демо-стенд нового слоя над картой участков.
 *
 * Прод не затронут: сюда ничего не импортируется из боевой страницы
 * посёлка, а боевая страница ничего не берёт отсюда.
 */
export default function V3Page() {
  const village = villages.find((v) => v.slug === "favorit") ?? villages[0];

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-7">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/55 ring-1 ring-white/12">
          демо · v3
        </div>
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
          Новый слой поверх карты участков
        </h1>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-white/60">
          Три варианта интерфейса над фреймом Земекс. Фрейм остаётся источником
          данных и местом брони — меняется только слой поверх него. Посёлок для
          примера — {village.name}.
        </p>
      </header>

      <MapStage
        village={{
          name: village.name,
          priceFrom: village.priceFrom,
          plotsCount: village.plotsCount,
          plotsAvailable: village.plotsAvailable,
          areaFrom: village.areaFrom,
          areaTo: village.areaTo,
          distance: village.distance,
          direction: village.direction,
        }}
        iframeUrl={village.iframeMapUrl}
      />
    </main>
  );
}
