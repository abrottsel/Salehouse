"use client";

/**
 * VillageAdvantages — compact, one-screen advantages + infrastructure.
 *
 * Layout (desktop):
 *   Left 5 cols:  signature card with gradient wash, 2×2 stats, CTA.
 *   Right 7 cols: 3 selling-point tiles in one row.
 *   Full 12 cols: infrastructure chips (flex-wrap pills).
 *
 * Everything fits above the fold on a 13" MBA (900 px viewport).
 */

import {
  Wallet,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  TreePine,
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

  priceFrom: number;
  plotsAvailable: number;
  plotsCount: number;
  areaFrom: number;
  areaTo: number;
  features: string[];
}

/* ─── infrastructure icon picker (reused from old full-card version) ─── */

function featureIcon(feature: string, fallbackIndex: number): { Icon: LucideIcon; color: string } {
  const f = feature.toLowerCase();
  if (f.includes("газ")) return { Icon: Flame, color: "text-amber-600" };
  if (f.includes("электр") || f.includes("свет"))
    return { Icon: Zap, color: "text-yellow-600" };
  if (f.includes("вод") || f.includes("скваж") || f.includes("водоснаб"))
    return { Icon: Droplets, color: "text-sky-600" };
  if (f.includes("охра") || f.includes("видео") || f.includes("забор") || f.includes("огражд"))
    return { Icon: Shield, color: "text-slate-600" };
  if (f.includes("дорог") || f.includes("асфальт"))
    return { Icon: Route, color: "text-zinc-600" };
  if (f.includes("парков") || f.includes("транс") || f.includes("авто"))
    return { Icon: Car, color: "text-blue-600" };
  if (f.includes("лес") || f.includes("сосн") || f.includes("дерев"))
    return { Icon: TreePine, color: "text-emerald-600" };
  if (f.includes("озер") || f.includes("пруд") || f.includes("река"))
    return { Icon: Waves, color: "text-cyan-600" };
  if (f.includes("холм") || f.includes("гор"))
    return { Icon: Mountain, color: "text-stone-600" };
  if (f.includes("интернет") || f.includes("связ"))
    return { Icon: Phone, color: "text-violet-600" };

  const fallbacks: { Icon: LucideIcon; color: string }[] = [
    { Icon: CheckCircle2, color: "text-emerald-600" },
    { Icon: Sparkles, color: "text-rose-500" },
    { Icon: MapPin, color: "text-indigo-600" },
  ];
  return fallbacks[fallbackIndex % fallbacks.length];
}

