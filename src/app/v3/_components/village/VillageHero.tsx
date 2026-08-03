"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Ruler } from "lucide-react";
import { useTier } from "../../_lib/perf";
import RouteBadgeDark from "../RouteBadgeDark";

/**
 * Hero посёлка — тёмный премиум.
 *
 * Фото на всю высоту экрана, листается свайпом, стрелками, точками и
 * клавишами ← →. Логика листания повторяет боевой VillageHeroSwiper
 * (порог свайпа 40 px, монтируем только соседние кадры), вёрстка новая.
 *
 * Секция вытянута вверх на -mt-20: в layout ветки /v3 контент обёрнут в
 * pt-20 под фиксированную шапку, а hero обязан быть во весь экран.
 */

interface Props {
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
  coords: [number, number];
}

export default function VillageHero({
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
  coords,
}: Props) {
  const tier = useTier();
  const lite = tier === "lite";

  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const total = photos.length;

  const go = useCallback(
    (delta: number) => {
      if (total < 2) return;
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  // Клавиатура ← →. На странице ниже живёт форма записи, и стрелки внутри
  // её полей не должны перелистывать фото.
  useEffect(() => {
    if (total < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, total]);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  // Свайпом считаем только горизонтальный сдвиг > 40 px — иначе обычная
  // вертикальная прокрутка на телефоне превращалась бы в листание.
  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - (startY.current ?? 0);
    startX.current = null;
    startY.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  return (
    <section
      className="relative -mt-20 h-[100svh] min-h-[600px] w-full select-none overflow-hidden bg-black"
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      aria-roledescription="карусель"
      aria-label={`Фотографии посёлка ${name}`}
    >
      {photos.map((src, i) => {
        // Держим смонтированными только соседние кадры: 8 полноэкранных
        // картинок разом кладут слабый телефон.
        const near =
          i === index || i === (index - 1 + total) % total || i === (index + 1) % total;
        if (!near) return null;
        const active = i === index;
        return (
          <div
            key={src}
            aria-hidden={!active}
            className={`absolute inset-0 ${
              active ? "opacity-100" : "opacity-0"
            } ${lite ? "transition-opacity duration-200" : "transition-all duration-[900ms] ease-out"}`}
            style={lite ? undefined : { transform: active ? "scale(1)" : "scale(1.05)" }}
          >
            <Image
              src={src}
              alt={`${name} — фото ${i + 1} из ${total}`}
              fill
              // `priority` в Next 16 объявлен устаревшим, его заменил `preload`.
              preload={i === 0}
              sizes="100vw"
              quality={85}
              className="object-cover"
              draggable={false}
            />
          </div>
        );
      })}

      {/* Затемнение: сверху лёгкое (фото должно дышать), внизу глухое —
          там текст, и низ обязан уйти в фон страницы без шва. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0e13]/75 via-[#0b0e13]/25 to-[#0b0e13]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0e13] to-transparent" />

      <div className="absolute inset-0 z-20 mx-auto flex max-w-[1500px] flex-col px-4 pb-24 pt-24 sm:px-6 sm:pb-28 sm:pt-28 lg:px-10">
        {/* Верхний ряд: сколько ехать от МКАД и — рядом — «Дорога к мечте»,
            сколько ехать именно от дома посетителя. Здесь у панели есть
            место развернуться вниз, в нижнем ряду пилюль она легла бы
            поверх кнопок.

            stopPropagation обязателен: секция ловит свайп для листания
            фото, и перетаскивание внутри панели пролистывало бы карусель. */}
        <div
          className="flex flex-wrap items-center gap-2"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <Pill lite={lite} tall>
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            {direction} · {distance} км от МКАД
          </Pill>
          <RouteBadgeDark villageCoords={coords} villageName={name} />
        </div>

        <div className="flex-1" />

        <div className="max-w-4xl space-y-4 sm:space-y-6">
          <h1 className="text-[38px] font-extrabold leading-[1.02] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-6xl lg:text-[76px]">
            {name}
          </h1>

          <p className="max-w-2xl text-[15px] leading-relaxed text-white/70 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-[17px]">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Pill lite={lite}>
              <span className="text-[10px] uppercase tracking-wider text-white/50">от</span>
              <span className="text-[15px] font-extrabold tabular-nums text-emerald-300">
                {priceFrom.toLocaleString("ru-RU")}
              </span>
              <span className="text-[11px] text-white/60">₽/сот</span>
            </Pill>
            <Pill lite={lite}>
              <Ruler className="h-3.5 w-3.5 text-white/55" />
              <span className="tabular-nums">
                {areaFrom}–{areaTo}
              </span>
              <span className="text-[11px] text-white/60">сот</span>
            </Pill>
            <Pill lite={lite}>
              <span className="text-[10px] uppercase tracking-wider text-white/50">свободно</span>
              <span className="text-[15px] font-extrabold tabular-nums text-emerald-300">
                {plotsAvailable}
              </span>
              <span className="text-[11px] text-white/50">/ {plotsCount}</span>
            </Pill>
            <Pill lite={lite}>
              <span className="text-[10px] uppercase tracking-wider text-white/50">готовность</span>
              <span className="tabular-nums">{readiness}%</span>
            </Pill>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="#plots-map"
              className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-6 text-[14px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]"
            >
              Смотреть участки
            </a>
            <a
              href="#viewing"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white/[0.07] px-6 text-[14px] font-bold text-white ring-1 ring-white/15 backdrop-blur-md transition-all hover:bg-white/[0.13] active:scale-[0.98]"
            >
              Записаться на просмотр
            </a>
          </div>
        </div>
      </div>

      {total > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-6 z-30 flex items-center justify-center gap-1.5 px-4">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Перейти к фото ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-8 bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                    : "w-1.5 bg-white/35 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Стрелки — в правом нижнем углу, а не по бокам: по центру
              левого края они наезжали бы на заголовок посёлка. */}
          <div className="absolute bottom-5 right-4 z-30 hidden items-center gap-2 sm:flex lg:right-10">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
              className="grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/20 backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold tabular-nums text-white/80 ring-1 ring-white/15">
              {index + 1}
              <span className="text-white/40">/</span>
              {total}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующее фото"
              className="grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/20 backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function Pill({
  children,
  lite,
  tall = false,
}: {
  children: ReactNode;
  lite: boolean;
  /** h-11 — чтобы в верхнем ряду совпасть по высоте с «Дорогой к мечте». */
  tall?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold text-white ring-1 ring-white/20 ${
        tall ? "h-11" : "h-9"
      } ${lite ? "bg-black/55" : "bg-black/35 backdrop-blur-md"}`}
    >
      {children}
    </span>
  );
}
