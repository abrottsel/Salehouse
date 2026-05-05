"use client";

/**
 * QuizSection — production-компонент квиза подбора участка.
 * Извлечён из preview-quiz-v3 (вариант V12 «Hero-fullscreen с pill-rows»).
 *
 * Стилистика — liquid-glass из CTA-баннера Catalog.tsx: фото-фон, чёрный
 * gradient overlay, glass-карточка с blur+saturate, rainbow conic-gradient
 * ::before, белый top-hairline, emerald CTA. На главной заменяет ContactForm.
 */

import { useState } from "react";
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Compass,
  Wallet,
  Ruler,
  Target,
  Calendar,
} from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

// ─────────────────────────────────────────────────────────────────────
// Types & submit

type AnswerMap = Record<string, string>;

interface QuizOption {
  value: string;
  label: string;
  hint?: string;
}
interface QuizQuestion {
  id: string;
  title: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  options: QuizOption[];
}

async function submitQuizLead(opts: {
  answers: AnswerMap;
  name: string;
  phoneDigits: string;
}): Promise<boolean> {
  try {
    const message = `[QUIZ_LEAD · homepage]\n${JSON.stringify(
      opts.answers,
      null,
      2,
    )}`;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: opts.name || "Без имени",
        phone: "+7" + opts.phoneDigits,
        email: "",
        type: "VIEWING",
        message,
        source: "quiz-homepage",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Style helpers

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
  backdropFilter: "blur(4px) saturate(1.8)",
  WebkitBackdropFilter: "blur(4px) saturate(1.8)",
  background:
    "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 32px -4px rgba(0,0,0,0.25)",
};

// ─────────────────────────────────────────────────────────────────────
// Questions (V12 bank)

const QUESTIONS: QuizQuestion[] = [
  {
    id: "area",
    title: "Площадь",
    short: "Соток",
    icon: Ruler,
    options: [
      { value: "5-7", label: "5–7" },
      { value: "7-10", label: "7–10" },
      { value: "10-15", label: "10–15" },
      { value: "any", label: "Любая" },
    ],
  },
  {
    id: "budget",
    title: "Бюджет",
    short: "₽",
    icon: Wallet,
    options: [
      { value: "<1m", label: "до 1 млн" },
      { value: "1-2m", label: "1–2 млн" },
      { value: "2-3m", label: "2–3 млн" },
      { value: "3m+", label: "3+ млн" },
    ],
  },
  {
    id: "direction",
    title: "Направление",
    short: "Куда",
    icon: Compass,
    options: [
      { value: "north", label: "Север" },
      { value: "south", label: "Юг" },
      { value: "east", label: "Восток" },
      { value: "any", label: "Любое" },
    ],
  },
  {
    id: "goal",
    title: "Цель",
    short: "Цель",
    icon: Target,
    options: [
      { value: "live", label: "Жить" },
      { value: "dacha", label: "Дача" },
      { value: "invest", label: "Инвест" },
      { value: "build", label: "Строить" },
    ],
  },
  {
    id: "timing",
    title: "Готовность",
    short: "Когда",
    icon: Calendar,
    options: [
      { value: "now", label: "Сейчас" },
      { value: "month", label: "Месяц" },
      { value: "season", label: "Сезон" },
      { value: "look", label: "Смотрю" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Hook

function useQuizState(questions: QuizQuestion[]) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = questions.every((q) => answers[q.id]);
  const canSubmit =
    allAnswered && name.trim().length > 0 && phone.length === 10;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    const ok = await submitQuizLead({
      answers,
      name: name.trim(),
      phoneDigits: phone,
    });
    setSubmitting(false);
    if (ok) setDone(true);
    else setError("Не удалось отправить. Попробуйте ещё раз.");
  };

  return {
    answers,
    setAnswers,
    name,
    setName,
    phone,
    setPhone,
    submitting,
    done,
    error,
    allAnswered,
    canSubmit,
    handleSubmit,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Success state

function SuccessGlass({ name, phone }: { name: string; phone: string }) {
  const phoneFmt = phone
    ? `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 8)}-${phone.slice(8, 10)}`
    : "";
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/30 ring-2 ring-emerald-300 mb-3">
        <CheckCircle2 className="w-7 h-7 text-white" />
      </div>
      <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
        Спасибо, {name || "друг"}!
      </h4>
      <p className="text-white/85 mt-2 text-sm sm:text-base">
        Подборка летит на {phoneFmt || "ваш номер"} — обычно приходит в течение
        15 минут в WhatsApp.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// QuizSection (V12) — production

export default function QuizSection() {
  const s = useQuizState(QUESTIONS);

  return (
    <section id="contacts" className="px-4 py-10 sm:py-14 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative overflow-hidden rounded-2xl bg-cover bg-center min-h-[640px]"
          style={{ backgroundImage: "url(/hero-v2.jpg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />

          <div className="relative z-10 flex items-center justify-center px-3 py-10 sm:px-6 sm:py-14 min-h-[640px]">
            <div
              className="quiz-v12-glass relative overflow-hidden rounded-2xl w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8"
              style={GLASS_STYLE}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="relative z-10">
                {!s.done ? (
                  <>
                    <div className="text-center mb-5 sm:mb-6">
                      <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-white/80 mb-2">
                        <Sparkles className="w-3.5 h-3.5" /> Тёплый подбор
                      </p>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
                        Расскажите о мечте — подберём 3 участка под вас
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2 sm:gap-2.5">
                      {QUESTIONS.map((qq) => {
                        const Icon = qq.icon;
                        return (
                          <div
                            key={qq.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                          >
                            <div className="sm:w-44 shrink-0 flex items-center gap-2">
                              <Icon className="w-4 h-4 text-white/80" />
                              <p className="text-white font-bold text-sm sm:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                                {qq.title}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 flex-1">
                              {qq.options.map((o) => {
                                const active = s.answers[qq.id] === o.value;
                                return (
                                  <button
                                    key={o.value}
                                    type="button"
                                    onClick={() =>
                                      s.setAnswers((p) => ({
                                        ...p,
                                        [qq.id]: o.value,
                                      }))
                                    }
                                    className={`text-sm rounded-full px-3 py-1.5 transition border whitespace-nowrap ${
                                      active
                                        ? "bg-emerald-500 border-emerald-300 text-white font-bold"
                                        : "bg-white/10 border-white/25 text-white/95 hover:bg-white/20"
                                    }`}
                                  >
                                    {o.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form
                      onSubmit={s.handleSubmit}
                      className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2.5"
                    >
                      <input
                        type="text"
                        placeholder="Имя"
                        value={s.name}
                        onChange={(e) => s.setName(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/70 px-4 py-3 outline-none focus:bg-white/25 focus:border-white/50 transition"
                      />
                      <PhoneInput
                        value={s.phone}
                        onChange={s.setPhone}
                        required
                      />
                      <button
                        type="submit"
                        disabled={!s.canSubmit || s.submitting}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 disabled:cursor-not-allowed text-white px-6 h-12 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 transition whitespace-nowrap"
                      >
                        {s.submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Подобрать
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                    {s.error && (
                      <p className="text-rose-200 text-sm mt-3 text-center">
                        {s.error}
                      </p>
                    )}
                  </>
                ) : (
                  <SuccessGlass name={s.name} phone={s.phone} />
                )}
              </div>
            </div>
          </div>

          <style>{`
            .quiz-v12-glass { position: relative; }
            .quiz-v12-glass::before {
              content:'';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;
              ${RAINBOW_CSS}
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
