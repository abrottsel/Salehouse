"use client";

import {
  ArrowRight,
  BadgePercent,
  Car,
  FileCheck2,
  Flame,
  Landmark,
  PiggyBank,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useInView, useScroll, useTransform, motion } from "framer-motion";
import { SectionTitle } from "../ui/primitives";
import { Counter, Reveal, StaggerItem, StaggerList } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import SpotlightCard from "../ui/SpotlightCard";

/**
 * Преимущества. Тексты — один в один из боевого src/components/Advantages.tsx
 * (8 карточек + баннер экономии). Меняется только подача:
 *
 *   — бенто-сетка: «Юридическая чистота» 2×2, «Рассрочка 0%» во всю ширину,
 *     остальные шесть — обычные ячейки (ровно 3×4 на десктопе);
 *   — призрачная иконка-водяной знак в каждой карточке;
 *   — пятно подсветки за курсором (SpotlightCard) и hover-лифт;
 *   — счётчики на суммах экономии, заводятся при въезде блока в экран.
 *
 * Мобайл главный: на 375px сетка — две колонки, акцентные карточки
 * раскладываются в полную ширину, ничего не режется.
 */

interface Item {
  Icon: LucideIcon;
  title: string;
  description: string;
  /** цвет иконки в тёмной теме — на месте пастельного bg с прода */
  tint: string;
  /** оттенок пятна подсветки под цвет иконки */
  glow: string;
}

const items: Item[] = [
  {
    Icon: ShieldCheck,
    title: "Юридическая чистота",
    description: "Аудит каждого участка. Гарантия чистой сделки закреплена в договоре.",
    tint: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
    glow: "rgba(16,185,129,0.26)",
  },
  {
    Icon: Flame,
    title: "Газ, свет, вода",
    description: "Магистральный газ, 15 кВт электричества, центральный водопровод или скважина.",
    tint: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
    glow: "rgba(245,158,11,0.20)",
  },
  {
    Icon: Car,
    title: "Асфальтовые дороги",
    description: "Твёрдое покрытие внутри посёлка и удобные подъезды.",
    tint: "bg-slate-400/15 text-slate-200 ring-slate-300/25",
    glow: "rgba(148,163,184,0.20)",
  },
  {
    Icon: ShieldAlert,
    title: "Охрана и КПП 24/7",
    description: "Видеонаблюдение, КПП, патрулирование территории.",
    tint: "bg-rose-500/15 text-rose-300 ring-rose-400/25",
    glow: "rgba(244,63,94,0.20)",
  },
  {
    Icon: Wallet,
    title: "Прозрачные цены",
    description: "Всё в договоре. Без скрытых платежей и доплат.",
    tint: "bg-teal-500/15 text-teal-300 ring-teal-400/25",
    glow: "rgba(20,184,166,0.20)",
  },
  {
    Icon: BadgePercent,
    title: "Рассрочка 0%",
    description: "До 12 месяцев без переплат. Первый взнос — 30% от стоимости участка.",
    tint: "bg-violet-500/15 text-violet-300 ring-violet-400/25",
    glow: "rgba(139,92,246,0.22)",
  },
  {
    Icon: Landmark,
    title: "Ипотека в 6 банках",
    description: "ВТБ, Сбер, Альфа, ГПБ, Россельхоз, Т-Банк.",
    tint: "bg-sky-500/15 text-sky-300 ring-sky-400/25",
    glow: "rgba(56,189,248,0.20)",
  },
  {
    Icon: FileCheck2,
    title: "Категория ИЖС",
    description:
      "Постоянная прописка, материнский капитал, ипотека и все государственные программы.",
    tint: "bg-yellow-500/15 text-yellow-300 ring-yellow-400/25",
    glow: "rgba(234,179,8,0.20)",
  },
];

/**
 * Раскладка бенто: 0 — крупная 2×2, 5 — широкая на две колонки.
 * На десктопе выходит ровно 3×4 без дыр, на мобиле — две колонки,
 * где акцентные карточки занимают строку целиком.
 */
const SPAN: Record<number, string> = {
  0: "col-span-2 lg:col-span-2 lg:row-span-2",
  5: "col-span-2 lg:col-span-2",
};

