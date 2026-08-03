"use client";

/**
 * Интерфейс поверх карты генплана: фильтры, легенда с «глазами»,
 * колонка управления, карточка участка, шторка для мобильного.
 *
 * Всё здесь — чистая презентация: состояние живёт в PlotMapDark.
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  LocateFixed,
  Map as MapIcon,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useRef, type ReactNode } from "react";

import { money } from "../shared";
import {
  RESERVED_COLOR,
  tierColor,
  textOn,
  type Filters,
  type Plot,
  type PlotKind,
} from "./types";

/** Стекло панелей — тот же рецепт, что у карточек /v3. */
const GLASS = {
  backdropFilter: "blur(18px) saturate(1.5)",
  WebkitBackdropFilter: "blur(18px) saturate(1.5)",
  background: "linear-gradient(160deg, rgba(14,18,24,0.90), rgba(9,12,16,0.95))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.14), 0 24px 60px -18px rgba(0,0,0,0.85)",
} as const;

const CHIP_BASE =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold transition-colors";

// ─────────────────────────────────────────────────────────────────
// Фильтры
// ─────────────────────────────────────────────────────────────────

export type ChipId = "area" | "price" | "status" | "utp" | null;

export function FilterBar({
  open,
  onOpen,
  filters,
  onChange,
  onReset,
  hasFilters,
  utpOptions,
  matchCount,
}: {
  open: ChipId;
  onOpen: (id: ChipId) => void;
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  hasFilters: boolean;
  utpOptions: string[];
  matchCount: number;
}) {
  const chip = (id: Exclude<ChipId, null>, label: string, on: boolean) => (
    <button
      type="button"
      onClick={() => onOpen(open === id ? null : id)}
      aria-expanded={open === id}
      className={`${CHIP_BASE} ${
        on
          ? "bg-emerald-400 text-[#08120c] shadow-[0_6px_20px_-6px_rgba(52,211,153,0.8)]"
          : "bg-[#0e1218]/85 text-white/80 ring-1 ring-white/12 hover:bg-[#161c25]/90"
      }`}
    >
      {label}
      <ChevronDown
        className={`h-3.5 w-3.5 transition-transform ${open === id ? "rotate-180" : ""}`}
      />
    </button>
  );

  const areaOn = filters.areaMin !== "" || filters.areaMax !== "";
  const priceOn = filters.priceMin !== "" || filters.priceMax !== "";

  return (
    <div className="pointer-events-auto relative">
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {chip("area", "Площадь", areaOn)}
        {chip("price", "Цена", priceOn)}
        {chip("status", "Статус", filters.statuses.length > 0)}
        {utpOptions.length > 0 && chip("utp", "Преимущества", filters.utp.length > 0)}
        {hasFilters && (
          <>
            <button
              type="button"
              onClick={onReset}
              className={`${CHIP_BASE} bg-white/[0.07] text-white/65 ring-1 ring-white/12 hover:text-white`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Сбросить
            </button>
            {/* Счётчик держим в самой строке чипов: выпадашка чипа
                накрывает всё, что под строкой, и результат прятался. */}
            <span
              className={`${CHIP_BASE} bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25`}
            >
              <span className="tabular-nums">{matchCount}</span> подходит
            </span>
          </>
        )}
      </div>

      <AnimatePresence>
        {open === "area" && (
          <Popup key="area" title="Площадь, соток" onClose={() => onOpen(null)}>
            <RangeRow
              from={filters.areaMin}
              to={filters.areaMax}
              onFrom={(v) => onChange({ ...filters, areaMin: v })}
              onTo={(v) => onChange({ ...filters, areaMax: v })}
              placeholderFrom="от"
              placeholderTo="до"
            />
          </Popup>
        )}
        {open === "price" && (
          <Popup key="price" title="Цена участка, млн ₽" onClose={() => onOpen(null)}>
            <RangeRow
              from={filters.priceMin}
              to={filters.priceMax}
              onFrom={(v) => onChange({ ...filters, priceMin: v })}
              onTo={(v) => onChange({ ...filters, priceMax: v })}
              placeholderFrom="от"
              placeholderTo="до"
            />
          </Popup>
        )}
        {open === "status" && (
          <Popup key="status" title="Статус" onClose={() => onOpen(null)}>
            <div className="space-y-1">
              {(
                [
                  ["free", "Свободен"],
                  ["reserved", "Забронирован"],
                ] as [PlotKind, string][]
              ).map(([id, label]) => (
                <CheckRow
                  key={id}
                  label={label}
                  checked={filters.statuses.includes(id)}
                  onToggle={() =>
                    onChange({
                      ...filters,
                      statuses: filters.statuses.includes(id)
                        ? filters.statuses.filter((s) => s !== id)
                        : [...filters.statuses, id],
                    })
                  }
                />
              ))}
            </div>
          </Popup>
        )}
        {open === "utp" && (
          <Popup key="utp" title="Преимущества" onClose={() => onOpen(null)}>
            <div className="max-h-[240px] space-y-1 overflow-y-auto">
              {utpOptions.map((u) => (
                <CheckRow
                  key={u}
                  label={u}
                  checked={filters.utp.includes(u)}
                  onToggle={() =>
                    onChange({
                      ...filters,
                      utp: filters.utp.includes(u)
                        ? filters.utp.filter((x) => x !== u)
                        : [...filters.utp, u],
                    })
                  }
                />
              ))}
            </div>
          </Popup>
        )}
      </AnimatePresence>

    </div>
  );
}

function Popup({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
      className="absolute left-0 top-full z-30 mt-2 w-[268px] rounded-[20px] p-4"
      style={GLASS}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-extrabold text-white/90">{title}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}

function RangeRow({
  from,
  to,
  onFrom,
  onTo,
  placeholderFrom,
  placeholderTo,
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  placeholderFrom: string;
  placeholderTo: string;
}) {
  const cls =
    "h-10 w-full rounded-xl bg-black/35 px-3 text-[13px] font-bold tabular-nums text-white ring-1 ring-white/15 outline-none transition-shadow placeholder:font-normal placeholder:text-white/40 focus:ring-2 focus:ring-emerald-400/70";
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        value={from}
        onChange={(e) => onFrom(e.target.value)}
        placeholder={placeholderFrom}
        aria-label={placeholderFrom}
        className={cls}
      />
      <span className="text-white/30">—</span>
      <input
        type="number"
        inputMode="decimal"
        value={to}
        onChange={(e) => onTo(e.target.value)}
        placeholder={placeholderTo}
        aria-label={placeholderTo}
        className={cls}
      />
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.06]"
    >
      <span
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md transition-colors ${
          checked ? "bg-emerald-400" : "bg-white/[0.06] ring-1 ring-white/20"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-[#08120c]" strokeWidth={3.5} />}
      </span>
      <span className={`text-[13px] ${checked ? "font-bold text-white" : "text-white/70"}`}>
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Легенда
// ─────────────────────────────────────────────────────────────────

export function LegendPanel({
  tiers,
  hidden,
  onToggle,
  counts,
  hasReserved,
  hasSold,
  onClose,
}: {
  tiers: number[];
  hidden: ReadonlySet<number>;
  onToggle: (tier: number) => void;
  counts: number[];
  hasReserved: boolean;
  hasSold: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto w-[248px] rounded-[22px] p-3.5"
      style={GLASS}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-extrabold text-white/90">Цена за сотку</div>
          <div className="mt-0.5 text-[10.5px] leading-tight text-white/45">
            Нажмите, чтобы скрыть участки
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть легенду"
          className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2.5 space-y-0.5">
        {tiers.map((price, i) => {
          const off = hidden.has(i);
          return (
            <button
              key={price}
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={!off}
              title={off ? "Показать участки этой цены" : "Скрыть участки этой цены"}
              className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded-full transition-opacity ${off ? "opacity-25" : ""}`}
                style={{
                  background: tierColor(i),
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.45), 0 0 10px -2px currentColor",
                  color: tierColor(i),
                }}
              />
              <span
                className={`flex-1 text-[12px] font-bold tabular-nums ${
                  off ? "text-white/30 line-through" : "text-white/85"
                }`}
              >
                {money(price)} ₽
              </span>
              {counts[i] > 0 && (
                <span
                  className={`text-[10px] tabular-nums ${off ? "text-white/20" : "text-white/40"}`}
                >
                  {counts[i]}
                </span>
              )}
              {off ? (
                <EyeOff className="h-3.5 w-3.5 shrink-0 text-white/30" />
              ) : (
                <Eye className="h-3.5 w-3.5 shrink-0 text-white/55" />
              )}
            </button>
          );
        })}
      </div>

      {(hasReserved || hasSold) && (
        <>
          <div className="my-2.5 h-px bg-white/10" />
          <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/35">
            Обозначения
          </div>
          <div className="space-y-1.5">
            {hasReserved && (
              <div className="flex items-center gap-2 px-1.5">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{
                    background: RESERVED_COLOR,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.45)",
                  }}
                />
                <span className="text-[12px] text-white/70">Резерв</span>
              </div>
            )}
            {hasSold && (
              <div className="flex items-center gap-2 px-1.5">
                <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] ring-1 ring-white/25">
                  <span className="text-[7px] font-bold leading-none text-white/40">№</span>
                </span>
                <span className="text-[12px] text-white/70">Продан</span>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Колонка управления справа
// ─────────────────────────────────────────────────────────────────

export function ControlRail({
  satellite,
  onToggleBase,
  legendOpen,
  onToggleLegend,
  onZoomIn,
  onZoomOut,
  onLocate,
  onHome,
  locating,
}: {
  satellite: boolean;
  onToggleBase: () => void;
  legendOpen: boolean;
  onToggleLegend: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onHome: () => void;
  locating: boolean;
}) {
  const btn =
    "grid h-10 w-10 place-items-center text-white/75 transition-colors hover:bg-white/[0.12] hover:text-white active:scale-95";
  return (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      <div className="overflow-hidden rounded-[18px]" style={GLASS}>
        <button
          type="button"
          onClick={onToggleBase}
          aria-label={satellite ? "Переключить на схему" : "Переключить на спутник"}
          title={satellite ? "Схема" : "Спутник"}
          className={btn}
        >
          {satellite ? <MapIcon className="h-[18px] w-[18px]" /> : <Layers className="h-[18px] w-[18px]" />}
        </button>
        <div className="mx-2 h-px bg-white/10" />
        <button
          type="button"
          onClick={onToggleLegend}
          aria-label="Легенда"
          aria-pressed={legendOpen}
          title="Легенда"
          className={`${btn} ${legendOpen ? "bg-white/[0.14] text-emerald-300" : ""}`}
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
            <circle cx="6" cy="7" r="2.4" fill="currentColor" />
            <circle cx="6" cy="16" r="2.4" fill="currentColor" />
            <path
              d="M11 7h8M11 16h8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="overflow-hidden rounded-[18px]" style={GLASS}>
        <button type="button" onClick={onZoomIn} aria-label="Приблизить" className={btn}>
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </button>
        <div className="mx-2 h-px bg-white/10" />
        <button type="button" onClick={onZoomOut} aria-label="Отдалить" className={btn}>
          <Minus className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </button>
      </div>

      <div className="overflow-hidden rounded-[18px]" style={GLASS}>
        <button
          type="button"
          onClick={onLocate}
          aria-label="Моё местоположение"
          title="Моё местоположение"
          className={`${btn} ${locating ? "animate-pulse text-emerald-300" : ""}`}
        >
          <LocateFixed className="h-[18px] w-[18px]" />
        </button>
        <div className="mx-2 h-px bg-white/10" />
        <button
          type="button"
          onClick={onHome}
          aria-label="Показать посёлок целиком"
          title="К посёлку"
          className={`${btn} text-emerald-300 hover:text-emerald-200`}
        >
          <Maximize2 className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Карточка участка
// ─────────────────────────────────────────────────────────────────

export function PlotCard({
  plot,
  kind,
  onClose,
  onBook,
  canBook,
}: {
  plot: Plot;
  kind: PlotKind;
  onClose: () => void;
  onBook: () => void;
  canBook: boolean;
}) {
  const accent =
    kind === "free" ? tierColor(plot.priceTier) : kind === "reserved" ? RESERVED_COLOR : "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      // max-h-full: кадр карты теперь считается под пропорции посёлка и в
      // альбомной ориентации бывает низким — карточка обязана в него влезть.
      className="pointer-events-auto max-h-full w-full overflow-y-auto rounded-[22px] p-4 sm:w-[302px]"
      style={GLASS}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-extrabold tabular-nums"
              style={{ background: accent, color: textOn(accent) }}
            >
              {plot.number}
            </span>
            <span className="truncate text-[17px] font-extrabold leading-tight">
              Участок № {plot.number}
            </span>
          </div>
          <span
            className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
              kind === "free"
                ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30"
                : kind === "reserved"
                  ? "bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/30"
                  : "bg-white/[0.07] text-white/50 ring-1 ring-white/12"
            }`}
          >
            {plot.statusName}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть карточку"
          className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {(plot.utp?.length ?? 0) > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {plot.utp!.map((u) => (
            <span
              key={u}
              className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10.5px] font-bold text-white/65 ring-1 ring-white/10"
            >
              {u}
            </span>
          ))}
        </div>
      )}

      <dl className="mt-3 space-y-1.5 text-[13px]">
        {plot.area > 0 && (
          <div className="flex justify-between">
            <dt className="text-white/50">Площадь</dt>
            <dd className="font-bold tabular-nums">{plot.area} сот</dd>
          </div>
        )}
        {plot.pricePerHundred > 0 && (
          <div className="flex justify-between">
            <dt className="text-white/50">Цена сотки</dt>
            <dd className="font-bold tabular-nums">{money(plot.pricePerHundred)} ₽</dd>
          </div>
        )}
        {plot.totalCost > 0 && (
          <div className="flex justify-between">
            <dt className="text-white/50">Стоимость</dt>
            <dd className="text-[15px] font-extrabold tabular-nums text-emerald-300">
              {money(plot.totalCost)} ₽
            </dd>
          </div>
        )}
        {plot.kadastr && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-white/50">Кадастр</dt>
            <dd className="truncate text-[12px] tabular-nums text-white/70">{plot.kadastr}</dd>
          </div>
        )}
      </dl>

      {canBook && (
        <button
          type="button"
          onClick={onBook}
          className="mt-3.5 h-11 w-full rounded-full bg-emerald-500 text-[13px] font-bold text-[#06130c] transition-all hover:-translate-y-0.5 hover:bg-emerald-400"
        >
          Забронировать
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Состояния и шторка
// ─────────────────────────────────────────────────────────────────

/**
 * Мобильная шторка. Карта под ней уже отрисована и показывает генплан —
 * это превью, а не картинка-заглушка. Пока шторка на месте, карта не
 * получает касаний и страница листается как обычно.
 *
 * Осознанно без framer-motion. Появление и уход шторки шли через
 * AnimatePresence, а он снимает узел только по завершении exit-анимации —
 * то есть по rAF. В фоновой или задросселенной вкладке rAF не тикает, и
 * подпись «Коснитесь…» оставалась висеть поверх уже интерактивной карты.
 * Монтирование/размонтирование должно быть детерминированным.
 *
 * Открываем по pointerup рядом с точкой нажатия, а не по click: на телефоне
 * браузер гасит click, если палец сместился на пару пикселей или страница
 * успела прокрутиться, и тап «не срабатывал». Порог в 14px оставляет
 * настоящий свайп-скролл странице — шторка при нём не снимается.
 */
export function TouchGate({ onOpen }: { onOpen: () => void }) {
  const down = useRef<{ x: number; y: number } | null>(null);

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        down.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = down.current;
        down.current = null;
        if (!start) return;
        if (Math.abs(e.clientX - start.x) > 14 || Math.abs(e.clientY - start.y) > 14) return;
        onOpen();
      }}
      onPointerCancel={() => {
        down.current = null;
      }}
      onClick={onOpen}
      className="absolute inset-0 z-40 grid place-items-center bg-[#0b0e13]/35"
      aria-label="Открыть карту"
    >
      <span
        className="rounded-full px-4 py-2.5 text-[13px] font-bold text-white"
        style={GLASS}
      >
        Коснитесь, чтобы открыть карту
      </span>
    </button>
  );
}

export function MapShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-[70svh] max-h-[760px] min-h-[430px] place-items-center rounded-[28px] bg-white/[0.03] p-6 text-center ring-1 ring-white/10 sm:h-[74vh]">
      {children}
    </div>
  );
}

export function MapSkeleton({ label }: { label: string }) {
  return (
    <MapShell>
      <div className="flex flex-col items-center gap-3">
        <span className="relative grid h-11 w-11 place-items-center">
          <span className="absolute inset-0 rounded-full bg-emerald-400/15" />
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
          <MapIcon className="relative h-5 w-5 text-emerald-300" />
        </span>
        <span className="text-[13px] font-bold text-white/55">{label}</span>
      </div>
    </MapShell>
  );
}

export function MapError({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail: string;
  onRetry?: () => void;
}) {
  return (
    <MapShell>
      <div className="max-w-md">
        <p className="text-[15px] font-bold text-white/85">{title}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/50">{detail}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 h-10 rounded-full bg-white/[0.09] px-5 text-[12px] font-bold text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/[0.16]"
          >
            Попробовать ещё раз
          </button>
        )}
      </div>
    </MapShell>
  );
}
