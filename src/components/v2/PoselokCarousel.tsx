"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, RotateCcw } from "lucide-react";
import { villages } from "@/lib/data";
import FavoriteHeart from "@/components/FavoriteHeart";
import { FilterChip, RangeFilter } from "@/components/filters/RangeFilterChip";

const AUTO_ADVANCE_MS = 5000;
const SWIPE_THRESHOLD = 50;

type Village = (typeof villages)[number];

// Directions present in the dataset + "Все" first
const DIRECTIONS = [
  "Все",
  ...Array.from(new Set(villages.map((v) => v.direction))),
];

// Short labels for the chip bar
function shortDirection(full: string): string {
  return full.replace(/\s?шоссе$/i, "");
}

// Price / area bounds, rounded to nice values
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

const formatRub = (n: number) => n.toLocaleString("ru-RU");
const parseRub = (s: string) => Number(s.replace(/\s/g, "").replace(",", "."));
const formatCompactPrice = (n: number) => {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} млн`;
  }
  return `${Math.round(n / 1000)}к`;
};

function VillageCard({
  village,
  elevated,
}: {
  village: Village;
  elevated?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm transition-all duration-500 h-full flex flex-col ${
        elevated ? "md:shadow-2xl md:scale-[1.03]" : "md:opacity-90"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-green-200">
        {village.photos[0] && (
          <Image
            src={village.photos[0]}
            alt={village.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}

        {/* Top-left readiness badge */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-semibold shadow-sm ${
              village.readiness === 100
                ? "bg-green-500/90 text-white ring-1 ring-green-300/60"
                : "bg-amber-500/90 text-white ring-1 ring-amber-300/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {village.readiness === 100
              ? "Готовый"
              : `Готовность ${village.readiness}%`}
          </div>
        </div>

        {/* Top-right favorite */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteHeart
            kind="village"
            slug={village.slug}
            variant="light"
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-black text-gray-900 leading-tight">
          {village.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin className="w-3 h-3" />
          {village.direction}, {village.distance} км от МКАД
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mt-3">
          {village.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-auto pt-4">
          <div className="leading-tight">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              от
            </div>
            <div className="text-lg font-black text-emerald-700 tabular-nums">
              {village.priceFrom.toLocaleString("ru-RU")} ₽
            </div>
            <div className="text-[10px] text-gray-400">за сотку</div>
          </div>
          <a
            href={`/village/${village.slug}`}
            className="inline-flex items-center gap-1 bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            Подробнее →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PoselokCarousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeDirection, setActiveDirection] = useState<string>("Все");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [areaRange, setAreaRange] = useState<[number, number]>([
    AREA_MIN,
    AREA_MAX,
  ]);
  const pointerStartX = useRef<number | null>(null);
  const pointerDeltaX = useRef<number>(0);
  const sectionRef = useRef<HTMLElement | null>(null);

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

  const count = filtered.length;

  const isPriceFiltered =
    priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX;
  const isAreaFiltered =
    areaRange[0] !== AREA_MIN || areaRange[1] !== AREA_MAX;
  const isAnyFilterActive =
    activeDirection !== "Все" || isPriceFiltered || isAreaFiltered;

  const resetFilters = () => {
    setActiveDirection("Все");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setAreaRange([AREA_MIN, AREA_MAX]);
  };

  // Price chip value label
  const priceLabel = isPriceFiltered
    ? `${formatCompactPrice(priceRange[0])}–${formatCompactPrice(priceRange[1])} ₽`
    : null;
  // Area chip value label
  const areaLabel = isAreaFiltered
    ? `${areaRange[0]}–${areaRange[1]} сот`
    : null;

  // Reset index when filter changes or falls out of range
  useEffect(() => {
    setIndex(0);
  }, [activeDirection, priceRange, areaRange]);

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      setIndex(((i % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || count <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [isPaused, count]);

  // Keyboard arrow navigation — active when section is in viewport
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack typing in inputs
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
      if (!inView) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  // Pointer handlers — unified for touch + mouse drag
  const onPointerDown = (e: React.PointerEvent) => {
    // Only primary button / touch
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerStartX.current = e.clientX;
    pointerDeltaX.current = 0;
    setIsPaused(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    pointerDeltaX.current = e.clientX - pointerStartX.current;
  };

  const onPointerEnd = (e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const dx = pointerDeltaX.current;
    if (dx > SWIPE_THRESHOLD) prev();
    else if (dx < -SWIPE_THRESHOLD) next();
    pointerStartX.current = null;
    pointerDeltaX.current = 0;
    setIsPaused(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <section
      ref={sectionRef}
      className="py-3 lg:py-5"
      aria-roledescription="carousel"
      aria-label="Посёлки"
    >
      {/* Filter row — direction chips + price/area popover chips */}
      <div className="max-w-6xl mx-auto mb-3 px-2 flex flex-wrap items-center justify-center gap-1.5">
        {DIRECTIONS.map((dir) => {
          const active = dir === activeDirection;
          const dirCount =
            dir === "Все"
              ? villages.length
              : villages.filter((v) => v.direction === dir).length;
          return (
            <button
              key={dir}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveDirection(dir)}
              className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold tracking-tight transition-all duration-200 whitespace-nowrap ${
                active
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm shadow-emerald-900/20 ring-1 ring-emerald-700/20"
                  : "bg-white text-emerald-900/80 ring-1 ring-emerald-200/70 hover:bg-emerald-50 hover:ring-emerald-300"
              }`}
            >
              {shortDirection(dir)}
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[15px] px-1 rounded-full text-[9px] font-bold tabular-nums ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {dirCount}
              </span>
            </button>
          );
        })}

        {/* Price popover chip */}
        <FilterChip
          label="Цена"
          value={priceLabel}
          placeholder="Цена"
          active={isPriceFiltered}
          compact
        >
          {() => (
            <RangeFilter
              label="Цена за сотку, ₽"
              suffix="₽"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRange}
              onChange={setPriceRange}
              format={formatRub}
              parse={parseRub}
            />
          )}
        </FilterChip>

        {/* Area popover chip */}
        <FilterChip
          label="Соток"
          value={areaLabel}
          placeholder="Соток"
          active={isAreaFiltered}
          compact
        >
          {() => (
            <RangeFilter
              label="Площадь участка, сотки"
              suffix="сот"
              min={AREA_MIN}
              max={AREA_MAX}
              step={AREA_STEP}
              value={areaRange}
              onChange={setAreaRange}
            />
          )}
        </FilterChip>

        {/* Reset button — shown only when any filter active */}
        {isAnyFilterActive && (
          <button
            type="button"
            onClick={resetFilters}
            aria-label="Сбросить фильтры"
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 ring-1 ring-gray-200 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Сбросить
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="max-w-6xl mx-auto py-10 text-center text-sm text-gray-500">
          В этом направлении пока нет посёлков
        </div>
      ) : (
      <div
        className="relative max-w-6xl mx-auto rounded-3xl ring-1 ring-gray-200 shadow-xl overflow-hidden bg-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Track viewport */}
        <div
          className="relative overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {filtered.map((village, i) => {
              // For desktop 3-up view: show prev + current + next peeking
              const prevIdx = (i - 1 + count) % count;
              const nextIdx = (i + 1) % count;
              return (
                <div
                  key={village.id}
                  className="shrink-0 w-full px-4 md:px-6 py-4"
                  aria-hidden={i !== index}
                >
                  {/* Mobile: single card */}
                  <div className="md:hidden">
                    <VillageCard village={village} elevated />
                  </div>
                  {/* Desktop: 3 up */}
                  <div className="hidden md:grid md:grid-cols-3 md:gap-5 md:items-center">
                    <VillageCard village={filtered[prevIdx]} />
                    <VillageCard village={village} elevated />
                    <VillageCard village={filtered[nextIdx]} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrow buttons (desktop only) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Предыдущий посёлок"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/70 backdrop-blur-md ring-1 ring-gray-200 shadow-md hover:bg-white text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Следующий посёлок"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/70 backdrop-blur-md ring-1 ring-gray-200 shadow-md hover:bg-white text-gray-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {filtered.map((v, i) => {
            const active = i === index;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Перейти к посёлку ${i + 1}`}
                aria-current={active ? "true" : undefined}
                className={`h-2 rounded-sm transition-all duration-300 ${
                  active
                    ? "w-6 bg-gradient-to-r from-green-600 to-emerald-700"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            );
          })}
        </div>
      </div>
      )}
    </section>
  );
}
