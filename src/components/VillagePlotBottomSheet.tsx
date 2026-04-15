"use client";

/**
 * VillagePlotBottomSheet — Yandex-Maps-style bottom sheet that
 * slides up when the user taps a plot on the InteractivePlotMap3
 * canvas. Carries plot details, the hidden-fees breakdown, and the
 * primary CTA (Забронировать).
 *
 * States:
 *   null       → hidden, slide-down off-screen
 *   selected   → visible at rest, ~60% of map height max
 *   expanded   → full-height within the map container
 *
 * Interactions:
 *   - tap grabber or "Подробнее" → toggle expanded
 *   - tap the X chip → clear selection (caller passes onClose)
 *   - Escape key → clear selection
 *   - on mobile, drag the grabber downward to close
 */

import { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronUp,
  ChevronDown,
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
  type FeeGroupId,
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  // Collapse to default height whenever a new plot is selected
  useEffect(() => {
    setExpanded(false);
    setShowFees(false);
  }, [plot?.number]);

  // Escape to close
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
  const statusPalette = isSold
    ? "bg-gray-100 text-gray-600"
    : status === "Бронь" || status === "Забронирован"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";

  const handleGrabberPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartY.current = e.clientY;
  };
  const handleGrabberPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current;
    dragStartY.current = null;
    if (Math.abs(dy) < 10) {
      // tap — toggle expansion
      setExpanded((v) => !v);
    } else if (dy > 60) {
      // drag down → close
      onClose();
    } else if (dy < -60) {
      // drag up → expand
      setExpanded(true);
    }
  };

  return (
    <div
      ref={sheetRef}
      className={`absolute left-0 right-0 bottom-0 z-40 rounded-t-3xl bg-white shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition-[max-height] duration-300 ease-out overflow-hidden flex flex-col pointer-events-auto ${
        expanded ? "max-h-[90%]" : "max-h-[56%]"
      }`}
      style={{ willChange: "max-height" }}
    >
      {/* Drag handle / grabber — tappable area that also receives
          the drag gesture on mobile. */}
      <div
        className="shrink-0 pt-2 pb-1 flex flex-col items-center cursor-pointer select-none"
        onPointerDown={handleGrabberPointerDown}
        onPointerUp={handleGrabberPointerUp}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      {/* Content scroller */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-5">
        {/* Header row: plot number + status + FavoriteHeart + close */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[9px] uppercase font-black tracking-wider text-emerald-700">
                Участок
              </div>
              <span
                className={`inline-flex items-center h-4 px-1.5 rounded-full text-[9px] font-black uppercase ${statusPalette}`}
              >
                {status}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 leading-none mt-0.5 tabular-nums">
              № {plot.number}
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500">
              {villageName}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
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
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main stats row — area, per sotka, total */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-gray-200 p-2.5">
            <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
              Площадь
            </div>
            <div className="text-sm font-black text-gray-900 leading-none mt-1 tabular-nums">
              {plot.area} <span className="text-[10px] text-gray-500 font-bold">сот</span>
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-gray-200 p-2.5">
            <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
              За сотку
            </div>
            <div className="text-sm font-black text-gray-900 leading-none mt-1 tabular-nums">
              {plot.pricePerHundred.toLocaleString("ru-RU")}{" "}
              <span className="text-[10px] text-gray-500 font-bold">₽</span>
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 ring-1 ring-emerald-200 p-2.5">
            <div className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">
              Итого
            </div>
            <div className="text-sm font-black text-green-800 leading-none mt-1 tabular-nums">
              {plot.totalCost.toLocaleString("ru-RU")}{" "}
              <span className="text-[10px] text-emerald-700 font-bold">₽</span>
            </div>
          </div>
        </div>

        {/* Primary CTAs */}
        {!isSold && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href="#contact-form"
              className="flex items-center justify-center h-11 rounded-xl bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all"
            >
              Забронировать
            </a>
            <a
              href="#contact-form"
              className="flex items-center justify-center h-11 rounded-xl bg-white ring-1 ring-emerald-300 hover:bg-emerald-50 text-emerald-800 font-black text-sm active:scale-[0.98] transition-all"
            >
              Записаться
            </a>
          </div>
        )}

        {/* Hidden fees toggle */}
        <button
          type="button"
          onClick={() => setShowFees((v) => !v)}
          className="mt-4 w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-900 text-[12px] font-bold hover:bg-amber-100 transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Banknote className="w-4 h-4 text-amber-700" />
            Скрытые платежи
            <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-amber-200 text-amber-900 text-[9px] font-black uppercase tracking-wider">
              прозрачно
            </span>
          </span>
          {showFees ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4 rotate-180" />
          )}
        </button>

        {/* Hidden fees panel */}
        {showFees && (
          <div className="mt-2 space-y-3">
            {/* Summary */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 ring-1 ring-emerald-200/60 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-emerald-800">
                <Info className="w-3.5 h-3.5" />У нас всё в договоре, ничего потом не всплывёт
              </div>
              <p className="mt-1 text-[11px] text-emerald-900/80 leading-snug">
                {villageName} — прозрачная структура. Ниже все
                потенциальные расходы сверх цены участка.
                Зелёная галочка = включено, серая pill = за ваш счёт
                с ориентировочной суммой из официальных источников.
              </p>
              <div className="mt-2 text-[11px] text-emerald-900/80">
                <b>Ориентир one-off:</b>{" "}
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

            {/* Per-group breakdown */}
            {FEE_GROUPS.map((group) => {
              const inGroup = fees.filter((f) => f.group === group.id);
              if (inGroup.length === 0) return null;
              return (
                <div
                  key={group.id}
                  className="rounded-xl bg-white ring-1 ring-gray-200 p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg leading-none">{group.emoji}</span>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-900">
                      {group.title}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {inGroup.map((fee) => (
                      <FeeRow key={fee.id} fee={fee} />
                    ))}
                  </ul>
                </div>
              );
            })}

            <p className="text-[10px] text-gray-500 leading-snug pt-1">
              Суммы ориентировочные, указаны на{" "}
              {new Date().toLocaleDateString("ru-RU", {
                month: "long",
                year: "numeric",
              })}{" "}
              по данным Росреестра, Россетей МР и Мособлгаза. Точная
              калькуляция по вашему участку — на просмотре.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeeRow({ fee }: { fee: HiddenFee }) {
  return (
    <li className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2 min-w-0">
        {fee.included ? (
          <CheckCircle2
            className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5"
            strokeWidth={2.5}
          />
        ) : (
          <div className="w-4 h-4 shrink-0 mt-0.5 rounded-full border-2 border-amber-300 bg-amber-50" />
        )}
        <div className="min-w-0">
          <div className="text-[11px] font-black text-gray-900 leading-snug">
            {fee.label}
          </div>
          {fee.hint && (
            <div className="text-[10px] text-gray-500 leading-snug mt-0.5">
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
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className={`shrink-0 text-[10px] font-black tabular-nums whitespace-nowrap ${
          fee.included
            ? "text-emerald-700"
            : "text-amber-900"
        }`}
      >
        {formatFeePrice(fee)}
      </div>
    </li>
  );
}
