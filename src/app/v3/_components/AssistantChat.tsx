"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Check,
  MessageCircle,
  Ruler,
  Send,
  Sparkles,
  Target,
  TreePine,
  Wallet,
  X,
} from "lucide-react";
import { glassStyle } from "./ui/primitives";
import { useTier } from "../_lib/perf";

/**
 * Чат-ассистент «Подберу участок» для /v3.
 *
 * Сценарий и формулировки один в один из боевого src/components/AIChatWidget.tsx
 * (бюджет → направление → площадь → цель → имя и телефон), оформление своё:
 * тёмное стекло ветки и изумруд вместо белой панели.
 *
 * ВАЖНО: боевой виджет подключать нельзя — он шлёт лид на /api/leads. Здесь
 * витрина: ни fetch, ни единого запроса, экран благодарности рисуется локальным
 * состоянием и честно говорит, что заявка не ушла (как в QuizSection).
 *
 * Панель уходит порталом в body: у пилюли мессенджеров свой transform (подъём
 * над cookie-баннером), а он создаёт containing block для position:fixed и
 * утащил бы окно за собой. Класс v3-scope возвращает порталу палитру ветки.
 */

interface Message {
  from: "bot" | "user";
  text: string;
}

type Step = "greeting" | "budget" | "direction" | "area" | "purpose" | "contact" | "done";

const budgetOptions = [
  { value: "economy", label: "До 500 000 ₽ за сотку", desc: "Эконом" },
  { value: "standard", label: "500 000 – 1 млн ₽", desc: "Стандарт" },
  { value: "business", label: "1 – 2 млн ₽", desc: "Бизнес" },
  { value: "premium", label: "Не ограничен", desc: "Премиум" },
];

const directionOptions = [
  "Каширское шоссе",
  "Симферопольское шоссе",
  "Дмитровское шоссе",
  "Новорижское шоссе",
  "Не важно",
];

const areaOptions = [
  { value: "6-8", label: "6–8 соток", desc: "Компакт" },
  { value: "9-12", label: "9–12 соток", desc: "Стандарт" },
  { value: "12+", label: "От 12 соток", desc: "Простор" },
];

const purposeOptions = [
  { value: "live", label: "Жить круглый год", Icon: TreePine },
  { value: "dacha", label: "Дача выходного дня", Icon: Sparkles },
  { value: "invest", label: "Инвестиция", Icon: Target },
];

const GREETING =
  "Привет! Я подберу вам идеальный участок за 30 секунд. Готовы ответить на 4 коротких вопроса?";

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

