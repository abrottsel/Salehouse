/**
 * Общие типы и геометрия для карты генплана /v3.
 *
 * Разделение простое: здесь всё, что не рисует, — формы данных, разбор
 * статуса, палитра тиров и расчёт bounds. Компоненты в MapUI.tsx только
 * показывают, PlotMapDark.tsx держит состояние.
 */

export interface Plot {
  number: string;
  area: number;
  pricePerHundred: number;
  totalCost: number;
  statusName: string;
  /** Кольцо полигона в порядке [lat, lon] — как отдаёт наш прокси. */
  coords: [number, number][];
  /** Центр участка в порядке [lat, lon]. */
  center: [number, number];
  kadastr: string;
  priceTier: number;
  /** УТП: «У воды», «Меньше соседей»… Может не прийти вовсе. */
  utp?: string[];
}

export interface VillageMap {
  villageName: string;
  center: [number, number];
  villageCoords: [number, number][];
  priceTiers: number[];
  statistics: { free: number; sold: number; reserved: number; other: number };
  plots: Plot[];
}

/** GeoJSON-порядок, в котором ymaps3 ждёт координаты. */
export type LngLat = [number, number];
export type LngLatBounds = [LngLat, LngLat];

export type PlotKind = "free" | "reserved" | "sold" | "other";

export function plotKind(statusName: string): PlotKind {
  if (/свобод/i.test(statusName)) return "free";
  if (/брон|резерв/i.test(statusName)) return "reserved";
  if (/прода/i.test(statusName)) return "sold";
  return "other";
}

/**
 * Палитра тиров. Земекс берёт максимально разнесённые тона (#f2f023,
 * #f62f7a, #19dae6, #e66b19, #a744ec, #ff0000) — именно контраст между
 * ними и делает карту «сочной». Повторяем идею, но подбираем тона,
 * которые не выцветают на тёмной подложке и на спутнике.
 */
export const TIER_COLORS = [
  "#d9f04a", // лайм
  "#22d3ee", // циан
  "#fb923c", // оранжевый
  "#f472b6", // розовый
  "#a78bfa", // фиолетовый
  "#f87171", // красный
  "#34d399", // изумруд
] as const;

/** Синий кружок резерва — как «Резерв» у Земекс, но читаемее на тёмном. */
export const RESERVED_COLOR = "#4f8bff";

export function tierColor(tier: number): string {
  return TIER_COLORS[tier % TIER_COLORS.length];
}

/**
 * Цвет цифры внутри кружка. Земекс всегда пишет белым и на жёлтом
 * #f2f023 номер теряется — считаем яркость и на светлых заливках
 * ставим почти чёрный.
 */
export function textOn(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const l = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return l > 0.45 ? "#08120c" : "#ffffff";
}

/** [lat, lon][] → [lon, lat][] без аллокаций сверх одного массива. */
export function ringToLngLat(ring: [number, number][]): LngLat[] {
  const out: LngLat[] = new Array(ring.length);
  for (let i = 0; i < ring.length; i++) out[i] = [ring[i][1], ring[i][0]];
  return out;
}

/**
 * Габариты посёлка. Берём и границу, и все полигоны участков: у части
 * посёлков village_coords приходит куцым (или пустым), и тогда fit по
 * одной границе обрезал бы крайние участки.
 */
export function boundsOf(data: VillageMap): LngLatBounds | null {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  const eat = (lat: number, lon: number) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    if (lat === 0 && lon === 0) return;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  };

  for (const [lat, lon] of data.villageCoords) eat(lat, lon);
  for (const p of data.plots) {
    for (const [lat, lon] of p.coords) eat(lat, lon);
  }

  if (!Number.isFinite(minLat) || !Number.isFinite(minLon)) return null;

  // Небольшой геозапас поверх пиксельного padding. Держим его маленьким:
  // каждый процент здесь — это процент, на который посёлок ужимается в
  // кадре, а кадр мы и так сажаем по границам посёлка.
  const padLat = Math.max((maxLat - minLat) * 0.025, 0.00015);
  const padLon = Math.max((maxLon - minLon) * 0.025, 0.00025);

  return [
    [minLon - padLon, minLat - padLat],
    [maxLon + padLon, maxLat + padLat],
  ];
}

// ── посадка «в экран» ───────────────────────────────────────────
// Считаем центр и зум сами, а не отдаём bounds в ymaps3. Причины две:
//   1) location={{bounds}} применяется только при монтировании — на
//      повторный setLocation с тем же массивом карта не реагирует,
//      и кнопка «домой» переставала работать;
//   2) поле padding у bounds не описано в типах ymaps3 — полагаться на
//      него нельзя, а нам нужен ассиметричный отступ под панели.

const TILE = 256;

