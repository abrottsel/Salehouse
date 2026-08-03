"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  Ruler,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Reveal } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { panel } from "./common";

/**
 * Квиз подбора. Вопросы и варианты — один в один из боевого
 * src/components/QuizSection.tsx (банк V12).
 *
 * ВАЖНО: это витрина нового дизайна, лиды отсюда никуда не уходят.
 * Ни fetch, ни /api/leads — по сабмиту показываем экран благодарности
 * локальным состоянием. Подключение к бэкенду — отдельным решением.
 */

type AnswerMap = Record<string, string>;

interface QuizOption {
  value: string;
  label: string;
}
interface QuizQuestion {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "area",
    title: "Площадь",
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
    icon: Calendar,
    options: [
      { value: "now", label: "Сейчас" },
      { value: "month", label: "Месяц" },
      { value: "season", label: "Сезон" },
      { value: "look", label: "Смотрю" },
    ],
  },
];

/** «(999) 123-45-67» из десяти цифр после +7. */
function formatMask(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  const parts: string[] = [];
  if (d.length > 0) parts.push("(" + d.slice(0, 3));
  if (d.length >= 3) parts[0] += ")";
  if (d.length > 3) parts.push(" " + d.slice(3, 6));
  if (d.length > 6) parts.push("-" + d.slice(6, 8));
  if (d.length > 8) parts.push("-" + d.slice(8, 10));
  return parts.join("");
}

function Success({ name, phone }: { name: string; phone: string }) {
  const phoneFmt = phone ? `+7 ${formatMask(phone)}` : "";
  return (
    <div className="py-6 text-center">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/25 ring-2 ring-emerald-400/60">
        <CheckCircle2 className="h-7 w-7 text-emerald-300" />
      </div>
      <h3 className="text-2xl font-extrabold tracking-[-0.01em] sm:text-3xl">
        Спасибо, {name || "друг"}!
      </h3>
      <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-white/60 sm:text-[15px]">
        Менеджер перезвонит на {phoneFmt || "ваш номер"} в течение 15 минут и
        пришлёт подборку участков.
      </p>
    </div>
  );
}

export default function QuizSection() {
  const lite = useTier() === "lite";
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  const answered = QUESTIONS.filter((q) => answers[q.id]).length;
  const canSubmit =
    answered === QUESTIONS.length && name.trim().length > 0 && phone.length === 10;

  // Ничего не отправляем: витрина. Форма закрывается локально.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setDone(true);
  };

  return (
    <section id="quiz" className="mx-auto mt-20 max-w-[1400px] scroll-mt-24 px-4 sm:mt-28 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px]">
          <Image
            src="/hero-v2.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e13]/85 via-[#0b0e13]/75 to-[#0b0e13]/92" />

          <div className="relative flex items-center justify-center px-3 py-8 sm:px-8 sm:py-12">
            <div
              className="w-full max-w-5xl rounded-[24px] px-5 py-6 sm:px-8 sm:py-8"
              style={panel(lite)}
            >
              {done ? (
                <Success name={name.trim()} phone={phone} />
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5" /> Тёплый подбор
                    </p>
                    <h2 className="mx-auto max-w-[22ch] text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:max-w-none sm:text-4xl lg:text-[44px]">
                      Расскажите о мечте — подберём 3 идеальных участка
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    {QUESTIONS.map((q) => {
                      const Icon = q.icon;
                      return (
                        <div
                          key={q.id}
                          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <div className="flex shrink-0 items-center gap-2 sm:w-44">
                            <Icon className="h-4 w-4 text-emerald-300" />
                            <p className="text-[14px] font-bold sm:text-[15px]">{q.title}</p>
                          </div>
                          <div className="flex flex-1 flex-wrap gap-1.5">
                            {q.options.map((o) => {
                              const active = answers[q.id] === o.value;
                              return (
                                <button
                                  key={o.value}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    setAnswers((p) => ({ ...p, [q.id]: o.value }))
                                  }
                                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 transition-all ${
                                    active
                                      ? "bg-emerald-500 text-white ring-emerald-300 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.8)]"
                                      : "bg-white/[0.06] text-white/85 ring-white/15 hover:bg-white/[0.13]"
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

                  {/* прогресс — видно, сколько осталось до кнопки */}
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-[width] duration-500"
                        style={{ width: `${(answered / QUESTIONS.length) * 100}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[12px] tabular-nums text-white/45">
                      {answered} из {QUESTIONS.length}
                    </span>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      type="text"
                      placeholder="Имя"
                      aria-label="Имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl bg-white/[0.06] px-4 text-[15px] text-white outline-none ring-1 ring-white/15 transition placeholder:text-white/40 focus:bg-white/[0.10] focus:ring-emerald-400/60"
                    />

                    <div className="flex h-12 items-stretch overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/15 transition focus-within:ring-emerald-400/60">
                      <span className="flex select-none items-center border-r border-white/10 px-3.5 text-[15px] font-bold tabular-nums text-emerald-300">
                        +7
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        aria-label="Телефон"
                        placeholder="(___) ___-__-__"
                        required
                        value={formatMask(phone)}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className="min-w-0 flex-1 bg-transparent px-3.5 text-[15px] tabular-nums text-white outline-none placeholder:text-white/40"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-500 px-6 text-[14px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-emerald-500/30 disabled:text-white/50 disabled:shadow-none"
                    >
                      Подобрать
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
