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
 * Variant 2 UNIFIED — "8 блоков одной сеткой"
 * Убрано разделение hero ↔ benefits — все 8 преимуществ идут одной
 * однородной сеткой. Максимально компактно и спокойно.
 * На мобиле: 2 колонки, на планшете: 4, на десктопе: 4 (2 ряда).
 */

interface Item {
  Icon: typeof ShieldCheck;
  title: string;
  description: string;
  bg: string;
  ring: string;
  iconBg: string;
}

const items: Item[] = [
  {
    Icon: ShieldCheck,
    title: "Юридическая чистота",
    description: "Аудит каждого участка. Гарантия закреплена в договоре.",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/60",
    iconBg: "bg-emerald-500",
  },
  {
    Icon: Trees,
    title: "31 посёлок",
    description: "4 направления Подмосковья, от 27 км от МКАД.",
    bg: "bg-sky-50",
    ring: "ring-sky-200/60",
    iconBg: "bg-sky-500",
  },
  {
    Icon: FileCheck2,
    title: "Категория ИЖС",
    description: "Прописка, ипотека в банках РФ, коммуникации.",
    bg: "bg-amber-50",
    ring: "ring-amber-200/60",
    iconBg: "bg-amber-500",
  },
  {
    Icon: Zap,
    title: "Все коммуникации",
    description: "Газ, электричество и вода подведены к участку.",
    bg: "bg-yellow-50",
    ring: "ring-yellow-200/60",
    iconBg: "bg-yellow-500",
  },
  {
    Icon: Car,
    title: "Асфальтированные дороги",
    description: "Твёрдое покрытие и удобные подъезды.",
    bg: "bg-slate-50",
    ring: "ring-slate-200/60",
    iconBg: "bg-slate-600",
  },
  {
    Icon: Fence,
    title: "Охрана 24/7",
    description: "КПП, видеонаблюдение, круглосуточный патруль.",
    bg: "bg-rose-50",
    ring: "ring-rose-200/60",
    iconBg: "bg-rose-500",
  },
  {
    Icon: Wallet,
    title: "Прозрачные цены",
    description: "Всё фиксируется в договоре. Без скрытых платежей.",
    bg: "bg-teal-50",
    ring: "ring-teal-200/60",
    iconBg: "bg-teal-500",
  },
  {
    Icon: BadgePercent,
    title: "Рассрочка 0%",
    description: "До 12 месяцев без переплат.",
    bg: "bg-violet-50",
    ring: "ring-violet-200/60",
    iconBg: "bg-violet-500",
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

export default function AdvantagesV2Unified() {
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

        {/* 8 unified cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
