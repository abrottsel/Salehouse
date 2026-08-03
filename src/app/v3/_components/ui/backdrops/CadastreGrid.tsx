"use client";

import { useMemo } from "react";
import { useTier } from "../../../_lib/perf";

/**
 * Вариант B — «Кадастровая сетка».
 *
 * Тематический фон: уходящая к горизонту сетка участков, по которой
 * бежит волна подсветки, и несколько «занятых» клеток, подсвеченных
 * зелёным. Прямая метафора того, чем занимается бизнес, и при этом
 * видно при любой яркости — линии контрастные, а не полупрозрачная пыль.
 */
export default function CadastreGrid() {
  const tier = useTier();

  // Подсвеченные клетки — детерминированно, без Math.random().
  const cells = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        col: (i * 5 + 2) % 12,
        row: (i * 3 + 1) % 7,
        delay: `${(i * 0.7) % 8}s`,
      })),
    [],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#0b0e13]" />

      {/* Свечение над горизонтом */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 62%, rgba(16,185,129,0.34) 0%, transparent 60%)," +
            "radial-gradient(90% 50% at 20% 20%, rgba(132,204,22,0.16) 0%, transparent 60%)",
        }}
      />

      {/* Перспективная плоскость с сеткой */}
      <div
        className="absolute inset-x-[-40%] bottom-[-10%] top-[38%]"
        style={{ perspective: "620px", perspectiveOrigin: "50% 0%" }}
      >
        <div
          className={tier === "full" ? "v3-grid-scroll absolute inset-0" : "absolute inset-0"}
          style={{
            transform: "rotateX(64deg)",
            transformOrigin: "50% 0%",
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.42) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(52,211,153,0.42) 1px, transparent 1px)",
            backgroundSize: "84px 84px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, transparent 78%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, transparent 78%)",
          }}
        >
          {tier === "full" &&
            cells.map((c, i) => (
              <span
                key={i}
                className="v3-cell absolute"
                style={{
                  left: `${c.col * 84}px`,
                  top: `${c.row * 84}px`,
                  width: 84,
                  height: 84,
                  animationDelay: c.delay,
                }}
              />
            ))}
        </div>
      </div>

      {/* Линия горизонта */}
      <div
        className="absolute inset-x-0 top-[38%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(110,231,183,0.85) 50%, transparent)",
          boxShadow: "0 0 24px rgba(52,211,153,0.6)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0b0e13] to-transparent" />
    </div>
  );
}
