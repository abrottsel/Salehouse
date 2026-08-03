"use client";

import {
  Wallet,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  TreePine,
  Droplets,
  MapPin,
  Route,
  Flame,
  Phone,
  Car,
  Waves,
  Mountain,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Accent, Eyebrow, glassStyle } from "../ui/primitives";
import { Counter, Reveal, StaggerItem, StaggerList } from "../ui/motion";

/**
 * Преимущества посёлка — тёмный премиум.
 *
 * Тексты (заголовки, бейджи, описания трёх плиток, подписи стат-ячеек)
 * взяты дословно из боевого src/components/VillageAdvantages.tsx —
 * факты не переписываем, меняется только оформление.
 */

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

/** Иконка под инфраструктурную пилюлю. Правила подбора — как в боевом
 *  компоненте, цвета подняты до светлых: на тёмном фоне -600 не видно. */
function featureIcon(feature: string, i: number): { Icon: LucideIcon; color: string } {
  const f = feature.toLowerCase();
  if (f.includes("газ")) return { Icon: Flame, color: "text-amber-300" };
  if (f.includes("электр") || f.includes("свет")) return { Icon: Zap, color: "text-yellow-300" };
  if (f.includes("вод") || f.includes("скваж")) return { Icon: Droplets, color: "text-sky-300" };
  if (f.includes("охра") || f.includes("видео") || f.includes("огражд"))
    return { Icon: Shield, color: "text-slate-300" };
  if (f.includes("дорог") || f.includes("асфальт")) return { Icon: Route, color: "text-zinc-300" };
  if (f.includes("парков") || f.includes("транс") || f.includes("авто"))
    return { Icon: Car, color: "text-blue-300" };
  if (f.includes("лес") || f.includes("сосн") || f.includes("дерев"))
    return { Icon: TreePine, color: "text-emerald-300" };
  if (f.includes("озер") || f.includes("пруд") || f.includes("река"))
    return { Icon: Waves, color: "text-cyan-300" };
  if (f.includes("холм") || f.includes("гор")) return { Icon: Mountain, color: "text-stone-300" };
  if (f.includes("интернет") || f.includes("связ")) return { Icon: Phone, color: "text-violet-300" };
  const fb: { Icon: LucideIcon; color: string }[] = [
    { Icon: CheckCircle2, color: "text-emerald-300" },
    { Icon: Sparkles, color: "text-rose-300" },
    { Icon: MapPin, color: "text-indigo-300" },
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
    <Reveal>
      <div
        className="relative overflow-hidden rounded-[28px] p-5 sm:p-8 lg:p-10"
        style={glassStyle}
      >
        {/* Зелёное свечение из угла + точечная текстура — фактура вместо
            плоской заливки, но без blur-слоёв: они дорогие на телефонах. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 100% 0%, rgba(16,185,129,0.16) 0%, transparent 58%)," +
              "radial-gradient(90% 70% at 0% 100%, rgba(163,230,53,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Eyebrow>
              <Sparkles className="h-3 w-3" />
              Почему {name}
            </Eyebrow>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold text-white/70 ring-1 ring-white/12">
              <MapPin className="h-3 w-3" />
              {direction} · {distance} км
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Слева — цифры посёлка */}
            <div className="lg:col-span-5">
              <h2 className="text-[28px] font-extrabold leading-[1.06] sm:text-4xl">
                Лучшие участки в <Accent>{name}</Accent>
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <StatCell label="От" unit="₽ / сотка">
                  <Counter to={priceFrom} />
                </StatCell>
                <StatCell label="Свободно" unit="участков" suffix={`/ ${plotsCount}`}>
                  <Counter to={plotsAvailable} />
                </StatCell>
                <StatCell label="Площадь" unit="соток">
                  {areaFrom}–{areaTo}
                </StatCell>
                <StatCell label="Готовность" progress={readiness}>
                  {readiness}%
                </StatCell>
              </div>

              <a
                href="#plots-map"
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-[14px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]"
              >
                Посмотреть все участки →
              </a>
            </div>

            {/* Справа — три плитки, тексты дословно из боевой версии */}
            <StaggerList className="flex flex-col gap-2.5 lg:col-span-7">
              <StaggerItem>
                <FeatureRow
                  icon={<Wallet className="h-5 w-5 text-emerald-300" strokeWidth={2.2} />}
                  badge="Экономия"
                  title="Фиксированная цена в договоре"
                  desc="Никаких доплат после бронирования — цена за сотку прописана в договоре."
                />
              </StaggerItem>
              <StaggerItem>
                <FeatureRow
                  icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" strokeWidth={2.2} />}
                  badge="Простота"
                  title="Сделка 1 день"
                  desc="Электронная регистрация в Росреестре. Без нотариуса и очередей."
                />
              </StaggerItem>
              <StaggerItem>
                <FeatureRow
                  icon={<LayoutGrid className="h-5 w-5 text-emerald-300" strokeWidth={2.2} />}
                  badge="Рассрочка"
                  title="Ипотека от 6.5%"
                  desc="Работаем со Сбером, ВТБ, Альфой и ещё 6 банками. Одобрение за 3 дня."
                />
              </StaggerItem>
            </StaggerList>
          </div>

          {features.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
              <span className="mr-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">
                Инфраструктура
              </span>
              {features.map((feature, i) => {
                const { Icon, color } = featureIcon(feature, i);
                return (
                  <span
                    key={feature}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 ring-1 ring-white/12 transition-colors hover:bg-white/[0.12]"
                  >
                    <Icon className={`h-3.5 w-3.5 ${color}`} strokeWidth={2.4} />
                    <span className="text-[12px] font-bold text-white/85">{feature}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function StatCell({
  label,
  children,
  suffix,
  unit,
  progress,
}: {
  label: string;
  children: ReactNode;
  suffix?: string;
  unit?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-[18px] bg-white/[0.05] p-3 ring-1 ring-white/10">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-1.5 text-[20px] font-extrabold leading-none tabular-nums text-white sm:text-[22px]">
        {children}
        {suffix && <span className="ml-1 text-[13px] font-extrabold text-white/40">{suffix}</span>}
      </div>
      {unit && <div className="mt-1 text-[10px] font-bold text-white/45">{unit}</div>}
      {typeof progress === "number" && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function FeatureRow({
  icon,
  badge,
  title,
  desc,
}: {
  icon: ReactNode;
  badge: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-[20px] bg-white/[0.05] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/[0.09]">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-emerald-400/10 ring-1 ring-emerald-400/25">
        {icon}
      </div>
      <div className="min-w-0">
        <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-emerald-300 ring-1 ring-emerald-400/25">
          {badge}
        </span>
        <div className="mt-1.5 text-[15px] font-extrabold leading-tight text-white">{title}</div>
        <div className="mt-1 text-[12.5px] leading-snug text-white/55">{desc}</div>
      </div>
    </div>
  );
}
