"use client";

import { useEffect, useRef } from "react";
import { useTier } from "../../../_lib/perf";

/**
 * D · «Курсор».
 *
 * Пятно света идёт за указателем по всей секции — тот же приём, что в
 * карточках преимуществ, только масштабом с блок. Координаты пишем прямо
 * в CSS-переменные, без setState: на mousemove пересборка дерева React
 * заметна даже на ноутбуке.
 *
 * На телефоне указателя нет — там пятно дрейфует само (см. правило
 * `@media (hover: none)` в v3.css). Делаем это в CSS, а не ветвлением в
 * JS: `matchMedia` при первой отрисовке разъезжается с сервером и ломает
 * гидрацию.
 */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const lite = useTier() === "lite";

  useEffect(() => {
    if (lite) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${e.clientX - r.left}px`);
      el.style.setProperty("--gy", `${e.clientY - r.top}px`);
      el.style.setProperty("--go", "1");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [lite]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <span
        className="v3-sec-cursor absolute inset-0"
        style={{
          background:
            "radial-gradient(420px circle at var(--gx, 50%) var(--gy, 30%), var(--v3-sec-glow-a), transparent 68%)",
        }}
      />
    </div>
  );
}
