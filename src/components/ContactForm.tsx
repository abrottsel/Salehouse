"use client";

import { useState } from "react";
import { Phone, Mail, Send, Clock, CheckCircle2, MessageCircle } from "lucide-react";
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
    <section id="contacts" className="py-10 lg:py-14 bg-white scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Info */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Свяжитесь с нами
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Оставьте заявку или позвоните — мы ответим на все вопросы
              и поможем подобрать идеальный участок.
            </p>

            {/* Quick callback — минимум трения, только номер */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border border-green-200 shadow-sm">
              <CallbackForm context="форма на странице «Контакты»" />
            </div>

            <div className="space-y-4 mb-8">
              <a
                href="tel:+79859052555"
                className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
              >
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    +7 (985) 905-25-55
                  </div>
                  <div className="text-sm text-gray-500">
                    Ежедневно с 9:00 до 21:00
                  </div>
                </div>
              </a>

              <a
                href="mailto:a.brottsel@mail.ru"
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    a.brottsel@mail.ru
                  </div>
                  <div className="text-sm text-gray-500">
                    Ответим в течение часа
                  </div>
                </div>
              </a>

              <a
                href="https://t.me/Abrottsel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    @Abrottsel
                  </div>
                  <div className="text-sm text-gray-500">
                    Telegram — ответим быстро
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Режим работы
                  </div>
                  <div className="text-sm text-gray-500">
                    Пн-Вс: 9:00 - 21:00
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="mt-12 lg:mt-0">
            {isSuccess ? (
              <div className="bg-green-50 rounded-2xl p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Заявка отправлена!
                </h3>
                <p className="text-gray-600 mb-6">
                  Наш менеджер свяжется с вами в ближайшее время.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-green-600 font-medium hover:underline"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-gray-50 rounded-2xl p-6 lg:p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Оставить заявку
                </h3>

                <div className="space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Что вас интересует?
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value as LeadType })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                      {leadTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Как к вам обращаться?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder:text-gray-400"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Телефон *
                    </label>
                    <PhoneInput
                      required
                      value={form.phone}
                      onChange={(digits) => setForm({ ...form, phone: digits })}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="mail@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder:text-gray-400"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Сообщение
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Расскажите о ваших пожеланиях..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none placeholder:text-gray-400"
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                  <p className="text-xs text-gray-400 text-center">
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
