"use client";

import { useEffect, useState } from "react";

export const money = (n: number) => n.toLocaleString("ru-RU");

/** Счётчик, который доезжает до значения при монтаже. */
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

    // В фоновой вкладке requestAnimationFrame не вызывается вообще, и
    // счётчик навсегда застыл бы на нуле — подстраховываемся таймером.
    const fallback = setTimeout(() => setValue(target), durationMs * 2);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [target, durationMs]);

  return value;
}
