"use client";

/**
 * ViewingModal — отдельная форма «Запись на просмотр» («Посмотреть вживую»).
 *
 * Открывается из любого места через openViewingForm(ctx) — кнопка в шапке,
 * hero посёлка, карточка участка на карте. Модалка монтируется один раз
 * (глобально в layout или на странице) и слушает window-событие.
 *
 * Дизайн — liquid-glass «Пушка» (см. CLAUDE.md): blur+saturate, белый текст
 * с drop-shadow, rainbow conic-gradient ::before рамка, белый top-hairline.
 *
 * Заявка летит в /api/leads → @prozemplus_bot (type: "VIEWING").
 * Детали (дата/слот/посёлок/участок/коммент) кодируются в message с тегом
 * [VIEWING] — бот форматирует их человекочитаемо (см. api/leads/route.ts).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle2, CalendarCheck, MapPin, Home } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

// ─────────────────────────────────────────────────────────────────────
// Public API — кнопки вызывают это, не зная о реализации модалки

export interface ViewingContext {
  /** slug посёлка для привязки заявки (например "favorit") */
  villageSlug?: string;
  /** Человекочитаемое имя посёлка для шапки формы */
  villageName?: string;
  /** Номер участка, если запись с карточки участка */
  plotNumber?: string;
  /** Откуда открыли — для аналитики (попадёт в текст заявки) */
  source?: string;
}

export const OPEN_VIEWING_EVENT = "zemplus:open-viewing";

/** Открыть форму записи на просмотр из любого клиентского компонента. */
export function openViewingForm(ctx: ViewingContext = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_VIEWING_EVENT, { detail: ctx }));
}

// ─────────────────────────────────────────────────────────────────────
// Style — «Пушка» glass

const RAINBOW_CSS = `
  background:conic-gradient(from 0deg,
    rgba(255,0,0,0.28),rgba(255,165,0,0.28),rgba(255,255,0,0.20),
    rgba(0,255,0,0.20),rgba(0,200,255,0.28),rgba(100,100,255,0.28),
    rgba(200,0,255,0.28),rgba(255,0,0,0.28));
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  pointer-events:none;z-index:1;
`;

const GLASS_STYLE: React.CSSProperties = {
  backdropFilter: "blur(8px) saturate(1.8)",
  WebkitBackdropFilter: "blur(8px) saturate(1.8)",
  background:
    "linear-gradient(160deg, rgba(20,28,38,0.72) 0%, rgba(12,18,26,0.82) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.30), 0 24px 64px -12px rgba(0,0,0,0.6)",
};

const TIME_SLOTS = [
  "10:00–12:00",
  "12:00–14:00",
  "14:00–16:00",
  "16:00–18:00",
  "18:00–20:00",
  "Любое время",
];

// ─────────────────────────────────────────────────────────────────────
// Helpers

function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function maxISO(daysAhead = 60): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function prettyDate(iso: string): string {
  if (!iso) return "";
  const [y, m, day] = iso.split("-").map(Number);
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  return `${day} ${months[m - 1]} ${y}`;
}

