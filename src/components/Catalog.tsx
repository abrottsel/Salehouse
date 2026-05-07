"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import {
  MapPin,
  Ruler,
  ArrowRight,
  SlidersHorizontal,
  ImageOff,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  TreePine,
  LayoutGrid,
  Wallet,
} from "lucide-react";
import { villages } from "@/lib/data";
import FavoriteHeart from "./FavoriteHeart";
import CardPhotoSwiper from "./CardPhotoSwiper";
import HomeDistanceBadge from "./HomeDistanceBadge";

interface VillageStats {
  plotsAvailable: number;
  plotsCount: number;
}

interface CatalogProps {
  /** Optional live stats fetched on the server (by slug). Overrides data.ts. */
  liveStats?: Record<string, VillageStats>;
}

const directions = [
  "Все",
  "Каширское шоссе",
  "Дмитровское шоссе",
  "Новорижское шоссе",
];

const INITIAL_VISIBLE = 20;

/* ─── data-driven bounds, rounded to nice values ─── */
const PRICE_STEP = 10000;
const AREA_STEP = 0.5;

const PRICE_MIN =
  Math.floor(Math.min(...villages.map((v) => v.priceFrom)) / PRICE_STEP) *
  PRICE_STEP;
const PRICE_MAX =
  Math.ceil(Math.max(...villages.map((v) => v.priceFrom)) / PRICE_STEP) *
  PRICE_STEP;

const AREA_MIN = Math.floor(Math.min(...villages.map((v) => v.areaFrom)));
const AREA_MAX = Math.ceil(Math.max(...villages.map((v) => v.areaTo)));

const PRICE_PRESETS = [
  { label: "до 1 млн",  min: PRICE_MIN,   max: 1_000_000 },
  { label: "1–2 млн",   min: 1_000_000,   max: 2_000_000 },
  { label: "2–3 млн",   min: 2_000_000,   max: 3_000_000 },
  { label: "3+ млн",    min: 3_000_000,   max: PRICE_MAX  },
] as const;

const AREA_PRESETS = [
  { label: "5–7 сот.",   min: 5,  max: 7        },
  { label: "7–10 сот.",  min: 7,  max: 10       },
  { label: "10–15 сот.", min: 10, max: 15       },
  { label: "15+ сот.",   min: 15, max: AREA_MAX },
] as const;

/* ─── headline stats — auto-computed from data ─── */
const STAT_VILLAGES = villages.length;
const STAT_PLOTS_AVAILABLE = villages.reduce(
  (s, v) => s + (v.plotsAvailable || 0),
  0
);
const STAT_PRICE_MIN_RUB = Math.min(...villages.map((v) => v.priceFrom));
const STAT_DIRECTIONS = new Set(villages.map((v) => v.direction)).size;

function formatPrice(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)} млн ₽`;
  }
  return `${Math.round(n / 1000)} тыс ₽`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/* ─────────────────────── filter chip (popover button) ─────────────────────── */

interface FilterChipProps {
  label: string;
  value: string | null;
  placeholder: string;
  active: boolean;
  children: (close: () => void) => React.ReactNode;
}

function FilterChip({
  label,
  value,
  placeholder,
  active,
  children,
}: FilterChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`group inline-flex items-center gap-2 h-10 pl-4 pr-3 rounded-full border text-sm font-medium transition-all ${
          active
            ? "bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
        } ${open ? "ring-2 ring-green-200" : ""}`}
      >
        <span className={`text-xs ${active ? "text-green-600" : "text-gray-400"}`}>
          {label}:
        </span>
        <span className="font-semibold whitespace-nowrap">
          {value ?? placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          } ${active ? "text-green-600" : "text-gray-400"}`}
        />
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="sm:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Popover */}
          <div
            className={
              // Mobile: fixed bottom sheet, full width
              "sm:absolute sm:left-0 sm:top-full sm:mt-2 " +
              "fixed sm:static inset-x-3 bottom-3 sm:inset-auto " +
              "z-50 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 " +
              "overflow-hidden animate-in fade-in slide-in-from-bottom-2 sm:slide-in-from-top-1 duration-150"
            }
          >
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────── V9 — no dropdown components needed ─── */

