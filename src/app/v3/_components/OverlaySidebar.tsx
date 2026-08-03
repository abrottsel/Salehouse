"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ChevronRight, Navigation, SlidersHorizontal } from "lucide-react";
import {
  money,
  splitStatuses,
  useCountUp,
  STATUS_META,
  type OverlayProps,
  type OverlayVillage,
} from "./shared";

/**
 * Вариант C — «Сайдбар».
 * Карта живёт слева, справа колонка со списком свободных участков и
 * фильтром. Клик по строке подсвечивает участок во фрейме Земекс —
 * в демо это заглушка.
 */

const panel = {
  backdropFilter: "blur(18px) saturate(1.6)",
  background: "linear-gradient(180deg, rgba(16,20,26,0.88) 0%, rgba(11,14,19,0.94) 100%)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 60px -18px rgba(0,0,0,0.85)",
} as const;

/** Демо-строки участков: детерминированно из данных посёлка, без рандома. */
function demoPlots(v: OverlayVillage, count: number) {
  const span = Math.max(1, v.areaTo - v.areaFrom);
  return Array.from({ length: count }, (_, i) => {
    const area = +(v.areaFrom + ((i * 3) % (span + 1))).toFixed(0);
    const perSot = v.priceFrom + (i % 4) * 15000;
    return {
      number: `${12 + i * 7}`,
      area,
      perSot,
      total: area * perSot,
    };
  });
}

export default function OverlaySidebar({ village }: OverlayProps) {
  const s = splitStatuses(village);
  const [maxArea, setMaxArea] = useState(village.areaTo);
  const all = useMemo(() => demoPlots(village, 8), [village]);
  const rows = all.filter((p) => p.area <= maxArea);
  const freeCount = useCountUp(s.free);

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* компактные статусы слева сверху */}
      <motion.div
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto absolute left-4 top-4 flex items-center gap-3 rounded-2xl bg-black/55 px-3.5 py-2.5 backdrop-blur-md ring-1 ring-white/12"
      >
        {STATUS_META.map((m) => (
          <div key={m.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: m.dot }} />
            <span className="text-[12px] text-white/60">{m.label}</span>
            <span className="text-[13px] font-bold tabular-nums">{s[m.key]}</span>
          </div>
        ))}
      </motion.div>

      {/* правая колонка */}
      <motion.aside
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={panel}
        className="pointer-events-auto absolute bottom-4 right-4 top-4 flex w-[330px] max-w-[calc(100%-2rem)] flex-col rounded-[26px] p-4"
      >
        <div className="flex items-baseline justify-between">
          <h3 className="text-[17px] font-extrabold">{village.name}</h3>
          <span className="text-[12px] text-white/50">
            {village.direction}, {village.distance} км
          </span>
        </div>
        <p className="mt-1 text-[13px] text-white/60">
          <b className="text-emerald-300">{freeCount}</b> свободных из {s.total} · от{" "}
          {money(village.priceFrom)} ₽/сот
        </p>

        <div className="mt-4 rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-bold text-white/70">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            До {maxArea} соток
          </div>
          <input
            type="range"
            min={village.areaFrom}
            max={village.areaTo}
            value={maxArea}
            onChange={(e) => setMaxArea(+e.target.value)}
            aria-label="Максимальная площадь участка"
            className="w-full accent-emerald-400"
          />
        </div>

        <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {rows.map((p) => (
            <button
              key={p.number}
              className="group flex w-full items-center justify-between rounded-2xl bg-white/[0.04] px-3.5 py-2.5 text-left ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.10]"
            >
              <div>
                <div className="text-[14px] font-bold">
                  Участок № {p.number}
                  <span className="ml-2 text-[12px] font-medium text-white/50">{p.area} сот</span>
                </div>
                <div className="text-[12px] text-white/55">{money(p.total)} ₽</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
          {rows.length === 0 && (
            <p className="px-1 py-6 text-center text-[13px] text-white/45">
              Под этот размер сейчас ничего нет
            </p>
          )}
        </div>

        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/[0.08] text-[13px] font-bold ring-1 ring-white/15 transition-colors hover:bg-white/[0.14]">
            <Navigation className="h-4 w-4 text-emerald-300" />
            Дорога к мечте
          </button>
          <button className="h-11 w-full rounded-full bg-emerald-500 text-[13px] font-bold transition-colors hover:bg-emerald-400">
            Забронировать
          </button>
          <p className="text-center text-[11px] leading-tight text-white/35">
            список и бронь — из системы Земекс
          </p>
        </div>
      </motion.aside>
    </div>
  );
}
