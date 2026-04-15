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
 * Variant D — Large pill thumb. Green with white inner ring.
 * Bold, touch-friendly (28px), hard to miss.
 */
export default function SliderD({
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
    "appearance-none bg-transparent absolute inset-x-0 w-full h-8 top-0 " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer";

  const tL = (pct: number) => `calc(16px + (100% - 32px) * ${pct} / 100)`;

  // Green disc with inner white ring (like iOS/Tailwind Plus)
  const thumbCls =
    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full " +
    "bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.25)] pointer-events-none";

  return (
    <div className="relative h-8 select-none">
      <div
        className="absolute top-1/2 h-2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
        style={{
          left: tL(minPct),
          right: `calc(16px + (100% - 32px) * ${100 - maxPct} / 100)`,
        }}
      />
      <div className={`${thumbCls} z-20`} style={{ left: tL(minPct) }}>
        <div className="w-2 h-2 rounded-full bg-white/80" />
      </div>
      <div className={`${thumbCls} z-20`} style={{ left: tL(maxPct) }}>
        <div className="w-2 h-2 rounded-full bg-white/80" />
      </div>
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
