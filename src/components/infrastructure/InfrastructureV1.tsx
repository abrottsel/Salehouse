import {
  Flame,
  Zap,
  Droplets,
  Car,
  ShieldCheck,
  Lightbulb,
  Trash2,
  Snowflake,
  Sparkles,
  ArrowRight,
  type LucideIcon,
  Wallet,
  PiggyBank,
} from "lucide-react";

/**
 * Infrastructure V1 — "Pastel bento" (в стиле Advantages V2)
 * Однородная сетка 4x2 / 2x4 с пастельными карточками.
 * Сверху — компактный заголовок.
 * Снизу — большой stat-банер с экономией + 2 CTA.
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
  {
    Icon: Flame,
    title: "Магистральный газ",
    description: "Газопровод до каждого участка.",
    bg: "bg-amber-50",
    ring: "ring-amber-200/60",
    iconBg: "bg-amber-500",
  },
  {
    Icon: Zap,
    title: "Электричество",
    description: "15 кВт на участок, своя подстанция.",
    bg: "bg-yellow-50",
    ring: "ring-yellow-200/60",
    iconBg: "bg-yellow-500",
  },
  {
    Icon: Droplets,
    title: "Водоснабжение",
    description: "Центральный водопровод или скважина.",
    bg: "bg-sky-50",
    ring: "ring-sky-200/60",
    iconBg: "bg-sky-500",
  },
  {
    Icon: Car,
    title: "Асфальт",
    description: "Твёрдое покрытие внутри и подъезды.",
    bg: "bg-slate-50",
    ring: "ring-slate-200/60",
    iconBg: "bg-slate-600",
  },
  {
    Icon: ShieldCheck,
    title: "Охрана и КПП",
    description: "24/7, КПП, видеонаблюдение.",
    bg: "bg-rose-50",
    ring: "ring-rose-200/60",
    iconBg: "bg-rose-500",
  },
  {
    Icon: Lightbulb,
    title: "Освещение",
    description: "Дороги и общественные зоны.",
    bg: "bg-teal-50",
    ring: "ring-teal-200/60",
    iconBg: "bg-teal-500",
  },
  {
    Icon: Trash2,
    title: "Вывоз мусора",
    description: "Организованный сбор и вывоз ТБО.",
    bg: "bg-violet-50",
    ring: "ring-violet-200/60",
    iconBg: "bg-violet-500",
  },
  {
    Icon: Snowflake,
    title: "Чистка зимой",
    description: "Регулярная уборка снега.",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/60",
    iconBg: "bg-emerald-500",
  },
];

function Card({ item }: { item: Item }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl p-4 ${item.bg} ring-1 ${item.ring} cursor-default h-full`}
    >
      <div
        className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shadow-sm`}
      >
        <item.Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="text-sm font-extrabold text-gray-900 leading-tight">
        {item.title}
      </h3>
      <p className="text-[11px] text-gray-600 leading-snug">
        {item.description}
      </p>
    </div>
  );
}

export default function InfrastructureV1() {
  return (
    <section
      id="infrastructure"
      className="py-10 lg:py-14 bg-white scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Готовая инфраструктура
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1.5">
            Всё готово{" "}
            <span className="text-green-600">к жизни с первого дня</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Коммуникации, дороги, охрана и сервисы — всё работает уже сейчас.
          </p>
        </div>

        {/* 8 pastel cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {items.map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </div>

        {/* Savings stat banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-green-100 to-emerald-200 ring-1 ring-emerald-300/70 px-5 py-5 sm:px-7 sm:py-6">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-green-400/25 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="flex items-start gap-3 text-center md:text-left">
              <div className="hidden md:flex shrink-0 w-12 h-12 rounded-2xl bg-white ring-1 ring-emerald-300 items-center justify-center shadow-sm">
                <PiggyBank className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight leading-tight">
                  Экономия 500 000 – 2 000 000 ₽
                </h3>
                <p className="text-xs sm:text-sm text-emerald-900/75 mt-0.5">
                  На подведении коммуникаций — всё уже сделано за вас.
                </p>
              </div>
            </div>

            <div className="flex items-stretch gap-2 shrink-0">
              <a
                href="#contacts"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 sm:px-5 h-11 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                Презентация
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </a>
              <a
                href="#calculator"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300 hover:ring-emerald-400 px-4 sm:px-5 h-11 rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
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
