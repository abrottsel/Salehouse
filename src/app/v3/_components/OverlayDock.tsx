"use client";

import { motion } from "framer-motion";
import { Navigation, Ruler, Wallet } from "lucide-react";
import {
  money,
  splitStatuses,
  useCountUp,
  STATUS_META,
  type OverlayProps,
} from "./shared";

/**
 * Вариант B — «Док».
 * Карта не закрыта ничем, весь интерфейс собран в одну плавающую панель
 * снизу. Наверху только компактный чип с названием.
 */

const dock = {
  backdropFilter: "blur(20px) saturate(1.7)",
  background: "linear-gradient(180deg, rgba(18,22,28,0.82) 0%, rgba(12,15,20,0.92) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.14), 0 24px 60px -16px rgba(0,0,0,0.8)",
} as const;

function Pill({ label, dot, value }: { label: string; dot: string; value: number }) {
  const n = useCountUp(value);
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 ring-1 ring-white/10">
      <span className="h-2 w-2 rounded-full" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />
      <span className="text-[12px] text-white/65">{label}</span>
      <span className="text-[14px] font-bold tabular-nums">{n}</span>
    </div>
  );
}

export default function OverlayDock({ village }: OverlayProps) {
  const s = splitStatuses(village);

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* чип названия */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2 text-[13px] font-bold backdrop-blur-md ring-1 ring-white/15"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
        {village.name}
        <span className="font-medium text-white/45">
          · {village.direction}, {village.distance} км
        </span>
      </motion.div>

      {/* док */}
      <motion.div
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={dock}
        className="pointer-events-auto absolute bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-[880px] -translate-x-1/2 rounded-[26px] p-3.5 sm:p-4"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {STATUS_META.map((m) => (
            <Pill key={m.key} label={m.label} dot={m.dot} value={s[m.key]} />
          ))}

          <div className="mx-1 hidden h-7 w-px bg-white/12 sm:block" />

          <div className="flex items-center gap-1.5 text-[13px] text-white/75">
            <Wallet className="h-4 w-4 text-white/45" />
            от <b className="text-white">{money(village.priceFrom)}</b> ₽/сот
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-white/75">
            <Ruler className="h-4 w-4 text-white/45" />
            {village.areaFrom}–{village.areaTo} сот
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="flex h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-[13px] font-bold ring-1 ring-white/15 transition-colors hover:bg-white/[0.14]">
              <Navigation className="h-4 w-4 text-emerald-300" />
              <span className="hidden sm:inline">Дорога к мечте</span>
            </button>
            <button className="h-11 rounded-full bg-emerald-500 px-5 text-[13px] font-bold transition-all hover:-translate-y-0.5 hover:bg-emerald-400">
              Забронировать
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-[11px] text-white/40">
          <span className="h-1 w-1 rounded-full bg-white/40" />
          статусы, цены и бронирование — из системы Земекс, обновляются автоматически
        </div>
      </motion.div>
    </div>
  );
}
