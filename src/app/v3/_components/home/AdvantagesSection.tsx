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
import { SectionTitle } from "../ui/primitives";
import { Reveal, StaggerItem, StaggerList } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { panel } from "./common";

/**
 * Преимущества. Тексты — один в один из боевого src/components/Advantages.tsx
 * (8 карточек + баннер экономии). Переписан только внешний вид под тёмную тему:
 * пастельные подложки заменены на тонированное стекло.
 */

interface Item {
  Icon: LucideIcon;
  title: string;
  description: string;
  /** цвет иконки в тёмной теме — на месте пастельного bg с прода */
  tint: string;
}

const items: Item[] = [
  {
    Icon: ShieldCheck,
    title: "Юридическая чистота",
    description: "Аудит каждого участка. Гарантия чистой сделки закреплена в договоре.",
    tint: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
  },
  {
    Icon: Flame,
    title: "Газ, свет, вода",
    description: "Магистральный газ, 15 кВт электричества, центральный водопровод или скважина.",
    tint: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
  },
  {
    Icon: Car,
    title: "Асфальтовые дороги",
    description: "Твёрдое покрытие внутри посёлка и удобные подъезды.",
    tint: "bg-slate-400/15 text-slate-200 ring-slate-300/25",
  },
  {
    Icon: ShieldAlert,
    title: "Охрана и КПП 24/7",
    description: "Видеонаблюдение, КПП, патрулирование территории.",
    tint: "bg-rose-500/15 text-rose-300 ring-rose-400/25",
  },
  {
    Icon: Wallet,
    title: "Прозрачные цены",
    description: "Всё в договоре. Без скрытых платежей и доплат.",
    tint: "bg-teal-500/15 text-teal-300 ring-teal-400/25",
  },
  {
    Icon: BadgePercent,
    title: "Рассрочка 0%",
    description: "До 12 месяцев без переплат. Первый взнос — 30% от стоимости участка.",
    tint: "bg-violet-500/15 text-violet-300 ring-violet-400/25",
  },
  {
    Icon: Landmark,
    title: "Ипотека в 6 банках",
    description: "ВТБ, Сбер, Альфа, ГПБ, Россельхоз, Т-Банк.",
    tint: "bg-sky-500/15 text-sky-300 ring-sky-400/25",
  },
  {
    Icon: FileCheck2,
    title: "Категория ИЖС",
    description:
      "Постоянная прописка, материнский капитал, ипотека и все государственные программы.",
    tint: "bg-yellow-500/15 text-yellow-300 ring-yellow-400/25",
  },
];

export default function AdvantagesSection() {
  const lite = useTier() === "lite";

  return (
    <section id="advantages" className="mx-auto mt-20 max-w-[1400px] scroll-mt-24 px-4 sm:mt-28 sm:px-6">
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
          const big = i === 0 || i === items.length - 1;
          return (
            <StaggerItem
              key={item.title}
              className={big ? "col-span-2 lg:col-span-1" : undefined}
            >
              <div
                className="flex h-full flex-col gap-2.5 rounded-[20px] p-4 transition-transform duration-300 hover:-translate-y-1 sm:p-5"
                style={panel(lite)}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${item.tint}`}
                >
                  <item.Icon className="h-5 w-5" strokeWidth={2.4} />
                </div>
                <h3 className="text-[15px] font-extrabold leading-tight sm:text-base">
                  {item.title}
                </h3>
                <p className="text-[12px] leading-snug text-white/50 sm:text-[13px]">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerList>

      <Reveal delay={0.1}>
        <div
          className="relative mt-4 overflow-hidden rounded-[24px] px-5 py-5 sm:px-7 sm:py-6"
          style={panel(lite)}
        >
          {!lite && (
            <>
              <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-lime-400/15 blur-3xl" />
            </>
          )}

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex items-start gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/25">
                <PiggyBank className="h-6 w-6 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[17px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[22px]">
                  Экономия 500 000 – 2 000 000 ₽
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
        </div>
      </Reveal>
    </section>
  );
}
