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
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { loadYmaps3, resetYmaps3Loader } from "@/lib/ymaps3";

import {
  ControlRail,
  FilterBar,
  LegendPanel,
  MapError,
  MapSkeleton,
  PlotCard,
  TouchGate,
  type ChipId,
} from "./map/MapUI";
import {
  boundsOf,
  collectUtp,
  EMPTY_FILTERS,
  filtersActive,
  fitView,
  passesFilters,
  plotKind,
  RESERVED_COLOR,
  ringToLngLat,
  textOn,
  tierColor,
  type Filters,
  type LngLat,
  type LngLatBounds,
  type Plot,
  type PlotKind,
  type VillageMap,
} from "./map/types";

/**
 * Карта генплана посёлка — тёмный премиум.
 *
 * Разбор эталона (генплан zemexx.ru, «Каретный ряд») показал, за счёт
 * чего он читается, и это перенесено сюда:
 *
 *   • Цвет живёт в КРУЖКАХ, не в заливке. У Земекс все 128 полигонов
 *     покрашены одинаково серым (#dadada, stroke 1.5), а статус и цену
 *     несут маркеры-кружки 25×25 с номером внутри. Мы делаем так же:
 *     границы тонкие и нейтральные, тир — крупный цветной кружок.
 *   • Проданные почти не видны: у них вообще нет кружка, только
 *     бледный контур и мелкий серый номер, который проявляется на
 *     ближнем зуме. При 438 проданных из 480 иначе тонут свободные.
 *   • Колесо мыши не зумит: behaviors без scrollZoom, ровно как у них
 *     (['drag','pinchZoom','dblClick']) — страница листается нормально.
 *   • Старт = «домой»: fitBounds по границе посёлка И по всем полигонам
 *     участков, с пиксельными отступами под панели.
 *
 * Чего у эталона нет, а у нас есть: тёмная эстетика /v3, фильтр по
 * площади и бюджету рядом со статусом и УТП, карточка с кадастром и
 * полной стоимостью, мобильная шторка вместо перехвата скролла.
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

/** Запас под панели, чтобы «домой» не прятал края посёлка под интерфейс. */
const PADDING_DESKTOP = { top: 88, right: 76, bottom: 56, left: 24 };
const PADDING_MOBILE = { top: 84, right: 62, bottom: 52, left: 14 };

/**
 * Размер кружка по зуму. У Земекс он фиксированный 25px, но их генплан
 * всегда открыт на одном масштабе, а у нас можно уехать на общий план.
 * На узком экране режем на четверть: посёлок там занимает меньше
 * пикселей, и кружки взрослого размера слипаются в кашу.
 */
