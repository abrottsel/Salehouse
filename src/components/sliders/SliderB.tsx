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
 * Variant B — Material-style. Solid green thumb, no border, soft drop shadow.
 * Custom visual thumbs + invisible native inputs.
 */
export default function SliderB({
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
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange([
        Math.max(min, Math.min(Number(e.target.value), maxVal - step)),
        maxVal,
      ]),
    [maxVal, min, step, onChange]
  );
  const handleMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange([
        minVal,
        Math.min(max, Math.max(Number(e.target.value), minVal + step)),
      ]),
    [minVal, max, step, onChange]
  );

  const hidden =
    "appearance-none bg-transparent absolute inset-x-0 w-full h-7 top-0 " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer";

  const tL = (pct: number) => `calc(14px + (100% - 28px) * ${pct} / 100)`;

  const thumbCls =
    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full " +
    "bg-green-600 shadow-[0_3px_8px_rgba(0,0,0,0.3),0_0_0_6px_rgba(16,185,129,0.15)] pointer-events-none";

  return (
    <div className="relative h-7 select-none">
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 bg-green-600 rounded-full"
        style={{
          left: tL(minPct),
          right: `calc(14px + (100% - 28px) * ${100 - maxPct} / 100)`,
        }}
      />
      <div className={`${thumbCls} z-20`} style={{ left: tL(minPct) }} />
      <div className={`${thumbCls} z-20`} style={{ left: tL(maxPct) }} />
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
