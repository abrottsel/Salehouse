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
import { useRef, type ReactNode } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Accent, Eyebrow, glassStyle } from "../ui/primitives";
import { Counter, Reveal, StaggerItem, StaggerList } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import SpotlightCard from "../ui/SpotlightCard";
import { plate, type ToneName } from "../tones";

/**
 * Преимущества посёлка — тёмный премиум, бенто.
 *
 * Тексты (заголовки, бейджи, описания трёх плиток, подписи стат-ячеек)
 * взяты дословно из боевого src/components/VillageAdvantages.tsx —
 * факты не переписываем, меняется только оформление.
 *
 * Что даёт «вау»:
 *   — цена вынесена в крупную ячейку с призрачным «₽» и счётчиком;
 *   — три плитки разложены бенто (первая — широкая, с водяным знаком);
 *   — пятно подсветки за курсором на панели и на каждой плитке;
 *   — гирлянда появления при скролле, лёгкий параллакс у знака «₽».
 *
 * Мобайл главный: на 375px всё в одну колонку, кроме пары мелких
 * стат-ячеек; горизонтального скролла нет, ничего не обрезается.
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

/** Днём у каждой плитки свой тон — три одинаково зелёные подряд читались
 *  как одна. Ночью все остаются зелёными (см. _components/tones.ts). */
