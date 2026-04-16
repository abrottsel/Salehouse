"use client";

/**
 * VillageHeroSwiper — full-screen hero for a village detail page.
 *
 * UX: 100 vh swipeable photo carousel with a reduced (30%) dark
 * overlay so the background photo actually shines. The title block
 * and CTA sit over the bottom-left. Arrow buttons + keyboard ← →
 * and touch swipe all flip the active photo.
 *
 * Tapping anywhere on the photo (not on a control) opens the
 * VillageLightbox with the currently visible photo preselected.
 *
 * Replaces the old VillageHero + VillageGallery pair. Those files
 * still exist in the repo as a safety net but are no longer
 * imported from the village route.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Ruler } from "lucide-react";
import FavoriteHeart from "./FavoriteHeart";
import VillageLightbox from "./VillageLightbox";

interface Props {
  slug: string;
  name: string;
  direction: string;
  distance: number;
  readiness: number;
  description: string;
  priceFrom: number;
  plotsAvailable: number;
  plotsCount: number;
  areaFrom: number;
  areaTo: number;
  photos: string[];
}

export default function VillageHeroSwiper({
  slug,
  name,
  direction,
  distance,
  readiness,
  description,
  priceFrom,
  plotsAvailable,
  plotsCount,
  areaFrom,
  areaTo,
  photos,
}: Props) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const suppressTapUntilRef = useRef(0);

  const total = photos.length;

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  // Keyboard nav
  useEffect(() => {
    if (lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, lightboxOpen]);

  // Pointer swipe — treat as swipe only when horizontal drag > 40 px,
  // taps under that threshold open the lightbox.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    const dy = (e.clientY ?? 0) - (dragStartY.current ?? 0);
    dragStartX.current = null;
    dragStartY.current = null;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      go(dx < 0 ? 1 : -1);
      // Suppress the synthetic click that follows a touch-drag so we
      // don't accidentally open the lightbox on swipe.
      suppressTapUntilRef.current = Date.now() + 250;
    }
  };

  const onPhotoClick = () => {
    if (Date.now() < suppressTapUntilRef.current) return;
    setLightboxStart(index);
    setLightboxOpen(true);
  };

  // Phase 4: keyboard accessibility (Enter / Space on wrapper)
  const onWrapperKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPhotoClick();
    }
  };

  const current = photos[index] ?? "";

  return (
    <>
      <section
        className="relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-black bg-cover bg-center bg-no-repeat select-none"
        style={{ backgroundImage: `url(${photos[0]})` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* Photo layers — absolute stacked, fade between indexes.
            First photo is also the CSS background-image so it paints
            instantly without waiting for JS hydration. */}
        {photos.map((src, i) => {
          const isNear = i === index || i === (index - 1 + total) % total || i === (index + 1) % total;
          if (!isNear && i !== 0) return null;
          return (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <Image
                src={src}
                alt={`${name} — фото ${i + 1} из ${total}`}
                fill
                priority={i === 0}
                sizes="100vw"
                quality={85}
                className="object-cover"
                draggable={false}
              />
            </div>
          );
        })}

        {/* Dimming overlay — 30% dark instead of the old ~50%, so the
            photo actually carries the mood. Bottom fade is a little
            stronger so the title + CTA stay readable against bright
            photos. */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-black/20 to-black/60" />

        {/* Click surface — sits above the image, below the controls.
            Enables the "tap to open lightbox" gesture without
            stealing swipes. */}
        <button
          type="button"
          onClick={onPhotoClick}
          onKeyDown={onWrapperKeyDown}
          className="absolute inset-0 z-10 cursor-zoom-in focus:outline-none"
          aria-label="Открыть галерею"
        />

        {/* Header spacing (the global site Header sits above and is
            fixed at top:0 h-16, so the hero content gets a 80 px
            breathing room from the top). */}
        <div className="absolute inset-0 z-20 flex flex-col pt-20 px-4 sm:px-8 lg:px-16 pb-6 lg:pb-10 pointer-events-none">
          {/* Top-right FavoriteHeart + photo counter */}
          <div className="flex items-start justify-between pointer-events-auto">
            <div className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/40 ring-1 ring-white/25 text-white text-[11px] font-bold">
              <MapPin className="w-3.5 h-3.5" />
              {direction} · {distance} км от МКАД
            </div>
            <FavoriteHeart kind="village" slug={slug} variant="dark" />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom overlay: title, description, CTA, stats */}
          <div className="max-w-4xl pointer-events-auto space-y-4 sm:space-y-5">
            <h1 className="text-[34px] sm:text-5xl lg:text-[64px] font-black text-white leading-[1.02] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {name}
            </h1>
            <p className="max-w-2xl text-white/85 text-sm sm:text-base lg:text-lg leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
              <div className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-black/40 ring-1 ring-white/25 text-white text-[12px] font-bold">
                <span className="text-white/60 text-[10px] uppercase tracking-wider">
                  от
                </span>
                <span className="text-base tabular-nums">
                  {priceFrom.toLocaleString("ru-RU")}
                </span>
                <span className="text-white/70 text-[11px]">₽/сот</span>
              </div>
              <div className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-black/40 ring-1 ring-white/25 text-white text-[12px] font-bold tabular-nums">
                <Ruler className="w-3.5 h-3.5 text-white/70" />
                {areaFrom}–{areaTo} сот
              </div>
              <div className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-black/40 ring-1 ring-white/25 text-white text-[12px] font-bold tabular-nums">
                <span className="text-white/70 text-[10px] uppercase">свободно</span>
                {plotsAvailable}
                <span className="text-white/50 text-[10px]">/ {plotsCount}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-black/40 ring-1 ring-white/25 text-white text-[12px] font-bold tabular-nums">
                <span className="text-white/70 text-[10px] uppercase">готовность</span>
                {readiness}%
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a
                href="#plots-map"
                className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-sm shadow-2xl shadow-emerald-900/40 transition-all"
              >
                Смотреть участки
              </a>
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-black/35 ring-1 ring-white/30 hover:bg-white/20 text-white font-bold text-sm transition-all"
              >
                Записаться на просмотр
              </a>
            </div>
          </div>
        </div>

        {/* Swipe arrows — desktop only, hidden below sm to keep the
            layout clean on touch devices where users swipe. */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="hidden sm:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 ring-1 ring-white/25 items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="hidden sm:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 ring-1 ring-white/25 items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
              aria-label="Следующее фото"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter + progress dots — bottom-right */}
        {total > 1 && (
          <div className="absolute right-4 sm:right-8 lg:right-16 bottom-5 lg:bottom-10 z-30 flex items-center gap-2 pointer-events-auto">
            <div className="inline-flex items-center gap-1 text-white text-[11px] font-black tabular-nums px-2.5 h-7 rounded-full bg-black/40">
              {index + 1}
              <span className="text-white/60">/</span>
              {total}
            </div>
          </div>
        )}

        {/* Progress dots row — bottom center, mobile friendly */}
        {total > 1 && total <= 12 && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 lg:bottom-6 z-30 flex items-center gap-1.5 pointer-events-auto">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Перейти к фото ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {lightboxOpen && (
        <VillageLightbox
          photos={photos}
          startIndex={lightboxStart}
          villageName={name}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Hidden: preload the current image via direct src for LCP */}
      {current && (
        <link
          rel="preload"
          as="image"
          href={current}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ fetchpriority: "high" } as any)}
        />
      )}
    </>
  );
}
