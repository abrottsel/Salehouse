/**
 * Визуальные варианты подачи генплана — временный стенд для выбора.
 *
 * Заказчик просил «более приятную картину посёлка». Переписывать карту ради
 * этого нельзя: логика посадки, группировки и hit-test выстрадана и работает.
 * Поэтому весь вкус вынесен сюда — палитра, заливки, контуры, подложка, — а
 * PlotMapDark просто читает готовый набор констант.
 *
 * Переключение: `?skin=pastel|contrast|satellite|mono|paper`. Без флага —
 * `current`, то есть ровно то, что стоит сейчас, байт в байт. Когда вариант
 * выберут, лишние скины и флаг удаляются, а выбранный остаётся единственным.
 *
 * Правила, которые обязан соблюдать любой скин (из ТЗ, не отступать):
 *   • нарезка участков видна всегда — контур клетки не растворяется в фоне;
 *   • проданные не спорят со свободными: тише по цвету и по контрасту;
 *   • на общем плане номеров нет — это про PlotMapDark, скин туда не лезет;
 *   • карта светлая, а рамка и панели остаются тёмным стеклом сайта.
 */

import { TIER_COLORS } from "./types";

export type SkinId = "current" | "pastel" | "contrast" | "satellite" | "mono" | "paper";

export const SKIN_IDS: readonly SkinId[] = [
  "current",
  "pastel",
  "contrast",
  "satellite",
  "mono",
  "paper",
] as const;

/** Правило кастомизации схемы Яндекса. Форма — из @yandex/ymaps3-types. */
export interface SchemeRule {
  readonly tags?:
    | string
    | {
        readonly all?: string | readonly string[];
        readonly any?: string | readonly string[];
        readonly none?: string | readonly string[];
      };
  readonly types?: string | readonly string[];
  readonly elements?: string | readonly string[];
  readonly stylers: readonly Record<string, unknown>[];
}

/** Стиль полигона участка. Ровно те поля, что уходят в YMapFeature.style. */
export interface PolyStyle {
  readonly fill: string;
  readonly fillOpacity: number;
  readonly stroke: string;
  readonly strokeWidth: number;
  readonly strokeOpacity: number;
}

export interface MapSkin {
  readonly id: SkinId;
  /** Подпись для стенда — в интерфейс не выводится. */
  readonly label: string;
  /** Фон кадра под картой: виден в момент загрузки тайлов и по краям. */
  readonly frameBg: string;
  /** Спутник вместо схемы при первом открытии. */
  readonly satelliteBase: boolean;
  /**
   * Вуаль поверх подложки и ПОД нарезкой участков. Единственный способ
   * приглушить спутник, не трогая наши заливки: CSS-слой поверх канвы
   * погасил бы и полигоны тоже.
   */
  readonly veil: { readonly color: string; readonly opacity: number } | null;
  /** Кастомизация схемы поверх базовой (та гасит подписи домов). */
  readonly scheme: readonly SchemeRule[];
  /** Граница посёлка. */
  readonly village: {
    readonly fill: string;
    readonly fillOpacity: number;
    readonly stroke: string;
    readonly strokeWidth: number;
  };
  /** Клетка без статуса — та самая «нарезка», её видно всегда. */
  readonly idle: PolyStyle;
  /** Проданный участок. */
  readonly sold: PolyStyle;
  /** Свободный: цвет берётся из тира, здесь только прозрачности и контур. */
  readonly free: {
    readonly fillOpacity: number;
    readonly strokeWidth: number;
    readonly strokeOpacity: number;
  };
  /** Выбранный участок. */
  readonly selected: { readonly fillOpacity: number; readonly stroke: string };
  /**
   * Чем заменить клетки, когда человек сам включил тумблер спутника. Нужно
   * там, где скин рассчитан на светлую схему: на снимке белая заливка 0.6
   * превращает посёлок в молочное пятно. Скины со своей вуалью этого не
   * задают — вуаль уже привела снимок к нужной светлоте.
   */
  readonly onSatellite?: {
    readonly idle: PolyStyle;
    readonly sold: PolyStyle;
    readonly selectedStroke: string;
  };
  /** Подсветка клетки под курсором. */
  readonly hover: { readonly fill: string; readonly fillOpacity: number; readonly stroke: string };
  /** Палитра тиров этого скина. */
  readonly tiers: readonly string[];
  /** Домик проданного: заливка, контур, прозрачность. */
  readonly soldGlyph: {
    readonly fill: string;
    readonly stroke: string;
    readonly opacity: number;
    /** Насколько домик крупнее/мельче базового. */
    readonly scale: number;
  };
  /** Цвет номера проданного (появляется только на близком зуме). */
  readonly soldInk: string;
  /** Точка свободного участка. */
  readonly dot: { readonly scale: number; readonly shadow: string };
  /** Ореол подписи — под цвет подложки скина. */
  readonly halo: string;
}

