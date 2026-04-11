import {
  ShieldCheck,
  Trees,
  FileCheck2,
  Zap,
  Fence,
  Car,
  Wallet,
  BadgePercent,
  Sparkles,
} from "lucide-react";

/**
 * Variant 2 PRO — развитие v2
 * ─ Гигантские stat-цифры как декоративный фон hero-блоков
 * ─ SVG-паттерны (точки, сетка, круги) в подложке
 * ─ Glow-свечения, stacked gradients, blur-диски
 * ─ Асимметричное бенто — hero-блоки разной высоты и композиции
 * ─ 5 карточек с яркими гредиентами + декоративные элементы
 * ─ Hover "breathing" анимация на некликабельных блоках
 */

/* ───────── SVG patterns ───────── */

function DotsPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotsp" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotsp)" />
    </svg>
  );
}

function GridPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gridp" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M 32 0 L 0 0 0 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gridp)" />
    </svg>
  );
}

function CirclesPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circp)" />
    </svg>
  );
}

/* ───────── Hero blocks (non-clickable) ───────── */

interface Hero {
  Icon: typeof ShieldCheck;
  stat: string;
  statSuffix?: string;
  title: string;
  subtitle: string;
  gradient: string;
  pattern: "dots" | "grid" | "circles";
  glowColor: string;
}

const heroes: Hero[] = [
  {
    Icon: ShieldCheck,
    stat: "100",
    statSuffix: "%",
    title: "Юридическая чистота",
    subtitle: "Проверка каждого участка. Гарантия закреплена в договоре.",
    gradient: "from-emerald-500 via-green-600 to-emerald-700",
    pattern: "dots",
    glowColor: "bg-emerald-300",
  },
  {
    Icon: Trees,
    stat: "31",
    title: "посёлок",
    subtitle: "4 направления Подмосковья. От 27 км от МКАД до леса и реки.",
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    pattern: "circles",
    glowColor: "bg-sky-300",
  },
  {
    Icon: FileCheck2,
    stat: "ИЖС",
    title: "категория земли",
    subtitle: "Прописка, ипотека в банках РФ, все коммуникации.",
    gradient: "from-amber-500 via-orange-500 to-red-600",
    pattern: "grid",
    glowColor: "bg-amber-300",
  },
];

function HeroCard({ hero }: { hero: Hero }) {
  const Pattern =
    hero.pattern === "dots"
      ? DotsPattern
      : hero.pattern === "grid"
      ? GridPattern
      : CirclesPattern;
  return (
    <div
      className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br ${hero.gradient} p-6 sm:p-7 shadow-2xl shadow-black/20 cursor-default ring-1 ring-white/10 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] transition-shadow duration-500`}
      style={{ minHeight: 240 }}
    >
      {/* Decorative giant stat as background */}
      <div
        className="absolute -bottom-8 -right-4 text-white/10 font-black leading-none pointer-events-none select-none tracking-tighter"
        style={{ fontSize: "10rem" }}
      >
        {hero.stat}
      </div>

      {/* SVG pattern overlay */}
      <Pattern className="absolute inset-0 w-full h-full text-white/10 pointer-events-none" />

      {/* Glow blob */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full ${hero.glowColor} opacity-20 blur-3xl pointer-events-none group-hover:opacity-30 transition-opacity duration-700`}
      />
      <div
        className={`absolute -bottom-20 -left-10 w-40 h-40 rounded-full ${hero.glowColor} opacity-15 blur-3xl pointer-events-none`}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon bubble */}
        <div className="mb-5">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500">
            <hero.Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Stat */}
        <div className="mb-2 flex items-baseline gap-1">
          <span className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight drop-shadow-lg">
            {hero.stat}
          </span>
          {hero.statSuffix && (
            <span className="text-3xl font-black text-white/80 leading-none">
              {hero.statSuffix}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-white mt-auto mb-1 drop-shadow">
          {hero.title}
        </h3>
        <p className="text-sm text-white/85 leading-relaxed max-w-[90%]">
          {hero.subtitle}
        </p>
      </div>
    </div>
  );
}

/* ───────── Benefit cards ───────── */

interface Benefit {
  Icon: typeof ShieldCheck;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  accentBlob: string;
}

const benefits: Benefit[] = [
  {
    Icon: Zap,
    title: "Все коммуникации",
    description: "Газ, электричество и вода подведены к участку.",
    gradient: "from-yellow-300 via-amber-300 to-orange-400",
    iconColor: "text-amber-900",
    accentBlob: "bg-yellow-200",
  },
  {
    Icon: Car,
    title: "Асфальт до участка",
    description: "Твёрдое покрытие внутри и удобные подъезды.",
    gradient: "from-slate-400 via-gray-500 to-zinc-600",
    iconColor: "text-white",
    accentBlob: "bg-slate-300",
  },
  {
    Icon: Fence,
    title: "Охрана 24/7",
    description: "КПП, видеонаблюдение, круглосуточный патруль.",
    gradient: "from-rose-400 via-pink-500 to-fuchsia-600",
    iconColor: "text-white",
    accentBlob: "bg-rose-300",
  },
  {
    Icon: Wallet,
    title: "Прозрачные цены",
    description: "Всё зафиксировано в договоре. Без скрытых платежей.",
    gradient: "from-teal-400 via-emerald-500 to-green-600",
    iconColor: "text-white",
    accentBlob: "bg-teal-300",
  },
  {
    Icon: BadgePercent,
    title: "Рассрочка 0%",
    description: "До 12 месяцев без переплат. Для молодых семей.",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    iconColor: "text-white",
    accentBlob: "bg-violet-300",
  },
];

function BenefitCard({ b }: { b: Benefit }) {
  return (
    <div
      className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br ${b.gradient} p-5 shadow-xl shadow-black/10 ring-1 ring-white/15 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 cursor-default`}
    >
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${b.accentBlob} opacity-30 blur-2xl pointer-events-none group-hover:opacity-50 transition-opacity`}
      />
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-xl bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform">
          <b.Icon className={`w-5 h-5 ${b.iconColor}`} strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-extrabold text-white mb-1 drop-shadow">
          {b.title}
        </h3>
        <p className="text-xs text-white/85 leading-relaxed">
          {b.description}
        </p>
      </div>
    </div>
  );
}

/* ───────── Main ───────── */

export default function AdvantagesV2Pro() {
  return (
    <section
      id="advantages"
      className="py-14 lg:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-emerald-200/20 to-sky-200/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm ring-1 ring-green-200">
            <Sparkles className="w-3.5 h-3.5" />
            Почему нам доверяют
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">
            Честно, прозрачно,{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              без сюрпризов
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Больше 30 посёлков с готовой инфраструктурой, проверенной юридической
            чистотой и честными ценами.
          </p>
        </div>

        {/* Hero row — 3 non-clickable highlight blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {heroes.map((h) => (
            <HeroCard key={h.title} hero={h} />
          ))}
        </div>

        {/* Benefits row — 5 vivid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {benefits.map((b) => (
            <BenefitCard key={b.title} b={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
