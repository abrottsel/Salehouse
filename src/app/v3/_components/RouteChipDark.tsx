"use client";

import { Home } from "lucide-react";
import { formatDuration, useHomeRoute } from "../_lib/route-home";

/**
 * «Дорога к мечте» в размере карточки каталога.
 *
 * Отдельный файл, а не третий `align` у RouteBadgeDark: там кнопка с
 * панелью поиска адреса, здесь — только надпись. Логика маршрута общая
 * (_lib/route-home), дубля нет.
 *
 * Без сохранённого адреса не рисуем ничего — как на боевой карточке.
 * Пока маршрут считается, держим место многоточием, иначе строка
 * дёргается уже после того, как человек начал читать карточку.
 */
export default function RouteChipDark({
  villageCoords,
  villageName,
}: {
  villageCoords: [number, number];
  villageName: string;
}) {
  const { home, route } = useHomeRoute(villageCoords);

  if (!home) return null;

  return (
    <span
      title={
        route
          ? `От «${home.address}» до «${villageName}» — ${formatDuration(route.durationMin)}, ${Math.round(route.distanceKm)} км`
          : `Считаем дорогу до «${villageName}»`
      }
      // v3-on-dark: чип лежит на фото, оно тёмное в обеих темах.
      className="v3-on-dark inline-flex h-7 items-center gap-1.5 rounded-full bg-black/55 pl-1 pr-2.5 text-[11px] font-bold text-white ring-1 ring-white/20 backdrop-blur-[2px]"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500">
        <Home className="h-3 w-3 text-[#06120c]" strokeWidth={2.6} />
      </span>
      <span className="tabular-nums">
        {route ? `${formatDuration(route.durationMin)} от дома` : "…"}
      </span>
    </span>
  );
}
