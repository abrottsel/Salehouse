"use client";

/**
 * VillageLightbox — full-screen photo gallery overlay.
 *
 * Opens when the user taps/clicks the hero photo. Renders a dark
 * backdrop, a big centered photo that matches the user's chosen
 * start index, swipe / arrow / keyboard navigation, and a thumbnail
 * strip at the bottom. Closes on Escape or click on the backdrop.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPortal } from "react-dom";

interface Props {
  photos: string[];
  startIndex: number;
  villageName: string;
  onClose: () => void;
}

export default function VillageLightbox({
  photos,
  startIndex,
  villageName,
  onClose,
}: Props) {
  const [index, setIndex] = useState(Math.max(0, Math.min(startIndex, photos.length - 1)));
  const [mounted, setMounted] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const total = photos.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  // Scroll the active thumbnail into view when index changes.
  useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const active = strip.querySelector<HTMLElement>(
      `[data-thumb="${index}"]`,
    );
    if (active) {
      active.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [index]);

  if (!mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 text-white">
        <div className="text-[11px] sm:text-sm font-bold">
          <span className="text-white/60 uppercase tracking-wider mr-2">
            Галерея
          </span>
          <span>{villageName}</span>
          <span className="ml-3 text-white/60 tabular-nums">
            {index + 1} / {total}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
          aria-label="Закрыть галерею"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active photo area */}
      <div
        className="relative flex-1 flex items-center justify-center select-none"
        onPointerDown={(e) => (dragStartX.current = e.clientX)}
        onPointerUp={(e) => {
          if (dragStartX.current === null) return;
          const dx = e.clientX - dragStartX.current;
          dragStartX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* Render all images stacked but only show the active one so
            Next Image caches them — avoids flash on swipe. */}
        {photos.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 flex items-center justify-center px-4 sm:px-12 lg:px-20 pb-24 pt-2 transition-opacity duration-200 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="relative w-full h-full max-w-[1600px] max-h-full">
              <Image
                src={src}
                alt={`${villageName} — фото ${i + 1}`}
                fill
                sizes="100vw"
                quality={90}
                className="object-contain"
                draggable={false}
                priority={i === index}
              />
            </div>
          </div>
        ))}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors"
              aria-label="Предыдущее"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors"
              aria-label="Следующее"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div
          ref={thumbsRef}
          className="shrink-0 flex items-center gap-2 px-4 sm:px-6 pb-5 pt-3 overflow-x-auto no-scrollbar"
        >
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              data-thumb={i}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden transition-all ${
                i === index
                  ? "ring-2 ring-emerald-400 scale-105"
                  : "ring-1 ring-white/20 opacity-60 hover:opacity-100"
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100px"
                quality={60}
                className="object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}
