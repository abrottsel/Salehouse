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
 * ними и делает карту «сочной». Повторяем идею, но подбираем тона под
 * СВЕТЛУЮ схему: пастель вроде прежнего лайма #d9f04a на белом просто
 * исчезала.
 *
 * Длина не случайна: у «Фаворита» девять ценовых тиров, а палитра из
 * семи заставляла восьмой и девятый повторять первый и второй — два
 * разных ценника одним цветом. Держим запас в десять.
 */
export const TIER_COLORS = [
  "#e66b19", // оранжевый — их же
  "#19dae6", // циан — их же
  "#a744ec", // фиолетовый — их же
  "#f2c218", // жёлтый
  "#f62f7a", // розовый
  "#ef4444", // красный
  "#16a34a", // зелёный
  "#0d9488", // тил
  "#84cc16", // лайм
  "#1e40af", // тёмно-синий
] as const;

/**
 * Кружок брони. У Земекс это чистый синий rgb(0,30,255) — берём его как
 * есть, поэтому в палитре тиров синего нет: два разных смысла одним
 * цветом читать нельзя.
 */
export const RESERVED_COLOR = "#001eff";

/**
 * Проданные. Серый — единственный признак статуса: заливка клетки,
 * контур, домик и номер берут его же, поэтому «продано» читается без
 * заглядывания в легенду и не спорит с цветами тиров.
 */
export const SOLD_COLOR = "#64748b";
/** Заливка клетки проданного — тот же серый, приглушённый до фона. */
export const SOLD_FILL = "#94a3b8";

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

// ── экран ↔ карта ───────────────────────────────────────────────
// Наведение курсора мы разбираем сами: ymaps3 отдаёт hover только тому,
// у кого есть свой DOM (маркеры), а нам нужно подсвечивать и клетки
// проданных, у которых на общем плане никакого маркера нет. Проекция та
// же самая, по которой считается fitView и группировка, — поэтому
// попадание совпадает с картинкой пиксель в пиксель.

/** Точка карты → пиксель кадра (0,0 — левый верхний угол). */
export function lngLatToScreen(
  point: LngLat,
  view: { center: LngLat; zoom: number },
  size: { w: number; h: number },
): { x: number; y: number } {
  const world = TILE * 2 ** view.zoom;
  return {
    x:
      (((point[0] + 180) / 360) - ((view.center[0] + 180) / 360)) * world +
      size.w / 2,
    y: (mercY(point[1]) - mercY(view.center[1])) * world + size.h / 2,
  };
}

/** Пиксель кадра → точка карты. */
export function screenToLngLat(
  x: number,
  y: number,
  view: { center: LngLat; zoom: number },
  size: { w: number; h: number },
): LngLat {
  const world = TILE * 2 ** view.zoom;
  const wx = ((view.center[0] + 180) / 360) * world + (x - size.w / 2);
  const wy = mercY(view.center[1]) * world + (y - size.h / 2);
  return [(wx / world) * 360 - 180, invMercY(wy / world)];
}

/** Классический ray casting. Кольцо в порядке [lat, lon], как у нас в Plot. */
export function pointInRing(
  lon: number,
  lat: number,
  ring: [number, number][],
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [latI, lonI] = ring[i];
    const [latJ, lonJ] = ring[j];
    if (latI > lat === latJ > lat) continue;
    if (lon < ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI) inside = !inside;
  }
  return inside;
}

