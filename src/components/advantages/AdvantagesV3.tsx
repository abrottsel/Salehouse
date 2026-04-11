import {
  ShieldCheck,
  Trees,
  FileCheck2,
  Zap,
  Fence,
  Car,
  Wallet,
  BadgePercent,
  Check,
} from "lucide-react";

/**
 * Variant 3 — "Тёмный доверительный hero + цветные карточки"
 * Сверху: тёмно-зелёная полоса с 3 hero-блоками на стекле (glassmorphism)
 * Снизу: 5 карточек с акцентным левым бордером в разных цветах
 * Стиль: серьёзный, доверительный, как у застройщиков-премиум
 */

const heroes = [
  {
    icon: ShieldCheck,
    title: "Юридическая чистота",
    subtitle: "Каждый участок проходит аудит. Гарантия в договоре.",
    stat: "100%",
    statLabel: "проверенных",
  },
  {
    icon: Trees,
    title: "31 посёлок",
    subtitle: "4 направления Подмосковья, от 27 км от МКАД.",
    stat: "31",
    statLabel: "в каталоге",
  },
  {
    icon: FileCheck2,
    title: "Категория ИЖС",
    subtitle: "Постоянная регистрация, ипотека, коммуникации.",
    stat: "ИЖС",
    statLabel: "все участки",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Все коммуникации",
    description: "Газ, электричество, вода подведены к участку — начинайте строить сразу.",
    accent: "border-l-amber-500",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    icon: Car,
    title: "Асфальтированные дороги",
    description: "Твёрдое покрытие внутри посёлков и удобные подъезды от шоссе.",
    accent: "border-l-slate-500",
    iconColor: "text-slate-700",
    bgColor: "bg-slate-50",
  },
  {
    icon: Fence,
    title: "Круглосуточная охрана",
    description: "КПП, видеонаблюдение, патруль. Ваша семья в безопасности.",
    accent: "border-l-rose-500",
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50",
  },
  {
    icon: Wallet,
    title: "Прозрачные цены",
    description: "Стоимость фиксируется в договоре. Никаких скрытых платежей.",
    accent: "border-l-emerald-500",
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: BadgePercent,
    title: "Рассрочка без переплат",
    description: "До 12 месяцев без процентов. Специальные программы для молодых семей.",
    accent: "border-l-violet-500",
    iconColor: "text-violet-600",
    bgColor: "bg-violet-50",
  },
];

export default function AdvantagesV3() {
  return (
    <section id="advantages" className="py-14 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider mb-3">
            Почему нам доверяют
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Честно, прозрачно, без сюрпризов
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Более 30 посёлков с готовой инфраструктурой и юридической гарантией.
          </p>
        </div>

        {/* Dark hero band with 3 trust blocks */}
        <div className="relative rounded-3xl bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 p-6 sm:p-8 mb-6 overflow-hidden shadow-2xl">
          {/* Decorative */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-green-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
            {heroes.map((h, i) => (
              <div
                key={h.title}
                className={`rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 ${
                  i > 0 ? "md:border-l-white/15" : ""
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-900/50">
                    <h.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-extrabold text-white leading-none">
                      {h.stat}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-green-300 mt-1">
                      {h.statLabel}
                    </div>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">
                  {h.title}
                </h3>
                <p className="text-xs text-green-100/80 leading-relaxed">
                  {h.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits: left-border accent cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className={`bg-white rounded-2xl p-5 border border-gray-100 border-l-4 ${b.accent} hover:shadow-lg transition-all`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${b.bgColor} flex items-center justify-center mb-3`}
              >
                <b.icon className={`w-5 h-5 ${b.iconColor}`} strokeWidth={2.5} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
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
