"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { CTA } from "../ui/primitives";
import { useTier } from "../../_lib/perf";

/**
 * Форма витрины /v3.
 *
 * ВАЖНО: она сознательно НИЧЕГО НЕ ОТПРАВЛЯЕТ — ни fetch, ни /api/leads.
 * /v3 пока стенд дизайна, и «тихие» лиды из него никто не читал бы.
 * Когда витрина заменит прод — сюда подставится боевой обработчик.
 * Экран благодарности рисуется локальным состоянием.
 */

const FIELD =
  "w-full rounded-2xl bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none ring-1 ring-white/12 transition-colors placeholder:text-white/35 focus:bg-white/[0.08] focus:ring-emerald-400/60";

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export default function LocalLeadForm({
  submitLabel = "Отправить",
  withMessage = false,
  messageLabel = "Комментарий",
  messagePlaceholder = "Что хотите узнать?",
  summary,
  note,
}: {
  submitLabel?: string;
  withMessage?: boolean;
  messageLabel?: string;
  messagePlaceholder?: string;
  /** Например, снимок расчёта ипотеки — показываем над полями. */
  summary?: ReactNode;
  note?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const tier = useTier();
  const lite = tier === "lite";
  // id через useId — на странице может оказаться две формы, а label
  // без уникального for перекидывал бы фокус в чужое поле.
  const uid = useId();

  function reset() {
    setName("");
    setPhone("");
    setMessage("");
    setError(null);
    setSent(false);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || sent) return;

    if (name.trim().length < 2) {
      setError("Напишите, как к вам обращаться");
      return;
    }
    if (digits(phone).length < 10) {
      setError("Телефон нужен полностью — 10 цифр после кода страны");
      return;
    }

    setError(null);
    setPending(true);
    // Короткая пауза вместо запроса: без неё переход к «спасибо» выглядит
    // как будто кнопка не нажалась.
    setTimeout(() => {
      setPending(false);
      setSent(true);
    }, 450);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: lite ? 1 : 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: lite ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center rounded-[22px] bg-emerald-400/[0.07] px-5 py-8 text-center ring-1 ring-emerald-400/25"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 shadow-[0_12px_34px_-10px_rgba(16,185,129,0.9)]">
          <Check className="h-7 w-7 text-white" strokeWidth={3} />
        </span>
        <h3 className="mt-4 text-[20px] font-extrabold sm:text-[24px]">Спасибо, записали</h3>
        <p className="mt-2 max-w-[42ch] text-[14px] leading-relaxed text-white/55">
          Это демонстрационная витрина: форма ничего никуда не отправляет, данные
          остались в браузере и никому не ушли.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 text-[13px] font-bold text-emerald-300 underline-offset-4 transition-colors hover:text-emerald-200 hover:underline"
        >
          Заполнить ещё раз
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      {summary}

      <div>
        <label htmlFor={`${uid}-name`} className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-white/40">
          Имя
        </label>
        <input
          id={`${uid}-name`}
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Как к вам обращаться"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-phone`} className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-white/40">
          Телефон
        </label>
        <input
          id={`${uid}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          placeholder="+7 (900) 000-00-00"
          className={FIELD}
        />
      </div>

      {withMessage && (
        <div>
          <label htmlFor={`${uid}-message`} className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-white/40">
            {messageLabel}
          </label>
          <textarea
            id={`${uid}-message`}
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={messagePlaceholder}
            className={`${FIELD} resize-y`}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-[13px] font-semibold text-rose-300">
          {error}
        </p>
      )}

      {/* data-float-guard: кнопка во всю ширину, плавающие мессенджеры
          обязаны с неё уйти (см. FloatingMessengers). */}
      <div data-float-guard>
        <CTA type="submit" className="w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Секунду…
            </>
          ) : (
            submitLabel
          )}
        </CTA>
      </div>

      {note && <p className="text-center text-[12px] leading-relaxed text-white/35">{note}</p>}
    </form>
  );
}
