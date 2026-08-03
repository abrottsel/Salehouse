"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, Ruler, Wallet, X, Layers } from "lucide-react";
import { loadYmaps3 } from "@/lib/ymaps3";
import { money, useCountUp } from "./shared";

/**
 * Карта участков — тёмный премиум.
 *
 * Чем отличается от карты Земекс, которую перебиваем:
 *   • проданные уводим почти в невидимость, свободные светятся —
 *     на их карте 438 серых пятен глушат 42 свободных;
 *   • номера рисуем только у свободных и у выбранного, а не у всех 480;
 *   • фильтр по площади и бюджету — у них его нет вообще;
 *   • карточка участка с кадастром и полной ценой;
 *   • спутник по умолчанию, тёмный интерфейс поверх.
 *
 * Данные и бронь — по-прежнему Земекс: тянем их API через наш
 * /api/village-map/[uuid], бронируем в их же фрейме.
 */

interface Plot {
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

interface VillageMap {
  villageName: string;
  center: [number, number];
  villageCoords: [number, number][];
  priceTiers: number[];
  statistics: { free: number; sold: number; reserved: number; other: number };
  plots: Plot[];
}

const isFree = (s: string) => /свобод/i.test(s);
const isReserved = (s: string) => /бронь|брон/i.test(s);

function ringToLonLat(ring: [number, number][]): [number, number][] {
  const out: [number, number][] = new Array(ring.length);
  for (let i = 0; i < ring.length; i++) out[i] = [ring[i][1], ring[i][0]];
  return out;
}

interface Reactified {
  YMap: ComponentType<{ location: unknown; mode?: string; children?: ReactNode }>;
  YMapDefaultSchemeLayer: ComponentType<Record<string, unknown>>;
  YMapDefaultSatelliteLayer: ComponentType<Record<string, unknown>>;
  YMapDefaultFeaturesLayer: ComponentType<Record<string, unknown>>;
  YMapFeature: ComponentType<{
    geometry: { type: "Polygon"; coordinates: [number, number][][] };
    style?: Record<string, unknown>;
    onClick?: () => void;
  }>;
  YMapMarker: ComponentType<{ coordinates: [number, number]; children?: ReactNode }>;
}

type Bundle =
  | { kind: "loading" }
  | { kind: "ready"; c: Reactified }
  | { kind: "blocked"; error: string };

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

  const [selected, setSelected] = useState<Plot | null>(null);
  const [booking, setBooking] = useState(false);
  const [satellite, setSatellite] = useState(true);
  const [freeOnly, setFreeOnly] = useState(true);
  const [areaMax, setAreaMax] = useState<number | null>(null);
  const [budgetMax, setBudgetMax] = useState<number | null>(null);