export default function VillageAdvantages({
  name,
  direction,
  distance,
  readiness,
  priceFrom,
  plotsAvailable,
  plotsCount,
  areaFrom,
  areaTo,
  features,
}: Props) {
  return (
    <section className="relative py-8 lg:py-10 overflow-hidden bg-gradient-to-b from-white via-emerald-50/20 to-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex items-center justify-center mb-4 lg:mb-6">
          <div className="inline-flex items-center gap-2 h-8 px-4 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Почему {name}
          </div>
        </div>

        {/* Main grid: signature card + 3 tiles + infra chips */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* ── Signature card — left 5 cols ── */}
          <div className="lg:col-span-5 relative rounded-[28px] p-5 lg:p-6 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 ring-1 ring-emerald-900/30 shadow-2xl shadow-emerald-900/20 overflow-hidden">
            {/* Texture */}
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col">
              {/* Location pills */}
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/25 text-white text-[10px] font-black uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  {direction}
                </div>
                <div className="inline-flex items-center h-6 px-2.5 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/25 text-white text-[10px] font-black uppercase tracking-wider tabular-nums">
                  {distance} км от МКАД
                </div>
              </div>

              {/* Title */}
              <h2 className="text-white text-2xl sm:text-3xl lg:text-[34px] font-black leading-[1.05] drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                Лучшие участки<br />
                в {name.toLowerCase()}
              </h2>

              {/* 2×2 stats */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <StatCell label="От" value={priceFrom.toLocaleString("ru-RU")} unit="₽ / сотка" />
                <StatCell
                  label="Свободно"
                  value={String(plotsAvailable)}
                  suffix={`/ ${plotsCount}`}
                  unit="участков"
                />
                <StatCell label="Площадь" value={`${areaFrom}–${areaTo}`} unit="соток" />
                <StatCell label="Готовность" value={`${readiness}%`} progress={readiness} />
              </div>

              {/* CTA */}
              <a
                href="#plots-map"
                className="mt-4 inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-white hover:bg-white/95 text-emerald-800 font-black text-sm shadow-lg active:scale-[0.98] transition-all"
              >
                Посмотреть все участки
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>

          {/* ── 3 feature tiles — right 7 cols, single row ── */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Tile
              tone="emerald"
              badge="Экономия"
              title="Фиксированная цена в договоре"
              desc="Никаких доплат после бронирования — цена за сотку прописана в договоре."
              icon={<Wallet className="w-5 h-5 text-white" strokeWidth={2.4} />}
            />
            <Tile
              tone="sky"
              badge="Простота"
              title="Сделка 1 день"
              desc="Электронная регистрация в Росреестре. Без нотариуса и очередей."
              icon={<CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.4} />}
            />
            <Tile
              tone="amber"
              badge="Рассрочка"
              title="Ипотека от 6.5%"
              desc="Работаем со Сбером, ВТБ, Альфой и ещё 6 банками. Одобрение за 3 дня."
              icon={<LayoutGrid className="w-5 h-5 text-white" strokeWidth={2.4} />}
            />
          </div>

          {/* ── Infrastructure pills — full width row ── */}
          {features.length > 0 && (
            <div className="lg:col-span-12 flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">
                Инфраструктура
              </span>
              {features.map((feature, i) => {
                const { Icon, color } = featureIcon(feature, i);
                return (
                  <div
                    key={feature}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-gray-50 ring-1 ring-gray-200 hover:ring-emerald-300 hover:bg-emerald-50 transition-colors"
                  >
                    <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={2.5} />
                    <span className="text-gray-800 text-xs font-bold">{feature}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── stat cell inside the signature card ─── */

function StatCell({
  label,
  value,
  suffix,
  unit,
  progress,
}: {
  label: string;
  value: string;
  suffix?: string;
  unit?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-2.5">
      <div className="text-[9px] uppercase tracking-wider text-white/60 font-bold">{label}</div>
      <div className="text-white text-lg lg:text-xl font-black tabular-nums leading-none mt-1">
        {value}
        {suffix && (
          <span className="text-sm text-white/60 font-black ml-1">{suffix}</span>
        )}
      </div>
      {unit && <div className="text-white/60 text-[10px] font-bold mt-0.5">{unit}</div>}
      {typeof progress === "number" && (
        <div className="mt-1.5 h-1 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

/* ─── feature tile ─── */

interface TileProps {
  tone: "emerald" | "sky" | "amber";
  badge: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const TONE: Record<TileProps["tone"], { bg: string; ring: string; iconBg: string; badge: string }> =
  {
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
  };

function Tile({ tone, badge, title, desc, icon }: TileProps) {
  const t = TONE[tone];
  return (
    <div
      className={`relative rounded-2xl p-3.5 ${t.bg} ring-1 ${t.ring} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
    >
      <div className="relative flex items-start gap-2.5">
        <div
          className={`shrink-0 w-10 h-10 rounded-xl ${t.iconBg} flex items-center justify-center shadow-md shadow-black/15`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div
            className={`inline-flex items-center h-4.5 px-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${t.badge} mb-1`}
          >
            {badge}
          </div>
          <div className="text-gray-900 text-[13px] font-black leading-tight">{title}</div>
          <div className="text-gray-600 text-[11px] leading-snug mt-1">{desc}</div>
        </div>
      </div>
    </div>
  );
}
