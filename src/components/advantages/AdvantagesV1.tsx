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
 * Variant 1 — "Премиум доверие"
 * 3 hero-блока сверху с мягкими gradient-подложками
 * 5 small-карточек ниже с цветными иконками на тинтованных фонах
 * Стиль: сдержанный премиум, много воздуха.
 */

const heroes = [
  {
    icon: ShieldCheck,
    badge: "100%",
    title: "Юридическая чистота",
    subtitle:
      "Каждый участок проходит юридический аудит. Гарантия закреплена в договоре.",
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-white/20",
    textColor: "text-white",
  },
  {
    icon: Trees,
    badge: "31",
    title: "посёлок в Подмосковье",
    subtitle:
      "4 направления, от 27 до 65 км от МКАД. Рядом лес, река, чистый воздух.",
    gradient: "from-sky-500 to-blue-600",
    iconBg: "bg-white/20",
    textColor: "text-white",
  },
  {
    icon: FileCheck2,
    badge: "ИЖС",
    title: "Категория земли",
    subtitle:
      "Постоянная регистрация, ипотека в банках РФ, подключение всех коммуникаций.",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-white/20",
    textColor: "text-white",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Все коммуникации",
    description: "Газ, электричество, вода — подведено к участку.",
    color: "bg-green-50 text-green-700",
  },
  {
    icon: Car,
    title: "Асфальт до участка",
    description: "Твёрдое покрытие внутри посёлков и подъезды от шоссе.",
    color: "bg-sky-50 text-sky-700",
  },
  {
    icon: Fence,
    title: "Охрана 24/7",
    description: "КПП, видеонаблюдение, круглосуточный патруль.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: Wallet,
    title: "Прозрачные цены",
    description: "Стоимость фиксируется в договоре. Никаких скрытых платежей.",
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon: BadgePercent,
    title: "Рассрочка без %",
    description: "До 12 месяцев без переплат. Программа для молодых семей.",
    color: "bg-violet-50 text-violet-700",
  },
];

export default function AdvantagesV1() {
  return (
    <section id="advantages" className="py-14 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Почему выбирают ЗемПлюс
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Проверенные посёлки, готовая инфраструктура и честные цены.
          </p>
        </div>

        {/* 3 hero blocks — non-clickable by design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {heroes.map((h) => (
            <div
              key={h.title}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${h.gradient} shadow-lg overflow-hidden`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${h.iconBg} backdrop-blur-sm flex items-center justify-center mb-4`}
              >
                <h.icon className={`w-6 h-6 ${h.textColor}`} />
              </div>
              <div className={`text-4xl font-extrabold ${h.textColor} leading-none mb-1`}>
                {h.badge}
              </div>
              <div className={`text-lg font-bold ${h.textColor} mb-2`}>
                {h.title}
              </div>
              <p className={`text-sm ${h.textColor} opacity-90 leading-relaxed`}>
                {h.subtitle}
              </p>
              {/* Decorative shape */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* 5 smaller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 rounded-lg ${b.color} flex items-center justify-center mb-3`}
              >
                <b.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                {b.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
