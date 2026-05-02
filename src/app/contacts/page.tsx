import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, Send, MapPin, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Контакты — ${LEGAL.brand}`,
  description: `Контакты ${LEGAL.brand}: телефон, e-mail, реквизиты ${LEGAL.shortName}. Подбор земельных участков в Подмосковье.`,
};

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Контакты
          </h1>
          <p className="text-gray-600 mb-10">
            Свяжитесь с нами удобным способом — отвечаем в рабочие часы за 5–15
            минут.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <a
              href={`tel:${LEGAL.phoneRaw}`}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-emerald-300 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Телефон
                </div>
                <div className="text-lg font-bold text-gray-900 mt-0.5">
                  {LEGAL.phone}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Ежедневно, 9:00–21:00
                </div>
              </div>
            </a>

            <a
              href={`mailto:${LEGAL.email}`}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-emerald-300 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  E-mail
                </div>
                <div className="text-lg font-bold text-gray-900 mt-0.5">
                  {LEGAL.email}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Отвечаем в течение дня
                </div>
              </div>
            </a>

            <a
              href={LEGAL.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-emerald-300 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-[#2AABEE] flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Telegram
                </div>
                <div className="text-lg font-bold text-gray-900 mt-0.5">
                  @zemplus
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Бот для подбора участка
                </div>
              </div>
            </a>

            <a
              href={LEGAL.max}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-emerald-300 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src="/max-logo.png"
                  alt="MAX"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  MAX Messenger
                </div>
                <div className="text-lg font-bold text-gray-900 mt-0.5">
                  ЗемПлюс
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Российский мессенджер
                </div>
              </div>
            </a>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Реквизиты
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-6 gap-y-3 text-sm">
              <dt className="text-gray-500 font-semibold">Полное имя</dt>
              <dd className="text-gray-900">{LEGAL.fullName}</dd>

              <dt className="text-gray-500 font-semibold">Краткое</dt>
              <dd className="text-gray-900">{LEGAL.shortName}</dd>

              <dt className="text-gray-500 font-semibold">ИНН</dt>
              <dd className="text-gray-900 font-mono">{LEGAL.inn}</dd>

              <dt className="text-gray-500 font-semibold">ОГРНИП</dt>
              <dd className="text-gray-900 font-mono">{LEGAL.ogrn}</dd>

              <dt className="text-gray-500 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Адрес
              </dt>
              <dd className="text-gray-900">{LEGAL.legalAddress}</dd>
            </dl>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            <Link href="/privacy" className="text-emerald-600 hover:underline">
              Политика конфиденциальности
            </Link>{" "}
            ·{" "}
            <Link href="/" className="text-emerald-600 hover:underline">
              На главную
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