export interface PlotBox {
  plot: Plot;
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

/**
 * Габариты каждого участка — грубый отсев перед ray casting: на 480
 * участках «Фаворита» без него курсор считал бы полигоны целиком.
 */
export function plotBoxes(plots: Plot[]): PlotBox[] {
  const out: PlotBox[] = [];
  for (const plot of plots) {
    if (!plot.coords || plot.coords.length < 3) continue;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;
    for (const [lat, lon] of plot.coords) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    if (!Number.isFinite(minLat) || !Number.isFinite(minLon)) continue;
    out.push({ plot, minLon, maxLon, minLat, maxLat });
  }
  return out;
}

// ── экранный размер участка ─────────────────────────────────────
// Сколько пикселей занимает участок на текущем зуме — от этого зависит,
// что вообще влезет в его клетку: только иконка дома или ещё и номер.
// Считаем медиану по посёлку один раз (в долях мира), дальше умножаем на
// размер мира — это дешевле, чем мерить каждый полигон на каждый зум.

/** Медианная ширина участка в долях экватора. 0, если геометрии нет. */
export function medianPlotSpan(plots: Plot[]): number {
  const spans: number[] = [];
  for (const p of plots) {
    if (!p.coords || p.coords.length < 3) continue;
    let minLon = Infinity;
    let maxLon = -Infinity;
    for (const [, lon] of p.coords) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    if (Number.isFinite(minLon) && maxLon > minLon) spans.push((maxLon - minLon) / 360);
  }
  if (spans.length === 0) return 0;
  spans.sort((a, b) => a - b);
  return spans[spans.length >> 1];
}

/** Ширина участка в пикселях экрана на этом зуме. */
export function plotPixels(span: number, zoom: number): number {
  return span * TILE * 2 ** zoom;
}

// ── группировка маркеров ────────────────────────────────────────
// Главная беда прошлой карты: на общем плане соседние кружки налезали
// друг на друга и номера сливались в «4484 487». Соседние участки в
// «Фаворите» стоят в 9 экранных пикселях друг от друга — кружок с
// читаемым номером туда не помещается физически, сколько его ни крась.
//
// Поэтому на каждом зуме считаем экранные координаты и жадно склеиваем
// всё, что ближе minDist, в одну группу с числом. Группа из одного
// участка — это обычный кружок с номером. Разъезжаются они сами: чем
// ближе зум, тем больше расстояние в пикселях.
//
// Жадный проход детерминирован: порядок входного массива фиксирован
// (порядок участков из API), центр группы пересчитывается по мере
// набора, поэтому один и тот же зум всегда даёт одну и ту же картинку.

export interface PlotCluster {
  /** Стабильный ключ для React — номер первого участка группы. */
  key: string;
  center: LngLat;
  plots: Plot[];
  /** Габариты центров группы — по ним кнопка «разложить» подбирает зум. */
  bounds: LngLatBounds;
}

interface Bucket {
  plots: Plot[];
  x: number;
  y: number;
}

/**
 * @param radiusOf экранный радиус значка группы из n участков — по нему
 *   решается, задевают ли две группы друг друга.
 * @param gap просвет между соседними значками, px.
 */
export function clusterPlots(
  plots: Plot[],
  zoom: number,
  radiusOf: (count: number) => number,
  gap: number,
): PlotCluster[] {
  const world = TILE * 2 ** zoom;
  const n = plots.length;

  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const [lat, lon] = plots[i].center;
    xs[i] = ((lon + 180) / 360) * world;
    ys[i] = mercY(lat) * world;
  }

  // Первый проход — жадный, по одиночному радиусу. Он снимает основную
  // массу: соседи по улице стоят вплотную и схлопываются сразу.
  const solo = radiusOf(1) * 2 + gap;
  const solo2 = solo * solo;
  const taken = new Uint8Array(n);
  const buckets: Bucket[] = [];

  for (let i = 0; i < n; i++) {
    if (taken[i]) continue;
    taken[i] = 1;
    const b: Bucket = { plots: [plots[i]], x: xs[i], y: ys[i] };
    let sumX = xs[i];
    let sumY = ys[i];
    for (let j = i + 1; j < n; j++) {
      if (taken[j]) continue;
      const dx = xs[j] - b.x;
      const dy = ys[j] - b.y;
      if (dx * dx + dy * dy > solo2) continue;
      taken[j] = 1;
      b.plots.push(plots[j]);
      sumX += xs[j];
      sumY += ys[j];
      b.x = sumX / b.plots.length;
      b.y = sumY / b.plots.length;
    }
    buckets.push(b);
  }

  // Второй этап. Значок группы крупнее одиночного кружка, а центр группы
  // уезжает к её середине — из-за этого после первого прохода соседний
  // одиночка всё ещё может оказаться под значком. Досклеиваем, пока
  // пересечения есть; пять проходов с запасом хватает даже на плотную
  // сетку, а бесконечного цикла при этом заведомо нет.
  for (let pass = 0; pass < 5; pass++) {
    let merged = false;
    for (let i = 0; i < buckets.length; i++) {
      for (let j = i + 1; j < buckets.length; j++) {
        const a = buckets[i];
        const c = buckets[j];
        const need = radiusOf(a.plots.length) + radiusOf(c.plots.length) + gap;
        const dx = a.x - c.x;
        const dy = a.y - c.y;
        if (dx * dx + dy * dy > need * need) continue;
        const total = a.plots.length + c.plots.length;
        a.x = (a.x * a.plots.length + c.x * c.plots.length) / total;
        a.y = (a.y * a.plots.length + c.y * c.plots.length) / total;
        a.plots.push(...c.plots);
        buckets.splice(j, 1);
        j -= 1;
        merged = true;
      }
    }
    if (!merged) break;
  }

  return buckets.map((b) => {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;
    for (const p of b.plots) {
      const [lat, lon] = p.center;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    return {
      key: b.plots[0].number,
      center: [(b.x / world) * 360 - 180, invMercY(b.y / world)] as LngLat,
      plots: b.plots,
      bounds: [
        [minLon, minLat],
        [maxLon, maxLat],
      ] as LngLatBounds,
    };
  });
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