function mercY(lat: number): number {
  const rad = (Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180;
  return (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2;
}

function invMercY(y: number): number {
  return (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Центр и зум, при которых прямоугольник bounds целиком влезает в
 * контейнер size с отступами pad под панели интерфейса.
 */
export function fitView(
  bounds: LngLatBounds,
  size: { w: number; h: number },
  pad: Padding,
  zoomRange: { min: number; max: number },
): { center: LngLat; zoom: number } {
  const [[minLon, minLat], [maxLon, maxLat]] = bounds;

  const availW = Math.max(48, size.w - pad.left - pad.right);
  const availH = Math.max(48, size.h - pad.top - pad.bottom);

  const dxFrac = Math.max((maxLon - minLon) / 360, 1e-9);
  const yTop = mercY(maxLat);
  const yBottom = mercY(minLat);
  const dyFrac = Math.max(yBottom - yTop, 1e-9);

  const zoom = Math.min(
    zoomRange.max,
    Math.max(
      zoomRange.min,
      Math.min(
        Math.log2(availW / (TILE * dxFrac)),
        Math.log2(availH / (TILE * dyFrac)),
      ),
    ),
  );

  // Сдвигаем центр на половину разницы отступов, иначе посёлок уезжает
  // под топбар и колонку кнопок вместо того, чтобы стоять по центру
  // свободной области.
  const world = TILE * 2 ** zoom;
  const cx = ((minLon + maxLon) / 2 + 180) / 360;
  const cy = (yTop + yBottom) / 2;
  const mx = cx * world - (pad.left - pad.right) / 2;
  const my = cy * world - (pad.top - pad.bottom) / 2;

  return { center: [(mx / world) * 360 - 180, invMercY(my / world)], zoom };
}

/**
 * Размер самого кадра карты под конкретный посёлок.
 *
 * Раньше кадр был фиксированным (70svh на телефоне, 74vh на десктопе), и
 * посёлок в него вписывался «по контейну»: у «Фаворита» пропорции 1,36:1,
 * а мобильный кадр — 0,6:1, поэтому по ширине посёлок ложился впритык, а по
 * высоте занимал треть — остальное добирали соседние деревни. На десктопе
 * ровно наоборот: кадр 2:1, посёлок упирался в высоту, а по бокам оставалось
 * полкадра окрестностей.
 *
 * Поэтому кадр подгоняем под пропорции посёлка: свободную область (кадр
 * минус отступы под панели) делаем такой же формы, что и bounds. Тогда
 * посёлок заполняет кадр по обеим осям, оставаясь целиком видимым.
 *
 * Ограничители: по ширине не больше доступной и не меньше minW (иначе на
 * широком мониторе вытянутый посёлок сжал бы карту в марку), по высоте — не
 * выше maxH (кадр обязан помещаться в экран без прокрутки) и не ниже minH.
 */
export function frameSize(
  bounds: LngLatBounds,
  availW: number,
  maxH: number,
  pad: Padding,
  limits: { minW: number; minH: number },
): { w: number; h: number } {
  const [[minLon, minLat], [maxLon, maxLat]] = bounds;

  const wFrac = Math.max((maxLon - minLon) / 360, 1e-9);
  const hFrac = Math.max(mercY(minLat) - mercY(maxLat), 1e-9);
  const aspect = wFrac / hFrac;

  const roomW = Math.max(48, availW - pad.left - pad.right);
  const roomH = Math.max(48, maxH - pad.top - pad.bottom);

  const innerW = Math.min(roomW, roomH * aspect);
  const innerH = innerW / aspect;

  return {
    w: Math.round(Math.min(availW, Math.max(limits.minW, innerW + pad.left + pad.right))),
    h: Math.round(Math.min(maxH, Math.max(limits.minH, innerH + pad.top + pad.bottom))),
  };
}

/** Уникальные УТП по всем участкам — из них собираем фильтр «Преимущества». */
export function collectUtp(plots: Plot[]): string[] {
  const seen = new Set<string>();
  for (const p of plots) {
    for (const u of p.utp ?? []) {
      const t = u.trim();
      if (t) seen.add(t);
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "ru"));
}

export interface Filters {
  areaMin: string;
  areaMax: string;
  priceMin: string;
  priceMax: string;
  /** Пусто = без ограничения по статусу. */
  statuses: PlotKind[];
  utp: string[];
}

export const EMPTY_FILTERS: Filters = {
  areaMin: "",
  areaMax: "",
  priceMin: "",
  priceMax: "",
  statuses: [],
  utp: [],
};

export function filtersActive(f: Filters): boolean {
  return (
    f.areaMin !== "" ||
    f.areaMax !== "" ||
    f.priceMin !== "" ||
    f.priceMax !== "" ||
    f.statuses.length > 0 ||
    f.utp.length > 0
  );
}

/**
 * Участок проходит фильтр. Проданные не проходят никогда — они фон,
 * а не результат подбора.
 */
export function passesFilters(
  plot: Plot,
  kind: PlotKind,
  f: Filters,
  hiddenTiers: ReadonlySet<number>,
): boolean {
  if (kind !== "free" && kind !== "reserved") return false;
  if (kind === "free" && hiddenTiers.has(plot.priceTier)) return false;

  if (f.statuses.length > 0 && !f.statuses.includes(kind)) return false;

  const aMin = f.areaMin === "" ? null : Number(f.areaMin);
  const aMax = f.areaMax === "" ? null : Number(f.areaMax);
  if (aMin !== null && Number.isFinite(aMin) && plot.area < aMin) return false;
  if (aMax !== null && Number.isFinite(aMax) && plot.area > aMax) return false;

  // Цена в фильтре — миллионы рублей за участок целиком: так думает
  // покупатель. Участки без цены (часто у брони) по цене не отсекаем.
  const pMin = f.priceMin === "" ? null : Number(f.priceMin) * 1_000_000;
  const pMax = f.priceMax === "" ? null : Number(f.priceMax) * 1_000_000;
  if (plot.totalCost > 0) {
    if (pMin !== null && Number.isFinite(pMin) && plot.totalCost < pMin) return false;
    if (pMax !== null && Number.isFinite(pMax) && plot.totalCost > pMax) return false;
  }

  if (f.utp.length > 0) {
    const own = plot.utp ?? [];
    for (const need of f.utp) {
      if (!own.includes(need)) return false;
    }
  }

  return true;
}
