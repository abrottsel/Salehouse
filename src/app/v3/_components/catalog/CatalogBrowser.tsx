"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useTier } from "../../_lib/perf";
import { Reveal } from "../ui/motion";
import { CTA, Glass } from "../ui/primitives";
import FilterPanel from "./FilterPanel";
import VillageCard from "./VillageCard";
import {
  NO_FILTERS,
  filterVillages,
  villagesWord,
  type CatalogFilters,
} from "./data";

/** Догружаем порциями — 31 карточка с фото сразу не нужна никому. */
const PAGE = 12;

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";

export default function CatalogBrowser({
  liveAvailable,
}: {
  /** slug → живое число свободных участков из Земекс. */
  liveAvailable?: Record<string, number>;
} = {}) {
  const [filters, setFilters] = useState<CatalogFilters>(NO_FILTERS);
  const [visible, setVisible] = useState(PAGE);
  const lite = useTier() === "lite";

  const found = useMemo(() => filterVillages(filters), [filters]);
  const shown = found.slice(0, visible);
  const rest = found.length - shown.length;

  // Любая смена фильтра возвращает список к первой порции: иначе после
  // «показать ещё» новый, более узкий результат открывался бы целиком.
  const change = useCallback((patch: Partial<CatalogFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setVisible(PAGE);
  }, []);

  const reset = useCallback(() => {
    setFilters(NO_FILTERS);
    setVisible(PAGE);
  }, []);

  return (
    <div>
      <FilterPanel
        filters={filters}
        onChange={change}
        onReset={reset}
        found={found.length}
        lite={lite}
      />

      {found.length === 0 ? (
        <Glass className="mt-8 px-6 py-14 text-center">
          <SlidersHorizontal className="mx-auto mb-4 h-9 w-9 text-white/25" />
          <p className="text-[17px] font-bold">По вашим фильтрам ничего не нашлось</p>
          <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-white/50">
            Попробуйте расширить диапазон цены или площади — или снимите фильтр по
            направлению.
          </p>
          <div className="mt-6 flex justify-center">
            <CTA onClick={reset}>Сбросить фильтры</CTA>
          </div>
        </Glass>
      ) : (
        <div className={`mt-6 lg:mt-8 ${GRID}`}>
          {shown.map((village, i) => (
            <Reveal key={village.slug} className="h-full" delay={(i % PAGE) * 0.05} y={24}>
              <VillageCard
                village={village}
                lite={lite}
                eager={i < 4}
                liveAvailable={liveAvailable?.[village.slug]}
              />
            </Reveal>
          ))}
        </div>
      )}

      {rest > 0 && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <CTA variant="ghost" onClick={() => setVisible((v) => v + PAGE)}>
            <span className="grid h-6 min-w-7 place-items-center rounded-full bg-emerald-500 px-2 text-[11px] font-extrabold text-[#06120c]">
              +{Math.min(PAGE, rest)}
            </span>
            Показать ещё
            <ChevronDown className="h-4 w-4" />
          </CTA>
          <p className="text-[12px] text-white/40">
            Показано {shown.length} {villagesWord(shown.length)} из {found.length}
          </p>
        </div>
      )}
    </div>
  );
}
