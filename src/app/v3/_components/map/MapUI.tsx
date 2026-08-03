"use client";

/**
 * Интерфейс поверх карты генплана: верхняя панель, фильтры, легенда,
 * колонка управления, карточка участка, превью для мобильного.
 *
 * Геометрия снята с генплана Земекс на 430×932 и повторена один в один:
 * круглые кнопки 48×48, вертикальный шаг колонки 60, отступы 12–14,
 * чип «Фильтры» 134×48 со шрифтом 16/600, кнопка навигации 52×52,
 * кнопка-«ещё» 38×38. Оформление наше: тёмное стекло вместо их белых
 * кнопок, изумрудный акцент вместо их зелёного, скругления панелей
 * 24–28px вместо их 20.
 *
 * Всё здесь — чистая презентация: состояние живёт в PlotMapDark.
 */

import { motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Layers,
  LocateFixed,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Minus,
  Home,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { glassStyle } from "../ui/primitives";
import { money } from "../shared";
import {
  RESERVED_COLOR,
  SOLD_COLOR,
  textOn,
  TIER_COLORS,
  type Filters,
  type Plot,
  type PlotKind,
} from "./types";

/** Стекло панелей. Тени глубже, чем у прототипа: подложка светлая. */
const GLASS: CSSProperties = {
  ...glassStyle,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -0.5px 0 rgba(255,255,255,0.05), 0 10px 28px -6px rgba(3,8,19,0.45)",
};

/** Шаг колонки управления у Земекс — 60px при кнопке 48. */
const RAIL_GAP = 12;

// ─────────────────────────────────────────────────────────────────
// Круглая кнопка карты
// ─────────────────────────────────────────────────────────────────

export function MapRoundButton({
  size = 48,
  tone = "glass",
  active = false,
  label,
  title,
  onClick,
  children,
}: {
  size?: number;
  tone?: "glass" | "accent" | "dim";
  active?: boolean;
  label: string;
  title?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const style: CSSProperties =
    tone === "accent"
      ? {
          width: size,
          height: size,
          background: "#10b981",
          color: "#04140c",
          boxShadow: "0 4px 16px rgba(16,185,129,0.45)",
        }
      : tone === "dim"
        ? {
            width: size,
            height: size,
            background: "rgba(10,16,26,0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 6px 18px rgba(3,8,19,0.28)",
          }
        : { width: size, height: size, ...GLASS };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title ?? label}
      className={`grid shrink-0 place-items-center rounded-full transition-transform active:scale-95 ${
        tone === "accent"
          ? ""
          : active
            ? "text-emerald-300"
            : "text-white/80 hover:text-white"
      }`}
      style={style}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Фильтры: чип 134×48 + панель
// ─────────────────────────────────────────────────────────────────

export function FilterChip({
  open,
  active,
  onClick,
}: {
  open: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-[16px] font-semibold transition-colors"
      style={{
        width: 134,
        height: 48,
        ...(active
          ? {
              background: "#10b981",
              color: "#04140c",
              boxShadow: "0 4px 16px rgba(16,185,129,0.45)",
            }
          : { ...GLASS, color: "rgba(255,255,255,0.9)" }),
      }}
    >
      <SlidersHorizontal className="h-[18px] w-[18px]" />
      Фильтры
    </button>
  );
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  hasFilters,
  utpOptions,
  matchCount,
  onClose,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  hasFilters: boolean;
  utpOptions: string[];
  matchCount: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.99 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto flex max-h-full w-full flex-col overflow-hidden rounded-[28px] sm:w-[340px]"
      style={GLASS}
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <span className="text-[15px] font-extrabold text-white/90">Фильтры</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть фильтры"
          className="-mr-1 grid h-9 w-9 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3">
        <Group title="Площадь, соток">
          <RangeRow
            from={filters.areaMin}
            to={filters.areaMax}
            onFrom={(v) => onChange({ ...filters, areaMin: v })}
            onTo={(v) => onChange({ ...filters, areaMax: v })}
          />
        </Group>

        <Group title="Цена участка, млн ₽">
          <RangeRow
            from={filters.priceMin}
            to={filters.priceMax}
            onFrom={(v) => onChange({ ...filters, priceMin: v })}
            onTo={(v) => onChange({ ...filters, priceMax: v })}
          />
        </Group>

        <Group title="Статус">
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
        </Group>

        {utpOptions.length > 0 && (
          <Group title="Преимущества">
            <div className="space-y-1">
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
          </Group>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-5 py-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white/[0.07] px-4 text-[13px] font-bold text-white/70 ring-1 ring-white/12 transition-colors hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Сбросить
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="h-11 flex-1 rounded-full bg-emerald-500 text-[14px] font-bold text-[#04140c] transition-colors hover:bg-emerald-400"
        >
          Показать <span className="tabular-nums">{matchCount}</span>
        </button>
      </div>
    </motion.div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
        {title}
      </div>
      {children}
    </div>
  );
}

function RangeRow({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  const cls =
    "h-11 w-full rounded-2xl bg-black/35 px-3 text-[14px] font-bold tabular-nums text-white ring-1 ring-white/15 outline-none transition-shadow placeholder:font-normal placeholder:text-white/40 focus:ring-2 focus:ring-emerald-400/70";
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        value={from}
        onChange={(e) => onFrom(e.target.value)}
        placeholder="от"
        aria-label="от"
        className={cls}
      />
      <span className="text-white/30">—</span>
      <input
        type="number"
        inputMode="decimal"
        value={to}
        onChange={(e) => onTo(e.target.value)}
        placeholder="до"
        aria-label="до"
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
      className="flex w-full items-center gap-2.5 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
    >
      <span
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md transition-colors ${
          checked ? "bg-emerald-400" : "bg-white/[0.06] ring-1 ring-white/20"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-[#08120c]" strokeWidth={3.5} />}
      </span>
      <span className={`text-[14px] ${checked ? "font-bold text-white" : "text-white/70"}`}>
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Иконка дома на проданном участке
// ─────────────────────────────────────────────────────────────────

/**
 * У эталона на каждом проданном участке нарисован домик — сразу видно,
 * что там уже построились. Форма нарочно грубая: на общем плане клетка
 * участка 10–11px, тонкие детали в ней превращаются в кашу.
 */
export function HouseGlyph({
  size,
  muted = false,
  fill = "#d3dae4",
  stroke = "#8d99ab",
  opacity = 1,
}: {
  size: number;
  muted?: boolean;
  /** Цвета задаёт скин карты — на кремовой подложке серый домик выпадает. */
  fill?: string;
  stroke?: string;
  opacity?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="block"
      style={{
        opacity,
        filter: muted ? "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" : "none",
      }}
    >
      <path
        d="M12 3 22 11.2h-3.2V21H5.2v-9.8H2z"
        fill={muted ? "rgba(255,255,255,0.72)" : fill}
        stroke={muted ? "rgba(15,23,42,0.55)" : stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
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
  palette = TIER_COLORS,
}: {
  tiers: number[];
  hidden: ReadonlySet<number>;
  onToggle: (tier: number) => void;
  counts: number[];
  hasReserved: boolean;
  hasSold: boolean;
  onClose: () => void;
  /** Палитра активного скина карты — легенда обязана совпадать с картой. */
  palette?: readonly string[];
}) {
  const ink = (i: number) => palette[i % palette.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto w-[252px] rounded-[24px] p-3.5"
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
              className="flex w-full items-center gap-2 rounded-xl px-1.5 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded-full transition-opacity ${off ? "opacity-25" : ""}`}
                style={{
                  background: ink(i),
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.55)",
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
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.55)",
                  }}
                />
                <span className="text-[12px] text-white/70">Бронь</span>
              </div>
            )}
            {hasSold && (
              <div className="flex items-center gap-2 px-1.5">
                {/* Серая клетка с домиком — ровно то, что видно на карте. */}
                <span
                  className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px]"
                  style={{
                    background: "rgba(148,163,184,0.45)",
                    boxShadow: `0 0 0 1px ${SOLD_COLOR}`,
                  }}
                >
                  <HouseGlyph size={11} />
                </span>
                <span className="text-[12px] text-white/70">Продан, построен дом</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-1.5">
              {/* Кольцо, а не диск: так группа отличается от точки участка. */}
              <span
                className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full"
                style={{
                  background: "conic-gradient(from -90deg, #e66b19 0% 50%, #19dae6 50% 100%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.55)",
                }}
              >
                <span className="block h-[5px] w-[5px] rounded-full bg-white" />
              </span>
              <span className="text-[12px] text-white/70">
                Несколько участков рядом — нажмите
              </span>
            </div>
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
  onZoomIn,
  onZoomOut,
  onLocate,
  onHome,
  fullscreen,
  onToggleFullscreen,
  locating,
}: {
  satellite: boolean;
  onToggleBase: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onHome: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  locating: boolean;
}) {
  return (
    <div
      className="pointer-events-auto flex flex-col items-center"
      style={{ gap: RAIL_GAP }}
    >
      <MapRoundButton label="Приблизить" onClick={onZoomIn}>
        <Plus className="h-[20px] w-[20px]" strokeWidth={2.4} />
      </MapRoundButton>
      <MapRoundButton label="Отдалить" onClick={onZoomOut}>
        <Minus className="h-[20px] w-[20px]" strokeWidth={2.4} />
      </MapRoundButton>
      <MapRoundButton
        label={satellite ? "Переключить на схему" : "Переключить на спутник"}
        title={satellite ? "Схема" : "Спутник"}
        onClick={onToggleBase}
        active={satellite}
      >
        {satellite ? (
          <MapIcon className="h-[20px] w-[20px]" />
        ) : (
          <Layers className="h-[20px] w-[20px]" />
        )}
      </MapRoundButton>
      <MapRoundButton label="Показать посёлок целиком" title="К посёлку" onClick={onHome}>
        <Home className="h-[20px] w-[20px]" />
      </MapRoundButton>
      <MapRoundButton
        size={52}
        tone="accent"
        label="Моё местоположение"
        onClick={onLocate}
      >
        <LocateFixed className={`h-[21px] w-[21px] ${locating ? "animate-pulse" : ""}`} />
      </MapRoundButton>
      <MapRoundButton
        size={38}
        tone="dim"
        label={fullscreen ? "Выйти из полноэкранной карты" : "Открыть на весь экран"}
        onClick={onToggleFullscreen}
      >
        {fullscreen ? (
          <Minimize2 className="h-[16px] w-[16px] text-white/85" />
        ) : (
          <Maximize2 className="h-[16px] w-[16px] text-white/85" />
        )}
      </MapRoundButton>
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
  palette = TIER_COLORS,
}: {
  plot: Plot;
  kind: PlotKind;
  onClose: () => void;
  onBook: () => void;
  canBook: boolean;
  /** Палитра активного скина карты — цвет в карточке равен цвету точки. */
  palette?: readonly string[];
}) {
  const accent =
    kind === "free"
      ? palette[plot.priceTier % palette.length]
      : kind === "reserved"
        ? RESERVED_COLOR
        : "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto max-h-full w-full overflow-y-auto rounded-[28px] p-4 sm:w-[320px]"
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
          className="mt-3.5 h-12 w-full rounded-full bg-emerald-500 text-[14px] font-bold text-[#06130c] transition-all hover:-translate-y-0.5 hover:bg-emerald-400"
        >
          Забронировать
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Состояния и превью
// ─────────────────────────────────────────────────────────────────

/**
 * Превью на телефоне. Карта под ним уже отрисована и показывает генплан,
 * но касаний не получает — страница листается как обычно. Тап открывает
 * полноэкранный режим, как «Смотреть генплан» у Земекс.
 *
 * Осознанно без framer-motion. Появление и уход шли через AnimatePresence,
 * а он снимает узел только по завершении exit-анимации — то есть по rAF.
 * В фоновой или задросселенной вкладке rAF не тикает, и подпись оставалась
 * висеть поверх уже интерактивной карты.
 *
 * Открываем по pointerup рядом с точкой нажатия, а не по click: на телефоне
 * браузер гасит click, если палец сместился на пару пикселей или страница
 * успела прокрутиться, и тап «не срабатывал». Порог в 14px оставляет
 * настоящий свайп-скролл странице.
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
      className="absolute inset-0 z-40 flex items-end justify-center bg-[#0b0e13]/12 pb-16"
      aria-label="Открыть карту на весь экран"
    >
      <span
        className="inline-flex items-center gap-2 rounded-full px-5 text-[15px] font-bold text-white"
        style={{ height: 48, ...GLASS }}
      >
        <Maximize2 className="h-[18px] w-[18px]" />
        Смотреть генплан
      </span>
    </button>
  );
}

/** Каркас пустых состояний. Габариты те же, что у карты, — без скачка вёрстки. */
export function MapShell({ children }: { children: ReactNode }) {
  return (
    <div className="ml-[calc(50%-50vw)] grid h-[100svh] w-screen place-items-center bg-white/[0.03] px-6 text-center ring-1 ring-white/10 sm:ml-0 sm:h-[min(calc(100svh-56px),860px)] sm:min-h-[520px] sm:w-full sm:rounded-[28px]">
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
            className="mt-4 h-11 rounded-full bg-white/[0.09] px-5 text-[13px] font-bold text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/[0.16]"
          >
            Попробовать ещё раз
          </button>
        )}
      </div>
    </MapShell>
  );
}
