"use client";

import { useCallback, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useTier } from "../../_lib/perf";
import { glassStyle } from "./primitives";

/**
 * Карточка со «стеклом» и пятном подсветки, которое едет за курсором.
 *
 * Координаты пишем прямо в CSS-переменные элемента, без setState —
 * иначе на mousemove пересобирался бы React-дерево целиком, а это
 * заметно даже на ноутбуке.
 *
 * На "lite" (слабый телефон, save-data, prefers-reduced-motion):
 * ни слушателей, ни blur-слоя, ни самого пятна — только заливка.
 */

/** Стекло с оглядкой на устройство: backdrop-filter — самое дорогое, что тут есть. */
export function cardGlass(lite: boolean): CSSProperties {
  if (!lite) return glassStyle;
  return { ...glassStyle, backdropFilter: "none", WebkitBackdropFilter: "none" };
}

interface Props {
  children: ReactNode;
  className?: string;
  /** радиус пятна подсветки, px */
  radius?: number;
  /** цвет пятна — обычно оттенок иконки карточки */
  tone?: string;
  style?: CSSProperties;
}

export default function SpotlightCard({
  children,
  className = "",
  radius = 260,
  tone = "rgba(16,185,129,0.22)",
  style,
}: Props) {
  const lite = useTier() === "lite";

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
    el.style.setProperty("--so", "1");
  }, []);

  const onLeave = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--so", "0");
  }, []);

  return (
    <div
      onMouseMove={lite ? undefined : onMove}
      onMouseLeave={lite ? undefined : onLeave}
      className={`group relative overflow-hidden ${className}`}
      style={{ ...cardGlass(lite), ...style }}
    >
      {!lite && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: "var(--so, 0)",
            background: `radial-gradient(${radius}px circle at var(--sx, 50%) var(--sy, 0%), ${tone}, transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
