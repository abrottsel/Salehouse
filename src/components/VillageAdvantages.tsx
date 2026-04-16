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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 ring-1 ring-emerald-200/60 shadow-xl shadow-emerald-900/5 overflow-hidden">
          {/* Subtle texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-32 -bottom-32 w-80 h-80 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />

          <div className="relative p-5 lg:p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 h-7 px-3.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3 h-3" />
                Почему {name}
              </div>
              <div className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/80 ring-1 ring-emerald-200 text-emerald-800 text-[10px] font-bold">
                <MapPin className="w-3 h-3" />
                {direction} · {distance} км
              </div>
            </div>

            {/* Main: stats left + infra center + features right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
              {/* Left: stats */}
              <div className="lg:col-span-4">
                <h2 className="text-emerald-900 text-2xl lg:text-[28px] font-black leading-[1.05]">
                  Лучшие участки в {name.toLowerCase()}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <StatCell label="От" value={priceFrom.toLocaleString("ru-RU")} unit="₽ / сотка" />
                  <StatCell label="Свободно" value={String(plotsAvailable)} suffix={`/ ${plotsCount}`} unit="участков" />
                  <StatCell label="Площадь" value={`${areaFrom}–${areaTo}`} unit="соток" />
                  <StatCell label="Готовность" value={`${readiness}%`} progress={readiness} />
                </div>
                <a
                  href="#plots-map"
                  className="mt-3 inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md shadow-emerald-900/15 active:scale-[0.98] transition-all"
                >
                  Посмотреть все участки →
                </a>
              </div>

              {/* Center: infrastructure */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700/50 mb-2">
                  Инфраструктура
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {features.map((feature, i) => {
                    const { Icon, color } = featureIcon(feature, i);
                    return (
                      <div
                        key={feature}
                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white/80 ring-1 ring-emerald-200/60 hover:ring-emerald-400 hover:bg-white transition-colors"
                      >
                        <Icon className={`w-3 h-3 ${color}`} strokeWidth={2.5} />
                        <span className="text-emerald-900 text-[11px] font-bold">{feature}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: features */}
              <div className="lg:col-span-5 flex flex-col gap-2.5">
                <FeatureRow
                  icon={<Wallet className="w-5 h-5 text-emerald-700" strokeWidth={2.4} />}
                  iconBg="bg-emerald-100"
                  badge="Экономия"
                  badgeColor="bg-emerald-100 text-emerald-800"
                  title="Фиксированная цена в договоре"
                  desc="Никаких доплат после бронирования — цена за сотку прописана в договоре."
                />
                <FeatureRow
                  icon={<CheckCircle2 className="w-5 h-5 text-sky-700" strokeWidth={2.4} />}
                  iconBg="bg-sky-100"
                  badge="Простота"
                  badgeColor="bg-sky-100 text-sky-800"
                  title="Сделка 1 день"
                  desc="Электронная регистрация в Росреестре. Без нотариуса и очередей."
                />
                <FeatureRow
                  icon={<LayoutGrid className="w-5 h-5 text-amber-700" strokeWidth={2.4} />}
                  iconBg="bg-amber-100"
                  badge="Рассрочка"
                  badgeColor="bg-amber-100 text-amber-900"
                  title="Ипотека от 6.5%"
                  desc="Работаем со Сбером, ВТБ, Альфой и ещё 6 банками. Одобрение за 3 дня."
                />
              </div>
            </div>
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
    <div className="rounded-xl bg-white/70 ring-1 ring-emerald-200/50 p-2.5">
      <div className="text-[9px] uppercase tracking-wider text-emerald-700/60 font-bold">{label}</div>
      <div className="text-emerald-900 text-lg font-black tabular-nums leading-none mt-1">
        {value}
        {suffix && <span className="text-sm text-emerald-600/60 font-black ml-1">{suffix}</span>}
      </div>
      {unit && <div className="text-emerald-700/50 text-[10px] font-bold mt-0.5">{unit}</div>}
      {typeof progress === "number" && (
        <div className="mt-1.5 h-1 rounded-full bg-emerald-200/50 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function FeatureRow({ icon, iconBg, badge, badgeColor, title, desc }: {
  icon: React.ReactNode; iconBg: string; badge: string; badgeColor: string; title: string; desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/60 ring-1 ring-emerald-200/40 p-3.5 hover:bg-white/80 hover:shadow-md transition-all">
      <div className={`shrink-0 w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`inline-flex items-center h-4 px-1.5 rounded-full text-[8px] font-black uppercase tracking-wider ${badgeColor} mb-1`}>
          {badge}
        </div>
        <div className="text-gray-900 text-[13px] font-black leading-tight">{title}</div>
        <div className="text-gray-600 text-[11px] leading-snug mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
