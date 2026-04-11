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
  Wallet,
  PiggyBank,
  Check,
  type LucideIcon,
} from "lucide-react";

/**
 * Infrastructure V3 — "Split hero с большой карточкой экономии"
 * Слева: гигантская градиентная карточка с экономией в центре (stat-hero).
 * Справа: колонка из 8 строк-feature с галочками.
 * На мобиле — стек, карточка сверху, feature-list снизу.
 */

interface Item {
  Icon: LucideIcon;
  title: string;
  sub: string;
}

const items: Item[] = [
  { Icon: Flame, title: "Магистральный газ", sub: "до каждого участка" },
  { Icon: Zap, title: "Электричество", sub: "15 кВт, своя подстанция" },
  { Icon: Droplets, title: "Вода", sub: "центральный водопровод" },
  { Icon: Car, title: "Асфальт", sub: "твёрдое покрытие и подъезды" },
  { Icon: ShieldCheck, title: "Охрана 24/7", sub: "КПП и видеонаблюдение" },
  { Icon: Lightbulb, title: "Освещение", sub: "дороги и общие зоны" },
  { Icon: Trash2, title: "Вывоз мусора", sub: "организованный сбор ТБО" },
  { Icon: Snowflake, title: "Чистка зимой", sub: "регулярная уборка снега" },
];

export default function InfrastructureV3() {
  return (
    <section
      id="infrastructure"
      className="py-10 lg:py-14 bg-gradient-to-b from-white to-gray-50 scroll-mt-16"
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
            Вы экономите время и деньги — коммуникации и сервисы уже работают.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Left: big stat card */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 p-6 sm:p-7 shadow-xl shadow-emerald-900/20 ring-1 ring-emerald-400/20">
            {/* Decorative */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-300/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-12 w-48 h-48 rounded-full bg-green-400/20 blur-3xl pointer-events-none" />
            <div
              className="absolute -bottom-4 -right-2 text-white/10 font-black leading-none pointer-events-none select-none tracking-tighter"
              style={{ fontSize: "8rem" }}
            >
              ₽
            </div>

            <div className="relative flex flex-col h-full">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30 flex items-center justify-center">
                  <PiggyBank
                    className="w-5 h-5 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/90 font-bold">
                  Ваша экономия
                </span>
              </div>

              <div className="mb-2">
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                  до 2 млн ₽
                </div>
                <div className="text-xs text-emerald-100/80 mt-1.5">
                  Vs покупка «голой» земли без коммуникаций
                </div>
              </div>

              <div className="mt-auto pt-5 flex flex-col gap-2">
                <a
                  href="#contacts"
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-5 h-11 rounded-xl font-bold text-sm shadow-lg shadow-black/15 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4" />
                  Получить презентацию
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#calculator"
                  className="inline-flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm text-white ring-1 ring-white/25 hover:bg-white/20 px-5 h-11 rounded-xl font-bold text-sm transition-all duration-300"
                >
                  <Wallet className="w-4 h-4" />
                  Рассчитать ипотеку
                </a>
              </div>
            </div>
          </div>

          {/* Right: feature list */}
          <div className="md:col-span-3 bg-white rounded-3xl ring-1 ring-gray-200 p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="group flex items-center gap-3 rounded-xl p-2.5 hover:bg-emerald-50/60 transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/60 flex items-center justify-center group-hover:bg-emerald-500 group-hover:ring-emerald-500 transition-colors">
                    <item.Icon
                      className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-gray-900 leading-tight">
                        {item.title}
                      </h3>
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
