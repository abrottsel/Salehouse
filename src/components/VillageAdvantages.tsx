"use client";

/**
 * VillageAdvantages — premium-feel advantages showcase.
 *
 * Designed as a hero-tier block, not a rail of equal cards:
 *   • one tall "signature" card on the left with a gradient wash,
 *     big stat numbers (price, plots), a short one-line pitch and
 *     a single CTA, acting as the anchor of the block;
 *   • three smaller feature tiles on the right that each carry a
 *     category badge, an icon in a coloured well, a 1-line title
 *     and a short supporting line;
 *   • below, a full-width strip of the village features returned
 *     from the backend (газ, электричество, охрана, …) with icons
 *     auto-picked by keyword. Those come from `features[]`.
 *
 * Every card has subtle hover affordances (translate + shadow),
 * gradient rings, and pastel backgrounds tuned for light theme.
 * Typography leans on font-black for drama without crossing into
 * bro-gram territory.
 */

import {
  Wallet,
  Ruler,
  LayoutGrid,
  Home as HomeIcon,
  Sparkles,
  Shield,
  Zap,
  TreePine,
  CheckCircle2,
  Droplets,
  Lightbulb,
  MapPin,
  Route,
  Flame,
  Phone,
  Car,
  Waves,
  Mountain,
  type LucideIcon,
} from "lucide-react";

interface Props {
  name: string;
  direction: string;
  distance: number;
  readiness: number;
  description: string;
  priceFrom: number;
  plotsAvailable: number;
  plotsCount: number;
  areaFrom: number;
  areaTo: number;
  features: string[];
}

interface FeaturePalette {
  Icon: LucideIcon;
  bg: string;
  ring: string;
  iconBg: string;
}

function featureStyle(feature: string, fallbackIndex: number): FeaturePalette {
  const f = feature.toLowerCase();
  if (f.includes("газ"))
    return {
      Icon: Flame,
      bg: "bg-gradient-to-br from-amber-50 to-orange-100",
      ring: "ring-amber-200/70",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    };
  if (f.includes("электр"))
    return {
      Icon: Zap,
      bg: "bg-gradient-to-br from-yellow-50 to-amber-100",
      ring: "ring-yellow-200/70",
      iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500",
    };
  if (f.includes("свет"))
    return {
      Icon: Lightbulb,
      bg: "bg-gradient-to-br from-yellow-50 to-amber-100",
      ring: "ring-yellow-200/70",
      iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500",
    };
  if (f.includes("вод") || f.includes("скваж") || f.includes("водоснаб"))
    return {
      Icon: Droplets,
      bg: "bg-gradient-to-br from-sky-50 to-blue-100",
      ring: "ring-sky-200/70",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    };
  if (f.includes("охра") || f.includes("видео") || f.includes("забор"))
    return {
      Icon: Shield,
      bg: "bg-gradient-to-br from-slate-50 to-gray-100",
      ring: "ring-slate-200/70",
      iconBg: "bg-gradient-to-br from-slate-600 to-gray-700",
    };
  if (f.includes("дорог") || f.includes("асфальт"))
    return {
      Icon: Route,
      bg: "bg-gradient-to-br from-zinc-50 to-neutral-100",
      ring: "ring-zinc-200/70",
      iconBg: "bg-gradient-to-br from-zinc-600 to-neutral-700",
    };
  if (f.includes("парков") || f.includes("транс") || f.includes("авто"))
    return {
      Icon: Car,
      bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
      ring: "ring-blue-200/70",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    };
  if (f.includes("лес") || f.includes("сосн") || f.includes("дерев"))
    return {
      Icon: TreePine,
      bg: "bg-gradient-to-br from-emerald-50 to-green-100",
      ring: "ring-emerald-200/70",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    };
  if (f.includes("озер") || f.includes("прудик") || f.includes("пруд") || f.includes("река"))
    return {
      Icon: Waves,
      bg: "bg-gradient-to-br from-cyan-50 to-teal-100",
      ring: "ring-cyan-200/70",
      iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
    };
  if (f.includes("холм") || f.includes("гор"))
    return {
      Icon: Mountain,
      bg: "bg-gradient-to-br from-stone-50 to-amber-100",
      ring: "ring-stone-200/70",
      iconBg: "bg-gradient-to-br from-stone-600 to-amber-700",
    };
  if (f.includes("интернет") || f.includes("связ"))
    return {
      Icon: Phone,
      bg: "bg-gradient-to-br from-violet-50 to-purple-100",
      ring: "ring-violet-200/70",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    };

  // fallback — cycle through pastel palettes
  const fallbackStyles: FeaturePalette[] = [
    {
      Icon: CheckCircle2,
      bg: "bg-gradient-to-br from-emerald-50 to-green-100",
      ring: "ring-emerald-200/70",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    },
    {
      Icon: Sparkles,
      bg: "bg-gradient-to-br from-rose-50 to-pink-100",
      ring: "ring-rose-200/70",
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    },
    {
      Icon: MapPin,
      bg: "bg-gradient-to-br from-indigo-50 to-blue-100",
      ring: "ring-indigo-200/70",
      iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    },
  ];
  return fallbackStyles[fallbackIndex % fallbackStyles.length];
}

