"use client";

/**
 * VillageAdvantages — Variant A pastel: unified card in soft tones.
 * Infrastructure centered between stats and features.
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

function featureIcon(feature: string, i: number): { Icon: LucideIcon; color: string } {
  const f = feature.toLowerCase();
  if (f.includes("газ")) return { Icon: Flame, color: "text-amber-600" };
  if (f.includes("электр") || f.includes("свет")) return { Icon: Zap, color: "text-yellow-600" };
  if (f.includes("вод") || f.includes("скваж")) return { Icon: Droplets, color: "text-sky-600" };
  if (f.includes("охра") || f.includes("видео") || f.includes("огражд")) return { Icon: Shield, color: "text-slate-600" };
  if (f.includes("дорог") || f.includes("асфальт")) return { Icon: Route, color: "text-zinc-600" };
  if (f.includes("парков") || f.includes("транс") || f.includes("авто")) return { Icon: Car, color: "text-blue-600" };
  if (f.includes("лес") || f.includes("сосн") || f.includes("дерев")) return { Icon: TreePine, color: "text-emerald-600" };
  if (f.includes("озер") || f.includes("пруд") || f.includes("река")) return { Icon: Waves, color: "text-cyan-600" };
  if (f.includes("холм") || f.includes("гор")) return { Icon: Mountain, color: "text-stone-600" };
  if (f.includes("интернет") || f.includes("связ")) return { Icon: Phone, color: "text-violet-600" };
  const fb: { Icon: LucideIcon; color: string }[] = [
    { Icon: CheckCircle2, color: "text-emerald-600" },
    { Icon: Sparkles, color: "text-rose-500" },
    { Icon: MapPin, color: "text-indigo-600" },
  ];
  return fb[i % fb.length];
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
    <section className="py-6 lg:py-8">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-3 lg:px-4">
        <div className="relative rounded-[28px] bg-gradient-to-br from-green-600 via-emerald-500 to-cyan-600 ring-1 ring-green-800/25 shadow-2xl shadow-green-900/15 overflow-hidden">
          {/* Texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-32 -bottom-32 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative p-5 lg:p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 h-7 px-3.5 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/25 text-white text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Почему {name}
              </div>
              <div className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/10 ring-1 ring-white/20 text-white/80 text-[10px] font-bold">
                <MapPin className="w-3 h-3" />
                {direction} · {distance} км
              </div>
            </div>

            {/* Main: stats left + features right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
              {/* Left: stats */}
              <div className="lg:col-span-5">
                <h2 className="text-white text-2xl lg:text-[30px] font-black leading-[1.05] drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Лучшие участки в {name}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <StatCell label="От" value={priceFrom.toLocaleString("ru-RU")} unit="₽ / сотка" />
                  <StatCell label="Свободно" value={String(plotsAvailable)} suffix={`/ ${plotsCount}`} unit="участков" />
                  <StatCell label="Площадь" value={`${areaFrom}–${areaTo}`} unit="соток" />
                  <StatCell label="Готовность" value={`${readiness}%`} progress={readiness} />
                </div>
                <a
                  href="#plots-map"
                  className="mt-3 inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-white hover:bg-white/95 text-emerald-800 font-black text-sm shadow-lg active:scale-[0.98] transition-all"
                >
                  Посмотреть все участки →
                </a>
              </div>

              {/* Right: features */}
              <div className="lg:col-span-7 flex flex-col gap-2.5">
                <FeatureRow
                  icon={<Wallet className="w-5 h-5 text-white" strokeWidth={2.4} />}
                  badge="Экономия"
                  title="Фиксированная цена в договоре"
                  desc="Никаких доплат после бронирования — цена за сотку прописана в договоре."
                />
                <FeatureRow
                  icon={<CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.4} />}
                  badge="Простота"
                  title="Сделка 1 день"
                  desc="Электронная регистрация в Росреестре. Без нотариуса и очередей."
                />
                <FeatureRow
                  icon={<LayoutGrid className="w-5 h-5 text-white" strokeWidth={2.4} />}
                  badge="Рассрочка"
                  title="Ипотека от 6.5%"
                  desc="Работаем со Сбером, ВТБ, Альфой и ещё 6 банками. Одобрение за 3 дня."
                />
              </div>
            </div>

            {/* Infrastructure pills — centered below */}
            {features.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap justify-center items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mr-1">
                  Инфраструктура
                </span>
                {features.map((feature, i) => {
                  const { Icon } = featureIcon(feature, i);
                  return (
                    <div
                      key={feature}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition-colors"
                    >
                      <Icon className="w-3 h-3 text-white/70" strokeWidth={2.5} />
                      <span className="text-white/90 text-[11px] font-bold">{feature}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCell({ label, value, suffix, unit, progress }: {
  label: string; value: string; suffix?: string; unit?: string; progress?: number;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-2.5">
      <div className="text-[9px] uppercase tracking-wider text-white/60 font-bold">{label}</div>
      <div className="text-white text-lg font-black tabular-nums leading-none mt-1">
        {value}
        {suffix && <span className="text-sm text-white/60 font-black ml-1">{suffix}</span>}
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

function FeatureRow({ icon, badge, title, desc }: {
  icon: React.ReactNode; iconBg?: string; badge: string; badgeColor?: string; title: string; desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 p-3.5 hover:bg-white/15 transition-colors">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="inline-flex items-center h-4 px-1.5 rounded-full bg-white/20 text-white text-[8px] font-black uppercase tracking-wider mb-1">
          {badge}
        </div>
        <div className="text-white text-sm font-black leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]">{title}</div>
        <div className="text-white/80 text-[11px] leading-snug mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
