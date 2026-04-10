"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  Maximize2,
  CircleCheck,
  CircleAlert,
  CircleSlash,
  X,
} from "lucide-react";
import FavoriteHeart from "./FavoriteHeart";

interface NormalizedPlot {
  number: string;
  area: number;
  pricePerHundred: number;
  totalCost: number;
  statusName: string;
  coords: [number, number][];
  center: [number, number];
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

interface Props {
  villageUuid: string;
  villageName: string;
  villageSlug: string;
}

// Tier colors — gradient from yellow (cheap) to red (expensive)
const TIER_COLORS = [
  { fill: "#fde047", stroke: "#ca8a04", label: "Эконом" }, // yellow
  { fill: "#86efac", stroke: "#16a34a", label: "Стандарт" }, // green
  { fill: "#7dd3fc", stroke: "#0284c7", label: "Комфорт" }, // sky
  { fill: "#fdba74", stroke: "#ea580c", label: "Бизнес" }, // orange
  { fill: "#fca5a5", stroke: "#dc2626", label: "Премиум" }, // red
];

const STATUS_COLORS: Record<string, { fill: string; stroke: string; opacity: number }> = {
  Свободен: { fill: "#27ae60", stroke: "#1e8449", opacity: 0.35 },
  Свободный: { fill: "#27ae60", stroke: "#1e8449", opacity: 0.35 },
  Продан: { fill: "#cccccc", stroke: "#aaaaaa", opacity: 0.1 },
  Продано: { fill: "#cccccc", stroke: "#aaaaaa", opacity: 0.1 },
  Бронь: { fill: "#e67e22", stroke: "#d35400", opacity: 0.35 },
  Забронирован: { fill: "#e67e22", stroke: "#d35400", opacity: 0.35 },
  Технический: { fill: "#94a3b8", stroke: "#64748b", opacity: 0.08 },
  Обманка: { fill: "#94a3b8", stroke: "#64748b", opacity: 0.08 },
};

function isPlotAvailable(status: string): boolean {
  return status === "Свободен" || status === "Свободный";
}

function isPlotReserved(status: string): boolean {
  return status === "Бронь" || status === "Забронирован";
}

function isPlotSold(status: string): boolean {
  return status === "Продан" || status === "Продано";
}

function isPlotActive(status: string): boolean {
  return status !== "Технический" && status !== "Обманка";
}

type ViewMode = "status" | "price";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ymaps?: any;
  }
}

