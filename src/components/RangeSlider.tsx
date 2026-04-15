"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

/**
 * Dual-thumb range slider, DOM shape:
 *
 *   [circle]━━━━━━━━━━━━[circle]
 *
 * No native <input type="range">, no gray rail. The track is literally nothing
 * (transparent container); only the green arrow between the two thumbs and the
 * two circles are rendered. Drag is handled via pointer events, so touch,
 * mouse and stylus all work.
 */
export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
}: RangeSliderProps) {
  const [minVal, maxVal] = value;
  const range = max - min || 1;
  const minPct = ((minVal - min) / range) * 100;
  const maxPct = ((maxVal - min) / range) * 100;

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<null | "min" | "max">(null);

  // Convert client X to a snapped value in [min..max].
  const valueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return min;
      const rect = el.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      const raw = min + pct * range;
      const snapped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, snapped));
    },
    [min, max, range, step],
  );

  const beginDrag = (which: "min" | "max") =>
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(which);
    };

  // Click on the empty track → move the nearest thumb to that point.
  const handleTrackPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    const v = valueFromClientX(e.clientX);
    const distMin = Math.abs(v - minVal);
    const distMax = Math.abs(v - maxVal);
    const which: "min" | "max" = distMin <= distMax ? "min" : "max";
    if (which === "min") onChange([Math.min(v, maxVal - step), maxVal]);
    else onChange([minVal, Math.max(v, minVal + step)]);
    setDragging(which);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const v = valueFromClientX(e.clientX);
      if (dragging === "min") {
        onChange([Math.min(v, maxVal - step), maxVal]);
      } else {
        onChange([minVal, Math.max(v, minVal + step)]);
      }
    };
    const up = () => setDragging(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, minVal, maxVal, step, valueFromClientX, onChange]);

  // Keyboard: ←/→ on a focused circle moves it by one step.
  const keyHandler = (which: "min" | "max") =>
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      let delta = 0;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
      if (e.key === "Home") delta = -Infinity;
      if (e.key === "End") delta = Infinity;
      if (!delta) return;
      e.preventDefault();
      if (which === "min") {
        const next = Math.max(
          min,
          Math.min(maxVal - step, minVal + delta),
        );
        onChange([next, maxVal]);
      } else {
        const next = Math.min(
          max,
          Math.max(minVal + step, maxVal + delta),
        );
        onChange([minVal, next]);
      }
    };

  return (
    <div
      ref={trackRef}
      onPointerDown={handleTrackPointerDown}
      className="relative h-7 select-none cursor-pointer touch-none"
    >
      {/* Green arrow between the two circles (gradient, no background rail). */}
      <div
        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 shadow-[0_1px_4px_rgba(16,185,129,0.35)] pointer-events-none"
        style={{
          left: `calc(14px + (100% - 28px) * ${minPct} / 100)`,
          right: `calc(14px + (100% - 28px) * ${100 - maxPct} / 100)`,
        }}
      />

      {/* Min circle */}
      <div
        role="slider"
        aria-label="Минимум"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={minVal}
        tabIndex={0}
        onPointerDown={beginDrag("min")}
        onKeyDown={keyHandler("min")}
        className="absolute top-1/2 w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 ring-2 ring-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-none focus:ring-[3px] focus:ring-emerald-300 z-20"
        style={{ left: `calc(14px + (100% - 28px) * ${minPct} / 100)` }}
      >
        <span className="w-2 h-2 rounded-full bg-white pointer-events-none" />
      </div>

      {/* Max circle */}
      <div
        role="slider"
        aria-label="Максимум"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={maxVal}
        tabIndex={0}
        onPointerDown={beginDrag("max")}
        onKeyDown={keyHandler("max")}
        className="absolute top-1/2 w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 ring-2 ring-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-none focus:ring-[3px] focus:ring-emerald-300 z-30"
        style={{ left: `calc(14px + (100% - 28px) * ${maxPct} / 100)` }}
      >
        <span className="w-2 h-2 rounded-full bg-white pointer-events-none" />
      </div>
    </div>
  );
}
