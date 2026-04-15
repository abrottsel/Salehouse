"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import RangeSlider from "../RangeSlider";

/* ─────────────────────── filter chip (popover button) ─────────────────────── */

export interface FilterChipProps {
  label: string;
  value: string | null;
  placeholder: string;
  active: boolean;
  compact?: boolean;
  children: (close: () => void) => React.ReactNode;
}

export function FilterChip({
  label,
  value,
  placeholder,
  active,
  compact = false,
  children,
}: FilterChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Compact variant matches the /v2 thin chip row
  const buttonCls = compact
    ? `inline-flex items-center gap-1 h-7 px-3 rounded-full text-[11px] font-semibold transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm shadow-emerald-900/20 ring-1 ring-emerald-700/20"
          : "bg-white text-emerald-900/80 ring-1 ring-emerald-200/70 hover:bg-emerald-50 hover:ring-emerald-300"
      } ${open ? "ring-2 ring-emerald-300" : ""}`
    : `group inline-flex items-center gap-2 h-10 pl-4 pr-3 rounded-full border text-sm font-medium transition-all ${
        active
          ? "bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
      } ${open ? "ring-2 ring-green-200" : ""}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={buttonCls}
      >
        {compact ? (
          <>
            <span>{value ?? label}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                open ? "rotate-180" : ""
              } ${active ? "text-white/80" : "text-emerald-700/60"}`}
            />
          </>
        ) : (
          <>
            <span
              className={`text-xs ${active ? "text-green-600" : "text-gray-400"}`}
            >
              {label}:
            </span>
            <span className="font-semibold whitespace-nowrap">
              {value ?? placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                open ? "rotate-180" : ""
              } ${active ? "text-green-600" : "text-gray-400"}`}
            />
          </>
        )}
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="sm:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Popover */}
          <div
            className={
              "sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-full sm:mt-2 " +
              "fixed sm:static inset-x-3 bottom-3 sm:inset-auto " +
              "z-50 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 " +
              "overflow-hidden animate-in fade-in slide-in-from-bottom-2 sm:slide-in-from-top-1 duration-150"
            }
          >
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────── range filter w/ inputs ─────────────────────── */

export interface RangeFilterProps {
  label: string;
  suffix: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format?: (n: number) => string;
  parse?: (s: string) => number;
}

export function RangeFilter({
  label,
  suffix,
  min,
  max,
  step,
  value,
  onChange,
  format = (n) => String(n),
  parse = (s) => Number(s.replace(/\s/g, "").replace(",", ".")),
}: RangeFilterProps) {
  const [minDraft, setMinDraft] = useState<string>(format(value[0]));
  const [maxDraft, setMaxDraft] = useState<string>(format(value[1]));

  useEffect(() => {
    setMinDraft(format(value[0]));
    setMaxDraft(format(value[1]));
  }, [value, format]);

  const commitMin = () => {
    const parsed = parse(minDraft);
    if (!isFinite(parsed)) {
      setMinDraft(format(value[0]));
      return;
    }
    const clamped = Math.max(min, Math.min(parsed, value[1] - step));
    onChange([clamped, value[1]]);
    setMinDraft(format(clamped));
  };

  const commitMax = () => {
    const parsed = parse(maxDraft);
    if (!isFinite(parsed)) {
      setMaxDraft(format(value[1]));
      return;
    }
    const clamped = Math.min(max, Math.max(parsed, value[0] + step));
    onChange([value[0], clamped]);
    setMaxDraft(format(clamped));
  };

  return (
    <div className="p-4 w-full sm:w-[340px]">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">
        {label}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <NumberField
          aria-label="От"
          prefix="от"
          suffix={suffix}
          value={minDraft}
          onChange={setMinDraft}
          onCommit={commitMin}
        />
        <div className="text-gray-300 shrink-0 text-xs">—</div>
        <NumberField
          aria-label="До"
          prefix="до"
          suffix={suffix}
          value={maxDraft}
          onChange={setMaxDraft}
          onCommit={commitMax}
        />
      </div>

      <RangeSlider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function NumberField({
  prefix,
  suffix,
  value,
  onChange,
  onCommit,
  ...rest
}: {
  prefix: string;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
} & React.AriaAttributes) {
  return (
    <label
      className="flex-1 min-w-0 flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:border-green-500 focus-within:bg-white transition-colors cursor-text"
      {...rest}
    >
      <span className="text-[10px] uppercase tracking-wider text-gray-400 shrink-0">
        {prefix}
      </span>
      <input
        type="text"
        inputMode="decimal"
        size={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="flex-1 min-w-0 w-full bg-transparent outline-none text-sm font-semibold text-gray-900 text-right tabular-nums"
      />
      <span className="text-[10px] text-gray-400 shrink-0">{suffix}</span>
    </label>
  );
}
