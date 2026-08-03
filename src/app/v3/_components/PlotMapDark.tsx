"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, List, X } from "lucide-react";

import { loadYmaps3, resetYmaps3Loader } from "@/lib/ymaps3";

import {
  ControlRail,
  FilterChip,
  FilterPanel,
  HouseGlyph,
  LegendPanel,
  MapError,
  MapRoundButton,
  MapSkeleton,
  PlotCard,
  TouchGate,
} from "./map/MapUI";
import {
  boundsOf,
  clusterPlots,
  collectUtp,
  EMPTY_FILTERS,
  filtersActive,
  fitView,
  medianPlotSpan,
  passesFilters,
  plotKind,
  plotPixels,
  RESERVED_COLOR,
  ringToLngLat,
  textOn,
  tierColor,
  type Filters,
  type LngLat,
  type LngLatBounds,
  type Padding,
  type Plot,
  type PlotCluster,
  type PlotKind,
  type VillageMap,
} from "./map/types";

/**
 * Карта генплана посёлка.
 *
 * Разбор эталона (генплан zemexx.ru, «Каретный ряд», снят на 430×932)
 * показал, за счёт чего он читается, и это перенесено сюда:
 *
 *   • Подложка СВЕТЛАЯ схема, а не спутник. На спутнике нарезка участков
 *     не видна вообще — зелёно-серое месиво. На схеме видно все клетки:
 *     белая заливка, тонкий серый контур. Спутник остаётся тумблером.
 *   • Цвет живёт в КРУЖКАХ, не в заливке: статус и цену несут маркеры с
 *     номером, границы участков нейтральные.
 *   • Проданные не исчезают, а уходят в фон: контур клетки + иконка дома
 *     внутри (у эталона ровно так — сразу видно, что там построились),
 *     номер проявляется, когда клетка вырастает настолько, что он влезает.
 *   • Карта во весь экран, а не карточкой в странице: на телефоне кадр
 *     100svh во всю ширину, тап открывает полноэкранный режим без шапки.
 *   • Колесо мыши не зумит: behaviors без scrollZoom, ровно как у них
 *     (['drag','pinchZoom','dblClick']) — страница листается нормально.
 *
 * Чего у эталона нет, а у нас есть: группировка кружков (см. clusterPlots
 * в types.ts — соседние участки в «Фаворите» стоят в 9 экранных пикселях,
 * и без группировки номера сливаются в «4484 487»), фильтр по площади и
 * бюджету, карточка с кадастром и полной стоимостью.
 *
 * Данные и бронь по-прежнему Земекс: тянем их API через наш
 * /api/village-map/[uuid], бронируем в их же фрейме.
 */

// ─────────────────────────────────────────────────────────────────
// Реактифицированный ymaps3
// ─────────────────────────────────────────────────────────────────

type LocationRequest =
  | {
      bounds: LngLatBounds;
      /** В типах ymaps3 его нет, но рантайм его понимает — так же фитит генплан Земекс. */
      padding?: { top: number; right: number; bottom: number; left: number };
      duration?: number;
      easing?: string;
    }
  | { center: LngLat; zoom: number; duration?: number; easing?: string };

interface Reactified {
  YMap: ComponentType<{
    location: LocationRequest;
    mode?: "vector" | "raster";
    behaviors?: readonly string[];
    zoomRange?: { min: number; max: number };
    zoomRounding?: "snap" | "smooth" | "auto";
    children?: ReactNode;
  }>;
  YMapDefaultSchemeLayer: ComponentType<Record<string, unknown>>;
  YMapDefaultSatelliteLayer: ComponentType<Record<string, unknown>>;
  YMapDefaultFeaturesLayer: ComponentType<Record<string, unknown>>;
  YMapFeature: ComponentType<{
    geometry: { type: "Polygon"; coordinates: LngLat[][] };
    style?: Record<string, unknown>;
    onClick?: () => void;
  }>;
  YMapMarker: ComponentType<{
    coordinates: LngLat;
    zIndex?: number;
    onClick?: () => void;
    children?: ReactNode;
  }>;
  YMapListener: ComponentType<{
    onUpdate?: (state: { location: { center: LngLat; zoom: number } }) => void;
    onActionEnd?: (state: { location: { center: LngLat; zoom: number } }) => void;
  }>;
}

type Bundle =
  | { kind: "loading" }
  | { kind: "ready"; c: Reactified }
  | { kind: "blocked"; error: string };

