import {
  ShieldCheck,
  Zap,
  Fence,
  Car,
  Wallet,
  BadgePercent,
  FileCheck2,
  Landmark,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";

/**
 * Advantages — "Единая сетка 8 блоков"
 * Структура: 1 BIG / 1-1 / 1-1 / 1-1 / 1 BIG на мобиле.
 * На десктопе: простой 4x2 grid без асимметрии.
 *
 * Логика: убраны дубликаты с Hero-бейджами (31 посёлок и т.д.),
 * вместо этого — практические преимущества посёлка. Юр. чистота
 * и ИЖС остаются как большие акцентные блоки сверху и снизу,
 * в середине — 6 сервисных benefit'ов парами.
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
  // 0. BIG — Юридическая чистота (top anchor)
  {
    Icon: ShieldCheck,
    title: "Юридическая чистота",
    description: "Аудит каждого участка. Гарантия чистой сделки закреплена в договоре.",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/70",
    iconBg: "bg-emerald-500",
  },
  // 1-2. Пара: Коммуникации + Асфальт
  {
    Icon: Zap,
    title: "Все коммуникации",
    description: "Газ, свет, вода подведены к участку.",
    bg: "bg-yellow-50",
    ring: "ring-yellow-200/70",
    iconBg: "bg-yellow-500",
  },
  {
    Icon: Car,
    title: "Асфальт до участка",
    description: "Твёрдое покрытие и удобные подъезды.",
    bg: "bg-slate-50",
    ring: "ring-slate-200/70",
    iconBg: "bg-slate-600",
  },
  // 3-4. Пара: Охрана + Цены
  {
    Icon: Fence,
    title: "Охрана 24/7",
    description: "КПП, видеонаблюдение и патруль.",
    bg: "bg-rose-50",
    ring: "ring-rose-200/70",
    iconBg: "bg-rose-500",
  },
  {
    Icon: Wallet,
    title: "Прозрачные цены",
    description: "Всё в договоре. Без скрытых платежей.",
    bg: "bg-teal-50",
    ring: "ring-teal-200/70",
    iconBg: "bg-teal-500",
  },
  // 5-6. Пара: Рассрочка + Ипотека
  {
    Icon: BadgePercent,
    title: "Рассрочка 0%",
    description: "До 12 месяцев без переплат.",
    bg: "bg-violet-50",
    ring: "ring-violet-200/70",
    iconBg: "bg-violet-500",
  },
  {
    Icon: Landmark,
    title: "Ипотека в 5 банках",
    description: "ВТБ, Сбер, Альфа, ГПБ, Россельхоз.",
    bg: "bg-sky-50",
    ring: "ring-sky-200/70",
    iconBg: "bg-sky-500",
  },
  // 7. BIG — ИЖС (bottom anchor)
  {
    Icon: FileCheck2,
    title: "Категория ИЖС",
    description:
      "Постоянная прописка, материнский капитал, ипотека и все государственные программы для ИЖС.",
    bg: "bg-amber-50",
    ring: "ring-amber-200/70",
    iconBg: "bg-amber-500",
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
    <section id="advantages" className="py-10 lg:py-14 bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact header */}
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
            Восемь причин, почему покупка участка у нас — это спокойствие и
            экономия.
          </p>
        </div>

        {/* Unified 8-card grid
            Mobile (grid-cols-2): first & last span 2 cols (1-2-2-2-1 layout)
            Desktop (md:grid-cols-4): plain 4x2 grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item, i) => {
            const isBig = i === 0 || i === items.length - 1;
            return <Card key={item.title} item={item} big={isBig} />;
          })}
        </div>
      </div>
    </section>
  );
}