const TILES: {
  Icon: LucideIcon;
  badge: string;
  title: string;
  desc: string;
  tone: ToneName;
}[] = [
  {
    Icon: Wallet,
    tone: "emerald",
    badge: "Экономия",
    title: "Фиксированная цена в договоре",
    desc: "Никаких доплат после бронирования — цена за сотку прописана в договоре.",
  },
  {
    Icon: CheckCircle2,
    tone: "sky",
    badge: "Простота",
    title: "Сделка 1 день",
    desc: "Электронная регистрация в Росреестре. Без нотариуса и очередей.",
  },
  {
    Icon: LayoutGrid,
    tone: "violet",
    badge: "Рассрочка",
    title: "Ипотека от 6.5%",
    desc: "Работаем со Сбером, ВТБ, Альфой и ещё 6 банками. Одобрение за 3 дня.",
  },
];

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
  const lite = useTier() === "lite";
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], [22, -22]);

  return (
    <Reveal>
      <div
        ref={ref}
        className="relative overflow-hidden rounded-[28px] p-5 sm:p-8 lg:p-10"
        style={
          lite ? { ...glassStyle, backdropFilter: "none", WebkitBackdropFilter: "none" } : glassStyle
        }
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
        {/* Светящаяся кромка сверху — читается как «премиум», стоит ноль. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent"
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

              <StaggerList className="mt-5 grid grid-cols-2 gap-2.5">
                {/* Ключевая ячейка: цена крупно, с призрачным «₽» и счётчиком. */}
                <StaggerItem className="col-span-2">
                  <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-emerald-500/[0.14] via-white/[0.05] to-transparent p-4 ring-1 ring-emerald-400/20">
                    <motion.span
                      aria-hidden="true"
                      style={lite ? undefined : { y: ghostY }}
                      className="pointer-events-none absolute -bottom-8 right-1 select-none text-[104px] font-black leading-none text-white/[0.05]"
                    >
                      ₽
                    </motion.span>
                    <div className="relative">
                      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300/70">
                        От
                      </div>
                      <div className="mt-1.5 text-[34px] font-extrabold leading-none tabular-nums text-white sm:text-[40px]">
                        {inView ? <Counter to={priceFrom} /> : "0"}
                      </div>
                      <div className="mt-1.5 text-[11px] font-bold text-white/50">₽ / сотка</div>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <StatCell label="Свободно" unit="участков" suffix={`/ ${plotsCount}`}>
                    {inView ? <Counter to={plotsAvailable} /> : "0"}
                  </StatCell>
                </StaggerItem>
                <StaggerItem>
                  <StatCell label="Площадь" unit="соток">
                    {areaFrom}–{areaTo}
                  </StatCell>
                </StaggerItem>
                <StaggerItem className="col-span-2">
                  <StatCell label="Готовность" progress={readiness} inline>
                    {readiness}%
                  </StatCell>
                </StaggerItem>
              </StaggerList>

              <a
                href="#plots-map"
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-[14px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]"
              >
                Посмотреть все участки →
              </a>
            </div>

            {/* Справа — три плитки бенто, тексты дословно из боевой версии */}
            <StaggerList className="grid gap-2.5 sm:grid-cols-2 lg:col-span-7">
              {TILES.map((tile, i) => (
                <StaggerItem key={tile.title} className={i === 0 ? "sm:col-span-2" : ""}>
                  <SpotlightCard
                    radius={i === 0 ? 380 : 240}
                    tone="rgba(16,185,129,0.20)"
                    className={`flex h-full flex-col justify-center rounded-[20px] p-4 ring-1 ring-white/10 ${
                      lite ? "" : "transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:ring-emerald-400/30"
                    } ${i === 0 ? "sm:p-5" : ""}`}
                    // вложенное стекло не нужно: панель уже размыта, второй
                    // backdrop-filter поверх неё — чистый расход кадров.
                    // Подложка переменной: днём белила в 5% исчезали на
                    // белой панели-родителе.
                    style={{
                      background: "var(--v3-surface-sub, rgba(255,255,255,0.05))",
                      boxShadow: "none",
                      backdropFilter: "none",
                      WebkitBackdropFilter: "none",
                    }}
                  >
                    <tile.Icon
                      aria-hidden="true"
                      strokeWidth={1.1}
                      className={`pointer-events-none absolute text-white/[0.05] ${
                        i === 0 ? "-bottom-6 -right-4 h-40 w-40" : "-bottom-4 -right-3 h-24 w-24"
                      }`}
                    />
                    <div className="relative flex items-start gap-3.5">
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ring-1 ${plate[tile.tone]}`}
                      >
                        <tile.Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] ring-1 ${plate[tile.tone]}`}
                        >
                          {tile.badge}
                        </span>
                        <div className="mt-1.5 text-[15px] font-extrabold leading-tight text-white">
                          {tile.title}
                        </div>
                        <div className="mt-1 text-[12.5px] leading-snug text-white/55">
                          {tile.desc}
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>

          {features.length > 0 && (
            <StaggerList className="mt-7 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
              <span className="mr-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">
                Инфраструктура
              </span>
              {features.map((feature, i) => {
                const { Icon, color } = featureIcon(feature, i);
                return (
                  <StaggerItem key={feature}>
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 ring-1 ring-white/12 transition-all hover:-translate-y-0.5 hover:bg-white/[0.12] hover:ring-emerald-400/30">
                      <Icon className={`h-3.5 w-3.5 ${color}`} strokeWidth={2.4} />
                      <span className="text-[12px] font-bold text-white/85">{feature}</span>
                    </span>
                  </StaggerItem>
                );
              })}
            </StaggerList>
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
  inline,
}: {
  label: string;
  children: ReactNode;
  suffix?: string;
  unit?: string;
  progress?: number;
  /** «Готовность» шире остальных — подпись и полоса в одну строку. */
  inline?: boolean;
}) {
  return (
    <div className="h-full rounded-[18px] bg-white/[0.05] p-3 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08]">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div
        className={
          inline
            ? "mt-1.5 flex items-center gap-3"
            : "mt-1.5 text-[20px] font-extrabold leading-none tabular-nums text-white sm:text-[22px]"
        }
      >
        {inline ? (
          <>
            <span className="text-[20px] font-extrabold leading-none tabular-nums text-white sm:text-[22px]">
              {children}
            </span>
            {typeof progress === "number" && (
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/12">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                  style={{ width: `${progress}%` }}
                />
              </span>
            )}
          </>
        ) : (
          <>
            {children}
            {suffix && (
              <span className="ml-1 text-[13px] font-extrabold text-white/40">{suffix}</span>
            )}
          </>
        )}
      </div>
      {unit && <div className="mt-1 text-[10px] font-bold text-white/45">{unit}</div>}
    </div>
  );
}
