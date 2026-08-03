"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  RotateCcw,
  Ruler,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Reveal } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { panel } from "./common";

/**
 * Квиз подбора — пошаговый. Вопросы и варианты один в один из боевого
 * src/components/QuizSection.tsx (банк V12), ни один текст не переписан;
 * поменялась только подача: один вопрос на экран, крупные карточки-варианты,
 * сегментный прогресс, переходы с учётом направления (вперёд/назад),
 * последним шагом — имя и телефон.
 *
 * ВАЖНО: это витрина нового дизайна, лиды отсюда никуда не уходят.
 * Ни fetch, ни /api/leads — по сабмиту показываем экран благодарности
 * локальным состоянием, и он честно говорит, что заявка не отправлена.
 * Подключение к бэкенду — отдельным решением.
 *
 * На "lite" (см. _lib/perf): без blur и салюта, переходы короткие.
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

/** Экранов всего: пять вопросов плюс контакты. */
const TOTAL = QUESTIONS.length + 1;
const CONTACT_STEP = QUESTIONS.length;

const EASE = [0.22, 1, 0.36, 1] as const;

/** Салют на экране благодарности. Координаты заданы руками —
 *  никакого Math.random(), разметка сервера и клиента обязана совпасть. */
const SPARKS = [
  { x: -118, y: -34, c: "#34d399", s: 9 },
  { x: -86, y: -78, c: "#a3e635", s: 6 },
  { x: -44, y: -104, c: "#fbbf24", s: 7 },
  { x: 4, y: -116, c: "#34d399", s: 5 },
  { x: 52, y: -100, c: "#38bdf8", s: 8 },
  { x: 94, y: -70, c: "#a3e635", s: 6 },
  { x: 122, y: -28, c: "#34d399", s: 7 },
  { x: 112, y: 26, c: "#fbbf24", s: 5 },
  { x: 70, y: 62, c: "#a3e635", s: 7 },
  { x: 12, y: 82, c: "#34d399", s: 6 },
  { x: -52, y: 68, c: "#38bdf8", s: 5 },
  { x: -104, y: 30, c: "#a3e635", s: 8 },
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

/** Подписи выбранных вариантов — для сводки на контактах и в благодарности. */
function chosenLabels(answers: AnswerMap): { id: string; title: string; label: string }[] {
  return QUESTIONS.flatMap((q) => {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    return opt ? [{ id: q.id, title: q.title, label: opt.label }] : [];
  });
}

function Recap({ answers, onPick }: { answers: AnswerMap; onPick?: (i: number) => void }) {
  const items = chosenLabels(answers);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {items.map((it, i) => {
        const inner = (
          <>
            <span className="text-white/45">{it.title}:</span>
            <span className="font-bold text-emerald-200">{it.label}</span>
          </>
        );
        const cls =
          "inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] ring-1 ring-white/10";
        return onPick ? (
          <button
            key={it.id}
            type="button"
            onClick={() => onPick(i)}
            className={`${cls} transition-colors hover:bg-white/[0.12]`}
          >
            {inner}
          </button>
        ) : (
          <span key={it.id} className={cls}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}

function Success({
  name,
  phone,
  answers,
  lite,
  onReset,
}: {
  name: string;
  phone: string;
  answers: AnswerMap;
  lite: boolean;
  onReset: () => void;
}) {
  const phoneFmt = phone ? `+7 ${formatMask(phone)}` : "";
  return (
    <motion.div
      initial={{ opacity: 0, y: lite ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: lite ? 0.2 : 0.5, ease: EASE }}
      className="py-4 text-center sm:py-6"
    >
      <div className="relative mx-auto mb-5 h-16 w-16">
        {/* Салют. На lite не рисуем — это два десятка анимируемых слоёв. */}
        {!lite &&
          SPARKS.map((s, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{ width: s.s, height: s.s, background: s.c }}
              initial={{ x: -4, y: -4, opacity: 0, scale: 0.4 }}
              animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
              transition={{ duration: 1.1, delay: 0.12 + i * 0.02, ease: "easeOut" }}
            />
          ))}

        {/* Расходящееся кольцо */}
        {!lite && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full ring-2 ring-emerald-400/60"
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}

        <motion.span
          className="relative grid h-16 w-16 place-items-center rounded-full bg-emerald-500/25 ring-2 ring-emerald-400/60"
          initial={{ scale: lite ? 1 : 0.4 }}
          animate={{ scale: 1 }}
          transition={
            lite ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 14 }
          }
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-300" />
        </motion.span>
      </div>

      <h3 className="text-2xl font-extrabold tracking-[-0.01em] sm:text-3xl">
        Спасибо, {name || "друг"}!
      </h3>

      <p className="mx-auto mt-3 max-w-[52ch] text-[14px] leading-relaxed text-white/60 sm:text-[15px]">
        Это витрина нового дизайна:{" "}
        <span className="font-bold text-amber-300">заявка никуда не отправлена</span> —
        ни менеджеру, ни в CRM. Ответы остались только в этом браузере, никто не
        перезвонит{phoneFmt ? ` на ${phoneFmt}` : ""}.
      </p>

      <div className="mt-5">
        <Recap answers={answers} />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/[0.07] px-5 text-[14px] font-bold text-white ring-1 ring-white/15 transition-all hover:bg-white/[0.13] active:scale-[0.98]"
      >
        <RotateCcw className="h-4 w-4" />
        Пройти заново
      </button>
    </motion.div>
  );
}

export default function QuizSection() {
  const lite = useTier() === "lite";
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  // step — номер экрана, dir — направление перехода для AnimatePresence.
  const [[step, dir], setStep] = useState<[number, number]>([0, 1]);

  // Автопереход после выбора варианта. Таймер держим в ref, чтобы снять
  // его при размонтировании и при повторном клике.
  const advanceRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    },
    [],
  );

  const go = (next: number) => {
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    setStep(([cur]) => [Math.max(0, Math.min(CONTACT_STEP, next)), next > cur ? 1 : -1]);
  };

  const choose = (q: QuizQuestion, value: string, from: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    // Небольшая пауза, чтобы человек увидел, что вариант выбрался.
    advanceRef.current = window.setTimeout(
      () => setStep((prev) => (prev[0] === from ? [from + 1, 1] : prev)),
      lite ? 130 : 280,
    );
  };

  const reset = () => {
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    setAnswers({});
    setName("");
    setPhone("");
    setDone(false);
    setStep([0, -1]);
  };

  const answered = QUESTIONS.filter((q) => answers[q.id]).length;
  const canSubmit =
    answered === QUESTIONS.length && name.trim().length > 0 && phone.length === 10;

  // Ничего не отправляем: витрина. Форма закрывается локально.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setDone(true);
  };

  const slide = {
    enter: (d: number) => ({ opacity: 0, x: lite ? 0 : d * 56 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: lite ? 0 : d * -56 }),
  };
  const slideTransition = { duration: lite ? 0.18 : 0.36, ease: EASE };

  const question = step < CONTACT_STEP ? QUESTIONS[step] : null;

  return (
    <section id="quiz" className="mx-auto mt-20 max-w-[1400px] scroll-mt-24 px-4 sm:mt-24 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px]">
          <Image src="/hero-v2.jpg" alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e13]/85 via-[#0b0e13]/75 to-[#0b0e13]/92" />
          {/* Зелёное зарево под панелью — тот самый «вау» на входе */}
          {!lite && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[60%]"
              style={{
                background:
                  "radial-gradient(60% 100% at 50% 0%, rgba(16,185,129,0.28) 0%, rgba(16,185,129,0) 70%)",
              }}
            />
          )}

          <div className="relative flex items-center justify-center px-3 py-5 sm:px-8 sm:py-9">
            <div
              className="w-full max-w-3xl rounded-[24px] px-4 py-5 sm:px-8 sm:py-7"
              style={panel(lite)}
            >
              {done ? (
                <Success
                  name={name.trim()}
                  phone={phone}
                  answers={answers}
                  lite={lite}
                  onReset={reset}
                />
              ) : (
                <>
                  <div className="mb-5 text-center sm:mb-6">
                    <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5" /> Тёплый подбор
                    </p>
                    <h2 className="mx-auto max-w-[22ch] text-[22px] font-extrabold leading-[1.12] tracking-[-0.02em] sm:max-w-[26ch] sm:text-[34px] lg:text-[40px]">
                      Расскажите о мечте — подберём 3 идеальных участка
                    </h2>
                  </div>

                  {/* Сегментный прогресс: сразу видно, сколько экранов осталось */}
                  <div className="mb-5 flex items-center gap-2 sm:mb-6">
                    {Array.from({ length: TOTAL }, (_, i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
                      >
                        <motion.div
                          className="h-full origin-left rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                          initial={false}
                          animate={{ scaleX: i < step ? 1 : i === step ? 0.4 : 0 }}
                          transition={{ duration: lite ? 0.15 : 0.45, ease: EASE }}
                          style={
                            i <= step && !lite
                              ? { boxShadow: "0 0 10px rgba(52,211,153,0.6)" }
                              : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {/* Высота зафиксирована снизу, чтобы панель не прыгала при
                      смене экранов. */}
                  {/* Минимальная высота держит карточку от прыжков между
                      шагами, но раньше была выставлена по самому длинному
                      шагу — и под коротким вопросом оставалось 80px пустоты.
                      Опущена до высоты сетки вариантов: скачок между шагами
                      сглаживает анимация, а дыры внизу больше нет. */}
                  <div className="min-h-[192px] sm:min-h-[212px]">
                    <AnimatePresence mode="wait" custom={dir} initial={false}>
                      <motion.div
                        key={step}
                        custom={dir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={slideTransition}
                      >
                        {question ? (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400/12 ring-1 ring-emerald-400/30">
                                <question.icon className="h-5 w-5 text-emerald-300" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                  Вопрос {step + 1} из {QUESTIONS.length}
                                </p>
                                <h3 className="text-[22px] font-extrabold leading-tight sm:text-[28px]">
                                  {question.title}
                                </h3>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-4 sm:gap-3">
                              {question.options.map((o) => {
                                const active = answers[question.id] === o.value;
                                return (
                                  <button
                                    key={o.value}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => choose(question, o.value, step)}
                                    className={`relative flex min-h-[84px] items-center justify-center rounded-2xl px-3 py-4 text-center transition-all active:scale-[0.97] sm:min-h-[110px] ${
                                      active
                                        ? "bg-emerald-500 text-white ring-2 ring-emerald-300 shadow-[0_16px_44px_-12px_rgba(16,185,129,0.9)]"
                                        : "bg-white/[0.05] text-white/90 ring-1 ring-white/12 hover:-translate-y-0.5 hover:bg-white/[0.10] hover:ring-white/25"
                                    }`}
                                  >
                                    <span className="text-[16px] font-extrabold leading-tight sm:text-[18px]">
                                      {o.label}
                                    </span>
                                    {active && (
                                      <motion.span
                                        className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-white"
                                        initial={{ scale: lite ? 1 : 0 }}
                                        animate={{ scale: 1 }}
                                        transition={
                                          lite
                                            ? { duration: 0.1 }
                                            : { type: "spring", stiffness: 520, damping: 18 }
                                        }
                                      >
                                        <Check
                                          className="h-3.5 w-3.5 text-emerald-600"
                                          strokeWidth={3.5}
                                        />
                                      </motion.span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => go(step - 1)}
                                disabled={step === 0}
                                className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold text-white/70 ring-1 ring-white/12 transition-all hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-0"
                              >
                                <ArrowLeft className="h-4 w-4" />
                                Назад
                              </button>
                              <button
                                type="button"
                                onClick={() => go(step + 1)}
                                disabled={!answers[question.id]}
                                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white/[0.07] px-4 text-[13px] font-bold text-white ring-1 ring-white/15 transition-all hover:bg-white/[0.14] disabled:pointer-events-none disabled:opacity-0"
                              >
                                Далее
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <form onSubmit={handleSubmit}>
                            <div className="text-center">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                                Последний шаг
                              </p>
                              <h3 className="mt-1 text-[22px] font-extrabold leading-tight sm:text-[28px]">
                                Куда прислать подборку?
                              </h3>
                            </div>

                            <div className="mt-4">
                              <Recap answers={answers} onPick={(i) => go(i)} />
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
                            </div>

                            <button
                              type="submit"
                              disabled={!canSubmit}
                              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-500 px-6 text-[15px] font-bold text-white shadow-[0_16px_44px_-12px_rgba(16,185,129,0.9)] transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-emerald-500/30 disabled:text-white/50 disabled:shadow-none"
                            >
                              Подобрать
                              <ArrowRight className="h-4 w-4" />
                            </button>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => go(step - 1)}
                                className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold text-white/70 ring-1 ring-white/12 transition-all hover:bg-white/[0.08] hover:text-white"
                              >
                                <ArrowLeft className="h-4 w-4" />
                                Назад
                              </button>
                              <p className="text-right text-[11px] leading-snug text-white/35">
                                Витрина дизайна: заявка никуда не отправляется
                              </p>
                            </div>
                          </form>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
