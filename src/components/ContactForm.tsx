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

const contactCards = [
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
    href: "mailto:info@zem-plus.ru",
    Icon: Mail,
    title: "info@zem-plus.ru",
    sub: "Написать на почту",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    ring: "ring-emerald-200/60",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      className="py-8 lg:py-12 bg-gradient-to-b from-stone-50 via-white to-emerald-50/30 scroll-mt-16 relative overflow-hidden"
    >
      {/* Decorative blurs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-green-200/15 blur-3xl pointer-events-none" />

      <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Свяжитесь с нами
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-[1.1] mb-2">
            Готовы{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              обсудить
            </span>{" "}
            ваш участок?
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            Оставьте заявку — мы поможем подобрать идеальный вариант
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-10">
          {/* Left: contacts + quick callback */}
          <div className="lg:col-span-2">
            {/* Quick callback */}
            <div className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 ring-1 ring-emerald-200/60 shadow-sm relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-300/20 blur-2xl pointer-events-none" />
              <div className="relative">
                <CallbackForm context="форма на странице «Контакты»" />
              </div>
            </div>

            {/* Contact cards */}
            <div className="space-y-2.5 mb-5">
              {contactCards.map(({ href, Icon, title, sub, gradient, bg, ring, external }) => (
                <a
                  key={title}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl ${bg} ring-1 ${ring} transition-all duration-200 hover:shadow-sm group`}
                >
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">
                      {title}
                    </div>
                    <div className="text-xs text-gray-500">{sub}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Work hours + address compact */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Пн–Вс 9:00–21:00</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Подмосковье</span>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            {isSuccess ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl ring-1 ring-green-200/60 p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-600/20">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Заявка отправлена!
                </h3>
                <p className="text-gray-600 mb-6">
                  Наш менеджер свяжется с вами в ближайшее время.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-emerald-600 font-semibold hover:underline text-sm"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl ring-1 ring-gray-200/80 shadow-sm p-5 lg:p-7"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  Оставить заявку
                </h3>

                <div className="space-y-3.5">
                  {/* Type */}
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as LeadType })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none transition-colors"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none placeholder:text-gray-400 transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none placeholder:text-gray-400 transition-colors"
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:from-green-500 hover:to-emerald-500 transition-all shadow-md shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

                  <p className="text-[10px] text-gray-400 text-center leading-tight">
                    Нажимая кнопку, вы соглашаетесь с политикой обработки
                    персональных данных
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
