"use client";

/**
 * InteractivePlotMap3 — Yandex Maps JS API 3.0 version of the village
 * plot map. Phase 1 scope:
 *   - bootstrap ymaps3 via the SSR-safe loader
 *   - reactify the runtime and render <YMap> with a scheme layer
 *   - fetch village data from /api/village-map/[uuid]
 *   - draw plot polygons as YMapFeature with status/tier colors
 *   - render plot numbers as YMapMarker React children
 *   - click to select a plot (side panel comes in Phase 2)
 *   - custom Tailwind zoom / scheme-satellite buttons
 *
 * Out of scope for Phase 1 (TODO for later phases):
 *   - left sidebar (stats, filters, selected plot card)
 *   - "Мои места" + route rendering
 *   - pulse animation on selected plot
 *   - zoom-adaptive marker sizing
 *   - mobile layout
 *   - Safari Private fallback
 *   - legend, favorites
 *
 * The existing InteractivePlotMap.tsx keeps serving prod until this
 * file reaches feature parity and we cut the switchover in Phase 5.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { loadYmaps3 } from "@/lib/ymaps3";

// Minimal structural types mirroring the /api/village-map/[uuid] shape.
// We keep them in sync with NormalizedVillageMap in the legacy component.
interface NormalizedPlot {
  number: string;
  area: number;
  pricePerHundred: number;
  totalCost: number;
  statusName: string;
  coords: [number, number][]; // [lat, lon][] — legacy Yandex 2.1 order
  center: [number, number];   // [lat, lon]
  kadastr: string;
  priceTier: number;
}

interface NormalizedVillageMap {
  villageId: string;
  villageName: string;
  center: [number, number];
  villageCoords: [number, number][];
  priceTiers: number[];
  statistics: {
    free: number;
    sold: number;
    reserved: number;
    other: number;
  };
  plots: NormalizedPlot[];
}

// Palette mirrors the legacy component; we'll import it from a shared
// module in Phase 4 once both versions live side-by-side.
const TIER_COLORS = [
  { fill: "#facc15", stroke: "#a16207" }, // yellow
  { fill: "#22c55e", stroke: "#15803d" }, // green
  { fill: "#22d3ee", stroke: "#0e7490" }, // cyan
  { fill: "#f97316", stroke: "#9a3412" }, // orange
  { fill: "#ef4444", stroke: "#991b1b" }, // red
];
const RESERVED = { fill: "#93c5fd", stroke: "#2563eb" };
const SOLD = { fill: "#d1d5db", stroke: "#9ca3af" };
const TECHNICAL = { fill: "#e5e7eb", stroke: "#9ca3af" };

function isPlotAvailable(s: string) {
  return s === "Свободен" || s === "Свободный";
}
function isPlotReserved(s: string) {
  return s === "Бронь" || s === "Забронирован";
}
function isPlotSold(s: string) {
  return s === "Продан" || s === "Продано";
}
function isPlotActive(s: string) {
  return s !== "Технический" && s !== "Обманка";
}

function plotPalette(plot: NormalizedPlot) {
  if (isPlotAvailable(plot.statusName)) {
    return TIER_COLORS[plot.priceTier] || TIER_COLORS[0];
  }
  if (isPlotReserved(plot.statusName)) return RESERVED;
  if (isPlotSold(plot.statusName)) return SOLD;
  return TECHNICAL;
}

// Convert a [lat, lon] ring from our API to [lon, lat] as required by
// the ymaps3 GeoJSON-style geometries.
function ringLatLonToLonLat(
  ring: [number, number][],
): [number, number][] {
  const out: [number, number][] = new Array(ring.length);
  for (let i = 0; i < ring.length; i++) {
    out[i] = [ring[i][1], ring[i][0]];
  }
  return out;
}

// Shape of the reactified ymaps3 component tree we touch. We keep this
// intentionally loose — the upstream types aren't exported in a way
// that plays nice with React 19 generics.
type ReactifiedYmaps3 = {
  YMap: ComponentType<
    {
      location: { center: [number, number]; zoom: number };
      mode?: "vector" | "raster";
      showScaleInCopyrights?: boolean;
      theme?: "light" | "dark";
      children?: ReactNode;
      ref?: unknown;
    } & Record<string, unknown>
  >;
  YMapDefaultSchemeLayer: ComponentType<Record<string, unknown>>;
  YMapDefaultFeaturesLayer: ComponentType<Record<string, unknown>>;
  YMapLayer: ComponentType<Record<string, unknown>>;
  YMapTileDataSource: ComponentType<Record<string, unknown>>;
  YMapFeature: ComponentType<{
    geometry: {
      type: "Polygon" | "LineString" | "Point";
      coordinates: unknown;
    };
    style?: Record<string, unknown>;
    onClick?: (object: unknown, event: unknown) => void;
    onFastClick?: (object: unknown, event: unknown) => void;
    properties?: Record<string, unknown>;
  }>;
  YMapMarker: ComponentType<{
    coordinates: [number, number];
    draggable?: boolean;
    zIndex?: number;
    onClick?: () => void;
    children?: ReactNode;
  }>;
  YMapListener: ComponentType<{
    onUpdate?: (state: { location: { zoom: number } }) => void;
  }>;
};

interface Props {
  villageUuid: string;
  villageName: string;
  villageSlug: string;
}

type BundleState =
  | { kind: "loading" }
  | { kind: "blocked"; error: string }
  | { kind: "ready"; components: ReactifiedYmaps3 };

export default function InteractivePlotMap3({
  villageUuid,
  villageName,
}: Props) {
  const [bundle, setBundle] = useState<BundleState>({ kind: "loading" });
  const [data, setData] = useState<NormalizedVillageMap | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<NormalizedPlot | null>(null);
  const [mapType, setMapType] = useState<"map" | "satellite">("map");
  const [zoom, setZoom] = useState(17);
  const [center, setCenter] = useState<[number, number] | null>(null);

  const initialFitDone = useRef(false);

  // Boot ymaps3 + reactify bundle once
  useEffect(() => {
    let cancelled = false;
    loadYmaps3()
      .then(async ({ ymaps3, reactify }) => {
        if (cancelled) return;
        // Bind reactify against React — we pass a minimal shim because
        // reactify only needs createElement + Fragment.
        const React = await import("react");
        const ReactDOM = await import("react-dom");
        const reactified = reactify.bindTo(React, ReactDOM);
        const mod = reactified.module(ymaps3) as unknown as ReactifiedYmaps3;
        setBundle({ kind: "ready", components: mod });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error("[ymaps3] load failed:", err);
        setBundle({ kind: "blocked", error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch village data
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/village-map/${villageUuid}`)
      .then((res) => {
        if (!res.ok) throw new Error(`village-map ${res.status}`);
        return res.json() as Promise<NormalizedVillageMap>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        // ymaps3 center is [lon, lat] — convert.
        setCenter([json.center[1], json.center[0]]);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error("[ymaps3] village fetch failed:", err);
        setDataError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [villageUuid]);

  // After the first render cycle with both bundle+data, fit bounds to
  // the village polygon by computing min/max lat/lon and setting the
  // map location. We do this via center+zoom for simplicity; a proper
  // `bounds` handoff comes in Phase 2.
  useEffect(() => {
    if (initialFitDone.current) return;
    if (bundle.kind !== "ready" || !data || data.villageCoords.length === 0) {
      return;
    }
    let minLat = Infinity,
      maxLat = -Infinity,
      minLon = Infinity,
      maxLon = -Infinity;
    for (const [lat, lon] of data.villageCoords) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    const cLat = (minLat + maxLat) / 2;
    const cLon = (minLon + maxLon) / 2;
    setCenter([cLon, cLat]);
    setZoom(17);
    initialFitDone.current = true;
  }, [bundle, data]);

  const visiblePlots = useMemo(() => {
    if (!data) return [];
    return data.plots;
  }, [data]);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(19, z + 1)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(5, z - 1)), []);

  // ── Render ─────────────────────────────────────────────────────
  if (bundle.kind === "blocked") {
    return (
      <section className="relative w-full h-[70vh] bg-stone-100 rounded-2xl flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h3 className="text-base font-black text-gray-900">
            Карта участков недоступна
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Не удалось загрузить Yandex Maps 3.0. Проверьте что браузер не блокирует
            <code className="mx-1">*.yandex.ru</code>.
          </p>
          <p className="text-[11px] text-gray-500 font-mono">{bundle.error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-9 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
          >
            Попробовать ещё раз
          </button>
        </div>
      </section>
    );
  }

  if (bundle.kind === "loading" || !data || !center) {
    return (
      <section className="relative w-full h-[70vh] bg-stone-100 rounded-2xl flex items-center justify-center">
        <div className="text-xs font-semibold text-gray-500">
          {dataError ? `Ошибка: ${dataError}` : "Загрузка карты…"}
        </div>
      </section>
    );
  }

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapLayer,
    YMapTileDataSource,
    YMapFeature,
    YMapMarker,
    YMapListener,
  } = bundle.components;

  return (
    <section className="relative w-full h-[calc(100vh-80px)] min-h-[560px] bg-stone-200 rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)]">
      {/* Village title — temporary until we wire the proper sidebar */}
      <div className="absolute top-3 left-3 z-30 bg-white/95 backdrop-blur-md rounded-xl shadow-lg px-3 py-2 ring-1 ring-black/5">
        <div className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">
          Карта участков · v3
        </div>
        <div className="text-sm font-black text-gray-900">{villageName}</div>
        <div className="text-[10px] text-gray-500 mt-0.5 tabular-nums">
          Всего {data.plots.length} · Свободно {data.statistics.free} ·
          Продано {data.statistics.sold}
        </div>
      </div>

      {/* Right-bottom controls */}
      <div className="absolute right-3 bottom-3 z-30 flex flex-col gap-1.5">
        <div className="flex flex-col bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-emerald-700 active:scale-95 transition-all text-lg font-black"
            aria-label="Приблизить"
          >
            +
          </button>
          <div className="h-px bg-gray-100 mx-1.5" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-emerald-700 active:scale-95 transition-all text-lg font-black"
            aria-label="Отдалить"
          >
            −
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-xl ring-1 ring-black/5 p-0.5 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => setMapType("map")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${
              mapType === "map"
                ? "bg-gradient-to-br from-emerald-700 to-green-700 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            aria-label="Схема"
          >
            СХ
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${
              mapType === "satellite"
                ? "bg-gradient-to-br from-emerald-700 to-green-700 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            aria-label="Спутник"
          >
            СП
          </button>
        </div>
      </div>

      {/* Selected plot readout — minimal for Phase 1 */}
      {selectedPlot && (
        <div className="absolute left-3 bottom-3 z-30 bg-white rounded-xl shadow-xl ring-1 ring-black/5 px-3 py-2 max-w-[260px]">
          <div className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">
            Участок
          </div>
          <div className="text-base font-black text-gray-900">
            № {selectedPlot.number}
          </div>
          <div className="text-[11px] text-gray-600 mt-0.5">
            {selectedPlot.statusName} · {selectedPlot.area} сот
          </div>
          <div className="text-[11px] font-bold text-emerald-700 mt-0.5 tabular-nums">
            {selectedPlot.totalCost.toLocaleString("ru-RU")} ₽
          </div>
        </div>
      )}

      {/* ── ymaps3 canvas ── */}
      <YMap location={{ center, zoom }}>
        <YMapDefaultSchemeLayer theme="light" />
        <YMapDefaultFeaturesLayer />

        {mapType === "satellite" && (
          <>
            <YMapTileDataSource
              id="sat-source"
              raster={{ type: "satellite" }}
              copyrights={["© Яндекс"]}
            />
            <YMapLayer source="sat-source" type="ground" />
          </>
        )}

        {/* Plot polygons */}
        {visiblePlots.map((plot) => {
          if (!plot.coords || plot.coords.length < 3) return null;
          const palette = plotPalette(plot);
          const isSelected = selectedPlot?.number === plot.number;
          const ring = ringLatLonToLonLat(plot.coords);
          return (
            <YMapFeature
              key={`poly-${plot.number}`}
              geometry={{ type: "Polygon", coordinates: [ring] }}
              style={{
                fill: palette.fill,
                fillOpacity: isSelected ? 0.88 : isPlotAvailable(plot.statusName) ? 0.7 : 0.55,
                stroke: [
                  {
                    color: isSelected ? "#16a34a" : palette.stroke,
                    width: isSelected ? 4 : 1.5,
                    opacity: 0.95,
                  },
                ],
              }}
              onClick={() => setSelectedPlot(plot)}
            />
          );
        })}

        {/* Plot number markers */}
        {visiblePlots.map((plot) => {
          if (!isPlotActive(plot.statusName)) return null;
          const palette = plotPalette(plot);
          const isSelected = selectedPlot?.number === plot.number;
          const coordLonLat: [number, number] = [plot.center[1], plot.center[0]];
          return (
            <YMapMarker
              key={`mark-${plot.number}`}
              coordinates={coordLonLat}
              draggable={false}
              zIndex={isSelected ? 1000 : isPlotAvailable(plot.statusName) ? 200 : 100}
              onClick={() => setSelectedPlot(plot)}
            >
              <div
                className="inline-flex items-center justify-center rounded-full cursor-pointer select-none shadow-[0_0_0_1.5px_#fff,0_2px_4px_rgba(0,0,0,0.35)]"
                style={{
                  width: isSelected ? 26 : 20,
                  height: isSelected ? 26 : 20,
                  fontSize: isSelected ? 10 : 9,
                  fontWeight: 800,
                  color: "#fff",
                  background: isSelected ? "#22c55e" : palette.fill,
                  transform: "translate(-50%, -50%)",
                  fontFamily:
                    "var(--font-inter), system-ui, -apple-system, sans-serif",
                }}
              >
                {plot.number}
              </div>
            </YMapMarker>
          );
        })}

        <YMapListener
          onUpdate={(state) => {
            if (typeof state.location.zoom === "number") {
              setZoom(state.location.zoom);
            }
          }}
        />
      </YMap>
    </section>
  );
}