export default function Catalog({ liveStats }: CatalogProps = {}) {
  const [activeDirection, setActiveDirection] = useState("Все");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [areaRange, setAreaRange] = useState<[number, number]>([
    AREA_MIN,
    AREA_MAX,
  ]);
  const [expanded, setExpanded] = useState(false);
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [activeArea, setActiveArea] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return villages.filter((v) => {
      if (activeDirection !== "Все" && v.direction !== activeDirection)
        return false;
      if (v.priceFrom < priceRange[0] || v.priceFrom > priceRange[1])
        return false;
      // overlap test for area range
      if (v.areaTo < areaRange[0] || v.areaFrom > areaRange[1]) return false;
      return true;
    });
  }, [activeDirection, priceRange, areaRange]);

  const hasMore = filtered.length > INITIAL_VISIBLE;
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = filtered.length - INITIAL_VISIBLE;

  const isAnyFilterActive =
    activeDirection !== "Все" || activePrice !== null || activeArea !== null;

  const handleDirectionChange = (dir: string) => {
    setActiveDirection(dir);
    setExpanded(false);
  };

  const handlePricePreset = (p: (typeof PRICE_PRESETS)[number]) => {
    if (activePrice === p.label) {
      setActivePrice(null);
      setPriceRange([PRICE_MIN, PRICE_MAX]);
    } else {
      setActivePrice(p.label);
      setPriceRange([p.min, p.max]);
    }
    setExpanded(false);
  };

  const handleAreaPreset = (a: (typeof AREA_PRESETS)[number]) => {
    if (activeArea === a.label) {
      setActiveArea(null);
      setAreaRange([AREA_MIN, AREA_MAX]);
    } else {
      setActiveArea(a.label);
      setAreaRange([a.min, a.max]);
    }
    setExpanded(false);
  };

  const resetFilters = () => {
    setActiveDirection("Все");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setAreaRange([AREA_MIN, AREA_MAX]);
    setActivePrice(null);
    setActiveArea(null);
    setExpanded(false);
  };

  return (
    <section id="catalog" className="pt-8 lg:pt-12 pb-4 bg-gray-50 scroll-mt-16">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Catalog hero — dynamic stats strip */}
        <div className="text-center mb-6">
          {/* Uppercase pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <TreePine className="w-3.5 h-3.5" />
            Каталог посёлков
          </div>

          {/* Big selling headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-4">
            Найдите свой
            <br className="sm:hidden" />{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              идеальный участок
            </span>
          </h2>

          {/* Stat chips row — pastel, matches project palette */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-50 ring-1 ring-emerald-200/70 rounded-full pl-1.5 pr-3.5 h-9">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                <TreePine className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-extrabold text-emerald-900 tabular-nums">
                {STAT_VILLAGES}
              </span>
              <span className="text-xs font-medium text-emerald-700/80">
                {plural(STAT_VILLAGES, "посёлок", "посёлка", "посёлков")}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 bg-sky-50 ring-1 ring-sky-200/70 rounded-full pl-1.5 pr-3.5 h-9">
              <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center shadow-sm">
                <LayoutGrid className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-extrabold text-sky-900 tabular-nums">
                {STAT_PLOTS_AVAILABLE.toLocaleString("ru-RU")}+
              </span>
              <span className="text-xs font-medium text-sky-700/80">
                участков
              </span>
            </div>

            <div className="inline-flex items-center gap-2 bg-amber-50 ring-1 ring-amber-200/70 rounded-full pl-1.5 pr-3.5 h-9">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                <Wallet className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
              <span className="text-xs font-medium text-amber-700/80">от</span>
              <span className="text-sm font-extrabold text-amber-900 tabular-nums">
                {STAT_PRICE_MIN_RUB.toLocaleString("ru-RU")} ₽
              </span>
              <span className="text-xs font-medium text-amber-700/80">
                /&nbsp;сотка
              </span>
            </div>
          </div>
        </div>

        {/* ── V9 Иконки: направления / цена / площадь ─────────── */}
        <div className="mb-6 bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm divide-y divide-gray-100">

          {/* Ряд 1: направления + счётчик */}
          <div className="flex items-center gap-1.5 px-3 py-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm shrink-0">
              <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </span>
            {directions.map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => handleDirectionChange(dir)}
                className={`flex-1 h-8 rounded-xl text-[11px] font-bold text-center transition-all ${
                  activeDirection === dir
                    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {dir === "Все" ? "Все" : dir.replace(" шоссе", "")}
              </button>
            ))}
            <div className="h-8 px-3 shrink-0 rounded-xl bg-emerald-500 text-white text-[11px] font-extrabold flex items-center ml-2 shadow-sm tabular-nums">
              {filtered.length}
            </div>
          </div>

          {/* Ряд 2: цена + площадь (mobile = стек, lg = ряд) */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-0 px-3 py-2.5 lg:gap-1.5">

            {/* Группа цены */}
            <div className="flex flex-1 items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm shrink-0">
                <Wallet className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </span>
              <div className="flex flex-1 items-center gap-1">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePricePreset(p)}
                    className={`flex-1 h-8 rounded-lg text-[11px] font-bold text-center whitespace-nowrap transition-all ${
                      activePrice === p.label
                        ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-5 bg-gray-200 shrink-0 hidden lg:block" />

            {/* Группа площади + кнопка сброса */}
            <div className="flex flex-1 items-center gap-1.5 mt-1.5 lg:mt-0">
              <span className="w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center shadow-sm shrink-0">
                <Ruler className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </span>
              <div className="flex flex-1 items-center gap-1">
                {AREA_PRESETS.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => handleAreaPreset(a)}
                    className={`flex-1 h-8 rounded-lg text-[11px] font-bold text-center whitespace-nowrap transition-all ${
                      activeArea === a.label
                        ? "bg-sky-100 text-sky-700 ring-1 ring-sky-200"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={resetFilters}
                title="Сбросить фильтры"
                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                  isAnyFilterActive
                    ? "text-gray-400 hover:text-emerald-700 hover:bg-gray-50"
                    : "text-gray-200 pointer-events-none"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="max-w-md mx-auto text-center py-16">
            <SlidersHorizontal className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-1">
              По вашим фильтрам ничего не нашлось
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Попробуйте расширить диапазон цены или площади.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 xl:gap-5">
          {visible.map((village) => (
            <a
              key={village.id}
              href={`/village/${village.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group block"
            >
              {/* Image — 5:4, photo-dominant with swiper */}
              <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-green-200">
                {village.photos.length > 0 ? (
                  <CardPhotoSwiper photos={village.photos} alt={village.name} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-green-700/60 p-6 text-center">
                    <ImageOff className="w-10 h-10 mb-3" />
                    <span className="text-xs font-semibold uppercase tracking-widest">
                      Фото скоро
                    </span>
                  </div>
                )}
                {/* Top gradient info bar (left side) + heart (right) */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent pb-10 pt-3 px-3">
                  <div className="flex items-start justify-between gap-2 text-white">
                    <div className="flex flex-col gap-1.5 items-start pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            village.readiness === 100
                              ? "bg-green-400"
                              : "bg-amber-400"
                          } shadow-[0_0_0_3px_rgba(255,255,255,0.15)]`}
                        />
                        <span className="text-xs font-semibold tracking-wide">
                          {village.readiness === 100
                            ? "Готовый"
                            : `Готовность ${village.readiness}%`}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <span className="text-sm font-bold leading-none">
                          {liveStats?.[village.slug]?.plotsAvailable ?? village.plotsAvailable}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider opacity-90 leading-none">
                          свободно
                        </span>
                      </div>
                    </div>
                    <div className="z-10">
                      <FavoriteHeart kind="village" slug={village.slug} variant="light" />
                    </div>
                  </div>
                </div>
                {/* Bottom-right: «Дорога к мечте» chip */}
                <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
                  <HomeDistanceBadge
                    villageCoords={village.coords}
                    villageName={village.name}
                    variant="card"
                  />
                </div>
              </div>

              <div className="px-4 pt-3 pb-4">
                <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors">
                  {village.name}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5 mb-2.5">
                  <MapPin className="w-3 h-3" />
                  {village.direction}, {village.distance} км от МКАД
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {village.features.slice(0, 4).map((f) => (
                    <span
                      key={f}
                      className="text-[11px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Area */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Ruler className="w-3 h-3" />
                  от {village.areaFrom} до {village.areaTo} соток
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="leading-tight">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                      от
                    </div>
                    <div className="text-lg font-extrabold text-green-600">
                      {village.priceFrom.toLocaleString("ru-RU")} &#8381;
                    </div>
                    <div className="text-[10px] text-gray-400">за сотку</div>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-green-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold group-hover:bg-green-700 transition-colors">
                    Подробнее
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Expand / collapse */}
        {hasMore && (
          <div className="flex flex-col items-center mt-10">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="group inline-flex items-center gap-3 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-400 text-gray-900 hover:text-green-700 px-7 py-3.5 rounded-full font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  Свернуть каталог
                </>
              ) : (
                <>
                  <span className="flex h-6 min-w-[28px] items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold px-2">
                    +{hiddenCount}
                  </span>
                  Показать все посёлки
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
            {!expanded && (
              <p className="mt-3 text-xs text-gray-500">
                Показано {INITIAL_VISIBLE} из {filtered.length} посёлков
              </p>
            )}
          </div>
        )}

        {/* CTA Banner — liquid glass on photo background */}
        <div
          className="relative mt-10 overflow-hidden rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: "url(/hero-home.jpg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/25 to-black/40" />
          <div
            className="catalog-cta-glass relative overflow-hidden rounded-2xl px-5 py-5 sm:px-7 sm:py-6"
            style={{
              backdropFilter: "blur(4px) saturate(1.8)",
              background: "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 32px -4px rgba(0,0,0,0.25)",
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
              <div className="text-center md:text-left min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                  Один показ — и вы влюбитесь в своё место
                </h3>
                <p className="text-[11px] sm:text-xs md:text-sm text-white/70 mt-0.5">
                  95% клиентов бронируют участок после первого визита. Приезжайте — покажем лично.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2 shrink-0">
                <a
                  href="#contacts"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-4 sm:px-5 h-11 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-4 h-4 shrink-0" />
                  Посмотреть вживую
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </a>
                <a
                  href="#calculator"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/25 px-4 sm:px-5 h-11 rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
                >
                  <Wallet className="w-4 h-4 shrink-0" />
                  Рассчитать ипотеку
                </a>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .catalog-cta-glass { position: relative; }
          .catalog-cta-glass::before {
            content:'';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;
            background:conic-gradient(from 0deg,rgba(255,0,0,0.25),rgba(255,165,0,0.25),rgba(255,255,0,0.18),rgba(0,255,0,0.18),rgba(0,200,255,0.25),rgba(100,100,255,0.25),rgba(200,0,255,0.25),rgba(255,0,0,0.25));
            -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
            -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:1;
          }
        `}</style>
      </div>
    </section>
  );
}