// ─────────────────────────────────────────────────────────────────
// Заготовки
// ─────────────────────────────────────────────────────────────────

const HALO_LIGHT = "0 0 3px #fff, 0 0 3px #fff, 0 1px 2px #fff, 0 -1px 2px #fff";
const HALO_DARK = "0 1px 3px rgba(0,0,0,0.95), 0 0 5px rgba(0,0,0,0.9)";
const HALO_PAPER =
  "0 0 3px #f7f0e4, 0 0 3px #f7f0e4, 0 1px 2px #f7f0e4, 0 -1px 2px #f7f0e4";

const DOT_SHADOW_LIGHT =
  "0 0 0 1.5px rgba(255,255,255,0.95), 0 2px 6px rgba(15,23,42,0.35)";

/** Пастель: те же тона, что и сейчас, но сбитые к молочному. */
const TIERS_PASTEL = [
  "#e39a63", // оранжевый
  "#5fbcc8", // циан
  "#a58ad2", // фиолетовый
  "#dfbb5c", // жёлтый
  "#e18aa8", // розовый
  "#dd8482", // красный
  "#6cb387", // зелёный
  "#61aba3", // тил
  "#a3bd72", // лайм
  "#7b8fc4", // синий
] as const;

/** Контраст: чистые сочные тона, специально «кричащие» на белом. */
const TIERS_VIVID = [
  "#f97316",
  "#06b6d4",
  "#8b5cf6",
  "#eab308",
  "#ec4899",
  "#ef4444",
  "#22c55e",
  "#14b8a6",
  "#84cc16",
  "#3b82f6",
] as const;

/** Бумага: земляные тона архитектурной подосновы. */
const TIERS_EARTH = [
  "#c05621", // терракота
  "#2f7d78", // морская волна
  "#7a5aa8", // слива
  "#c08a13", // охра
  "#b3456b", // марена
  "#a63a34", // сурик
  "#4a8a4e", // оливково-зелёный
  "#2b6f6a", // патина
  "#7f8f34", // хаки
  "#3c5a8f", // индиго
] as const;

// ─────────────────────────────────────────────────────────────────
// Скины
// ─────────────────────────────────────────────────────────────────

/** То, что стоит сейчас. Эталон для сравнения, менять его нельзя. */
const CURRENT: MapSkin = {
  id: "current",
  label: "Как сейчас",
  frameBg: "#e8edf3",
  satelliteBase: false,
  veil: null,
  scheme: [],
  village: { fill: "#22c55e", fillOpacity: 0.04, stroke: "#16a34a", strokeWidth: 2.4 },
  idle: {
    fill: "#ffffff",
    fillOpacity: 0.6,
    stroke: "#8d99ab",
    strokeWidth: 1,
    strokeOpacity: 0.9,
  },
  sold: {
    fill: "#94a3b8",
    fillOpacity: 0.3,
    stroke: "#78889c",
    strokeWidth: 1,
    strokeOpacity: 0.9,
  },
  free: { fillOpacity: 0.28, strokeWidth: 1.4, strokeOpacity: 1 },
  selected: { fillOpacity: 0.5, stroke: "#0f172a" },
  onSatellite: {
    idle: {
      fill: "#ffffff",
      fillOpacity: 0.2,
      stroke: "#e5edf5",
      strokeWidth: 1,
      strokeOpacity: 0.9,
    },
    sold: {
      fill: "#94a3b8",
      fillOpacity: 0.34,
      stroke: "#cbd5e1",
      strokeWidth: 1,
      strokeOpacity: 0.9,
    },
    selectedStroke: "#ffffff",
  },
  hover: { fill: "#0f172a", fillOpacity: 0.08, stroke: "#0f172a" },
  tiers: TIER_COLORS,
  soldGlyph: { fill: "#d3dae4", stroke: "#8d99ab", opacity: 1, scale: 1 },
  soldInk: "#64748b",
  dot: { scale: 1, shadow: DOT_SHADOW_LIGHT },
  halo: HALO_LIGHT,
};

