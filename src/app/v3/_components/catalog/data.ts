import { villages, type Village } from "@/lib/data";

/**
 * Данные и правила фильтрации каталога /v3.
 *
 * Модуль намеренно без "use client": его читает и серверная page.tsx
 * (для metadata), и клиентские компоненты каталога.
 */

export const ALL = "Все";

/** Направления берём из данных, а не из захардкоженного списка. */
export const DIRECTIONS: readonly string[] = [
  ALL,
  ...Array.from(new Set(villages.map((v) => v.direction))),
];

const PRICE_MAX = Math.max(...villages.map((v) => v.priceFrom));
const AREA_MAX = Math.ceil(Math.max(...villages.map((v) => v.areaTo)));

export interface RangePreset {
  id: string;
  label: string;
  min: number;
  max: number;
}

/**
 * Цена за сотку. Пороги нарезаны по фактическому разбросу данных
 * (194 000 – 1 799 000 ₽): у боевого каталога пресеты «2–3 млн» и «3+ млн»
 * не находят ни одного посёлка, здесь пустых кнопок нет.
 */
export const PRICE_PRESETS: readonly RangePreset[] = [
  { id: "price-lt300", label: "до 300 тыс", min: 0, max: 299_999 },
  { id: "price-300-500", label: "300–500 тыс", min: 300_000, max: 499_999 },
  { id: "price-500-1m", label: "500 тыс — 1 млн", min: 500_000, max: 999_999 },
  { id: "price-gt1m", label: "от 1 млн", min: 1_000_000, max: PRICE_MAX },
];

/** Площадь участка — как в боевом каталоге. */
export const AREA_PRESETS: readonly RangePreset[] = [
  { id: "area-5-7", label: "5–7 сот.", min: 5, max: 7 },
  { id: "area-7-10", label: "7–10 сот.", min: 7, max: 10 },
  { id: "area-10-15", label: "10–15 сот.", min: 10, max: 15 },
  { id: "area-15", label: "15+ сот.", min: 15, max: AREA_MAX },
];

export interface ReadinessPreset {
  id: string;
  label: string;
  min: number;
}

export const READINESS_PRESETS: readonly ReadinessPreset[] = [
  { id: "ready-70", label: "от 70%", min: 70 },
  { id: "ready-80", label: "от 80%", min: 80 },
  { id: "ready-90", label: "от 90%", min: 90 },
  { id: "ready-100", label: "100%", min: 100 },
];

export interface CatalogFilters {
  direction: string;
  /** id пресета или null, если не выбран */
  price: string | null;
  area: string | null;
  readiness: string | null;
}

export const NO_FILTERS: CatalogFilters = {
  direction: ALL,
  price: null,
  area: null,
  readiness: null,
};

export function activeFilterCount(f: CatalogFilters): number {
  return (
    (f.direction !== ALL ? 1 : 0) +
    (f.price ? 1 : 0) +
    (f.area ? 1 : 0) +
    (f.readiness ? 1 : 0)
  );
}

export function filterVillages(f: CatalogFilters): Village[] {
  const price = PRICE_PRESETS.find((p) => p.id === f.price);
  const area = AREA_PRESETS.find((a) => a.id === f.area);
  const ready = READINESS_PRESETS.find((r) => r.id === f.readiness);

  return villages.filter((v) => {
    if (f.direction !== ALL && v.direction !== f.direction) return false;
    if (price && (v.priceFrom < price.min || v.priceFrom > price.max)) return false;
    // Площадь — пересечение отрезков, а не «попадание целиком»: посёлок
    // с участками 6–12 соток подходит и под «5–7», и под «10–15».
    if (area && (v.areaTo < area.min || v.areaFrom > area.max)) return false;
    if (ready && v.readiness < ready.min) return false;
    return true;
  });
}

/* ─── цифры шапки, считаются из данных ─── */

export const STAT_VILLAGES = villages.length;
export const STAT_PLOTS_AVAILABLE = villages.reduce(
  (sum, v) => sum + (v.plotsAvailable || 0),
  0,
);
export const STAT_PRICE_MIN = Math.min(...villages.map((v) => v.priceFrom));

/* ─── форматирование ─── */

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const villagesWord = (n: number) => plural(n, "посёлок", "посёлка", "посёлков");
export const plotsWord = (n: number) => plural(n, "участок", "участка", "участков");

/** «Каширское шоссе» → «Каширское»: в узкой кнопке шоссе не помещается. */
export const shortDirection = (d: string) => d.replace(" шоссе", "");

export const money = (n: number) => n.toLocaleString("ru-RU");

const AREA_FMT = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

/** У части посёлков нарезка одинаковая (7,62–7,62) — не пишем диапазон. */
export function areaLabel(v: Village): string {
  if (v.areaFrom === v.areaTo) return `${AREA_FMT.format(v.areaFrom)} соток`;
  return `от ${AREA_FMT.format(v.areaFrom)} до ${AREA_FMT.format(v.areaTo)} соток`;
}
