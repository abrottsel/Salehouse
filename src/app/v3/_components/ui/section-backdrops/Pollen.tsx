"use client";

import { useMemo } from "react";
import { useTier } from "../../../_lib/perf";

/**
 * F · «Пыльца».
 *
 * Ответ на вопрос про звёзды: те же светящиеся точки, но не мигают на
 * месте, а медленно поднимаются, как пыльца в вечернем воздухе. Мигание
 * под строкой текста дёргает глаз, ровный подъём — нет.
 */
export default function Pollen() {
  const lite = useTier() === "lite";

  // Золотые последовательности вместо Math.random(): раскладка одинакова
  // на сервере и клиенте, гидрация не ругается.
  const dots = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: `${((i * 0.618033988749895) % 1) * 100}%`,
        bottom: `${-10 + ((i * 0.7548776662466927) % 1) * 40}%`,
        size: 2 + ((i * 5) % 3),
        delay: `${((i * 23) % 180) / 10}s`,
        dur: `${16 + ((i * 31) % 90) / 10}s`,
      })),
    [],
  );

  if (lite) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="v3-sec-pollen absolute rounded-full"
          style={{
            left: d.left,
            bottom: d.bottom,
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
            animationDuration: d.dur,
          }}
        />
      ))}
    </div>
  );
}