export default function AdvantagesSection() {
  const lite = useTier() === "lite";

  return (
    <section id="advantages" className="mx-auto mt-20 max-w-[1400px] scroll-mt-24 px-4 sm:mt-24 sm:px-6">
      <Reveal>
        <SectionTitle
          eyebrow="Наши преимущества"
          title="Всё включено"
          accent="для комфортной жизни"
          sub="Коммуникации, охрана, дороги и финансовые программы — всё готово."
        />
      </Reveal>

      <StaggerList className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item, i) => {
          const hero = i === 0;
          const wide = i === 5;
          return (
            <StaggerItem key={item.title} className={SPAN[i] ?? ""}>
              <SpotlightCard
                tone={item.glow}
                radius={hero ? 420 : 260}
                className={`flex h-full flex-col rounded-[20px] p-4 ring-1 ring-white/[0.06] sm:p-5 ${
                  lite
                    ? ""
                    : "transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:ring-white/15"
                } ${hero ? "justify-end gap-3 sm:p-7" : "gap-2.5"}`}
              >
                {/* Водяной знак: та же иконка, только огромная и почти прозрачная.
                    У широкой карточки его нет — там знаком служит сама «0%». */}
                {!wide && (
                  <item.Icon
                    aria-hidden="true"
                    strokeWidth={1.1}
                    className={`pointer-events-none absolute text-white/[0.045] ${
                      hero
                        ? "-bottom-8 -right-6 h-52 w-52 sm:h-64 sm:w-64"
                        : "-bottom-4 -right-3 h-24 w-24"
                    }`}
                  />
                )}

                {!lite && hero && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
                  />
                )}
                {!lite && wide && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl"
                  />
                )}

                {/* Крупная «0%» — цифра из самого заголовка, ничего нового. */}
                {wide && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-[86px] font-black leading-none tracking-tighter text-white/[0.06] sm:right-6 sm:text-[112px]"
                  >
                    0%
                  </span>
                )}

                <div
                  className={`relative flex items-center justify-center rounded-xl ring-1 ${item.tint} ${
                    hero ? "h-14 w-14" : "h-11 w-11"
                  }`}
                >
                  <item.Icon className={hero ? "h-6 w-6" : "h-5 w-5"} strokeWidth={2.4} />
                </div>

                <h3
                  className={`relative font-extrabold leading-tight ${
                    hero
                      ? "text-[20px] tracking-[-0.01em] sm:text-[26px]"
                      : "text-[15px] sm:text-base"
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`relative leading-snug text-white/50 ${
                    hero
                      ? "max-w-[34ch] text-[13px] sm:text-[15px]"
                      : "text-[12px] sm:text-[13px]"
                  }`}
                >
                  {item.description}
                </p>
              </SpotlightCard>
            </StaggerItem>
          );
        })}
      </StaggerList>

      <SavingsBanner lite={lite} />
    </section>
  );
}

/**
 * Баннер экономии — ключевая карточка блока: суммы доезжают счётчиком,
 * но только когда баннер реально попал в экран (иначе анимация
 * отыгрывает где-то далеко внизу и её никто не видит).
 */
function SavingsBanner({ lite }: { lite: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [26, -26]);

  return (
    <Reveal delay={0.1}>
      <div ref={ref}>
        <SpotlightCard
          radius={520}
          tone="rgba(16,185,129,0.20)"
          className="mt-3 rounded-[24px] px-5 py-6 ring-1 ring-emerald-400/15 sm:px-7 sm:py-7"
        >
          {!lite && (
            <>
              <span className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl" />
              <span className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-lime-400/15 blur-3xl" />
            </>
          )}

          <motion.span
            aria-hidden="true"
            style={lite ? undefined : { y: ghostY }}
            className="pointer-events-none absolute -bottom-10 right-2 select-none text-[120px] font-black leading-none text-white/[0.035] sm:right-10 sm:text-[180px]"
          >
            ₽
          </motion.span>

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex items-start gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/25">
                <PiggyBank className="h-6 w-6 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[17px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[26px]">
                  Экономия{" "}
                  <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-lime-300 bg-clip-text tabular-nums text-transparent">
                    {inView ? <Counter to={500000} /> : "0"} – {inView ? <Counter to={2000000} duration={1400} /> : "0"} ₽
                  </span>
                </h3>
                <p className="mt-1 text-[12px] text-white/50 sm:text-[14px]">
                  На подведении коммуникаций — всё уже сделано.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-stretch gap-2">
              <a
                href="#quiz"
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-emerald-500 px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 md:flex-none"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                Презентация
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </a>
              <Link
                href="/v3/mortgage"
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white/[0.07] px-5 text-[13px] font-bold text-emerald-300 ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:bg-white/[0.13] md:flex-none"
              >
                <Wallet className="h-4 w-4 shrink-0" />
                Ипотека
              </Link>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </Reveal>
  );
}
