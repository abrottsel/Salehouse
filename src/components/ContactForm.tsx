"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  MessageCircle,
  MapPin,
  Sparkles,
} from "lucide-react";
import PhoneInput from "./PhoneInput";
import CallbackForm from "./CallbackForm";

type LeadType = "VIEWING" | "PRESENTATION" | "MORTGAGE" | "BOOKING" | "CALLBACK";

interface FormData {
  name: string;
  phone: string;
  email: string;
  type: LeadType;
  message: string;
}

const leadTypes: { value: LeadType; label: string }[] = [
  { value: "VIEWING", label: "Записаться на просмотр" },
  { value: "PRESENTATION", label: "Получить презентацию" },
  { value: "MORTGAGE", label: "Рассчитать ипотеку" },
  { value: "BOOKING", label: "Забронировать участок" },
  { value: "CALLBACK", label: "Обратный звонок" },
];

const EMAIL_ADDRESS = "info@zem.plus";

type ContactCard = {
  href: string;
  Icon: typeof Phone;
  title: string;
  sub: string;
  gradient: string;
  bg: string;
  ring: string;
  external?: boolean;
  email?: boolean;
};

const contactCards: ContactCard[] = [
  {
    href: "tel:+79859052555",
    Icon: Phone,
    title: "+7 (985) 905-25-55",
    sub: "Ежедневно 9:00–21:00",
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50 hover:bg-green-100",
    ring: "ring-green-200/60",
  },
  {
    href: `mailto:${EMAIL_ADDRESS}`,
    Icon: Mail,
    title: EMAIL_ADDRESS,
    sub: "Написать на почту",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    ring: "ring-emerald-200/60",
    email: true,
  },
  {
    href: "https://t.me/zemplus_bot",
    Icon: MessageCircle,
    title: "@zemplus",
    sub: "Telegram — ответим быстро",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 hover:bg-sky-100",
    ring: "ring-sky-200/60",
    external: true,
  },
];

export default function ContactForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    type: "VIEWING",
    message: "",
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(EMAIL_ADDRESS);
      }
    } catch {
      // clipboard might be unavailable (insecure context, permissions) — silently ignore
    }
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 1500);
    // still try to open the user's mail client for those that have one
    window.location.href = `mailto:${EMAIL_ADDRESS}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Необходимо согласие на обработку персональных данных");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: "+7" + form.phone }),
      });

      if (!res.ok) throw new Error("Ошибка отправки");

      setIsSuccess(true);
      setForm({ name: "", phone: "", email: "", type: "VIEWING", message: "" });
    } catch {
      setError("Не удалось отправить заявку. Позвоните нам: +7 (985) 905-25-55");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contacts"
      className="py-8 lg:py-12 scroll-mt-16 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #2d3436 0%, #636e72 40%, #2d3436 100%)" }}
    >
      <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-white/80 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Свяжитесь с нами
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-[1.1] mb-2">
            Готовы{" "}
            <span className="text-emerald-400">обсудить</span>{" "}
            ваш участок?
          </h2>
          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto">
            Оставьте заявку — мы поможем подобрать идеальный вариант
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Left: contacts + quick callback */}
          <div
            className="contact-glass-card rounded-2xl p-5 lg:p-6 overflow-hidden relative"
            style={{
              backdropFilter: "blur(2px) saturate(1.8)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px -4px rgba(0,0,0,0.3)",
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Quick callback */}
            <div className="mb-5">
              <CallbackForm context="форма на странице «Контакты»" />
            </div>

            {/* Contact cards */}
            <div className="space-y-2.5 mb-5">
              {contactCards.map(({ href, Icon, title, sub, external, email }) => (
                <a
                  key={title}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  {...(email ? { onClick: handleEmailClick } : {})}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm truncate">{title}</div>
                    <div className="text-xs text-white/50">
                      {email && emailCopied ? "✓ Скопировано" : sub}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Work hours + address */}
            <div className="flex items-center gap-4 text-xs text-white/40">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Пн–Вс 9:00–21:00</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Подмосковье</span>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="mt-6 lg:mt-0">
            {isSuccess ? (
              <div
                className="contact-glass-card rounded-2xl p-8 text-center overflow-hidden relative"
                style={{
                  backdropFilter: "blur(2px) saturate(1.8)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px -4px rgba(0,0,0,0.3)",
                }}
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Заявка отправлена!</h3>
                <p className="text-white/50 mb-6">Наш менеджер свяжется с вами в ближайшее время.</p>
                <button onClick={() => setIsSuccess(false)} className="text-emerald-400 font-semibold hover:underline text-sm">
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="contact-glass-card rounded-2xl p-5 lg:p-7 overflow-hidden relative"
                style={{
                  backdropFilter: "blur(2px) saturate(1.8)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px -4px rgba(0,0,0,0.3)",
                }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Оставить заявку
                </h3>

                <div className="space-y-3.5">
                  {/* Type */}
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as LeadType })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white/10 outline-none transition-colors placeholder:text-white/30"
                  >
                    {leadTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {/* Name + Phone row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Ваше имя *"
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white/10 outline-none placeholder:text-white/30 transition-colors"
                    />
                    <PhoneInput
                      required
                      value={form.phone}
                      onChange={(digits) => setForm({ ...form, phone: digits })}
                    />
                  </div>

                  {/* Email */}
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Email (необязательно)"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white/10 outline-none placeholder:text-white/30 transition-colors"
                  />

                  {/* Message */}
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Расскажите о ваших пожеланиях..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none resize-none placeholder:text-gray-400 transition-colors"
                  />

                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}

                  <label className="flex items-start gap-2 text-[11px] text-white/55 leading-snug cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer flex-shrink-0"
                    />
                    <span>
                      Согласен на обработку персональных данных согласно{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline"
                      >
                        Политике конфиденциальности
                      </a>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || !consent}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      "Отправка..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Отправить заявку
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contact-glass-card { position: relative; }
        .contact-glass-card::before {
          content:'';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;
          background:conic-gradient(from 0deg,rgba(255,0,0,0.2),rgba(255,165,0,0.2),rgba(255,255,0,0.15),rgba(0,255,0,0.15),rgba(0,200,255,0.2),rgba(100,100,255,0.2),rgba(200,0,255,0.2),rgba(255,0,0,0.2));
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:1;
        }
      `}</style>
    </section>
  );
}