function circleSize(zoom: number, narrow: boolean): number {
  let base: number;
  if (zoom <= 12) base = 0;
  else if (zoom <= 13) base = 15;
  else if (zoom === 14) base = 19;
  else if (zoom === 15) base = 22;
  else if (zoom === 16) base = 25;
  else if (zoom === 17) base = 29;
  else if (zoom === 18) base = 33;
  else base = 38;
  if (base === 0) return 0;
  // Нижняя граница 18px: телефон вписывает посёлок на меньшем зуме, и
  // без неё кружки схлопывались в безымянные точки — а номер участка
  // и есть главное, что человек ищет глазами.
  return narrow ? Math.max(18, Math.round(base * 0.82)) : base;
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
  const [satellite, setSatellite] = useState(true);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [openChip, setOpenChip] = useState<ChipId>(null);
  const [hiddenTiers, setHiddenTiers] = useState<ReadonlySet<number>>(new Set());
  const [legendOpen, setLegendOpen] = useState(false);

  const [location, setLocation] = useState<LocationRequest | null>(null);
  const [zoomBucket, setZoomBucket] = useState(16);
  const cameraRef = useRef<{ center: LngLat; zoom: number } | null>(null);

  const [gated, setGated] = useState(false);
  const [me, setMe] = useState<LngLat | null>(null);
  const [locating, setLocating] = useState(false);
  const touchedRef = useRef(false);
  const gateDismissedRef = useRef(false);

  /** Реальный размер контейнера карты. Считаем посадку от него, а не от
   *  window: контейнер может смонтироваться нулевым (скрытая вкладка,
   *  ленивый блок) — тогда fitBounds по нулю даёт зум «вся страна». */
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const [narrow, setNarrow] = useState(false);

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

  /**
   * Единственный способ подвинуть камеру — через состояние.
   *
   * Reactify переприменяет проп `location` на каждый ре-рендер, поэтому
   * императивный setLocation бесполезен: ближайший же ре-рендер (смена
   * зум-бакета, выбор участка) утащит камеру обратно на значение пропа.
   * Значит проп обязан быть источником правды и всегда совпадать с тем,
   * где карта стоит на самом деле — за этим следит onActionEnd ниже.
   */
  const applyView = useCallback(
    (view: { center: LngLat; zoom: number }, animate: boolean) => {
      cameraRef.current = view;
      // Сразу ставим зум-бакет: маркеры получают верный размер в том же
      // кадре, не дожидаясь первого onUpdate от карты.
      const b = Math.round(view.zoom);
      setZoomBucket((prev) => (prev === b ? prev : b));
      setLocation({
        ...view,
        ...(animate ? { duration: 420, easing: "ease-in-out" } : null),
      });
    },
    [],
  );

  const fitVillage = useCallback(
    (animate: boolean) => {
      if (!bounds) return;
      const size = sizeRef.current;
      if (size.w < 1 || size.h < 1) return;
      const pad = size.w >= 640 ? PADDING_DESKTOP : PADDING_MOBILE;
      applyView(fitView(bounds, size, pad, ZOOM_RANGE), animate);
    },
    [bounds, applyView],
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

  // Стартовое состояние = «домой». Считаем его от реального размера
  // контейнера: он же ловит и поворот телефона, и ресайз окна, и
  // переход из нулевой ширины (скрытая вкладка, ленивый блок).
  // Пока пользователь ничего не двигал — пересобираем посадку под кадр.
  useEffect(() => {
    if (!shellEl || typeof ResizeObserver === "undefined") return;
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      const prev = sizeRef.current;
      sizeRef.current = { w: r.width, h: r.height };
      if (r.width < 1 || r.height < 1) return;
      setNarrow(r.width < 640);
      const grew =
        prev.w < 1 || Math.abs(prev.w - r.width) > 32 || Math.abs(prev.h - r.height) > 32;
      if (!grew || touchedRef.current) return;
      clearTimeout(t);
      t = setTimeout(() => fitVillage(false), 160);
    });
    ro.observe(shellEl);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [shellEl, fitVillage]);

  // ── мобильная шторка ───────────────────────────────────────
  // Ставим только после монтирования: на сервере ширины нет, а рисовать
  // шторку в первом же кадре — гарантированный hydration mismatch.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 639.98px)");
    const sync = () => {
      if (gateDismissedRef.current) return;
      setGated(mq.matches && window.innerWidth > 0);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
    setOpenChip(null);
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
    const b = Math.round(loc.zoom);
    setZoomBucket((prev) => (prev === b ? prev : b));
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

  // ── полигоны ───────────────────────────────────────────────
  // Границы у всех участков тонкие и нейтральные — цвет несут кружки.
  // Подсветка заливкой только у подходящих под фильтр и у выбранного.
  const C = bundle.kind === "ready" ? bundle.c : null;
  const selectedNumber = selected?.number ?? null;

  const polygons = useMemo(() => {
    if (!C || !data) return null;
    const { YMapFeature } = C;
    return data.plots.map((p) => {
      if (!p.coords || p.coords.length < 3) return null;
      const kind = kinds.get(p.number) ?? "other";
      const hit = matched.has(p.number);
      const sel = selectedNumber === p.number;
      const accent = kind === "reserved" ? RESERVED_COLOR : tierColor(p.priceTier);

      let fill = "#ffffff";
      let fillOpacity = 0.03;
      let strokeColor = "#dfe9f3";
      let strokeWidth = 1;
      let strokeOpacity = 0.24;

      if (hit) {
        fill = accent;
        fillOpacity = 0.17;
        strokeColor = accent;
        strokeWidth = 1.2;
        strokeOpacity = 0.75;
      }
      if (sel) {
        fill = accent;
        fillOpacity = 0.42;
        strokeColor = "#ffffff";
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
  }, [C, data, kinds, matched, selectedNumber, selectPlot]);

  // ── маркеры ────────────────────────────────────────────────
  const markers = useMemo(() => {
    if (!C || !data) return null;
    const { YMapMarker } = C;
    const size = circleSize(zoomBucket, narrow);
    const showSoldNumbers = zoomBucket >= 17;

    return data.plots.map((p) => {
      if (!p.center || (p.center[0] === 0 && p.center[1] === 0)) return null;
      const kind = kinds.get(p.number) ?? "other";
      const hit = matched.has(p.number);
      const sel = selectedNumber === p.number;
      const coord: LngLat = [p.center[1], p.center[0]];

      // Проданные — только мелкий серый номер, и только вблизи.
      if (!hit && !sel) {
        if (!showSoldNumbers) return null;
        return (
          <YMapMarker key={`m-${p.number}`} coordinates={coord} zIndex={100}>
            <span
              className="pointer-events-none block -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold tabular-nums text-white/40"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.95)" }}
            >
              {p.number}
            </span>
          </YMapMarker>
        );
      }

      if (size === 0 && !sel) return null;

      const accent = kind === "reserved" ? RESERVED_COLOR : tierColor(p.priceTier);
      const d = sel ? Math.max(size, 22) + 6 : size;
      const fontSize = d >= 30 ? 13 : d >= 25 ? 12 : d >= 21 ? 11 : d >= 17 ? 9.5 : 8;

      return (
        <YMapMarker
          key={`m-${p.number}`}
          coordinates={coord}
          zIndex={sel ? 1000 : kind === "free" ? 300 : 250}
          onClick={() => selectPlot(p)}
        >
          <span
            className="block cursor-pointer select-none rounded-full text-center font-extrabold tabular-nums transition-transform hover:scale-110"
            style={{
              width: d,
              height: d,
              lineHeight: `${d}px`,
              fontSize,
              marginLeft: -d / 2,
              marginTop: -d / 2,
              background: accent,
              color: textOn(accent),
              boxShadow: sel
                ? `0 0 0 2.5px #fff, 0 0 22px -2px ${accent}, 0 4px 14px rgba(0,0,0,0.6)`
                : `0 0 0 1.5px rgba(0,0,0,0.45), 0 3px 10px rgba(0,0,0,0.5)`,
            }}
          >
            {d >= 15 ? p.number : ""}
          </span>
        </YMapMarker>
      );
    });
  }, [C, data, kinds, matched, selectedNumber, zoomBucket, narrow, selectPlot]);

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

  return (
    <>
      <div className="relative overflow-hidden rounded-[28px] bg-[#0b0e13] ring-1 ring-white/10">
        {/* Высота подобрана так, чтобы генплан целиком помещался в экран
            ноутбука и телефона: svh не скачет от адресной строки iOS. */}
        <div
          ref={setShellEl}
          className="relative h-[70svh] max-h-[760px] min-h-[430px] sm:h-[74vh]"
        >
          <div className={`absolute inset-0 ${gated ? "pointer-events-none" : ""}`}>
            <YMap
              location={
                location ?? initialLocationRef.current ?? { center: [37.6173, 55.7558], zoom: 9 }
              }
              mode="vector"
              behaviors={BEHAVIORS}
              zoomRange={ZOOM_RANGE}
            >
              {/* Схема всегда смонтирована — на ней держится векторный
                  конвейер. Спутник кладётся сверху, features — над обоими. */}
              <YMapDefaultSchemeLayer theme="dark" />
              {satellite && <YMapDefaultSatelliteLayer />}
              <YMapDefaultFeaturesLayer zIndex={2000} />

              {data.villageCoords.length >= 3 && (
                <YMapFeature
                  geometry={{
                    type: "Polygon",
                    coordinates: [ringToLngLat(data.villageCoords)],
                  }}
                  style={{
                    fill: "#34d399",
                    fillOpacity: 0.02,
                    stroke: [{ color: "#34d399", width: 1.8, opacity: 0.6 }],
                  }}
                />
              )}

              {polygons}
              {markers}

              {me && (
                <YMapMarker coordinates={me} zIndex={1200}>
                  <span className="relative block h-0 w-0">
                    <span className="absolute -left-2 -top-2 block h-4 w-4 rounded-full bg-sky-400 shadow-[0_0_0_2px_#fff,0_0_18px_rgba(56,189,248,0.9)]" />
                  </span>
                </YMapMarker>
              )}

              <YMapListener onUpdate={onMapUpdate} />
              <YMapListener onActionEnd={onActionEnd} />
            </YMap>
          </div>

          {/* ── фильтры + счётчик слева сверху ── */}
          <div className="pointer-events-none absolute left-3 right-[62px] top-3 z-20 sm:left-5 sm:right-[92px] sm:top-5">
            <div className="pointer-events-auto mb-2 inline-flex items-center gap-2 rounded-full bg-[#0e1218]/85 px-3 py-1.5 text-[11.5px] ring-1 ring-white/12 backdrop-blur-md">
              <span className="font-extrabold text-white/90">{data.villageName}</span>
              <span className="h-3 w-px bg-white/15" />
              <span className="font-bold tabular-nums text-emerald-300">
                {data.statistics.free}
              </span>
              <span className="text-white/45">
                свободно из <span className="tabular-nums">{data.plots.length}</span>
              </span>
            </div>

            <FilterBar
              open={openChip}
              onOpen={setOpenChip}
              filters={filters}
              onChange={setFilters}
              onReset={() => {
                setFilters(EMPTY_FILTERS);
                setHiddenTiers(new Set());
              }}
              hasFilters={hasFilters}
              utpOptions={utpOptions}
              matchCount={matched.size}
            />
          </div>

          {/* ── колонка управления справа ── */}
          <div className="pointer-events-none absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
            <ControlRail
              satellite={satellite}
              onToggleBase={() => setSatellite((v) => !v)}
              legendOpen={legendOpen}
              onToggleLegend={() => setLegendOpen((v) => !v)}
              onZoomIn={() => zoomBy(1)}
              onZoomOut={() => zoomBy(-1)}
              onLocate={locate}
              onHome={() => {
                touchedRef.current = false;
                setSelected(null);
                fitVillage(true);
              }}
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
          <div className="pointer-events-none absolute bottom-[46px] left-3 right-3 z-30 flex justify-end sm:left-auto sm:right-5">
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

          {/* ── мобильная шторка ── */}
          <AnimatePresence>
            {gated && (
              <TouchGate
                onOpen={() => {
                  gateDismissedRef.current = true;
                  setGated(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

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
