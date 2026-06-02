"use client";

/**
 * MortgageModal — краткая форма заявки на ипотеку из калькулятора.
 *
 * Открывается через openMortgageForm(ctx) (кнопка «Оставить заявку» в
 * MortgageCalculator). Стиль и поведение — как у ViewingModal (плотное
 * тёмное стекло, портал в body, компактно, тонкий скроллбар).
 *
 * Поля: Имя, Телефон (обяз.), Комментарий (необяз.), согласие 152-ФЗ.
 * Заявка → /api/leads (type "MORTGAGE" → бот показывает «Расчёт ипотеки»).
 * К сообщению прикладываются текущие параметры калькулятора.
 */

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle2, Landmark } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

export interface MortgageContext {
  /** Стоимость участка, ₽ */
  price?: number;
  /** Первоначальный взнос, % */
  downPayment?: number;
  /** Срок, лет */
  years?: number;
  /** Ставка, % */
  rate?: number;
  /** Ежемесячный платёж, ₽ */
  monthlyPayment?: number;
}

export const OPEN_MORTGAGE_EVENT = "zemplus:open-mortgage";

export function openMortgageForm(ctx: MortgageContext = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_MORTGAGE_EVENT, { detail: ctx }));
}

// ─────────────────────────────────────────────────────────────────────
// Style — «Пушка» glass (плотный, как в выверенной ViewingModal)

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
  backdropFilter: "blur(10px) saturate(1.05)",
  WebkitBackdropFilter: "blur(10px) saturate(1.05)",
  background:
    "linear-gradient(160deg, rgba(18,26,36,0.97) 0%, rgba(10,16,24,0.98) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.30), 0 24px 64px -12px rgba(0,0,0,0.6)",
};

const fmt = (v: number) => v.toLocaleString("ru-RU") + " ₽";

async function submitMortgage(opts: {
  ctx: MortgageContext;
  name: string;
  phoneDigits: string;
  comment: string;
}): Promise<boolean> {
  try {
    const { ctx } = opts;
    const lines = [
      "🏦 Заявка на ипотеку (из калькулятора)",
      ctx.price != null ? `• Стоимость участка: ${fmt(ctx.price)}` : null,
      ctx.downPayment != null ? `• Первый взнос: ${ctx.downPayment}%` : null,
      ctx.years != null && ctx.rate != null
        ? `• Срок: ${ctx.years} лет · ставка ${ctx.rate}%`
        : null,
      ctx.monthlyPayment != null
        ? `• Платёж: ~${fmt(ctx.monthlyPayment)}/мес`
        : null,
      opts.comment.trim() ? `💬 Комментарий: ${opts.comment.trim()}` : null,
    ].filter(Boolean);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: opts.name.trim() || "Без имени",
        phone: "+7" + opts.phoneDigits,
        type: "MORTGAGE",
        message: lines.join("\n"),
        source: "mortgage-calc",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────

export default function MortgageModal() {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<MortgageContext>({});
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const reset = useCallback(() => {
    setName("");
    setPhone("");
    setComment("");
    setConsent(true);
    setSubmitting(false);
    setDone(false);
    setError(null);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(reset, 200);
  }, [reset]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<MortgageContext>).detail || {};
      reset();
      setCtx(detail);
      setOpen(true);
    };
    window.addEventListener(OPEN_MORTGAGE_EVENT, handler);
    return () => window.removeEventListener(OPEN_MORTGAGE_EVENT, handler);
  }, [reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const canSubmit = phone.length === 10 && consent && !submitting;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const ok = await submitMortgage({ ctx, name, phoneDigits: phone, comment });
    setSubmitting(false);
    if (ok) setDone(true);
    else setError("Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.");
  };

  if (!mounted || !open) return null;

  const hasCalc = ctx.monthlyPayment != null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Заявка на ипотеку"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={close}
      />

      <div
        className="mortgage-glass relative z-10 w-full sm:max-w-md max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-[24px] text-white [&_*]:drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
        style={GLASS_STYLE}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/45 to-transparent" />

        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="absolute top-2.5 right-2.5 z-20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/90" />
        </button>

        <div className="relative z-10 px-5 py-5 sm:px-7 sm:py-6">
          {!done ? (
            <>
              <div className="mb-3">
                <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-emerald-300 mb-1">
                  <Landmark className="w-3.5 h-3.5" /> Ипотека
                </p>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Оставить заявку
                </h3>
                {hasCalc && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-white/85">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1">
                      ~{fmt(ctx.monthlyPayment!)}/мес
                    </span>
                    {ctx.years != null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1">
                        {ctx.years} лет · {ctx.rate}%
                      </span>
                    )}
                  </div>
                )}
                <p className="mt-1.5 text-[13px] leading-snug text-white/75">
                  Подберём банк и поможем с одобрением — перезвоним и
                  проконсультируем.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/70 px-4 py-2.5 outline-none focus:bg-white/25 focus:border-white/50 transition"
                />

                <PhoneInput value={phone} onChange={setPhone} required />

                <textarea
                  placeholder="Комментарий (необязательно)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/70 px-4 py-2.5 outline-none focus:bg-white/25 focus:border-white/50 transition resize-none"
                />

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
                  className="mt-0.5 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 disabled:cursor-not-allowed text-white px-6 h-11 rounded-xl font-bold transition"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Landmark className="w-5 h-5" />
                      Оставить заявку
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
                {name ? `${name}, ` : ""}наш менеджер перезвонит, подберёт банк
                и поможет с одобрением.
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
          .mortgage-glass { position: relative; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.22) transparent; }
          .mortgage-glass::before {
            content:'';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;
            ${RAINBOW_CSS}
          }
          .mortgage-glass::-webkit-scrollbar { width: 6px; }
          .mortgage-glass::-webkit-scrollbar-track { background: transparent; }
          .mortgage-glass::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 999px; }
          .mortgage-glass::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        `}</style>
      </div>
    </div>,
    document.body,
  );
}