async function submitViewing(opts: {
  ctx: ViewingContext;
  name: string;
  phoneDigits: string;
  date: string;
  slot: string;
  comment: string;
}): Promise<boolean> {
  try {
    const details = {
      date: prettyDate(opts.date),
      slot: opts.slot,
      village: opts.ctx.villageName || opts.ctx.villageSlug || "",
      plot: opts.ctx.plotNumber || "",
      comment: opts.comment.trim(),
      source: opts.ctx.source || "viewing-modal",
    };
    const message = `[VIEWING]\n${JSON.stringify(details, null, 2)}`;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: opts.name.trim() || "Без имени",
        phone: "+7" + opts.phoneDigits,
        type: "VIEWING",
        message,
        villageSlug: opts.ctx.villageSlug || "",
        plotNumber: opts.ctx.plotNumber || "",
        source: opts.ctx.source || "viewing-modal",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Component

export default function ViewingModal() {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<ViewingContext>({});
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const reset = useCallback(() => {
    setName("");
    setPhone("");
    setDate("");
    setSlot("");
    setComment("");
    setConsent(true);
    setSubmitting(false);
    setDone(false);
    setError(null);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // даём анимации/порталу отработать перед сбросом
    window.setTimeout(reset, 200);
  }, [reset]);

  // Слушаем глобальное событие открытия
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ViewingContext>).detail || {};
      reset();
      setCtx(detail);
      setOpen(true);
    };
    window.addEventListener(OPEN_VIEWING_EVENT, handler);
    return () => window.removeEventListener(OPEN_VIEWING_EVENT, handler);
  }, [reset]);

  // Esc + блокировка скролла body, пока модалка открыта
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  const canSubmit =
    phone.length === 10 && !!date && !!slot && consent && !submitting;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const ok = await submitViewing({ ctx, name, phoneDigits: phone, date, slot, comment });
    setSubmitting(false);
    if (ok) setDone(true);
    else setError("Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.");
  };

  if (!mounted || !open) return null;

  const contextLabel = ctx.villageName || ctx.villageSlug;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Запись на просмотр"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={close}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="viewing-glass relative z-10 w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-[24px] text-white [&_*]:drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
        style={GLASS_STYLE}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/45 to-transparent" />

        {/* Close */}
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="absolute top-2.5 right-2.5 z-20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/90" />
        </button>

        <div className="relative z-10 px-5 py-6 sm:px-7 sm:py-7">
          {!done ? (
            <>
              <div className="mb-4">
                <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-emerald-300 mb-1.5">
                  <CalendarCheck className="w-3.5 h-3.5" /> Посмотреть вживую
                </p>
                <h3 className="text-2xl font-black tracking-tight">
                  Запись на просмотр
                </h3>
                {contextLabel && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/85">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1">
                      <Home className="w-3.5 h-3.5" /> {contextLabel}
                    </span>
                    {ctx.plotNumber && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1">
                        <MapPin className="w-3.5 h-3.5" /> Участок №{ctx.plotNumber}
                      </span>
                    )}
                  </div>
                )}
                <p className="mt-2 text-sm text-white/75">
                  Выберите удобные дату и время — менеджер подтвердит запись и
                  встретит вас на месте.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/70 px-4 py-3 outline-none focus:bg-white/25 focus:border-white/50 transition"
                />

                <PhoneInput value={phone} onChange={setPhone} required />

                {/* Дата */}
                <label className="block">
                  <span className="text-xs font-semibold text-white/80 mb-1 block">
                    Желаемая дата
                  </span>
                  <input
                    type="date"
                    value={date}
                    min={todayISO()}
                    max={maxISO(60)}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/15 border border-white/30 text-white px-4 py-3 outline-none focus:bg-white/25 focus:border-white/50 transition [color-scheme:dark]"
                  />
                </label>

                {/* Время */}
                <div>
                  <span className="text-xs font-semibold text-white/80 mb-1.5 block">
                    Удобное время
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_SLOTS.map((t) => {
                      const active = slot === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSlot(t)}
                          className={`text-sm rounded-full px-3 py-1.5 transition border whitespace-nowrap ${
                            active
                              ? "bg-emerald-500 border-emerald-300 text-white font-bold"
                              : "bg-white/10 border-white/25 text-white/95 hover:bg-white/20"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Комментарий */}
                <textarea
                  placeholder="Комментарий (необязательно)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/70 px-4 py-3 outline-none focus:bg-white/25 focus:border-white/50 transition resize-none"
                />

                {/* Согласие 152-ФЗ */}
                <label className="flex items-start gap-2 text-xs text-white/75 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-500 shrink-0"
                  />
                  <span>
                    Соглашаюсь на обработку персональных данных согласно{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-white"
                    >
                      политике конфиденциальности
                    </a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 disabled:cursor-not-allowed text-white px-6 h-12 rounded-xl font-bold transition"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CalendarCheck className="w-5 h-5" />
                      Записаться на просмотр
                    </>
                  )}
                </button>

                {error && (
                  <p className="text-rose-200 text-sm text-center">{error}</p>
                )}
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/30 ring-2 ring-emerald-300 mb-3">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-2xl font-black tracking-tight">
                Заявка принята!
              </h4>
              <p className="text-white/85 mt-2 text-sm">
                {name ? `${name}, ` : ""}мы записали вас на{" "}
                {prettyDate(date)}, {slot.toLowerCase()}.
                {contextLabel ? ` Посёлок «${contextLabel}».` : ""} Менеджер
                перезвонит и подтвердит запись.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-5 inline-flex items-center justify-center bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 h-11 rounded-xl font-semibold transition"
              >
                Готово
              </button>
            </div>
          )}
        </div>

        <style>{`
          .viewing-glass { position: relative; }
          .viewing-glass::before {
            content:'';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;
            ${RAINBOW_CSS}
          }
        `}</style>
      </div>
    </div>,
    document.body,
  );
}
