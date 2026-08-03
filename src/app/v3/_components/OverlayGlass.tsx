"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin, Navigation, Search, X } from "lucide-react";
import {
  glass,
  money,
  splitStatuses,
  useCountUp,
  STATUS_META,
  type OverlayProps,
} from "./shared";

/**
 * Вариант A — «Стеклянный HUD».
 * Слои разнесены по углам, карта в центре открыта. Контейнер не ловит
 * клики (pointer-events-none) — кликается только сама панель.
 */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

function StatRow({ label, dot, value }: { label: string; dot: string; value: number }) {
  const n = useCountUp(value);
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="flex items-center gap-2 text-[13px] text-white/70">
        <span className="h-2 w-2 rounded-full" style={{ background: dot, boxShadow: `0 0 10px ${dot}` }} />
        {label}
      </span>
      <span className="text-[15px] font-bold tabular-nums text-white">{n}</span>
    </div>
  );
}

export default function OverlayGlass({ village }: OverlayProps) {
  const s = splitStatuses(village);
  const [addressOpen, setAddressOpen] = useState(false);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="pointer-events-none absolute inset-0 z-30 p-3 sm:p-5"
    >
      {/* ── слева сверху: статус-борд ───────────────────────────── */}
      <motion.div
        variants={item}
        style={glass}
        className="pointer-events-auto absolute left-3 top-3 w-[212px] rounded-[22px] p-4 sm:left-5 sm:top-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-300" />
          <span className="truncate text-[15px] font-extrabold">{village.name}</span>
        </div>
        <div className="space-y-2.5">
          {STATUS_META.map((m) => (
            <StatRow key={m.key} label={m.label} dot={m.dot} value={s[m.key]} />
          ))}
        </div>
        <div className="mt-3.5 border-t border-white/12 pt-3 text-[11px] leading-tight text-white/45">
          статусы и бронь — из системы Земекс
        </div>
      </motion.div>

      {/* ── справа сверху: «Дорога к мечте» ─────────────────────── */}
      <motion.div variants={item} className="pointer-events-auto absolute right-3 top-3 sm:right-5 sm:top-5">
        {!addressOpen ? (
          <button
            onClick={() => setAddressOpen(true)}
            style={glass}
            className="flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition-transform active:scale-95"
          >
            <Navigation className="h-4 w-4 text-emerald-300" />
            Дорога к мечте
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={glass}
            className="w-[268px] rounded-[22px] p-4"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="text-[14px] font-extrabold">Дорога к мечте</div>
                <div className="text-[11px] text-white/60">Сколько ехать от вашего дома</div>
              </div>
              <button
                onClick={() => setAddressOpen(false)}
                aria-label="Закрыть"
                className="-mr-1 -mt-1 grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 ring-1 ring-white/25">
              <Search className="h-4 w-4 shrink-0 text-white/60" />
              <input
                placeholder="Москва, Тверская, 1"
                className="h-10 w-full bg-transparent text-[13px] outline-none placeholder:text-white/50"
              />
            </div>
            <button className="mt-2.5 h-10 w-full rounded-full bg-emerald-500 text-[13px] font-bold text-white transition-colors hover:bg-emerald-400">
              Построить маршрут
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* ── снизу: цена и действие ──────────────────────────────── */}
      <motion.div
        variants={item}
        style={glass}
        className="pointer-events-auto absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[22px] px-4 py-3 sm:bottom-5 sm:left-5 sm:right-auto sm:pr-3"
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Цена</div>
          <div className="text-[17px] font-extrabold leading-tight">
            от {money(village.priceFrom)} <span className="text-[12px] font-semibold text-white/60">₽/сот</span>
          </div>
        </div>
        <div className="h-8 w-px bg-white/15" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Площадь</div>
          <div className="text-[17px] font-extrabold leading-tight">
            {village.areaFrom}–{village.areaTo} <span className="text-[12px] font-semibold text-white/60">сот</span>
          </div>
        </div>
        <button className="ml-auto h-11 shrink-0 rounded-full bg-emerald-500 px-5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-400">
          Выбрать участок на карте
        </button>
      </motion.div>
    </motion.div>
  );
}
