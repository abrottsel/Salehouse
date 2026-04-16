import {
  ShieldCheck,
  Flame,
  Zap,
  Car,
  ShieldAlert,
  Wallet,
  BadgePercent,
  FileCheck2,
  Landmark,
  PiggyBank,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

/**
 * Advantages — "Всё включено для комфортной жизни"
 * Merged: old Advantages + Infrastructure (removed duplicates).
 * 8 pastel cards + savings banner.
 */

interface Item {
  Icon: LucideIcon;
  title: string;
  description: string;
  bg: string;
  ring: string;
  iconBg: string;
}

const items: Item[] = [
  // BIG top — Юридическая чистота
  {
    Icon: ShieldCheck,
    title: "Юридическая чистота",
    description: "Аудит каждого участка. Гарантия чистой сделки закреплена в договоре.",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/70",
    iconBg: "bg-emerald-500",
  },
  // Газ + свет + вода
  {
    Icon: Flame,
    title: "Газ, свет, вода",
    description: "Магистральный газ, 15 кВт электричества, центральный водопровод или скважина.",
    bg: "bg-amber-50",
    ring: "ring-amber-200/70",
    iconBg: "bg-amber-500",
  },
  // Асфальт
  {
    Icon: Car,
    title: "Асфальтовые дороги",
    description: "Твёрдое покрытие внутри посёлка и удобные подъезды.",
    bg: "bg-slate-50",
    ring: "ring-slate-200/70",
    iconBg: "bg-slate-600",
  },
  // Охрана
  {
    Icon: ShieldAlert,
    title: "Охрана и КПП 24/7",
    description: "Видеонаблюдение, КПП, патрулирование территории.",
    bg: "bg-rose-50",
    ring: "ring-rose-200/70",
    iconBg: "bg-rose-500",
  },
  // Цены
  {
    Icon: Wallet,
    title: "Прозрачные цены",
    description: "Всё в договоре. Без скрытых платежей и доплат.",
    bg: "bg-teal-50",
    ring: "ring-teal-200/70",
    iconBg: "bg-teal-500",
  },
  // Рассрочка
  {
    Icon: BadgePercent,
    title: "Рассрочка 0%",
    description: "До 12 месяцев без переплат. Первый взнос от 50 000 ₽.",
    bg: "bg-violet-50",
    ring: "ring-violet-200/70",
    iconBg: "bg-violet-500",
  },
  // Ипотека
  {
    Icon: Landmark,
    title: "Ипотека в 6 банках",
    description: "ВТБ, Сбер, Альфа, ГПБ, Россельхоз, Т-Банк.",
    bg: "bg-sky-50",
    ring: "ring-sky-200/70",
    iconBg: "bg-sky-500",
  },
  // BIG bottom — ИЖС
  {
    Icon: FileCheck2,
    title: "Категория ИЖС",
    description:
      "Постоянная прописка, материнский капитал, ипотека и все государственные программы.",
    bg: "bg-yellow-50",
    ring: "ring-yellow-200/70",
    iconBg: "bg-yellow-500",
  },
];

function Card({ item, big }: { item: Item; big: boolean }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl ${item.bg} ring-1 ${
        item.ring
      } cursor-default h-full ${
        big ? "col-span-2 md:col-span-1 p-5 md:p-4" : "p-4"
      }`}
    >
      <div
        className={`rounded-xl ${item.iconBg} flex items-center justify-center shadow-sm ${
          big ? "w-12 h-12 md:w-10 md:h-10" : "w-10 h-10"
        }`}
      >
        <item.Icon
          className={`text-white ${big ? "w-6 h-6 md:w-5 md:h-5" : "w-5 h-5"}`}
          strokeWidth={2.5}
        />
      </div>
      <h3
        className={`font-extrabold text-gray-900 leading-tight ${
          big ? "text-base md:text-sm" : "text-sm"
        }`}
      >
        {item.title}
      </h3>
      <p
        className={`text-gray-600 leading-snug ${
          big ? "text-xs md:text-[11px]" : "text-[11px]"
        }`}
      >
        {item.description}
      </p>
    </div>
  );
}

export default function Advantages() {
  return (
    <section id="advantages" className="py-6 lg:py-10 bg-white scroll-mt-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <PiggyBank className="w-3.5 h-3.5" />
            Наши преимущества
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1.5">
            Всё включено{" "}
            <span className="text-green-600">для комфортной жизни</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Коммуникации, охрана, дороги и финансовые программы — всё готово.
          </p>
        </div>

        {/* 8-card grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {items.map((item, i) => {
            const isBig = i === 0 || i === items.length - 1;
            return <Card key={item.title} item={item} big={isBig} />;
          })}
        </div>

        {/* Savings banner (from old Infrastructure) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-green-100 to-emerald-200 ring-1 ring-emerald-300/70 px-4 py-4 sm:px-6 sm:py-5">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-green-400/25 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
            <div className="flex items-start gap-3 text-left">
              <div className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white ring-1 ring-emerald-300 flex items-center justify-center shadow-sm">
                <PiggyBank className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-black text-emerald-950 tracking-tight leading-tight">
                  Экономия 500 000 – 2 000 000 ₽
                </h3>
                <p className="text-[11px] sm:text-xs md:text-sm text-emerald-900/75 mt-0.5">
                  На подведении коммуникаций — всё уже сделано.
                </p>
              </div>
            </div>

            <div className="flex items-stretch gap-2 shrink-0">
              <a
                href="#contacts"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 sm:px-5 h-10 md:h-11 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                Презентация
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </a>
              <a
                href="#calculator"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300 hover:ring-emerald-400 px-4 sm:px-5 h-10 md:h-11 rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                <Wallet className="w-4 h-4 shrink-0" />
                Ипотека
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
