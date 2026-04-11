"use client";

import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  FileCheck2,
  Landmark,
  Home as HomeIcon,
  Zap,
  Undo2,
  ScrollText,
  BadgePercent,
  type LucideIcon,
} from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
  Icon: LucideIcon;
  bg: string;
  ring: string;
  iconBg: string;
}

const faqItems: FaqItem[] = [
  {
    q: "Как проверить юридическую чистоту?",
    a: "Мы прикладываем к договору выписку из ЕГРН, межевой план и справки об обременениях. Штатный юрист компании отвечает за каждую сделку. Все документы передаются вам на руки до подписания договора.",
    Icon: ShieldCheck,
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/60",
    iconBg: "bg-emerald-500",
  },
  {
    q: "Что такое ИЖС и чем отличается от СНТ?",
    a: "ИЖС (индивидуальное жилищное строительство) даёт право постоянной прописки, строительства капитального дома и подведения всех коммуникаций за счёт государственных программ. СНТ — садовое товарищество с ограничениями на постройку и прописку.",
    Icon: FileCheck2,
    bg: "bg-amber-50",
    ring: "ring-amber-200/60",
    iconBg: "bg-amber-500",
  },
  {
    q: "Какая ипотека доступна на участок?",
    a: "Работаем с ВТБ, Сбером, Альфа-Банком, Газпромбанком и Россельхозбанком. Помогаем собрать документы и получить одобрение. Первоначальный взнос от 20%, срок до 30 лет.",
    Icon: Landmark,
    bg: "bg-sky-50",
    ring: "ring-sky-200/60",
    iconBg: "bg-sky-500",
  },
  {
    q: "Можно ли прописаться в доме?",
    a: "Да, в домах на участках категории ИЖС вы оформляете постоянную регистрацию так же, как в городской квартире. Мы поможем с оформлением техпаспорта и адреса.",
    Icon: HomeIcon,
    bg: "bg-violet-50",
    ring: "ring-violet-200/60",
    iconBg: "bg-violet-500",
  },
  {
    q: "Кто подводит коммуникации?",
    a: "В готовых посёлках газ, электричество и вода уже подведены к границам участка. Остаётся только подключиться — мы поможем с документами и сопроводим процесс до ввода в эксплуатацию.",
    Icon: Zap,
    bg: "bg-yellow-50",
    ring: "ring-yellow-200/60",
    iconBg: "bg-yellow-500",
  },
  {
    q: "Что если передумаю после брони?",
    a: "Бронирование возвратное в течение 7 дней. Если передумаете в этот срок — вернём сумму брони без вопросов и комиссий. После 7 дней возврат возможен по согласованию.",
    Icon: Undo2,
    bg: "bg-rose-50",
    ring: "ring-rose-200/60",
    iconBg: "bg-rose-500",
  },
  {
    q: "Как проходит сделка через Росреестр?",
    a: "Подписываем договор купли-продажи, подаём документы в МФЦ или напрямую в Росреестр. Регистрация занимает 5–7 рабочих дней, после чего вы получаете выписку ЕГРН с вашим именем как собственника.",
    Icon: ScrollText,
    bg: "bg-teal-50",
    ring: "ring-teal-200/60",
    iconBg: "bg-teal-500",
  },
  {
    q: "Есть ли рассрочка без переплат?",
    a: "Да, предоставляем беспроцентную рассрочку до 12 месяцев. Первый взнос от 30%, остальное равными платежами каждый месяц. Для молодых семей действует специальная программа с дополнительными условиями.",
    Icon: BadgePercent,
    bg: "bg-slate-50",
    ring: "ring-slate-200/60",
    iconBg: "bg-slate-600",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-10 lg:py-14 bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Частые вопросы
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1.5">
            Всё, что{" "}
            <span className="text-green-600">обычно спрашивают</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Если вашего вопроса нет — позвоните, ответим развёрнуто и без воды.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className={`group text-left rounded-2xl p-4 ${item.bg} ring-1 ${item.ring} transition-all hover:shadow-sm`}
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shadow-sm`}
                  >
                    <item.Icon
                      className="w-5 h-5 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-gray-900 leading-snug">
                        {item.q}
                      </h3>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 shrink-0 mt-0.5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-2"
                          : "grid-rows-[0fr] opacity-0 mt-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-[12px] text-gray-700 leading-relaxed pr-1">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
