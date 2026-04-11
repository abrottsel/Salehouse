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
  type LucideIcon,
} from "lucide-react";

/**
 * Infrastructure V2 — "Dark emerald hero + compact feature row"
 * Сверху: тёмно-зелёная карточка-hero с гигантским stat-числом экономии,
 * подзаголовком и 2 CTA (заявка + ипотека). Это главный акцент.
 * Снизу: 8 компактных feature-чипсов в один ряд (4x2 на mobile).
 * Путь до заявки супер-короткий: CTA в самом верху секции.
 */

interface Item {
  Icon: LucideIcon;
  title: string;
  iconBg: string;
  iconColor: string;
}

const items: Item[] = [
  { Icon: Flame, title: "Газ", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { Icon: Zap, title: "Электричество", iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  { Icon: Droplets, title: "Водоснабжение", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  { Icon: Car, title: "Асфальт", iconBg: "bg-slate-100", iconColor: "text-slate-700" },
  { Icon: ShieldCheck, title: "Охрана 24/7", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  { Icon: Lightbulb, title: "Освещение", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  { Icon: Trash2, title: "Вывоз мусора", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  { Icon: Snowflake, title: "Чистка зимой", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
];

export default function InfrastructureV2() {
  return (
    <section
      id="infrastructure"
      className="py-10 lg:py-14 bg-white scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Готовая инфраструктура
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Всё готово{" "}
            <span className="text-green-600">к жизни с первого дня</span>
          </h2>
        </div>

        {/* Dark emerald hero with giant stat */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-900 p-6 sm:p-8 mb-4 shadow-xl ring-1 ring-emerald-400/20">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />
          {/* Giant stat as background text */}
          <div
            className="absolute -bottom-6 -right-2 text-white/5 font-black leading-none pointer-events-none select-none tracking-tighter"
            style={{ fontSize: "9rem" }}
          >
            2M₽
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4 text-left">
              <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 items-center justify-center shadow-lg shadow-black/20">
                <PiggyBank className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold mb-1">
                  Экономия на подключении
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.05]">
                  от 500 000{" "}
                  <span className="text-emerald-300">до 2 млн ₽</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/75 mt-1.5 max-w-md">
                  В сравнении с «голой» землёй. Газ, свет, вода, дороги — всё
                  уже проведено.
                </p>
              </div>
            </div>

            <div className="flex items-stretch gap-2 shrink-0">
              <a
                href="#contacts"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-4 sm:px-5 h-11 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-black/25 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                Презентация
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </a>
              <a
                href="#calculator"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm text-white ring-1 ring-white/25 hover:bg-white/15 px-4 sm:px-5 h-11 rounded-xl font-bold text-xs sm:text-sm hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                <Wallet className="w-4 h-4 shrink-0" />
                Ипотека
              </a>
            </div>
          </div>
        </div>

        {/* 8 compact feature chips — 4x2 mobile, 8x1 desktop */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-2 rounded-xl p-3 bg-gray-50 ring-1 ring-gray-200/70 hover:bg-white hover:ring-emerald-300/60 hover:shadow-sm transition-all cursor-default text-center"
            >
              <div
                className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center`}
              >
                <item.Icon
                  className={`w-5 h-5 ${item.iconColor}`}
                  strokeWidth={2.5}
                />
              </div>
              <span className="text-[11px] font-bold text-gray-900 leading-tight">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
