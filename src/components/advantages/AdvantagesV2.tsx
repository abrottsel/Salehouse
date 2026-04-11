import {
  ShieldCheck,
  Trees,
  FileCheck2,
  Zap,
  Fence,
  Car,
  Wallet,
  BadgePercent,
} from "lucide-react";

/**
 * Variant 2 — "Пастель · компакт"
 * Мягкие пастельные фоны, тёмный текст, никаких декоративных блобов.
 * Карточки сжаты по вертикали — чтобы путь до каталога был коротким.
 * На мобиле hero-карточки горизонтальные (icon слева + контент справа)
 * и помещаются в 1 экран.
 */

interface Hero {
  Icon: typeof ShieldCheck;
  title: string;
  subtitle: string;
  bg: string;
  ring: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  subColor: string;
}

const heroes: Hero[] = [
  {
    Icon: ShieldCheck,
    title: "Юридическая чистота",
    subtitle: "Аудит каждого участка. Гарантия закреплена в договоре.",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/60",
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
    textColor: "text-emerald-950",
    subColor: "text-emerald-800/70",
  },
  {
    Icon: Trees,
    title: "31 посёлок в Подмосковье",
    subtitle: "4 направления, от 27 км от МКАД. Лес, река, чистый воздух.",
    bg: "bg-sky-50",
    ring: "ring-sky-200/60",
    iconBg: "bg-sky-500",
    iconColor: "text-white",
    textColor: "text-sky-950",
    subColor: "text-sky-800/70",
  },
  {
    Icon: FileCheck2,
    title: "Категория ИЖС",
    subtitle: "Прописка, ипотека в банках РФ, все коммуникации.",
    bg: "bg-amber-50",
    ring: "ring-amber-200/60",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    textColor: "text-amber-950",
    subColor: "text-amber-800/70",
  },
];

interface Benefit {
  Icon: typeof ShieldCheck;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const benefits: Benefit[] = [
  {
    Icon: Zap,
    title: "Все коммуникации",
    description: "Газ, свет, вода — к участку.",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-700",
  },
  {
    Icon: Car,
    title: "Асфальт",
    description: "Твёрдое покрытие и подъезды.",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
  {
    Icon: Fence,
    title: "Охрана 24/7",
    description: "КПП, видеонаблюдение, патруль.",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
  },
  {
    Icon: Wallet,
    title: "Честные цены",
    description: "Всё зафиксировано в договоре.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    Icon: BadgePercent,
    title: "Рассрочка 0%",
    description: "До 12 месяцев без переплат.",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
  },
];

function HeroCard({ hero }: { hero: Hero }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl p-4 ${hero.bg} ring-1 ${hero.ring} cursor-default`}
    >
      <div
        className={`shrink-0 w-11 h-11 rounded-xl ${hero.iconBg} flex items-center justify-center shadow-sm`}
      >
        <hero.Icon className={`w-5 h-5 ${hero.iconColor}`} strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={`text-sm sm:text-base font-extrabold ${hero.textColor} leading-tight mb-1`}>
          {hero.title}
        </h3>
        <p className={`text-xs ${hero.subColor} leading-snug`}>
          {hero.subtitle}
        </p>
      </div>
    </div>
  );
}

function BenefitCard({ b }: { b: Benefit }) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-default">
      <div
        className={`w-9 h-9 rounded-lg ${b.iconBg} flex items-center justify-center mb-2`}
      >
        <b.Icon className={`w-4 h-4 ${b.iconColor}`} strokeWidth={2.5} />
      </div>
      <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 leading-tight">
        {b.title}
      </h3>
      <p className="text-[11px] sm:text-xs text-gray-500 leading-snug">
        {b.description}
      </p>
    </div>
  );
}

export default function AdvantagesV2() {
  return (
    <section id="advantages" className="py-10 lg:py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1.5">
            Честно, прозрачно,{" "}
            <span className="text-green-600">без сюрпризов</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Проверенные посёлки, готовая инфраструктура и честные цены.
          </p>
        </div>

        {/* 3 hero cards — horizontal layout, pastel bg */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {heroes.map((h) => (
            <HeroCard key={h.title} hero={h} />
          ))}
        </div>

        {/* 5 benefits — compact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {benefits.map((b) => (
            <BenefitCard key={b.title} b={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