  // ── данные Земекс ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/village-map/${uuid}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: VillageMap) => !cancelled && setData(d))
      .catch((e: Error) => !cancelled && setDataError(e.message));
    return () => {
      cancelled = true;
    };
  }, [uuid]);

  // ── ymaps3 ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    loadYmaps3()
      .then(async ({ ymaps3, reactify }) => {
        if (cancelled) return;
        const React = await import("react");
        const ReactDOM = await import("react-dom");
        const bound = reactify.bindTo(React, ReactDOM);
        setBundle({ kind: "ready", c: bound.module(ymaps3) as unknown as Reactified });
      })
      .catch((e: Error) => !cancelled && setBundle({ kind: "blocked", error: e.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  // ── производные ────────────────────────────────────────────
  const bounds = useMemo(() => {
    const free = (data?.plots ?? []).filter((p) => isFree(p.statusName));
    const areas = free.map((p) => p.area).filter(Boolean);
    const costs = free.map((p) => p.totalCost).filter(Boolean);
    return {
      areaMin: areas.length ? Math.floor(Math.min(...areas)) : 0,
      areaMax: areas.length ? Math.ceil(Math.max(...areas)) : 0,
      costMax: costs.length ? Math.max(...costs) : 0,
    };
  }, [data]);

  useEffect(() => {
    if (bounds.areaMax && areaMax === null) setAreaMax(bounds.areaMax);
    if (bounds.costMax && budgetMax === null) setBudgetMax(bounds.costMax);
  }, [bounds, areaMax, budgetMax]);

  const matches = useCallback(
    (p: Plot) => {
      if (!isFree(p.statusName)) return false;
      if (areaMax !== null && p.area > areaMax) return false;
      if (budgetMax !== null && p.totalCost && p.totalCost > budgetMax) return false;
      return true;
    },
    [areaMax, budgetMax],
  );

  const matchCount = useMemo(
    () => (data?.plots ?? []).filter(matches).length,
    [data, matches],
  );

  const freeShown = useCountUp(data?.statistics.free ?? 0);
  const totalShown = useCountUp(data?.plots.length ?? 0);

  // ── состояния загрузки ─────────────────────────────────────
  if (dataError || bundle.kind === "blocked") {
    return (
      <div className="grid h-[560px] place-items-center rounded-[28px] bg-white/[0.03] p-8 text-center ring-1 ring-white/10">
        <div className="max-w-md">
          <p className="text-[15px] font-bold text-white/80">Карта недоступна</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/50">
            {dataError
              ? `Данные Земекс не пришли: ${dataError}. С этой машины map.zemexx.ru не отвечает — на проде карта работает.`
              : bundle.kind === "blocked"
                ? bundle.error
                : ""}
          </p>
        </div>
      </div>
    );
  }

  if (!data || bundle.kind === "loading") {
    return (
      <div className="grid h-[560px] place-items-center rounded-[28px] bg-white/[0.03] ring-1 ring-white/10">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  const { YMap, YMapDefaultSchemeLayer, YMapDefaultSatelliteLayer, YMapDefaultFeaturesLayer, YMapFeature, YMapMarker } =
    bundle.c;

  const visible = freeOnly ? data.plots.filter((p) => isFree(p.statusName) || p.number === selected?.number) : data.plots;

  return (
    <>
      <div className="relative overflow-hidden rounded-[28px] bg-[#0b0e13] ring-1 ring-white/10">
        <div className="relative h-[620px] sm:h-[780px]">
          <YMap
            location={{ center: [data.center[1], data.center[0]], zoom: 16 }}
            mode="vector"
          >
            <YMapDefaultSchemeLayer theme="dark" />
            {satellite && <YMapDefaultSatelliteLayer />}
            <YMapDefaultFeaturesLayer zIndex={2000} />

            {data.villageCoords.length >= 3 && (
              <YMapFeature
                geometry={{ type: "Polygon", coordinates: [ringToLonLat(data.villageCoords)] }}
                style={{
                  fill: "#34d399",
                  fillOpacity: 0.03,
                  stroke: [{ color: "#34d399", width: 2.5, opacity: 0.7 }],
                }}
              />
            )}

            {visible.map((p) => {
              if (!p.coords || p.coords.length < 3) return null;
              const free = isFree(p.statusName);
              const reserved = isReserved(p.statusName);
              const hit = free && matches(p);
              const sel = selected?.number === p.number;

              // Проданные — почти в ноль. Ради этого всё и затевалось:
              // на карте Земекс они забивают собой свободные.
              const fill = sel ? "#a3e635" : hit ? "#34d399" : reserved ? "#fbbf24" : "#64748b";
              const fillOpacity = sel ? 0.7 : hit ? 0.45 : reserved ? 0.3 : 0.07;
              const strokeColor = sel ? "#d9f99d" : hit ? "#6ee7b7" : reserved ? "#fbbf24" : "#94a3b8";
              const strokeWidth = sel ? 4 : hit ? 2 : 0.75;
              const strokeOpacity = sel ? 1 : hit ? 0.95 : 0.28;

              return (
                <YMapFeature
                  key={p.number}
                  geometry={{ type: "Polygon", coordinates: [ringToLonLat(p.coords)] }}
                  style={{
                    fill,
                    fillOpacity,
                    stroke: [{ color: strokeColor, width: strokeWidth, opacity: strokeOpacity }],
                  }}
                  onClick={() => setSelected(p)}
                />
              );
            })}

            {/* Номера — только у подходящих под фильтр и у выбранного.
                480 подписей разом превращаются в кашу, как у Земекс. */}
            {data.plots
              .filter((p) => matches(p) || p.number === selected?.number)
              .map((p) => (
                <YMapMarker key={`m-${p.number}`} coordinates={[p.center[1], p.center[0]]}>
                  <button
                    onClick={() => setSelected(p)}
                    className={`-translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums transition-transform hover:scale-110 ${
                      selected?.number === p.number
                        ? "bg-lime-300 text-black shadow-[0_0_16px_rgba(163,230,53,0.9)]"
                        : "bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.7)]"
                    }`}
                  >
                    {p.number}
                  </button>
                </YMapMarker>
              ))}
          </YMap>

          {/* ── панель фильтров ── */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-3 top-3 w-[248px] rounded-[24px] p-4 sm:left-5 sm:top-5"
            style={{
              backdropFilter: "blur(18px) saturate(1.5)",
              background: "linear-gradient(160deg, rgba(14,18,24,0.86), rgba(9,12,16,0.92))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 24px 60px -18px rgba(0,0,0,0.85)",
            }}
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-300" />
              <span className="text-[15px] font-extrabold">{data.villageName}</span>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[30px] font-extrabold leading-none text-emerald-300 tabular-nums">
                {freeShown}
              </span>
              <span className="text-[13px] text-white/50">
                свободно из <span className="tabular-nums">{totalShown}</span>
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5 font-bold text-white/70">
                    <Ruler className="h-3.5 w-3.5" /> Площадь
                  </span>
                  <span className="tabular-nums text-white/85">до {areaMax ?? "—"} сот</span>
                </div>
                <input
                  type="range"
                  min={bounds.areaMin}
                  max={bounds.areaMax}
                  value={areaMax ?? bounds.areaMax}
                  onChange={(e) => setAreaMax(+e.target.value)}
                  aria-label="Максимальная площадь"
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5 font-bold text-white/70">
                    <Wallet className="h-3.5 w-3.5" /> Бюджет
                  </span>
                  <span className="tabular-nums text-white/85">
                    до {budgetMax ? (budgetMax / 1_000_000).toFixed(1) : "—"} млн
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={bounds.costMax}
                  step={100_000}
                  value={budgetMax ?? bounds.costMax}
                  onChange={(e) => setBudgetMax(+e.target.value)}
                  aria-label="Максимальный бюджет"
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-emerald-400/10 px-3 py-2 text-center ring-1 ring-emerald-400/25">
              <span className="text-[19px] font-extrabold tabular-nums text-emerald-300">
                {matchCount}
              </span>
              <span className="ml-1.5 text-[12px] text-white/60">подходит</span>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setFreeOnly((v) => !v)}
                className={`h-9 flex-1 rounded-full text-[12px] font-bold transition-colors ${
                  freeOnly
                    ? "bg-white/[0.09] text-white/80 ring-1 ring-white/15"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {freeOnly ? "Показать все" : "Только свободные"}
              </button>
              <button
                onClick={() => setSatellite((v) => !v)}
                aria-label="Спутник или схема"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.09] ring-1 ring-white/15 transition-colors hover:bg-white/[0.16]"
              >
                <Layers className="h-4 w-4 text-white/75" />
              </button>
            </div>
          </motion.div>

          {/* ── карточка участка ── */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-3 right-3 w-[300px] max-w-[calc(100%-1.5rem)] rounded-[24px] p-4 sm:bottom-5 sm:right-5"
                style={{
                  backdropFilter: "blur(18px) saturate(1.5)",
                  background: "linear-gradient(160deg, rgba(14,18,24,0.9), rgba(9,12,16,0.95))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), 0 24px 60px -18px rgba(0,0,0,0.9)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[19px] font-extrabold leading-tight">
                      Участок № {selected.number}
                    </div>
                    <div
                      className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isFree(selected.statusName)
                          ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30"
                          : "bg-white/[0.07] text-white/55 ring-1 ring-white/12"
                      }`}
                    >
                      {selected.statusName}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Закрыть карточку"
                    className="-mr-1 -mt-1 grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <dl className="mt-3 space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <dt className="text-white/50">Площадь</dt>
                    <dd className="font-bold tabular-nums">{selected.area} сот</dd>
                  </div>
                  {selected.pricePerHundred > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-white/50">Цена сотки</dt>
                      <dd className="font-bold tabular-nums">
                        {money(selected.pricePerHundred)} ₽
                      </dd>
                    </div>
                  )}
                  {selected.totalCost > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-white/50">Стоимость</dt>
                      <dd className="text-[15px] font-extrabold tabular-nums text-emerald-300">
                        {money(selected.totalCost)} ₽
                      </dd>
                    </div>
                  )}
                  {selected.kadastr && (
                    <div className="flex justify-between gap-3">
                      <dt className="shrink-0 text-white/50">Кадастр</dt>
                      <dd className="truncate text-[12px] tabular-nums text-white/70">
                        {selected.kadastr}
                      </dd>
                    </div>
                  )}
                </dl>

                {isFree(selected.statusName) && bookingUrl && (
                  <button
                    onClick={() => setBooking(true)}
                    className="mt-3.5 h-11 w-full rounded-full bg-emerald-500 text-[13px] font-bold transition-all hover:-translate-y-0.5 hover:bg-emerald-400"
                  >
                    Забронировать
                  </button>
                )}
              </motion.div>
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