/**
 * «Пастель». Подложка уведена в молочно-серый, зелень и вода приглушены,
 * заливки свободных мягкие. Нарезку держит не контраст, а тонкий, но
 * непрерывный контур. Спокойно и дорого — курортный генплан, не кадастр.
 */
const PASTEL: MapSkin = {
  id: "pastel",
  label: "Пастель",
  frameBg: "#eef0ed",
  satelliteBase: false,
  veil: { color: "#fbfaf7", opacity: 0.34 },
  scheme: [
    { elements: "geometry", stylers: [{ saturation: -0.55, lightness: 0.18 }] },
    { tags: { any: ["vegetation", "terrain"] }, stylers: [{ color: "#e6ece1" }] },
    { tags: "water", stylers: [{ color: "#dce8ee" }] },
    { tags: "landscape", stylers: [{ color: "#f5f4f0" }] },
    { tags: "building", stylers: [{ color: "#eae7e1", opacity: 0.5 }] },
    { tags: "road", elements: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { tags: "road", elements: "geometry.outline", stylers: [{ color: "#e2e0da" }] },
    { tags: { any: ["poi", "transit"] }, elements: "label", stylers: [{ visibility: "off" }] },
  ],
  village: { fill: "#8fae90", fillOpacity: 0.05, stroke: "#8aa88c", strokeWidth: 2 },
  idle: {
    fill: "#ffffff",
    fillOpacity: 0.5,
    stroke: "#b7bfc6",
    strokeWidth: 0.9,
    strokeOpacity: 0.85,
  },
  sold: {
    fill: "#dfe3e6",
    fillOpacity: 0.62,
    stroke: "#c3cad0",
    strokeWidth: 0.9,
    strokeOpacity: 0.9,
  },
  free: { fillOpacity: 0.4, strokeWidth: 1.2, strokeOpacity: 0.85 },
  selected: { fillOpacity: 0.58, stroke: "#3f4a55" },
  hover: { fill: "#3f4a55", fillOpacity: 0.07, stroke: "#3f4a55" },
  tiers: TIERS_PASTEL,
  soldGlyph: { fill: "#e7ebee", stroke: "#c3cad0", opacity: 0.95, scale: 0.94 },
  soldInk: "#8a949e",
  dot: { scale: 0.92, shadow: "0 0 0 1.6px rgba(255,255,255,0.98), 0 1px 4px rgba(60,70,80,0.22)" },
  halo: HALO_LIGHT,
};

/**
 * «Контраст». Подложка обесцвечена почти в белое, проданные едва читаются
 * бледной клеткой, а свободные заливаются целиком сочным цветом тира.
 * Взгляд цепляется ровно за то, что можно купить.
 */
const CONTRAST: MapSkin = {
  id: "contrast",
  label: "Контраст",
  frameBg: "#eff2f6",
  satelliteBase: false,
  veil: { color: "#ffffff", opacity: 0.42 },
  scheme: [
    { elements: "geometry", stylers: [{ saturation: -0.9, lightness: 0.42 }] },
    { tags: { any: ["vegetation", "terrain", "landscape"] }, stylers: [{ color: "#f2f4f6" }] },
    { tags: "water", stylers: [{ color: "#e3ebf1" }] },
    { tags: "building", stylers: [{ visibility: "off" }] },
    { tags: "road", elements: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { tags: "road", elements: "geometry.outline", stylers: [{ color: "#e4e8ec" }] },
    { tags: { any: ["poi", "transit"] }, elements: "label", stylers: [{ visibility: "off" }] },
  ],
  village: { fill: "#94a3b8", fillOpacity: 0.03, stroke: "#94a3b8", strokeWidth: 1.8 },
  idle: {
    fill: "#ffffff",
    fillOpacity: 0.72,
    stroke: "#c8d0d9",
    strokeWidth: 0.9,
    strokeOpacity: 0.9,
  },
  sold: {
    fill: "#ffffff",
    fillOpacity: 0.82,
    stroke: "#d5dce4",
    strokeWidth: 0.9,
    strokeOpacity: 0.95,
  },
  free: { fillOpacity: 0.66, strokeWidth: 1.6, strokeOpacity: 1 },
  selected: { fillOpacity: 0.86, stroke: "#0f172a" },
  hover: { fill: "#0f172a", fillOpacity: 0.09, stroke: "#0f172a" },
  tiers: TIERS_VIVID,
  soldGlyph: { fill: "#f1f4f8", stroke: "#d5dce4", opacity: 0.9, scale: 0.88 },
  soldInk: "#a9b4c0",
  dot: { scale: 1.06, shadow: "0 0 0 2px #ffffff, 0 2px 7px rgba(15,23,42,0.32)" },
  halo: HALO_LIGHT,
};

/**
 * «Спутник». Настоящее место, а не абстракция: видны леса, дороги, соседи.
 * Снимок гасится белой вуалью — без неё нарезка тонет в зелёно-серой каше,
 * ровно как было до перехода на схему.
 */
const SATELLITE: MapSkin = {
  id: "satellite",
  label: "Спутник",
  frameBg: "#0d1117",
  satelliteBase: true,
  veil: { color: "#f7fafc", opacity: 0.5 },
  scheme: [],
  village: { fill: "#ffffff", fillOpacity: 0.06, stroke: "#ffffff", strokeWidth: 2.2 },
  idle: {
    fill: "#ffffff",
    fillOpacity: 0.24,
    stroke: "#ffffff",
    strokeWidth: 1,
    strokeOpacity: 0.75,
  },
  sold: {
    fill: "#f8fafc",
    fillOpacity: 0.4,
    stroke: "#e2e8f0",
    strokeWidth: 1,
    strokeOpacity: 0.8,
  },
  free: { fillOpacity: 0.56, strokeWidth: 1.5, strokeOpacity: 1 },
  selected: { fillOpacity: 0.78, stroke: "#ffffff" },
  hover: { fill: "#ffffff", fillOpacity: 0.16, stroke: "#ffffff" },
  tiers: TIERS_VIVID,
  soldGlyph: { fill: "#ffffff", stroke: "#94a3b8", opacity: 0.85, scale: 0.92 },
  soldInk: "#546174",
  dot: { scale: 1.04, shadow: "0 0 0 2px #ffffff, 0 2px 8px rgba(2,6,23,0.5)" },
  halo: HALO_LIGHT,
};

/**
 * «Журнальный». Подложка полностью обесцвечена, проданные — серая клетка без
 * тени цвета. Единственное цветное пятно на карте — свободные участки, и
 * поэтому карта читается за долю секунды: цвет = «можно купить».
 */
const MONO: MapSkin = {
  id: "mono",
  label: "Журнальный",
  frameBg: "#edeef0",
  satelliteBase: false,
  veil: { color: "#ffffff", opacity: 0.3 },
  scheme: [
    { elements: "geometry", stylers: [{ saturation: -1, lightness: 0.3 }] },
    { tags: { any: ["vegetation", "terrain", "landscape"] }, stylers: [{ color: "#eeeff0" }] },
    { tags: "water", stylers: [{ color: "#e2e4e6" }] },
    { tags: "building", stylers: [{ color: "#e6e7e9", opacity: 0.6 }] },
    { tags: "road", elements: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { tags: "road", elements: "geometry.outline", stylers: [{ color: "#dfe1e3" }] },
    { elements: "label", stylers: [{ saturation: -1, lightness: 0.25 }] },
    { tags: { any: ["poi", "transit"] }, elements: "label", stylers: [{ visibility: "off" }] },
  ],
  village: { fill: "#8e949b", fillOpacity: 0.04, stroke: "#7c838b", strokeWidth: 2 },
  idle: {
    fill: "#ffffff",
    fillOpacity: 0.55,
    stroke: "#b2b7bd",
    strokeWidth: 0.9,
    strokeOpacity: 0.9,
  },
  sold: {
    fill: "#c9cdd2",
    fillOpacity: 0.55,
    stroke: "#a9aeb5",
    strokeWidth: 0.9,
    strokeOpacity: 0.9,
  },
  free: { fillOpacity: 0.62, strokeWidth: 1.7, strokeOpacity: 1 },
  selected: { fillOpacity: 0.85, stroke: "#1c2126" },
  hover: { fill: "#1c2126", fillOpacity: 0.1, stroke: "#1c2126" },
  tiers: TIERS_VIVID,
  soldGlyph: { fill: "#dcdfe3", stroke: "#a9aeb5", opacity: 0.95, scale: 0.92 },
  soldInk: "#7c838b",
  dot: { scale: 1.12, shadow: "0 0 0 2px #ffffff, 0 2px 8px rgba(28,33,38,0.35)" },
  halo: HALO_LIGHT,
};

/**
 * «Бумага» — мой вариант. Тёплая кремовая подоснова, как у печатного
 * архитектурного генплана: земляные тона, коричневые контуры, никакого
 * офисного сине-серого. Свободные читаются, но карта в целом выглядит не
 * интерфейсом, а разворотом из буклета — это и есть «приятная картина».
 */
const PAPER: MapSkin = {
  id: "paper",
  label: "Бумага",
  frameBg: "#f3ecdf",
  satelliteBase: false,
  veil: { color: "#f8f1e3", opacity: 0.44 },
  scheme: [
    { elements: "geometry", stylers: [{ saturation: -0.62, lightness: 0.28 }] },
    { tags: { any: ["vegetation", "terrain"] }, stylers: [{ color: "#e6e5cf" }] },
    { tags: "water", stylers: [{ color: "#d9e4e2" }] },
    { tags: "landscape", stylers: [{ color: "#f4ecdd" }] },
    { tags: "building", stylers: [{ color: "#e7dcc9", opacity: 0.55 }] },
    { tags: "road", elements: "geometry.fill", stylers: [{ color: "#fffaf0" }] },
    { tags: "road", elements: "geometry.outline", stylers: [{ color: "#ded1ba" }] },
    { elements: "label.text.fill", stylers: [{ color: "#7a6a55" }] },
    { tags: { any: ["poi", "transit"] }, elements: "label", stylers: [{ visibility: "off" }] },
  ],
  village: { fill: "#a08a63", fillOpacity: 0.05, stroke: "#a08a63", strokeWidth: 2.2 },
  idle: {
    fill: "#fffaf0",
    fillOpacity: 0.58,
    stroke: "#c3b39a",
    strokeWidth: 0.9,
    strokeOpacity: 0.9,
  },
  sold: {
    fill: "#e3d8c4",
    fillOpacity: 0.6,
    stroke: "#bfae93",
    strokeWidth: 0.9,
    strokeOpacity: 0.9,
  },
  free: { fillOpacity: 0.46, strokeWidth: 1.4, strokeOpacity: 0.95 },
  selected: { fillOpacity: 0.7, stroke: "#4a3f2f" },
  hover: { fill: "#4a3f2f", fillOpacity: 0.09, stroke: "#4a3f2f" },
  tiers: TIERS_EARTH,
  soldGlyph: { fill: "#efe6d5", stroke: "#bfae93", opacity: 0.95, scale: 0.92 },
  soldInk: "#8b7a61",
  dot: { scale: 0.96, shadow: "0 0 0 1.8px #fffaf0, 0 1px 5px rgba(74,63,47,0.28)" },
  halo: HALO_PAPER,
};

export const SKINS: Readonly<Record<SkinId, MapSkin>> = {
  current: CURRENT,
  pastel: PASTEL,
  contrast: CONTRAST,
  satellite: SATELLITE,
  mono: MONO,
  paper: PAPER,
};

export function skinById(raw: string | null | undefined): MapSkin {
  const id = (raw ?? "").toLowerCase();
  return (SKIN_IDS as readonly string[]).includes(id) ? SKINS[id as SkinId] : SKINS.current;
}

/** Ореол подписи: на спутнике — чёрный, иначе — свой у каждого скина. */
export function haloFor(skin: MapSkin, satellite: boolean): string {
  return satellite && !skin.veil ? HALO_DARK : skin.halo;
}
