"use client";

import { useEffect, useRef } from "react";
import { useTier } from "../../../_lib/perf";

/**
 * Вариант C — «Прожектор».
 *
 * Плотная точечная сетка, по которой ходит мягкий световой круг.
 * На десктопе следует за курсором, на телефоне (курсора нет) дрейфует
 * сам — иначе на мобильных, где основной трафик, эффекта бы не было.
 *
 * Позицию двигаем через CSS-переменные напрямую в стиле узла, минуя
 * состояние React: иначе на каждое движение мыши шёл бы ререндер.
 */
export default function Spotlight() {
  const tier = useTier();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || tier === "lite") return;

    const fine = window.matchMedia("(pointer: fine)").matches;

    if (fine) {
      const onMove = (e: PointerEvent) => {
        const r = node.getBoundingClientRect();
        node.style.setProperty("--sx", `${((e.clientX - r.left) / r.width) * 100}%`);
        node.style.setProperty("--sy", `${((e.clientY - r.top) / r.height) * 100}%`);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }

    // Телефон: медленный дрейф по фигуре Лиссажу
    let raf = 0;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const s = (t - t0) / 1000;
      node.style.setProperty("--sx", `${50 + Math.sin(s * 0.32) * 30}%`);
      node.style.setProperty("--sy", `${46 + Math.cos(s * 0.21) * 26}%`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tier]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ ["--sx" as string]: "50%", ["--sy" as string]: "40%" }}
    >
      <div className="absolute inset-0 bg-[#0b0e13]" />

      {/* Точечная сетка */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1.4px, transparent 1.4px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Прожектор: подсвечивает точки под собой */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(110,231,183,0.95) 1.6px, transparent 1.6px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(circle 280px at var(--sx) var(--sy), rgba(0,0,0,1) 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle 280px at var(--sx) var(--sy), rgba(0,0,0,1) 0%, transparent 70%)",
        }}
      />

      {/* Само световое пятно */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 340px at var(--sx) var(--sy), rgba(16,185,129,0.30) 0%, transparent 68%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b0e13] to-transparent" />
    </div>
  );
}