/** Без scrollZoom — колесо остаётся странице. Точь-в-точь как у Земекс. */
const BEHAVIORS = ["drag", "pinchZoom", "dblClick"] as const;
const ZOOM_RANGE = { min: 3, max: 20 } as const;

/**
 * Запас под панели, чтобы «домой» не прятал края посёлка под интерфейс.
 * Считан по разметке: верхняя панель 12 + 48, под ней плашка с названием,
 * справа колонка 52 при отступе 14.
 */
// По горизонтали отступы симметричные: посёлок обязан стоять по центру
// кадра, а не липнуть к левому краю из-за колонки кнопок справа.
const PADDING_DESKTOP: Padding = { top: 128, right: 96, bottom: 76, left: 96 };
const PADDING_MOBILE: Padding = { top: 118, right: 34, bottom: 74, left: 34 };

/**
 * Порог, ниже которого клетка участка на экране слишком мала, чтобы в неё
 * что-то класть. Ровно тот случай, когда карту отмасштабировали на весь
 * район: рисуем только контуры, маркеры проданных не мешаются.
 */
const SOLD_GLYPH_PX = 9;
/** С этой ширины клетки под иконкой дома помещается ещё и номер. */
const SOLD_NUMBER_PX = 19;

/** Диаметр кружка участка. Замер с генплана Земекс: 32×32 при шрифте 16. */
const CIRCLE_D = 32;

function circleDiameter(zoom: number): number {
  return zoom >= 17 ? CIRCLE_D + 4 : CIRCLE_D;
}

/** Кегль номера внутри кружка: 16px на двузначном, мельче на длинных. */
function numberFont(d: number, len: number): number {
  const k = len >= 4 ? 0.34 : len === 3 ? 0.42 : 0.5;
  return Math.max(9, Math.round(d * k * 10) / 10);
}

/** Плашка названия — то же стекло, что у кнопок, только не круглое. */
const PILL = {
  backdropFilter: "blur(18px) saturate(1.5)",
  WebkitBackdropFilter: "blur(18px) saturate(1.5)",
  background: "linear-gradient(160deg, rgba(18,23,30,0.80), rgba(10,13,18,0.88))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 28px -6px rgba(3,8,19,0.45)",
} as const;

function hasCenter(p: Plot): boolean {
  return Boolean(p.center) && !(p.center[0] === 0 && p.center[1] === 0);
}

/** [lat, lon] центра участка → порядок, в котором ymaps3 ждёт координаты. */
function centerLngLat(p: Plot): LngLat {
  return [p.center[1], p.center[0]];
}

/**
 * Кольцо группы: секторами по цветам тиров, которые в неё попали. Один
 * тир — ровный цвет, несколько — видно, что в группе разные ценники.
 */
function tierRing(cl: PlotCluster): string {
  const tiers = [...new Set(cl.plots.map((p) => p.priceTier))].sort((a, b) => a - b);
  if (tiers.length === 1) return tierColor(tiers[0]);
  const step = 100 / tiers.length;
  const stops = tiers
    .map((t, i) => `${tierColor(t)} ${i * step}% ${(i + 1) * step}%`)
    .join(", ");
  return `conic-gradient(from -90deg, ${stops})`;
}

