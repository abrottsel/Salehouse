"use client";

import { useCallback } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

/**
 * Dual-thumb range slider built from two overlaid native <input type="range">.
 * Pointer events on the track are disabled; only the thumbs are interactive,
 * so both handles can be grabbed independently even when they overlap.
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

  // Tailwind 4 arbitrary modifiers for native range thumbs
  const thumbStyles =
    "appearance-none bg-transparent pointer-events-none absolute w-full h-2 " +
    "[&::-webkit-slider-thumb]:appearance-none " +
    "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white " +
    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-green-600 " +
    "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-webkit-slider-thumb]:pointer-events-auto " +
    "[&::-webkit-slider-thumb]:transition-transform " +
    "[&::-webkit-slider-thumb]:hover:scale-110 " +
    "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 " +
    "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white " +
    "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-green-600 " +
    "[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:pointer-events-auto";

  return (
    <div className="relative h-5 select-none">
      {/* Track background */}
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-gray-200 rounded-full" />
      {/* Selected range */}
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 bg-green-600 rounded-full"
        style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
      />
      {/* Min thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMin}
        aria-label="Минимум"
        className={`${thumbStyles} top-1/2 -translate-y-1/2 z-20`}
      />
      {/* Max thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMax}
        aria-label="Максимум"
        className={`${thumbStyles} top-1/2 -translate-y-1/2 z-30`}
      />
    </div>
  );
}
