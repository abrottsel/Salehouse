"use client";

import { useCallback } from "react";

interface Props {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

/**
 * Variant A — Custom visual thumbs (divs) + invisible native inputs.
 *
 * Both thumbs are plain absolutely-positioned divs, so they can sit exactly
 * at 0% and 100% of the container without any native inset. Native inputs
 * overlay the whole slider for drag/keyboard interaction; their own thumbs
 * are visually hidden (opacity 0).
 */
export default function SliderA({
  min,
  max,
  step = 1,
  value,
  onChange,
}: Props) {
  const [minVal, maxVal] = value;
  const range = max - min || 1;
  const minPct = ((minVal - min) / range) * 100;
  const maxPct = ((maxVal - min) / range) * 100;

  const handleMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), maxVal - step);
      onChange([Math.max(min, v), maxVal]);
    },
    [maxVal, min, step, onChange]
  );

  const handleMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), minVal + step);
      onChange([minVal, Math.min(max, v)]);
    },
    [minVal, max, step, onChange]
  );

  // Native thumbs are invisible but still interactive.
  const hidden =
    "appearance-none bg-transparent absolute inset-x-0 w-full h-6 top-0 " +
    "[&::-webkit-slider-thumb]:appearance-none " +
    "[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 " +
    "[&::-webkit-slider-thumb]:rounded-full " +
    "[&::-webkit-slider-thumb]:bg-transparent " +
    "[&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 " +
    "[&::-moz-range-thumb]:rounded-full " +
    "[&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:border-0 " +
    "[&::-moz-range-thumb]:cursor-pointer";

  // Offset math: 12px thumb radius inset on each side.
  const tL = (pct: number) => `calc(12px + (100% - 24px) * ${pct} / 100)`;

  // Solid green circle w/ darker border + drop shadow
  const thumbCls =
    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full " +
    "bg-[#10b981] border-2 border-[#047857] shadow-[0_2px_6px_rgba(0,0,0,0.25)] pointer-events-none";

  return (
    <div className="relative h-6 select-none">
      <div
        className="absolute top-1/2 h-2 -translate-y-1/2 bg-green-600 rounded-full"
        style={{
          left: tL(minPct),
          right: `calc(12px + (100% - 24px) * ${100 - maxPct} / 100)`,
        }}
      />
      {/* Visual thumbs */}
      <div className={`${thumbCls} z-20`} style={{ left: tL(minPct) }} />
      <div className={`${thumbCls} z-20`} style={{ left: tL(maxPct) }} />
      {/* Interaction inputs */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMin}
        aria-label="Минимум"
        className={`${hidden} z-30`}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMax}
        aria-label="Максимум"
        className={`${hidden} z-40`}
      />
    </div>
  );
}
