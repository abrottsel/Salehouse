"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  photos: string[];
  name: string;
}

const AUTOPLAY_MS = 6000;

export default function VillageGallery({ photos, name }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = photos.length;

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  // Autoplay
  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count, next]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (count === 0) return null;

  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Фотогалерея посёлка
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {count} фото · автопереключение каждые 6 секунд
            </p>
          </div>
          <div className="hidden sm:block text-sm text-gray-400 font-medium">
            {index + 1} / {count}
          </div>
        </div>

        {/* Main carousel */}
        <div
          className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 shadow-lg group"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slides */}
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === index ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={photo}
                alt={`${name} — фото ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          ))}

          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Предыдущее фото"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Следующее фото"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Mobile pagination dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:hidden">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Перейти к фото ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        {count > 1 && (
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden transition-all ${
                  i === index
                    ? "ring-2 ring-green-600 ring-offset-2 scale-105"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={photo}
                  alt={`${name} — миниатюра ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
