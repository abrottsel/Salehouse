"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gauge, MapPin, RotateCcw, Ruler, SlidersHorizontal, Wallet, X } from "lucide-react";
import { glassStyle } from "../ui/primitives";
import {
  AREA_PRESETS,
  DIRECTIONS,
  PRICE_PRESETS,
  READINESS_PRESETS,
  activeFilterCount,
  shortDirection,
  villagesWord,
  type CatalogFilters,
} from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

/** На слабых устройствах blur убираем, поэтому подложку делаем плотнее. */
function panelStyle(lite: boolean): CSSProperties {
  if (!lite) return glassStyle;
  return {
    background: "linear-gradient(160deg, rgba(18,23,30,0.97), rgba(10,13,18,0.99))",
    boxShadow: glassStyle.boxShadow,
  };
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-3.5 text-[12px] font-bold transition-colors ${
        active
          ? "bg-emerald-500 text-[#06120c] shadow-[0_8px_20px_-10px_rgba(16,185,129,0.9)]"
          : "bg-white/[0.06] text-white/65 ring-1 ring-white/10 hover:bg-white/[0.12] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function GroupIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/20">
      {children}
    </span>
  );
}

function ResetButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold transition-colors ${
        disabled
          ? "cursor-default text-white/20"
          : "bg-white/[0.06] text-white/70 ring-1 ring-white/10 hover:bg-white/[0.12] hover:text-white"
      }`}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Сбросить
    </button>
  );
}

export interface FilterPanelProps {
  filters: CatalogFilters;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onReset: () => void;
  /** Сколько посёлков подходит прямо сейчас. */
  found: number;
  lite: boolean;
}

export default function FilterPanel({ filters, onChange, onReset, found, lite }: FilterPanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = activeFilterCount(filters);

  // Шторка живёт только на мобайле. Если её не закрыть при переходе на
  // десктоп, она станет lg:hidden, а замок скролла останется висеть.
  useEffect(() => {
    if (!sheetOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setSheetOpen(false);
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [sheetOpen]);

  const toggle = (key: "price" | "area" | "readiness", id: string) =>
    onChange({ [key]: filters[key] === id ? null : id });

  const directionChips = DIRECTIONS.map((dir) => (
    <Chip
      key={dir}
      active={filters.direction === dir}
      onClick={() => onChange({ direction: dir })}
    >
      {shortDirection(dir)}
    </Chip>
  ));

  const priceChips = PRICE_PRESETS.map((p) => (
    <Chip key={p.id} active={filters.price === p.id} onClick={() => toggle("price", p.id)}>
      {p.label}
    </Chip>
  ));

  const areaChips = AREA_PRESETS.map((a) => (
    <Chip key={a.id} active={filters.area === a.id} onClick={() => toggle("area", a.id)}>
      {a.label}
    </Chip>
  ));

  const readinessChips = READINESS_PRESETS.map((r) => (
    <Chip key={r.id} active={filters.readiness === r.id} onClick={() => toggle("readiness", r.id)}>
      {r.label}
    </Chip>
  ));

  const foundLabel = `Найдено ${found} ${villagesWord(found)}`;

  return (
    <>
      {/* ─── Десктоп: липкая стеклянная панель ─── */}
      <div className="sticky top-[80px] z-30 hidden lg:block">
        <div className="rounded-[22px] p-3" style={panelStyle(lite)}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <GroupIcon>
                <MapPin className="h-4 w-4" strokeWidth={2.4} />
              </GroupIcon>
              <div className="flex flex-wrap items-center gap-1.5">{directionChips}</div>
            </div>

            <div className="flex items-center gap-2">
              <GroupIcon>
                <Gauge className="h-4 w-4" strokeWidth={2.4} />
              </GroupIcon>
              <div className="flex flex-wrap items-center gap-1.5">{readinessChips}</div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span
                aria-live="polite"
                className="inline-flex h-9 items-center rounded-full bg-emerald-400/12 px-3.5 text-[12px] font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-400/25"
              >
                {foundLabel}
              </span>
              <ResetButton disabled={active === 0} onClick={onReset} />
            </div>
          </div>

          {/* Без вертикальных разделителей: при переносе строки они
              повисают в конце ряда «висячей палкой». Группы разделяют иконки. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-2.5">
            <div className="flex items-center gap-2">
              <GroupIcon>
                <Wallet className="h-4 w-4" strokeWidth={2.4} />
              </GroupIcon>
              <div className="flex flex-wrap items-center gap-1.5">{priceChips}</div>
            </div>

            <div className="flex items-center gap-2">
              <GroupIcon>
                <Ruler className="h-4 w-4" strokeWidth={2.4} />
              </GroupIcon>
              <div className="flex flex-wrap items-center gap-1.5">{areaChips}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Мобайл: одна кнопка вместо панели ─── */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex h-12 flex-1 items-center gap-2.5 rounded-2xl bg-white/[0.06] px-4 text-[14px] font-bold ring-1 ring-white/12 transition-colors active:bg-white/[0.12]"
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-emerald-300" />
          Фильтры
          {active > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-extrabold text-[#06120c]">
              {active}
            </span>
          )}
        </button>
        <span
          aria-live="polite"
          className="inline-flex h-12 shrink-0 items-center rounded-2xl bg-emerald-400/12 px-4 text-[13px] font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-400/25"
        >
          {found} {villagesWord(found)}
        </span>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="filters-backdrop"
            className="fixed inset-0 z-[60] bg-black/65 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: lite ? 0.12 : 0.25 }}
            onClick={() => setSheetOpen(false)}
          />
        )}
        {sheetOpen && (
          <motion.div
            key="filters-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Фильтры каталога"
            className="v3-scroll fixed inset-x-0 bottom-0 z-[61] max-h-[86vh] overflow-y-auto rounded-t-[26px] px-4 pb-5 pt-3 lg:hidden"
            style={panelStyle(lite)}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: lite ? 0.16 : 0.34, ease: EASE }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[19px] font-extrabold">Фильтры</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Закрыть фильтры"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] ring-1 ring-white/12"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SheetGroup icon={<MapPin className="h-4 w-4" strokeWidth={2.4} />} title="Направление">
              {directionChips}
            </SheetGroup>
            <SheetGroup icon={<Wallet className="h-4 w-4" strokeWidth={2.4} />} title="Цена за сотку">
              {priceChips}
            </SheetGroup>
            <SheetGroup icon={<Ruler className="h-4 w-4" strokeWidth={2.4} />} title="Площадь участка">
              {areaChips}
            </SheetGroup>
            <SheetGroup icon={<Gauge className="h-4 w-4" strokeWidth={2.4} />} title="Готовность посёлка">
              {readinessChips}
            </SheetGroup>

            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
              <ResetButton disabled={active === 0} onClick={onReset} />
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-emerald-500 px-5 text-[14px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] active:scale-[0.98]"
              >
                Показать {found} {villagesWord(found)}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SheetGroup({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center gap-2">
        <GroupIcon>{icon}</GroupIcon>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </section>
  );
}