export default function PlotMapDark({
  uuid,
  bookingUrl,
}: {
  uuid: string;
  bookingUrl?: string;
}) {
  const [bundle, setBundle] = useState<Bundle>({ kind: "loading" });
  const [data, setData] = useState<VillageMap | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [selected, setSelected] = useState<Plot | null>(null);
  const [booking, setBooking] = useState(false);
  /** Схема по умолчанию: на спутнике нарезки участков не видно вообще. */
  const [satellite, setSatellite] = useState(false);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hiddenTiers, setHiddenTiers] = useState<ReadonlySet<number>>(new Set());
  const [legendOpen, setLegendOpen] = useState(false);

  const [location, setLocation] = useState<LocationRequest | null>(null);
  /** Зум с шагом 0,5 — по нему считаются размеры маркеров и группировка. */
  const [zoomStep, setZoomStep] = useState(15);
  const cameraRef = useRef<{ center: LngLat; zoom: number } | null>(null);

  const [narrow, setNarrow] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [me, setMe] = useState<LngLat | null>(null);
  const [locating, setLocating] = useState(false);
  const touchedRef = useRef(false);

  /**
   * Меряем сам кадр карты. Размер ему задаёт CSS (100svh на телефоне,
   * 86svh на десктопе, весь экран в полноэкранном режиме) — считать его в
   * JS больше не нужно, а вот посадка посёлка считается по замеру, потому
   * что svh и адресная строка iOS в число не переводятся.
   */
  const [viewEl, setViewEl] = useState<HTMLDivElement | null>(null);
  const [viewW, setViewW] = useState(0);
  const [viewH, setViewH] = useState(0);

  // ── данные Земекс ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setDataError(null);
    fetch(`/api/village-map/${uuid}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: VillageMap) => {
        if (!cancelled) setData(d);
      })
      .catch((e: Error) => {
        if (!cancelled) setDataError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [uuid, attempt]);

  // ── ymaps3 ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setBundle({ kind: "loading" });
    loadYmaps3()
      .then(async ({ ymaps3, reactify }) => {
        if (cancelled) return;
        const React = await import("react");
        const ReactDOM = await import("react-dom");
        const bound = reactify.bindTo(React, ReactDOM);
        setBundle({ kind: "ready", c: bound.module(ymaps3) as unknown as Reactified });
      })
      .catch((e: Error) => {
        if (!cancelled) setBundle({ kind: "blocked", error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // ── габариты посёлка ───────────────────────────────────────
  const bounds = useMemo(() => (data ? boundsOf(data) : null), [data]);
  /** Медианная ширина участка в долях мира — из неё считается размер клетки. */
  const plotSpan = useMemo(() => (data ? medianPlotSpan(data.plots) : 0), [data]);

  /**
   * Единственный способ подвинуть камеру — через состояние.
   *
   * Reactify переприменяет проп `location` на каждый ре-рендер, поэтому
   * императивный setLocation бесполезен: ближайший же ре-рендер (смена
   * зума, выбор участка) утащит камеру обратно на значение пропа.
   * Значит проп обязан быть источником правды и всегда совпадать с тем,
   * где карта стоит на самом деле — за этим следит onActionEnd ниже.
   */
  const applyView = useCallback(
    (view: { center: LngLat; zoom: number }, animate: boolean) => {
      cameraRef.current = view;
      // Сразу ставим зум: маркеры получают верный размер в том же кадре,
      // не дожидаясь первого onUpdate от карты.
      const step = Math.round(view.zoom * 2) / 2;
      setZoomStep((prev) => (prev === step ? prev : step));
      setLocation({
        ...view,
        ...(animate ? { duration: 420, easing: "ease-in-out" } : null),
      });
    },
    [],
  );

  const frame = useMemo(() => {
    if (viewW < 1 || viewH < 1) return null;
    const wide = viewW >= 640;
    return { w: viewW, h: viewH, pad: wide ? PADDING_DESKTOP : PADDING_MOBILE, wide };
  }, [viewW, viewH]);

  const fitVillage = useCallback(
    (animate: boolean) => {
      if (!bounds || !frame) return;
      applyView(fitView(bounds, frame, frame.pad, ZOOM_RANGE), animate);
    },
    [bounds, frame, applyView],
  );

  /**
   * Стартовый кадр карты. Считается один раз и дальше не меняется —
   * иначе reactify при смене пропа дёрнет камеру обратно.
   */
  const initialLocationRef = useRef<LocationRequest | null>(null);
  if (!initialLocationRef.current && bounds) {
    // Считаем только когда габариты уже известны: до загрузки данных
    // здесь застряла бы Москва, и карта так и осталась бы на ней.
    initialLocationRef.current = {
      center: [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2],
      zoom: 15,
    };
  }

  useEffect(() => {
    if (!viewEl || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r || r.width < 1 || r.height < 1) return;
      setViewW((prev) => (Math.abs(prev - r.width) < 1 ? prev : r.width));
      setViewH((prev) => (Math.abs(prev - r.height) < 1 ? prev : r.height));
    });
    ro.observe(viewEl);
    return () => ro.disconnect();
  }, [viewEl]);

  // Стартовое состояние = «домой». Пересобираем посадку на каждый новый
  // кадр (первый замер, поворот телефона, вход в полный экран) — пока
  // пользователь сам ничего не двигал.
  useEffect(() => {
    if (!frame || touchedRef.current) return;
    fitVillage(false);
  }, [frame, fitVillage]);

  // ── телефон: карта показывается превью, тап открывает полный экран ──
  // Ставим только после монтирования: на сервере ширины нет, а рисовать
  // шторку в первом же кадре — гарантированный hydration mismatch.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 639.98px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const openFullscreen = useCallback(() => {
    touchedRef.current = false;
    setFiltersOpen(false);
    setFullscreen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    touchedRef.current = false;
    setFiltersOpen(false);
    setLegendOpen(false);
    setFullscreen(false);
  }, []);

  // Полноэкранный режим забирает прокрутку страницы себе и закрывается Esc.
  useEffect(() => {
    if (!fullscreen || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen, closeFullscreen]);

  /** Пока карта в странице и экран узкий — она превью, касания ей не идут. */
  const gated = narrow && !fullscreen;

  // ── производные ────────────────────────────────────────────
  const utpOptions = useMemo(() => (data ? collectUtp(data.plots) : []), [data]);
  const hasFilters = filtersActive(filters);

  const kinds = useMemo(() => {
    const m = new Map<string, PlotKind>();
    for (const p of data?.plots ?? []) m.set(p.number, plotKind(p.statusName));
    return m;
  }, [data]);

  const matched = useMemo(() => {
    const s = new Set<string>();
    for (const p of data?.plots ?? []) {
      const k = kinds.get(p.number) ?? "other";
      if (passesFilters(p, k, filters, hiddenTiers)) s.add(p.number);
    }
    return s;
  }, [data, kinds, filters, hiddenTiers]);

  const tierCounts = useMemo(() => {
    const counts = new Array<number>(data?.priceTiers.length ?? 0).fill(0);
    for (const p of data?.plots ?? []) {
      if (kinds.get(p.number) !== "free") continue;
      if (p.priceTier < counts.length) counts[p.priceTier] += 1;
    }
    return counts;
  }, [data, kinds]);

  const selectPlot = useCallback((p: Plot) => {
    touchedRef.current = true;
    setSelected(p);
    setFiltersOpen(false);
  }, []);

  const toggleTier = useCallback((tier: number) => {
    setHiddenTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) next.delete(tier);
      else next.add(tier);
      return next;
    });
  }, []);

  const zoomBy = useCallback(
    (delta: number) => {
      touchedRef.current = true;
      const cam = cameraRef.current;
      if (!cam) return;
      applyView(
        {
          center: cam.center,
          zoom: Math.min(ZOOM_RANGE.max, Math.max(ZOOM_RANGE.min, cam.zoom + delta)),
        },
        true,
      );
    },
    [applyView],
  );

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    touchedRef.current = true;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: LngLat = [pos.coords.longitude, pos.coords.latitude];
        setMe(c);
        applyView({ center: c, zoom: 13 }, true);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [applyView]);

  const onMapUpdate = useCallback((state: { location: { center: LngLat; zoom: number } }) => {
    const loc = state?.location;
    if (!loc || typeof loc.zoom !== "number") return;
    cameraRef.current = { center: loc.center, zoom: loc.zoom };
    const step = Math.round(loc.zoom * 2) / 2;
    setZoomStep((prev) => (prev === step ? prev : step));
  }, []);

  /**
   * Конец жеста (drag / pinch). Подтягиваем проп location к тому, где
   * карта реально оказалась, иначе первый же ре-рендер вернёт камеру
   * на последнюю программную позицию — и посёлок «прыгнет» под рукой.
   */
  const onActionEnd = useCallback(() => {
    touchedRef.current = true;
    const cam = cameraRef.current;
    if (cam) setLocation({ center: cam.center, zoom: cam.zoom });
  }, []);

  // ── маркеры: размеры и группировка ─────────────────────────
  const circleD = circleDiameter(zoomStep);
  /** Ширина клетки участка на экране — от неё зависит вид проданных. */
  const cellPx = plotPixels(plotSpan, zoomStep);

  const selectedNumber = selected?.number ?? null;

  /**
   * Свободные и забронированные, прошедшие фильтр. Выбранный участок из
   * группировки исключаем — он всегда рисуется отдельным крупным кружком.
   */
  const pickable = useMemo(() => {
    if (!data) return [];
    return data.plots.filter(
      (p) => matched.has(p.number) && p.number !== selectedNumber && hasCenter(p),
    );
  }, [data, matched, selectedNumber]);

  /**
   * Радиус значка группы: у одиночки это сам кружок, у группы — он же
   * плюс прибавка на количество, и в обоих случаях ещё белое кольцо.
   * clusterPlots по этому радиусу и решает, что склеивать.
   */
  const badgeRadius = useCallback(
    (count: number) => (circleD + (count > 1 ? Math.min(10, count) : 0)) / 2 + 4,
    [circleD],
  );

  const clusters = useMemo(
    () => clusterPlots(pickable, zoomStep, badgeRadius, 4),
    [pickable, zoomStep, badgeRadius],
  );

  /** Тап по группе подводит зум ровно настолько, чтобы она распалась. */
  const expandCluster = useCallback(
    (cl: PlotCluster) => {
      if (!frame) return;
      touchedRef.current = true;
      setSelected(null);
      const cam = cameraRef.current;
      const padLon = Math.max(plotSpan * 360 * 1.6, 1e-5);
      const padLat = padLon * 0.6;
      const fit = fitView(
        [
          [cl.bounds[0][0] - padLon, cl.bounds[0][1] - padLat],
          [cl.bounds[1][0] + padLon, cl.bounds[1][1] + padLat],
        ],
        frame,
        frame.pad,
        ZOOM_RANGE,
      );
      // Больше чем на две с половиной ступени за тап не прыгаем: иначе с
      // общего плана попадаешь сразу вплотную и теряешь, где ты.
      const zoom = Math.min(fit.zoom, (cam?.zoom ?? fit.zoom) + 2.5);
      applyView({ center: cl.center, zoom }, true);
    },
    [frame, plotSpan, applyView],
  );

  // ── полигоны ───────────────────────────────────────────────
  // Нарезка обязана читаться: у проданных белая клетка с серым контуром,
  // у подходящих под фильтр — заливка цветом тира.
  const C = bundle.kind === "ready" ? bundle.c : null;

  const polygons = useMemo(() => {
    if (!C || !data) return null;
    const { YMapFeature } = C;
    const idleFill = satellite ? 0.2 : 0.6;
    const idleStroke = satellite ? "#e5edf5" : "#8d99ab";
    const selStroke = satellite ? "#ffffff" : "#0f172a";

    return data.plots.map((p) => {
      if (!p.coords || p.coords.length < 3) return null;
      const kind = kinds.get(p.number) ?? "other";
      const hit = matched.has(p.number);
      const sel = selectedNumber === p.number;
      const accent = kind === "reserved" ? RESERVED_COLOR : tierColor(p.priceTier);

      let fill = "#ffffff";
      let fillOpacity = idleFill;
      let strokeColor = idleStroke;
      let strokeWidth = 1;
      let strokeOpacity = 0.9;

      if (hit) {
        fill = accent;
        fillOpacity = 0.28;
        strokeColor = accent;
        strokeWidth = 1.4;
        strokeOpacity = 1;
      }
      if (sel) {
        fill = accent;
        fillOpacity = 0.5;
        strokeColor = selStroke;
        strokeWidth = 2.4;
        strokeOpacity = 1;
      }

      return (
        <YMapFeature
          key={`p-${p.number}`}
          geometry={{ type: "Polygon", coordinates: [ringToLngLat(p.coords)] }}
          style={{
            fill,
            fillOpacity,
            stroke: [{ color: strokeColor, width: strokeWidth, opacity: strokeOpacity }],
            cursor: "pointer",
          }}
          onClick={() => selectPlot(p)}
        />
      );
    });
  }, [C, data, kinds, matched, selectedNumber, satellite, selectPlot]);

  // ── проданные: домик в клетке, номер — когда клетка подросла ──
  const soldMarkers = useMemo(() => {
    if (!C || !data || cellPx < SOLD_GLYPH_PX) return null;
    const { YMapMarker } = C;
    const glyph = Math.max(8, Math.min(16, Math.round(cellPx * 0.46)));
    const showNumber = cellPx >= SOLD_NUMBER_PX;
    const fs = Math.max(8, Math.min(12, Math.round(cellPx * 0.34)));

    return data.plots.map((p) => {
      if (matched.has(p.number) || p.number === selectedNumber) return null;
      if (!hasCenter(p)) return null;
      return (
        <YMapMarker
          key={`s-${p.number}`}
          coordinates={centerLngLat(p)}
          zIndex={80}
          onClick={() => selectPlot(p)}
        >
          <span className="flex -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none flex-col items-center leading-none">
            <HouseGlyph size={glyph} muted={satellite} />
            {showNumber && (
              <span
                className="mt-[1px] font-semibold tabular-nums"
                style={{
                  fontSize: fs,
                  color: satellite ? "rgba(255,255,255,0.85)" : "#64748b",
                  textShadow: satellite ? "0 1px 3px rgba(0,0,0,0.9)" : "none",
                }}
              >
                {p.number}
              </span>
            )}
          </span>
        </YMapMarker>
      );
    });
  }, [C, data, matched, selectedNumber, cellPx, satellite, selectPlot]);

  // ── свободные: кружок с номером, слипшиеся — одной группой ──
  const freeMarkers = useMemo(() => {
    if (!C) return null;
    const { YMapMarker } = C;

    return clusters.map((cl) => {
      if (cl.plots.length === 1) {
        const p = cl.plots[0];
        const kind = kinds.get(p.number) ?? "other";
        const accent = kind === "reserved" ? RESERVED_COLOR : tierColor(p.priceTier);
        return (
          <YMapMarker
            key={`f-${cl.key}`}
            coordinates={centerLngLat(p)}
            zIndex={300}
            onClick={() => selectPlot(p)}
          >
            <span
              className="block cursor-pointer select-none rounded-full text-center font-extrabold tabular-nums transition-transform hover:scale-110"
              style={{
                width: circleD,
                height: circleD,
                lineHeight: `${circleD}px`,
                fontSize: numberFont(circleD, p.number.length),
                marginLeft: -circleD / 2,
                marginTop: -circleD / 2,
                background: accent,
                color: textOn(accent),
                boxShadow:
                  "0 0 0 1.5px rgba(255,255,255,0.95), 0 2px 9px rgba(15,23,42,0.35)",
              }}
            >
              {p.number}
            </span>
          </YMapMarker>
        );
      }

      // Группа: тёмная «монета» с количеством в кольце из цветов тиров,
      // которые в неё попали. Силуэт специально другой, чем у кружка
      // участка, — иначе «5» не отличить от участка № 5, — а кольцо не даёт
      // потерять главное: по какой цене тут стоят участки.
      const d = circleD + Math.min(10, cl.plots.length);
      const inner = d - 7;
      return (
        <YMapMarker
          key={`c-${cl.key}`}
          coordinates={cl.center}
          zIndex={320}
          onClick={() => expandCluster(cl)}
        >
          <span
            className="grid cursor-pointer select-none place-items-center rounded-full transition-transform hover:scale-110"
            style={{
              width: d,
              height: d,
              marginLeft: -d / 2,
              marginTop: -d / 2,
              background: tierRing(cl),
              boxShadow:
                "0 0 0 1.5px rgba(255,255,255,0.95), 0 3px 12px rgba(15,23,42,0.4)",
            }}
            title={`${cl.plots.length} свободных участка рядом — нажмите, чтобы разложить`}
          >
            <span
              className="block rounded-full text-center font-extrabold tabular-nums text-white"
              style={{
                width: inner,
                height: inner,
                lineHeight: `${inner}px`,
                fontSize: numberFont(inner, String(cl.plots.length).length),
                background: "#111827",
              }}
            >
              {cl.plots.length}
            </span>
          </span>
        </YMapMarker>
      );
    });
  }, [C, clusters, kinds, circleD, selectPlot, expandCluster]);

  // ── состояния ──────────────────────────────────────────────
  if (dataError || bundle.kind === "blocked") {
    return (
      <MapError
        title="Карта участков недоступна"
        detail={
          dataError
            ? `Данные Земекс не пришли (${dataError}). Так бывает, если у сервиса Земекс перерыв или сеть режет запрос — на проде карта работает.`
            : bundle.kind === "blocked"
              ? `Яндекс.Карты не загрузились: ${bundle.error}. Обычно это приватный режим Safari или блокировщик — откройте страницу в обычном окне.`
              : ""
        }
        onRetry={() => {
          resetYmaps3Loader();
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  if (!data || bundle.kind !== "ready") {
    return <MapSkeleton label="Загружаем генплан…" />;
  }

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultSatelliteLayer,
    YMapDefaultFeaturesLayer,
    YMapFeature,
    YMapMarker,
    YMapListener,
  } = bundle.c;

  const selectedKind: PlotKind = selected
    ? (kinds.get(selected.number) ?? "other")
    : "other";
  const selectedAccent = selected
    ? selectedKind === "reserved"
      ? RESERVED_COLOR
      : tierColor(selected.priceTier)
    : "#94a3b8";
  const selectedD = circleD + 8;

  /**
   * Содержимое кадра. Один и тот же узел живёт либо в странице, либо в
   * полноэкранном портале — оба контейнера позиционированы, поэтому
   * absolute inset-0 работает без изменений.
   */
  const surface = (
    <div ref={setViewEl} className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${gated ? "pointer-events-none" : ""}`}>
        <YMap
          location={
            location ?? initialLocationRef.current ?? { center: [37.6173, 55.7558], zoom: 9 }
          }
          mode="vector"
          behaviors={BEHAVIORS}
          zoomRange={ZOOM_RANGE}
          /* Дробный зум обязателен: посадка почти никогда не попадает
             в целое число, а при zoomRounding="auto" карта без
             WebGL уходит в растр и округляет зум ВВЕРХ — посёлок
             при этом обрезается по краям. */
          zoomRounding="smooth"
        >
          {/* Светлая схема — единственная подложка, на которой видно
              нарезку участков. Спутник кладётся сверху по тумблеру. */}
          <YMapDefaultSchemeLayer theme="light" />
          {satellite && <YMapDefaultSatelliteLayer />}
          <YMapDefaultFeaturesLayer zIndex={2000} />

          {data.villageCoords.length >= 3 && (
            <YMapFeature
              geometry={{
                type: "Polygon",
                coordinates: [ringToLngLat(data.villageCoords)],
              }}
              style={{
                fill: "#22c55e",
                fillOpacity: 0.04,
                stroke: [{ color: "#16a34a", width: 2.4, opacity: 0.95 }],
              }}
            />
          )}

          {polygons}
          {soldMarkers}
          {freeMarkers}

          {selected && hasCenter(selected) && (
            <YMapMarker coordinates={centerLngLat(selected)} zIndex={1000}>
              <span
                className="block select-none rounded-full text-center font-extrabold tabular-nums"
                style={{
                  width: selectedD,
                  height: selectedD,
                  lineHeight: `${selectedD}px`,
                  fontSize: numberFont(selectedD, selected.number.length),
                  marginLeft: -selectedD / 2,
                  marginTop: -selectedD / 2,
                  background: selectedAccent,
                  color: textOn(selectedAccent),
                  boxShadow: `0 0 0 3px #ffffff, 0 0 0 5px ${selectedAccent}, 0 6px 18px rgba(15,23,42,0.45)`,
                }}
              >
                {selected.number}
              </span>
            </YMapMarker>
          )}

          {me && (
            <YMapMarker coordinates={me} zIndex={1200}>
              <span className="relative block h-0 w-0">
                <span className="absolute -left-2 -top-2 block h-4 w-4 rounded-full bg-sky-500 shadow-[0_0_0_2px_#fff,0_0_18px_rgba(14,165,233,0.9)]" />
              </span>
            </YMapMarker>
          )}

          <YMapListener onUpdate={onMapUpdate} />
          <YMapListener onActionEnd={onActionEnd} />
        </YMap>
      </div>

      {/* ── верхняя панель: «назад», легенда, «Фильтры» ── */}
      {/* Геометрия снята с генплана Земекс: отступ 12, кнопки 48×48,
          чип «Фильтры» 134×48 прижат к правому краю. */}
      {/* Пока это превью в странице, панель прячем: она всё равно не
          кликается, а сверху её накрывает липкая шапка сайта. */}
      <div
        className={`pointer-events-none absolute inset-x-3 top-3 z-30 flex items-start gap-2 ${gated ? "hidden" : ""}`}
      >
        {fullscreen && (
          <div className="pointer-events-auto">
            <MapRoundButton label="Выйти из полноэкранной карты" onClick={closeFullscreen}>
              <ChevronLeft className="h-[22px] w-[22px]" />
            </MapRoundButton>
          </div>
        )}
        <div className="pointer-events-auto">
          <MapRoundButton
            label="Легенда"
            active={legendOpen}
            onClick={() => setLegendOpen((v) => !v)}
          >
            <List className="h-[20px] w-[20px]" />
          </MapRoundButton>
        </div>

        <span className="ml-auto" />

        <div className="pointer-events-auto">
          <FilterChip
            open={filtersOpen}
            active={hasFilters}
            onClick={() => {
              setFiltersOpen((v) => !v);
              setSelected(null);
            }}
          />
        </div>
      </div>

      {/* ── название и счётчик под верхней панелью ── */}
      <div
        className={`pointer-events-none absolute left-3 z-20 max-w-[62%] ${gated ? "bottom-[124px]" : "top-[66px]"}`}
      >
        <span className="inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px]" style={PILL}>
          <span className="truncate font-extrabold text-white/90">{data.villageName}</span>
          <span className="h-3 w-px shrink-0 bg-white/15" />
          <span className="shrink-0 font-bold tabular-nums text-emerald-300">
            {data.statistics.free}
          </span>
          <span className="shrink-0 text-white/45">
            свободно из <span className="tabular-nums">{data.plots.length}</span>
          </span>
        </span>
      </div>

      {/* ── панель фильтров: шторка снизу на телефоне, выпадашка на ПК ── */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-40 flex max-h-[76%] justify-end sm:inset-x-auto sm:bottom-auto sm:right-[76px] sm:top-[66px] sm:max-h-[72%]">
        <AnimatePresence>
          {filtersOpen && (
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => {
                setFilters(EMPTY_FILTERS);
                setHiddenTiers(new Set());
              }}
              hasFilters={hasFilters}
              utpOptions={utpOptions}
              matchCount={matched.size}
              onClose={() => setFiltersOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── колонка управления справа: x = правый край − 14, шаг 60 ── */}
      <div
        className={`pointer-events-none absolute right-[14px] top-[66px] z-20 ${gated ? "hidden" : ""}`}
      >
        <ControlRail
          satellite={satellite}
          onToggleBase={() => setSatellite((v) => !v)}
          onZoomIn={() => zoomBy(1)}
          onZoomOut={() => zoomBy(-1)}
          onLocate={locate}
          onHome={() => {
            touchedRef.current = false;
            setSelected(null);
            fitVillage(true);
          }}
          fullscreen={fullscreen}
          onToggleFullscreen={fullscreen ? closeFullscreen : openFullscreen}
          locating={locating}
        />
      </div>

      {/* ── легенда слева снизу, выше плашки «Открыть Яндекс Карты» ── */}
      <div className="pointer-events-none absolute bottom-[58px] left-3 z-20 sm:bottom-[64px] sm:left-5">
        <AnimatePresence>
          {legendOpen && data.priceTiers.length > 0 && (
            <LegendPanel
              tiers={data.priceTiers}
              hidden={hiddenTiers}
              onToggle={toggleTier}
              counts={tierCounts}
              hasReserved={data.statistics.reserved > 0}
              hasSold={data.statistics.sold > 0}
              onClose={() => setLegendOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── карточка участка ── */}
      {/* Приподняты над обязательной плашкой копирайта Яндекса —
          её перекрывать нельзя, а она сидит по низу карты. */}
      <div className="pointer-events-none absolute bottom-[46px] left-3 right-3 top-3 z-30 flex items-end justify-end sm:left-auto sm:right-5">
        <AnimatePresence>
          {selected && (
            <PlotCard
              plot={selected}
              kind={selectedKind}
              onClose={() => setSelected(null)}
              onBook={() => setBooking(true)}
              canBook={selectedKind === "free" && Boolean(bookingUrl)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── превью на телефоне ── */}
      {/* Без AnimatePresence: узел должен исчезать сразу по тапу, а не
          после exit-анимации, которая в фоновой вкладке не тикает. */}
      {gated && <TouchGate onOpen={openFullscreen} />}
    </div>
  );

  return (
    <>
      {/* Кадр в странице. На телефоне он во всю ширину окна и во всю его
          высоту — прежние 70svh в скруглённой карточке и были той самой
          «маленькой карточкой», из-за которой генплан не читался. */}
      <div className="relative ml-[calc(50%-50vw)] h-[100svh] w-screen overflow-hidden bg-[#e8edf3] sm:ml-0 sm:h-[min(calc(100svh-56px),860px)] sm:min-h-[520px] sm:w-full sm:rounded-[28px] sm:ring-1 sm:ring-white/10">
        {!fullscreen && surface}
      </div>

      {fullscreen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[90] bg-[#e8edf3]">{surface}</div>,
          document.body,
        )}

      {/* ── бронь: фрейм Земекс как есть ── */}
      <AnimatePresence>
        {booking && bookingUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setBooking(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[85vh] w-full max-w-[1100px] overflow-hidden rounded-[24px] bg-[#0b0e13] ring-1 ring-white/15"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="text-[13px] font-bold">
                  Бронирование участка № {selected?.number} · система Земекс
                </span>
                <button
                  type="button"
                  onClick={() => setBooking(false)}
                  aria-label="Закрыть бронирование"
                  className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <iframe
                src={bookingUrl}
                className="h-[calc(100%-49px)] w-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer-when-downgrade"
                title="Бронирование участка"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
