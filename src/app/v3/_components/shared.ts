"use client";

import { useEffect, useState } from "react";

export interface OverlayVillage {
  name: string;
  priceFrom: number;
  plotsCount: number;
  plotsAvailable: number;
  areaFrom: number;
  areaTo: number;
  distance: number;
  direction: string;
}

export interface OverlayProps {
  village: OverlayVillage;
}

/** Разбивка по статусам. Free — живая цифра, остальное добираем из общего числа. */
export function splitStatuses(v: OverlayVillage) {
  const free = v.plotsAvailable;
  const reserved = Math.max(0, Math.round((v.plotsCount - free) * 0.18));
  const sold = Math.max(0, v.plotsCount - free - reserved);
  return { free, reserved, sold, total: v.plotsCount };
}

/** Счётчик, который доезжает до значения — запускается один раз при появлении. */
export function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = reduce ? 1 : Math.min(1, (t - t0) / durationMs);
      // easeOutCubic
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Подстраховка: в фоновой вкладке requestAnimationFrame не вызывается
    // вообще, и счётчик навсегда застыл бы на нуле. Через два интервала
    // анимации просто ставим итоговое значение.
    const fallback = setTimeout(() => setValue(target), durationMs * 2);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [target, durationMs]);

  return value;
}

export const money = (n: number) => n.toLocaleString("ru-RU");

/** Стекло в духе эталона «Пушка», но темнее и без радужной рамки. */
export const glass = {
  backdropFilter: "blur(18px) saturate(1.5)",
  // тёмная база обязательна: карта под слоем бывает светло-зелёной,
  // на прозрачном стекле белый текст на ней не читается
  background:
    "linear-gradient(150deg, rgba(14,18,24,0.78) 0%, rgba(10,13,18,0.86) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -0.5px 0 rgba(255,255,255,0.06), 0 18px 50px -12px rgba(0,0,0,0.7)",
} as const;

export const STATUS_META = [
  { key: "free", label: "Свободно", dot: "#34d399" },
  { key: "reserved", label: "Бронь", dot: "#fbbf24" },
  { key: "sold", label: "Продано", dot: "#94a3b8" },
] as const;