export default function InteractivePlotMap({ villageUuid, villageName, villageSlug }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const plotObjectsRef = useRef<any[]>([]);

  const [data, setData] = useState<NormalizedVillageMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<NormalizedPlot | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("price");
  const [mapReady, setMapReady] = useState(false);

  // Fetch plot data via our proxy
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/village-map/${villageUuid}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<NormalizedVillageMap>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Не удалось загрузить карту");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [villageUuid]);

  // Load Yandex Maps API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.ymaps && window.ymaps.Map) {
      setMapReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-ymaps-loader="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setMapReady(true));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    script.async = true;
    script.dataset.ymapsLoader = "true";
    script.onload = () => {
      window.ymaps?.ready(() => setMapReady(true));
    };
    document.head.appendChild(script);
  }, []);

  // Render plots when data + map API are both ready
  useEffect(() => {
    if (!mapReady || !data || !mapRef.current || !window.ymaps) return;

    const ymaps = window.ymaps;

    // Init map once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new ymaps.Map(
        mapRef.current,
        {
          center: data.center,
          zoom: 16,
          controls: ["zoomControl", "fullscreenControl", "typeSelector"],
        },
        {
          suppressMapOpenBlock: true,
        }
      );
      mapInstanceRef.current.options.set("minZoom", 13);
      mapInstanceRef.current.options.set("maxZoom", 19);
      mapInstanceRef.current.setType("yandex#satellite");
    }

    const map = mapInstanceRef.current;

    // Clear previous objects
    plotObjectsRef.current.forEach((o) => map.geoObjects.remove(o));
    plotObjectsRef.current = [];

    // Village border
    if (data.villageCoords.length > 0) {
      const border = new ymaps.Polygon(
        [data.villageCoords],
        {},
        {
          fillColor: "#16a34a00",
          strokeColor: "#22c55e",
          strokeWidth: 3,
          strokeStyle: "solid",
        }
      );
      map.geoObjects.add(border);
      plotObjectsRef.current.push(border);
    }

    // Plots
    data.plots.forEach((plot) => {
      if (!plot.coords || plot.coords.length < 3) return;

      let fill: string;
      let stroke: string;
      let opacity: number;

      if (viewMode === "status") {
        const c = STATUS_COLORS[plot.statusName] || STATUS_COLORS.Технический;
        fill = c.fill;
        stroke = c.stroke;
        opacity = c.opacity;
      } else {
        const tier = TIER_COLORS[plot.priceTier] || TIER_COLORS[0];
        fill = tier.fill;
        stroke = tier.stroke;
        if (isPlotSold(plot.statusName)) opacity = 0.1;
        else if (!isPlotActive(plot.statusName)) opacity = 0.08;
        else opacity = 0.5;
      }

      const priceStr = plot.totalCost.toLocaleString("ru-RU");
      const polygon = new ymaps.Polygon(
        [plot.coords],
        {
          hintContent: `№ ${plot.number} · ${plot.area} сот · ${priceStr} ₽`,
        },
        {
          fillColor: fill,
          fillOpacity: opacity,
          strokeColor: stroke,
          strokeWidth: 1.5,
          strokeOpacity: 0.9,
          cursor: "pointer",
        }
      );

      polygon.events.add("click", () => {
        setSelectedPlot(plot);
      });
      polygon.events.add("mouseenter", () => {
        polygon.options.set("strokeWidth", 3);
        polygon.options.set("fillOpacity", Math.min(opacity + 0.2, 0.85));
      });
      polygon.events.add("mouseleave", () => {
        polygon.options.set("strokeWidth", 1.5);
        polygon.options.set("fillOpacity", opacity);
      });

      map.geoObjects.add(polygon);
      plotObjectsRef.current.push(polygon);

      // Small label with plot number (only on active plots)
      if (isPlotActive(plot.statusName)) {
        const label = new ymaps.Placemark(
          plot.center,
          { iconContent: plot.number },
          {
            preset: "islands#circleIcon",
            iconColor: isPlotAvailable(plot.statusName)
              ? "#16a34a"
              : isPlotSold(plot.statusName)
              ? "#6b7280"
              : "#ea580c",
          }
        );
        label.events.add("click", () => setSelectedPlot(plot));
        map.geoObjects.add(label);
        plotObjectsRef.current.push(label);
      }
    });

    // Fit bounds to village
    if (data.villageCoords.length > 0) {
      try {
        const bounds = data.villageCoords.reduce(
          (acc, [lat, lon]) => {
            acc.minLat = Math.min(acc.minLat, lat);
            acc.maxLat = Math.max(acc.maxLat, lat);
            acc.minLon = Math.min(acc.minLon, lon);
            acc.maxLon = Math.max(acc.maxLon, lon);
            return acc;
          },
          {
            minLat: Infinity,
            maxLat: -Infinity,
            minLon: Infinity,
            maxLon: -Infinity,
          }
        );
        map.setBounds(
          [
            [bounds.minLat, bounds.minLon],
            [bounds.maxLat, bounds.maxLon],
          ],
          { checkZoomRange: true, zoomMargin: 60 }
        );
      } catch {
        /* ignore */
      }
    }
  }, [mapReady, data, viewMode]);

  const openExternalMap = useCallback(() => {
    if (!data) return;
    const [lat, lon] = data.center;
    window.open(
      `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`,
      "_blank"
    );
  }, [data]);

  return (
    <section className="py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-600" />
              Карта участков
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {villageName} · нажмите на участок чтобы увидеть детали и цену
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-1 flex">
              <button
                onClick={() => setViewMode("price")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "price"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                По цене
              </button>
              <button
                onClick={() => setViewMode("status")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "status"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                По статусу
              </button>
            </div>

            <button
              onClick={openExternalMap}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-medium text-sm transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Маршрут
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Legend sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Statistics */}
            {data && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Всего участков
                </div>
                <div className="text-3xl font-black text-gray-900 mb-4">
                  {data.plots.length}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <CircleCheck className="w-4 h-4 text-green-600" />
                      Свободно
                    </span>
                    <span className="font-bold text-green-700">
                      {data.statistics.free}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <CircleAlert className="w-4 h-4 text-orange-500" />
                      Бронь
                    </span>
                    <span className="font-bold text-orange-700">
                      {data.statistics.reserved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <CircleSlash className="w-4 h-4 text-gray-400" />
                      Продано
                    </span>
                    <span className="font-bold text-gray-500">
                      {data.statistics.sold}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                {viewMode === "price" ? "Цена за сотку" : "Статус"}
              </div>
              {viewMode === "price" && data ? (
                <ul className="space-y-2 text-sm">
                  {TIER_COLORS.map((tier, i) => {
                    if (i >= data.priceTiers.length) return null;
                    const min = data.priceTiers[i];
                    const max =
                      i + 1 < data.priceTiers.length
                        ? data.priceTiers[i + 1] - 1
                        : null;
                    return (
                      <li key={i} className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-sm flex-shrink-0 border"
                          style={{
                            backgroundColor: tier.fill,
                            borderColor: tier.stroke,
                          }}
                        />
                        <span className="text-xs text-gray-700">
                          {min.toLocaleString("ru-RU")}
                          {max
                            ? ` – ${max.toLocaleString("ru-RU")}`
                            : "+"}
                          &nbsp;&#8381;
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-sm flex-shrink-0 border"
                      style={{
                        backgroundColor: STATUS_COLORS.Свободен.fill,
                        borderColor: STATUS_COLORS.Свободен.stroke,
                      }}
                    />
                    <span className="text-xs text-gray-700">Свободен</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-sm flex-shrink-0 border"
                      style={{
                        backgroundColor: STATUS_COLORS.Бронь.fill,
                        borderColor: STATUS_COLORS.Бронь.stroke,
                      }}
                    />
                    <span className="text-xs text-gray-700">Забронирован</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-sm flex-shrink-0 border"
                      style={{
                        backgroundColor: STATUS_COLORS.Продан.fill,
                        borderColor: STATUS_COLORS.Продан.stroke,
                      }}
                    />
                    <span className="text-xs text-gray-700">Продан</span>
                  </li>
                </ul>
              )}
            </div>
          </aside>

          {/* Map canvas */}
          <div className="lg:col-span-3 relative">
            <div
              ref={mapRef}
              className="w-full h-[500px] lg:h-[650px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100"
            />

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  <span className="text-sm font-medium">
                    Загружаем карту участков...
                  </span>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl">
                <div className="text-center p-6">
                  <div className="text-red-600 font-semibold mb-2">
                    Не удалось загрузить карту
                  </div>
                  <div className="text-gray-500 text-sm">{error}</div>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Maximize2 className="w-3 h-3" />
              Прокрутка колёсиком — зум, перетаскивание — сдвиг карты
            </div>
          </div>
        </div>
      </div>

      {/* Plot details modal */}
      {selectedPlot && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedPlot(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">
                    Участок №{selectedPlot.number}
                  </div>
                  <div className="text-3xl font-black text-gray-900">
                    {selectedPlot.area} соток
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FavoriteHeart
                    kind="plot"
                    plot={{
                      villageSlug,
                      villageName,
                      plotNumber: selectedPlot.number,
                      area: selectedPlot.area,
                      pricePerHundred: selectedPlot.pricePerHundred,
                      totalCost: selectedPlot.totalCost,
                      status: selectedPlot.statusName,
                    }}
                    variant="inline"
                    stopPropagation={false}
                  />
                  <button
                    onClick={() => setSelectedPlot(null)}
                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                    aria-label="Закрыть"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 ${
                  isPlotAvailable(selectedPlot.statusName)
                    ? "bg-green-100 text-green-800"
                    : isPlotSold(selectedPlot.statusName)
                    ? "bg-gray-100 text-gray-600"
                    : isPlotReserved(selectedPlot.statusName)
                    ? "bg-orange-100 text-orange-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {selectedPlot.statusName}
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Цена за сотку</span>
                  <span className="font-semibold text-gray-900">
                    {selectedPlot.pricePerHundred.toLocaleString("ru-RU")} &#8381;
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Итоговая цена</span>
                  <span className="font-bold text-green-600 text-lg">
                    {selectedPlot.totalCost.toLocaleString("ru-RU")} &#8381;
                  </span>
                </div>
                {selectedPlot.kadastr && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Кадастровый №</span>
                    <span className="font-mono text-xs text-gray-700">
                      {selectedPlot.kadastr}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5 text-xs text-green-800">
                <b>Без скрытых платежей.</b> Финальная цена включает кадастровый
                учёт, договор и регистрацию права в Росреестре.
              </div>

              {isPlotAvailable(selectedPlot.statusName) ||
              isPlotReserved(selectedPlot.statusName) ? (
                <div className="space-y-2">
                  <a
                    href="#contact-form"
                    onClick={() => setSelectedPlot(null)}
                    className="w-full inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-green-600/30"
                  >
                    Забронировать участок №{selectedPlot.number}
                  </a>
                  <a
                    href="tel:+79859052555"
                    className="w-full inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Позвонить: +7 (985) 905-25-55
                  </a>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 py-3">
                  Этот участок уже продан. Посмотрите свободные на карте выше.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
