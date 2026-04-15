"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  photos: string[];
  alt: string;
}

/**
 * Compact photo swiper for village cards in the catalog grid.
 * Touch swipe on mobile, arrow buttons on desktop hover.
 * Dots indicator at bottom.
 */
export default function CardPhotoSwiper({ photos, alt }: Props) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = photos.length;

  if (count === 0) return null;

  const go = (i: number) => setIdx(((i % count) + count) % count);

  const onPointerDown = (e: React.PointerEvent) => {
    touchX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (touchX.current === null) return;
    const dx = e.clientX - touchX.current;
    if (dx > 40) go(idx - 1);
    else if (dx < -40) go(idx + 1);
    touchX.current = null;
  };

  return (
    <div
      className="relative w-full h-full touch-pan-y select-none group/swiper"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Current photo */}
      <Image
        src={photos[idx]}
        alt={`${alt} — фото ${idx + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Arrow buttons — desktop hover only */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(idx - 1); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-opacity shadow-sm z-10 hover:bg-white"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(idx + 1); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-opacity shadow-sm z-10 hover:bg-white"
            aria-label="Следующее фото"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
          {photos.slice(0, 5).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === idx
                  ? "bg-white w-3 shadow-sm"
                  : "bg-white/60"
              }`}
              aria-label={`Фото ${i + 1}`}
            />
          ))}
          {count > 5 && (
            <span className="text-[8px] text-white/80 font-bold ml-0.5">
              +{count - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
