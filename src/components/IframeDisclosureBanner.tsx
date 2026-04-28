"use client";

import { ShieldCheck, ExternalLink } from "lucide-react";

/**
 * IframeDisclosureBanner — брендированный баннер раскрытия Zemexx над iframe карты.
 *
 * Размещается ВНУТРИ обёртки с iframe (та же rounded-2xl ring shadow), сверху над iframe.
 * Реализация полностью повторяет V3_BrandedBanner из /preview-iframe-disclosure
 * за вычетом внешнего rounded-обёртывания (его держит родитель).
 *
 * Юр. цель: 152-ФЗ (передача ПДн партнёру) + ЗоЗПП (с кем заключается договор бронирования).
 *
 * Mobile (<640px): кнопка «Условия оферты» скрыта, текст переносится.
 * Desktop (≥640px): кнопка справа, ведёт на /oferta.
 */

interface Props {
  /** Имя посёлка — пока не используется в тексте, заложено на будущее. */
  villageName?: string;
}

export default function IframeDisclosureBanner({ villageName: _villageName }: Props) {
  return (
    <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-emerald-50 border-b border-emerald-200/60 px-5 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-900 leading-tight">
              Онлайн-бронирование через сервис Zemexx
            </div>
            <div className="text-xs text-stone-600 mt-0.5">
              Карта участков и форма бронирования предоставлены партнёром. Данные передаются для обработки заявки.
            </div>
          </div>
        </div>
        <a
          href="/oferta"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-xs font-semibold whitespace-nowrap transition-colors"
        >
          Условия оферты
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