export default function VillageAdvantages({
  name,
  direction,
  distance,
  readiness,
  description,
  priceFrom,
  plotsAvailable,
  plotsCount,
  areaFrom,
  areaTo,
  features,
}: Props) {
  return (
    <section className="relative py-14 lg:py-20 overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white">
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(16,185,129,0) 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0) 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex items-center justify-center mb-6 lg:mb-10">
          <div className="inline-flex items-center gap-2 h-8 px-4 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Почему {name}
          </div>
        </div>

        {/* Hero grid: 1 signature card + 3 feature tiles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Signature card — spans 5 cols on lg+ */}
          <div className="lg:col-span-5 lg:row-span-2 relative rounded-[32px] p-6 lg:p-8 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 ring-1 ring-emerald-900/30 shadow-2xl shadow-emerald-900/20 overflow-hidden group">
            {/* Inner texture */}
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col h-full min-h-[340px]">
              <div className="flex items-center gap-2 mb-5">
                <div className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/25 text-white text-[10px] font-black uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  {direction}
                </div>
                <div className="inline-flex items-center h-6 px-2.5 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/25 text-white text-[10px] font-black uppercase tracking-wider tabular-nums">
                  {distance} км от МКАД
                </div>
              </div>

              <h2 className="text-white text-3xl sm:text-4xl lg:text-[40px] font-black leading-[1.05] drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                Лучшие участки<br />
                в {name.toLowerCase()}
              </h2>
              <p className="mt-4 text-white/85 text-sm lg:text-[15px] leading-relaxed max-w-md line-clamp-3">
                {description}
              </p>

              <div className="mt-6 lg:mt-auto grid grid-cols-2 gap-3 pt-6">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-3">
                  <div className="text-[9px] uppercase tracking-wider text-white/60 font-bold">
                    От
                  </div>
                  <div className="text-white text-xl lg:text-2xl font-black tabular-nums leading-none mt-1">
                    {priceFrom.toLocaleString("ru-RU")}
                  </div>
                  <div className="text-white/60 text-[10px] font-bold mt-1">
                    ₽ / сотка
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-3">
                  <div className="text-[9px] uppercase tracking-wider text-white/60 font-bold">
                    Свободно
                  </div>
                  <div className="text-white text-xl lg:text-2xl font-black tabular-nums leading-none mt-1">
                    {plotsAvailable}
                    <span className="text-sm text-white/60 font-black ml-1">
                      / {plotsCount}
                    </span>
                  </div>
                  <div className="text-white/60 text-[10px] font-bold mt-1">
                    участков
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-3">
                  <div className="text-[9px] uppercase tracking-wider text-white/60 font-bold">
                    Площадь
                  </div>
                  <div className="text-white text-xl lg:text-2xl font-black tabular-nums leading-none mt-1">
                    {areaFrom}–{areaTo}
                  </div>
                  <div className="text-white/60 text-[10px] font-bold mt-1">
                    соток
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-3">
                  <div className="text-[9px] uppercase tracking-wider text-white/60 font-bold">
                    Готовность
                  </div>
                  <div className="text-white text-xl lg:text-2xl font-black tabular-nums leading-none mt-1">
                    {readiness}%
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${readiness}%` }}
                    />
                  </div>
                </div>
              </div>

              <a
                href="#plots-map"
                className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white hover:bg-white/95 text-emerald-800 font-black text-sm shadow-lg active:scale-[0.98] transition-all"
              >
                Посмотреть все участки
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>

          {/* 3 side feature tiles — spans 7 cols */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureTile
              tone="emerald"
              badge="Экономия"
              title="Фиксированная цена в договоре"
              desc="Никаких доплат после бронирования — цена за сотку прописана в договоре."
              icon={<Wallet className="w-6 h-6 text-white" strokeWidth={2.4} />}
            />
            <FeatureTile
              tone="sky"
              badge="Простота"
              title="Сделка 1 день"
              desc="Электронная регистрация в Росреестре. Без нотариуса и очередей."
              icon={<CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.4} />}
            />
            <FeatureTile
              tone="amber"
              badge="Рассрочка"
              title="Ипотека от 6.5%"
              desc="Работаем со Сбером, ВТБ, Альфой и ещё 6 банками. Одобрение за 3 дня."
              icon={<LayoutGrid className="w-6 h-6 text-white" strokeWidth={2.4} />}
            />
            <FeatureTile
              tone="violet"
              badge="Готовность"
              title={`Построено ${readiness}% инфраструктуры`}
              desc="Коммуникации, дороги, КПП — уже работают на месте."
              icon={<HomeIcon className="w-6 h-6 text-white" strokeWidth={2.4} />}
              wide
            />
            <FeatureTile
              tone="rose"
              badge="Поддержка"
              title="Персональный менеджер"
              desc="От просмотра до ключей — один человек, одна ответственность."
              icon={<Phone className="w-6 h-6 text-white" strokeWidth={2.4} />}
              wide
            />
          </div>
        </div>

        {/* Infrastructure row — village features */}
        {features.length > 0 && (
          <div className="mt-10 lg:mt-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
              <div className="inline-flex items-center gap-1.5 px-4 h-7 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Инфраструктура
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {features.map((feature, i) => {
                const style = featureStyle(feature, i);
                const { Icon } = style;
                return (
                  <div
                    key={feature}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 ${style.bg} ring-1 ${style.ring} hover:-translate-y-0.5 hover:shadow-lg shadow-sm transition-all duration-300`}
                  >
                    <div
                      className={`shrink-0 w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center shadow-md shadow-black/10 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-gray-900 text-sm font-bold leading-tight">
                      {feature}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ───── internal tile component ───── */

interface TileProps {
  tone: "emerald" | "sky" | "amber" | "violet" | "rose";
  badge: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  wide?: boolean;
}

const TONE_CLASSES: Record<
  TileProps["tone"],
  { bg: string; ring: string; iconBg: string; badge: string }
> = {
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60",
    ring: "ring-emerald-200/70",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    badge: "bg-emerald-100 text-emerald-800",
  },
  sky: {
    bg: "bg-gradient-to-br from-sky-50 via-white to-sky-100/60",
    ring: "ring-sky-200/70",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    badge: "bg-sky-100 text-sky-800",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 via-white to-amber-100/60",
    ring: "ring-amber-200/70",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    badge: "bg-amber-100 text-amber-900",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-50 via-white to-violet-100/60",
    ring: "ring-violet-200/70",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    badge: "bg-violet-100 text-violet-800",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-50 via-white to-rose-100/60",
    ring: "ring-rose-200/70",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    badge: "bg-rose-100 text-rose-800",
  },
};

function FeatureTile({ tone, badge, title, desc, icon, wide }: TileProps) {
  const t = TONE_CLASSES[tone];
  return (
    <div
      className={`relative rounded-3xl p-5 ${t.bg} ring-1 ${t.ring} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
        wide ? "sm:col-span-2 lg:col-span-1" : ""
      }`}
    >
      <div className="relative flex items-start gap-3">
        <div
          className={`shrink-0 w-12 h-12 rounded-2xl ${t.iconBg} flex items-center justify-center shadow-md shadow-black/15`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div
            className={`inline-flex items-center h-5 px-2 rounded-full text-[9px] font-black uppercase tracking-wider ${t.badge} mb-1.5`}
          >
            {badge}
          </div>
          <div className="text-gray-900 text-sm font-black leading-tight">
            {title}
          </div>
          <div className="text-gray-600 text-[11px] leading-snug mt-1.5">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}
