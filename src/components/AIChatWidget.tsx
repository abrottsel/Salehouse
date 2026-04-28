"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Check,
  TreePine,
  Wallet,
  Ruler,
  Target,
} from "lucide-react";

interface Message {
  from: "bot" | "user";
  text: string;
}

interface QuizAnswers {
  budget?: string;
  direction?: string;
  area?: string;
  purpose?: string;
  name?: string;
  phone?: string;
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

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(true);
  const [pulseVisible, setPulseVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial bot message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            from: "bot",
            text: "Привет! Я подберу вам идеальный участок за 30 секунд. Готовы ответить на 4 коротких вопроса?",
          },
        ]);
        setTimeout(() => {
          setStep("budget");
          pushBot("Начнём с бюджета. Сколько готовы вложить за сотку?");
        }, 800);
      }, 400);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, step]);

  // Pulse animation every 30s to draw attention (only if closed and not yet interacted)
  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setPulseVisible(true);
      setTimeout(() => setPulseVisible(false), 2000);
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  function pushBot(text: string) {
    setMessages((m) => [...m, { from: "bot", text }]);
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { from: "user", text }]);
  }

  function handleOpen() {
    setIsOpen(true);
    setUnread(false);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleBudget(opt: (typeof budgetOptions)[number]) {
    setAnswers((a) => ({ ...a, budget: opt.label }));
    pushUser(opt.label);
    setTimeout(() => {
      pushBot("Отлично! А какое направление вам ближе?");
      setStep("direction");
    }, 500);
  }

  function handleDirection(dir: string) {
    setAnswers((a) => ({ ...a, direction: dir }));
    pushUser(dir);
    setTimeout(() => {
      pushBot("Какая площадь участка интересует?");
      setStep("area");
    }, 500);
  }

  function handleArea(opt: (typeof areaOptions)[number]) {
    setAnswers((a) => ({ ...a, area: opt.label }));
    pushUser(opt.label);
    setTimeout(() => {
      pushBot("Последний вопрос: для чего вам нужен участок?");
      setStep("purpose");
    }, 500);
  }

  function handlePurpose(opt: (typeof purposeOptions)[number]) {
    setAnswers((a) => ({ ...a, purpose: opt.label }));
    pushUser(opt.label);
    setTimeout(() => {
      pushBot(
        "Готово! Я подобрал для вас 5 подходящих участков. Оставьте телефон — вышлю подборку и детальную презентацию в Telegram за 2 минуты."
      );
      setStep("contact");
    }, 500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Заполните имя и телефон");
      return;
    }
    setSubmitting(true);
    try {
      const message = `[AI-подбор] Бюджет: ${answers.budget}; Направление: ${answers.direction}; Площадь: ${answers.area}; Назначение: ${answers.purpose}`;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          type: "PRESENTATION",
          message,
          source: "ai-chat-widget",
        }),
      });
      if (!res.ok) throw new Error("Не удалось отправить заявку");
      pushUser(`${name}, ${phone}`);
      setTimeout(() => {
        pushBot(
          `${name}, спасибо! Подборка уже летит к вам. Менеджер свяжется в течение 10 минут на ${phone}.`
        );
        setStep("done");
      }, 400);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка отправки. Попробуйте позвонить: +7 (985) 905-25-55"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setMessages([]);
    setAnswers({});
    setName("");
    setPhone("");
    setError("");
    setStep("greeting");
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Открыть AI-подбор участка"
          className="fixed bottom-2 right-3 sm:bottom-3 sm:right-6 z-40 group"
        >
          <span
            className={`absolute inset-0 rounded-full bg-green-500 transition-transform ${
              pulseVisible ? "animate-ping" : ""
            }`}
          />
          <span className="relative flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white h-11 w-11 sm:w-auto sm:px-5 rounded-2xl sm:rounded-full shadow-2xl shadow-green-600/40 hover:shadow-green-500/60 hover:scale-105 active:scale-95 transition-all">
            <span className="relative">
              <MessageCircle className="w-5 h-5" />
              {unread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
              )}
            </span>
            <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
              Подберу участок
            </span>
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:max-h-[80vh] flex flex-col bg-white sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">AI-подбор участка</div>
                <div className="text-xs text-green-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                  Онлайн · ответ за 30 секунд
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Закрыть"
              className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-5 space-y-3"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-green-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Step-specific controls inline */}
            {step === "budget" && (
              <div className="pt-2 space-y-2">
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleBudget(opt)}
                    className="w-full flex items-center justify-between gap-3 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 px-4 py-3 rounded-xl text-left text-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-gray-900">
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === "direction" && (
              <div className="pt-2 grid grid-cols-1 gap-2">
                {directionOptions.map((dir) => (
                  <button
                    key={dir}
                    onClick={() => handleDirection(dir)}
                    className="w-full text-left bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 transition-all"
                  >
                    {dir}
                  </button>
                ))}
              </div>
            )}

            {step === "area" && (
              <div className="pt-2 grid grid-cols-1 gap-2">
                {areaOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleArea(opt)}
                    className="w-full flex items-center justify-between bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 px-4 py-3 rounded-xl text-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Ruler className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-900">
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === "purpose" && (
              <div className="pt-2 grid grid-cols-1 gap-2">
                {purposeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handlePurpose(opt)}
                    className="w-full flex items-center gap-3 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 transition-all"
                  >
                    <opt.Icon className="w-4 h-4 text-green-600" />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {step === "done" && (
              <div className="pt-3 flex flex-col gap-2">
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-800 flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                  Заявка принята. Менеджер свяжется в течение 10 минут.
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-green-600 underline self-start"
                >
                  Пройти ещё раз
                </button>
              </div>
            )}
          </div>

          {/* Footer: contact form (only at contact step) */}
          {step === "contact" && (
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-100 bg-white p-4 flex-shrink-0 space-y-2"
            >
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
              <div className="flex items-center h-11 rounded-xl border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 overflow-hidden">
                <span className="flex items-center gap-1.5 px-3 h-full bg-emerald-50 text-emerald-700 text-sm font-bold border-r border-gray-200 shrink-0 select-none">
                  🇷🇺 +7
                </span>
                <input
                  type="tel"
                  placeholder="(___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 h-full px-3 text-sm focus:outline-none bg-transparent"
                />
              </div>
              {error && <div className="text-xs text-red-600">{error}</div>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  "Отправляем..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Получить подборку
                  </>
                )}
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                Нажимая кнопку, вы соглашаетесь с{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 underline"
                >
                  политикой обработки персональных данных
                </a>
              </p>
            </form>
          )}

          {/* Bottom footnote */}
          {step !== "contact" && (
            <div className="border-t border-gray-100 bg-white px-4 py-2.5 flex-shrink-0 flex items-center justify-between text-[10px] text-gray-400">
              <span>AI-помощник ЗемПлюс</span>
              <a
                href="tel:+79859052555"
                className="text-green-600 font-semibold hover:underline"
              >
                +7 (985) 905-25-55
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
