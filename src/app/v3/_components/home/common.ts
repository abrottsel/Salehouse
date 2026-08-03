import type { CSSProperties } from "react";
import { villages, type Village } from "@/lib/data";
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
 * Шестёрка для превью каталога.
 *
 * Было: топ-6 по готовности — наверх всплывали одни стопроцентные, и
 * витрина врала, будто строящихся посёлков у нас нет. Стало: выборка
 * по стадиям — по два посёлка из «готовых», «на финише» и «в стройке»,
 * внутри стадии первым идёт тот, где больше свободных участков (там и
 * выбор шире, и карточка полезнее). Тай-брейк по slug — чтобы порядок
 * не зависел от порядка строк в data.ts.
 *
 * Сравниваем slug не через localeCompare: у сервера и браузера бывают
 * разные ICU-данные, а разметка обязана совпасть. Никакого random и
 * new Date по той же причине.
 */
const PREVIEW_SIZE = 6;
const PER_STAGE = 2;

/** 0 — готов, 1 — на финише, 2 — в стройке. */
function stage(v: Village): 0 | 1 | 2 {
  if (v.readiness >= 100) return 0;
  if (v.readiness >= 85) return 1;
  return 2;
}

function byOffer(a: Village, b: Village) {
  return b.plotsAvailable - a.plotsAvailable || (a.slug < b.slug ? -1 : 1);
}

function pickPreview(): Village[] {
  const stages: Village[][] = [[], [], []];
  for (const v of villages) stages[stage(v)].push(v);
  for (const s of stages) s.sort(byOffer);

  const picked = stages.flatMap((s) => s.slice(0, PER_STAGE));
  // Стадия может опустеть (например, все посёлки достроены) — добираем
  // недостающее лучшим из оставшихся, чтобы в блоке всегда было шесть.
  if (picked.length < PREVIEW_SIZE) {
    const rest = stages.flatMap((s) => s.slice(PER_STAGE)).sort(byOffer);
    picked.push(...rest.slice(0, PREVIEW_SIZE - picked.length));
  }

  return picked.sort((a, b) => b.readiness - a.readiness || byOffer(a, b));
}

export const TOP_VILLAGES = pickPreview();

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
