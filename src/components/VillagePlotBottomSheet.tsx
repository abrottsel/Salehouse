"use client";

/**
 * VillagePlotBottomSheet — compact bottom sheet (Yandex-Maps-style).
 *
 * Collapsed state takes ~35% of map height — enough for header + stats
 * + CTAs in a single glance without hiding the map. Expanding reveals
 * the hidden-fees breakdown.
 *
 * On desktop (lg+) the header and stats are laid out horizontally to
 * use the wide sheet width efficiently.
 */

import { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
  ExternalLink,
  Banknote,
} from "lucide-react";
import FavoriteHeart from "./FavoriteHeart";
import {
  DEFAULT_HIDDEN_FEES,
  FEE_GROUPS,
  formatFeePrice,
  estimateOneOffTotal,
  type HiddenFee,
} from "@/lib/hidden-fees";

interface PlotLike {
  number: string;
  area: number;
  pricePerHundred: number;
  totalCost: number;
  statusName: string;
}

interface Props {
  plot: PlotLike | null;
  villageSlug: string;
  villageName: string;
  isSold: boolean;
  fees?: HiddenFee[];
  onClose: () => void;
}

export default function VillagePlotBottomSheet({
  plot,
  villageSlug,
  villageName,
  isSold,
  fees = DEFAULT_HIDDEN_FEES,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    setExpanded(false);
    setShowFees(false);
  }, [plot?.number]);

  useEffect(() => {
    if (!plot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [plot, onClose]);

  if (!plot) return null;

  const { low, high } = estimateOneOffTotal(fees);
  const monthly = fees.find((f) => /мес/i.test(f.unit ?? ""));

  const status = plot.statusName;
  const statusColor = isSold
    ? "bg-gray-100 text-gray-600"
    : status === "Бронь" || status === "Забронирован"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";

  const onGrabberDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
  };
  const onGrabberUp = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current;
    dragStartY.current = null;
    if (Math.abs(dy) < 10) setExpanded((v) => !v);
    else if (dy > 60) onClose();
    else if (dy < -60) setExpanded(true);
  };

  return (
    <div
      className={`absolute left-0 right-0 bottom-0 z-40 rounded-t-2xl bg-white shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/5 transition-[max-height] duration-300 ease-out overflow-hidden flex flex-col pointer-events-auto ${
        expanded ? "max-h-[85%]" : "max-h-[36%]"
      }`}
      style={{ willChange: "max-height" }}
    >
      {/* Grabber */}
      <div
        className="shrink-0 pt-1.5 pb-1 flex flex-col items-center cursor-pointer select-none"
        onPointerDown={onGrabberDown}
        onPointerUp={onGrabberUp}
      >
        <div className="w-9 h-1 rounded-full bg-gray-300" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-3">
        {/* ── Desktop: single horizontal row ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
          {/* Plot identity */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <div className="text-[9px] uppercase font-black tracking-wider text-emerald-700">
              Участок
            </div>
            <div className="text-xl font-black text-gray-900 tabular-nums leading-none">
              № {plot.number}
            </div>
            <span
              className={`inline-flex items-center h-4 px-1.5 rounded-full text-[8px] font-black uppercase ${statusColor}`}
            >
              {status}
            </span>
          </div>

          {/* Stats — inline on lg */}
          <div className="mt-2 lg:mt-0 flex items-center gap-2 flex-1 min-w-0">
            <Stat label="Площадь" value={`${plot.area} сот`} />
            <Stat label="За сотку" value={`${plot.pricePerHundred.toLocaleString("ru-RU")} ₽`} />
            <Stat
              label="Итого"
              value={`${plot.totalCost.toLocaleString("ru-RU")} ₽`}
              accent
            />
          </div>

          {/* CTAs + controls */}
          <div className="mt-2 lg:mt-0 flex items-center gap-2 shrink-0">
            {!isSold && (
              <>
                <a
                  href="#contact-form"
                  className="flex items-center justify-center h-9 px-4 rounded-lg bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-900/20 active:scale-[0.98] transition-all"
                >
                  Забронировать
                </a>
                <a
                  href="#contact-form"
                  className="flex items-center justify-center h-9 px-4 rounded-lg bg-white ring-1 ring-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold text-xs active:scale-[0.98] transition-all"
                >
                  Записаться
                </a>
              </>
            )}
            <FavoriteHeart
              kind="plot"
              plot={{
                villageSlug,
                villageName,
                plotNumber: plot.number,
                area: plot.area,
                pricePerHundred: plot.pricePerHundred,
                totalCost: plot.totalCost,
                status: plot.statusName,
              }}
              variant="light"
              className="!w-8 !h-8"
            />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hidden fees toggle */}
        <button
          type="button"
          onClick={() => {
            setShowFees((v) => !v);
            if (!expanded) setExpanded(true);
          }}
          className="mt-2.5 w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-50 ring-1 ring-amber-200 text-amber-900 text-[11px] font-bold hover:bg-amber-100 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-amber-700" />
            Скрытые платежи
            <span className="inline-flex items-center h-3.5 px-1 rounded-full bg-amber-200 text-amber-900 text-[8px] font-black uppercase tracking-wider">
              прозрачно
            </span>
          </span>
          {showFees ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 rotate-180" />
          )}
        </button>

        {/* Expanded fees panel */}
        {showFees && (
          <div className="mt-2 space-y-2.5">
            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 ring-1 ring-emerald-200/60 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-800">
                <Info className="w-3 h-3" />У нас всё в договоре, ничего потом не
                всплывёт
              </div>
              <div className="mt-1.5 text-[10px] text-emerald-900/80">
                <b>Разово:</b>{" "}
                <span className="tabular-nums font-black text-emerald-800">
                  {low.toLocaleString("ru-RU")} – {high.toLocaleString("ru-RU")} ₽
                </span>
                {monthly && (
                  <>
                    {" · "}
                    <b>Ежемесячно:</b>{" "}
                    <span className="tabular-nums font-black text-emerald-800">
                      {formatFeePrice(monthly)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {FEE_GROUPS.map((group) => {
              const inGroup = fees.filter((f) => f.group === group.id);
              if (inGroup.length === 0) return null;
              return (
                <div
                  key={group.id}
                  className="rounded-lg bg-white ring-1 ring-gray-200 p-2.5"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm leading-none">{group.emoji}</span>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-900">
                      {group.title}
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {inGroup.map((fee) => (
                      <FeeRow key={fee.id} fee={fee} />
                    ))}
                  </ul>
                </div>
              );
            })}

            <p className="text-[9px] text-gray-500 leading-snug">
              Суммы ориентировочные на{" "}
              {new Date().toLocaleDateString("ru-RU", {
                month: "long",
                year: "numeric",
              })}
              . Точная калькуляция — на просмотре.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── compact stat pill ─── */

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg px-2.5 py-1.5 ring-1 ${
        accent
          ? "bg-emerald-50 ring-emerald-200"
          : "bg-gray-50 ring-gray-200"
      }`}
    >
      <div className="text-[8px] uppercase font-bold text-gray-500 tracking-wider">{label}</div>
      <div
        className={`text-xs font-black leading-none mt-0.5 tabular-nums ${
          accent ? "text-green-800" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* ─── fee row ─── */

function FeeRow({ fee }: { fee: HiddenFee }) {
  return (
    <li className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-1.5 min-w-0">
        {fee.included ? (
          <CheckCircle2
            className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5"
            strokeWidth={2.5}
          />
        ) : (
          <div className="w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full border-2 border-amber-300 bg-amber-50" />
        )}
        <div className="min-w-0">
          <div className="text-[10px] font-black text-gray-900 leading-snug">
            {fee.label}
          </div>
          {fee.hint && (
            <div className="text-[9px] text-gray-500 leading-snug mt-0.5">
              {fee.hint}
              {fee.source && (
                <>
                  {" — "}
                  <a
                    href={fee.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    {fee.source.label}
                    <ExternalLink className="w-2 h-2" />
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className={`shrink-0 text-[9px] font-black tabular-nums whitespace-nowrap ${
          fee.included ? "text-emerald-700" : "text-amber-900"
        }`}
      >
        {formatFeePrice(fee)}
      </div>
    </li>
  );
}
