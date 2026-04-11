"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { villages } from "@/lib/data";
import FavoriteHeart from "@/components/FavoriteHeart";

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD = 50;

type Village = (typeof villages)[number];

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
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const count = villages.length;

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

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null) return;
    const dx = touchDeltaX.current;
    if (dx > SWIPE_THRESHOLD) prev();
    else if (dx < -SWIPE_THRESHOLD) next();
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  };

  if (count === 0) return null;

  return (
    <section className="py-10 lg:py-14">
      <div
        className="relative max-w-6xl mx-auto rounded-3xl ring-1 ring-gray-200 shadow-xl overflow-hidden bg-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Track viewport */}
        <div
          className="relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {villages.map((village, i) => {
              // For desktop 3-up view: show prev + current + next peeking
              const prevIdx = (i - 1 + count) % count;
              const nextIdx = (i + 1) % count;
              return (
                <div
                  key={village.id}
                  className="shrink-0 w-full px-4 md:px-6 py-8"
                  aria-hidden={i !== index}
                >
                  {/* Mobile: single card */}
                  <div className="md:hidden">
                    <VillageCard village={village} elevated />
                  </div>
                  {/* Desktop: 3 up */}
                  <div className="hidden md:grid md:grid-cols-3 md:gap-5 md:items-center">
                    <VillageCard village={villages[prevIdx]} />
                    <VillageCard village={village} elevated />
                    <VillageCard village={villages[nextIdx]} />
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
        <div className="flex items-center justify-center gap-1.5 pb-5">
          {villages.map((v, i) => {
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
    </section>
  );
}
