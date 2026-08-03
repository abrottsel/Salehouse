import type { CSSProperties } from "react";
import { villages } from "@/lib/data";
import { glassStyle } from "../ui/primitives";

/**
 * Цифры главной. Всё считается из data.ts — руками ничего не вписываем,
 * иначе после правки посёлка на витрине останется вчерашняя правда.
 */

export const VILLAGE_COUNT = villages.length;

export const PLOTS_AVAILABLE = villages.reduce((s, v) => s + (v.plotsAvailable || 0), 0);

export const PLOTS_TOTAL = villages.reduce((s, v) => s + (v.plotsCount || 0), 0);

/** priceFrom в data.ts — цена за сотку (см. карточку каталога на проде). */
export const PRICE_MIN = Math.min(...villages.map((v) => v.priceFrom));

export const DIRECTIONS = new Set(villages.map((v) => v.direction)).size;

export const DISTANCE_MIN = Math.min(...villages.map((v) => v.distance));

export const READY_COUNT = villages.filter((v) => v.readiness === 100).length;

/**
 * Шестёрка для превью каталога: сначала полностью готовые, внутри —
 * у кого больше свободных участков. Сортировка детерминированная,
 * никакого рандома: разметка сервера и клиента обязана совпасть.
 */
export const TOP_VILLAGES = [...villages]
  .sort((a, b) => b.readiness - a.readiness || b.plotsAvailable - a.plotsAvailable)
  .slice(0, 6);

export const rub = (n: number) => n.toLocaleString("ru-RU");

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/**
 * Стекло с оглядкой на устройство: на слабых именно backdrop-filter
 * съедает кадры, поэтому на "lite" оставляем только заливку.
 */
export function panel(lite: boolean): CSSProperties {
  if (!lite) return glassStyle;
  return {
    ...glassStyle,
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
  };
}