export default function AssistantChat({ enabled = true }: { enabled?: boolean }) {
  const lite = useTier() === "lite";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);

  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    },
    [],
  );

  // Прокрутка ленты к последнему сообщению. Это правка DOM, а не состояния,
  // поэтому эффекту здесь ничего не мешает.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, step, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Скролл страницы под открытой панелью блокируем только на телефоне: там
  // панель занимает почти весь экран, а на десктопе это лишь окно в углу.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 639px)");
    const prev = document.body.style.overflow;
    let locked = false;
    const sync = () => {
      if (mq.matches && !locked) {
        document.body.style.overflow = "hidden";
        locked = true;
      } else if (!mq.matches && locked) {
        document.body.style.overflow = prev;
        locked = false;
      }
    };
    sync();
    mq.addEventListener("change", sync);
    const id = window.setTimeout(
      () => closeRef.current?.focus({ preventScroll: true }),
      0,
    );
    return () => {
      mq.removeEventListener("change", sync);
      window.clearTimeout(id);
      if (locked) document.body.style.overflow = prev;
    };
  }, [open]);

  const pushUser = (text: string) => setMessages((m) => [...m, { from: "user", text }]);

  const botSay = (text: string, delay: number, then?: () => void) => {
    setTyping(true);
    after(delay, () => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text }]);
      then?.();
    });
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      botSay(GREETING, lite ? 200 : 450, () =>
        botSay("Начнём с бюджета. Сколько готовы вложить за сотку?", lite ? 300 : 800, () =>
          setStep("budget"),
        ),
      );
    }
  };

  const answer = (label: string, question: string, next: Step) => {
    pushUser(label);
    botSay(question, lite ? 250 : 500, () => setStep(next));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length !== 10) {
      setError("Заполните имя и телефон");
      return;
    }
    setError("");
    const phoneFmt = `+7 ${formatMask(phone)}`;
    pushUser(`${name.trim()}, ${phoneFmt}`);
    botSay(
      `${name.trim()}, спасибо! Это витрина нового дизайна — заявка никуда не отправлена, ни менеджеру, ни в CRM. Ответы остались только в этом браузере, никто не перезвонит на ${phoneFmt}.`,
      lite ? 200 : 450,
      () => setStep("done"),
    );
  };

  const reset = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setMessages([]);
    setName("");
    setPhone("");
    setError("");
    setTyping(false);
    setStep("greeting");
    botSay(GREETING, lite ? 200 : 450, () =>
      botSay("Начнём с бюджета. Сколько готовы вложить за сотку?", lite ? 300 : 800, () =>
        setStep("budget"),
      ),
    );
  };

  const optionClass =
    "flex min-h-[52px] w-full items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 text-left text-[14px] font-semibold text-white ring-1 ring-white/12 transition-all hover:bg-white/[0.11] hover:ring-white/25 active:scale-[0.98]";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Чат-ассистент: подберу участок"
        title="Подберу участок"
        aria-haspopup="dialog"
        aria-expanded={open}
        tabIndex={enabled ? 0 : -1}
        className="grid h-11 w-9 place-items-center rounded-full transition-transform hover:scale-110 active:scale-95"
      >
        <span className="v3-on-dark grid h-[22px] w-[22px] place-items-center rounded-[7px] bg-gradient-to-br from-emerald-400 to-emerald-600">
          <MessageCircle className="h-3.5 w-3.5 text-white" strokeWidth={2.6} />
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="v3-scope fixed inset-0 z-[110] text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Чат-ассистент подбора участка"
          >
            <button
              type="button"
              aria-label="Закрыть чат"
              onClick={() => setOpen(false)}
              className={`absolute inset-0 cursor-default bg-black/55 sm:bg-black/25 ${
                lite ? "" : "backdrop-blur-[2px]"
              }`}
            />

            <motion.div
              initial={{ opacity: 0, y: lite ? 0 : 18, scale: lite ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: lite ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={
                lite
                  ? { ...glassStyle, backdropFilter: "none", WebkitBackdropFilter: "none" }
                  : glassStyle
              }
              /* Верх панели упирается в 84px от края экрана — ровно под шапкой
                 ветки (она 80px). dvh только там, где он есть: Safari 15.0–15.3
                 из browserslist его не знает. */
              className="absolute bottom-[66px] left-3 right-3 flex max-h-[calc(100vh-150px)] flex-col overflow-hidden rounded-[24px] supports-[height:100dvh]:max-h-[calc(100dvh-150px)] sm:bottom-[70px] sm:left-auto sm:right-4 sm:w-[380px] sm:max-h-[min(560px,calc(100vh-140px))] sm:supports-[height:100dvh]:max-h-[min(560px,calc(100dvh-140px))]"
            >
              <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3">
                <span className="v3-on-dark grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-white">AI-подбор участка</div>
                  <div className="flex items-center gap-1.5 text-[12px] text-white/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Онлайн · ответ за 30 секунд
                  </div>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/[0.09] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div
                ref={scrollRef}
                aria-live="polite"
                className="v3-scroll flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4"
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] break-words rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                        msg.from === "user"
                          ? "rounded-br-md bg-emerald-500 font-semibold text-white"
                          : "rounded-bl-md bg-white/[0.06] text-white/85 ring-1 ring-white/10"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/[0.06] px-3.5 py-3 ring-1 ring-white/10">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                          animate={lite ? undefined : { opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!typing && step === "budget" && (
                  <div className="space-y-2 pt-1">
                    {budgetOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          answer(
                            opt.label,
                            "Отлично! А какое направление вам ближе?",
                            "direction",
                          )
                        }
                        className={`${optionClass} justify-between`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <Wallet className="h-4 w-4 shrink-0 text-emerald-300" />
                          <span className="min-w-0">{opt.label}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {!typing && step === "direction" && (
                  <div className="space-y-2 pt-1">
                    {directionOptions.map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() =>
                          answer(dir, "Какая площадь участка интересует?", "area")
                        }
                        className={optionClass}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                )}

                {!typing && step === "area" && (
                  <div className="space-y-2 pt-1">
                    {areaOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          answer(
                            opt.label,
                            "Последний вопрос: для чего вам нужен участок?",
                            "purpose",
                          )
                        }
                        className={`${optionClass} justify-between`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <Ruler className="h-4 w-4 shrink-0 text-emerald-300" />
                          <span className="min-w-0">{opt.label}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {!typing && step === "purpose" && (
                  <div className="space-y-2 pt-1">
                    {purposeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          answer(
                            opt.label,
                            "Готово! Я подобрал для вас 5 подходящих участков. Оставьте телефон — вышлю подборку и детальную презентацию в Telegram за 2 минуты.",
                            "contact",
                          )
                        }
                        className={optionClass}
                      >
                        <opt.Icon className="h-4 w-4 shrink-0 text-emerald-300" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {!typing && step === "done" && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-2 rounded-2xl bg-emerald-400/10 px-3.5 py-3 text-[12px] leading-relaxed text-emerald-200 ring-1 ring-emerald-400/25">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>
                        Витрина дизайна: заявка{" "}
                        <span className="font-bold">никуда не отправлена</span>.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex h-11 items-center rounded-full px-4 text-[13px] font-bold text-white/70 ring-1 ring-white/12 transition-all hover:bg-white/[0.08] hover:text-white"
                    >
                      Пройти ещё раз
                    </button>
                  </div>
                )}
              </div>

              {step === "contact" && !typing && (
                <form
                  onSubmit={handleSubmit}
                  className="shrink-0 space-y-2.5 border-t border-white/10 px-4 py-3.5"
                >
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    aria-label="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                      value={formatMask(phone)}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className="min-w-0 flex-1 bg-transparent px-3.5 text-[15px] tabular-nums text-white outline-none placeholder:text-white/40"
                    />
                  </div>
                  {error && <p className="text-[12px] text-red-400">{error}</p>}
                  <button
                    type="submit"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-[15px] font-bold text-white shadow-[0_16px_44px_-12px_rgba(16,185,129,0.9)] transition-all hover:bg-emerald-400 active:scale-[0.98]"
                  >
                    <Send className="h-4 w-4" />
                    Получить подборку
                  </button>
                  <p className="text-center text-[11px] leading-snug text-white/35">
                    Витрина дизайна: заявка никуда не отправляется
                  </p>
                </form>
              )}

              {step !== "contact" && (
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-4 text-[11px] text-white/35">
                  <span>Витрина дизайна — заявки не уходят</span>
                  <a
                    href="tel:+79859052555"
                    className="inline-flex min-h-11 shrink-0 items-center font-bold text-emerald-300 hover:underline"
                  >
                    +7 (985) 905-25-55
                  </a>
                </div>
              )}
            </motion.div>
          </div>,
          document.body,
        )}
    </>
  );
}
