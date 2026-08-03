"use client";

import { ArrowRight, CalendarClock, MapPin } from "lucide-react";
import Aurora from "../ui/Aurora";
import { Accent, CTA, Eyebrow } from "../ui/primitives";
import { Counter, Reveal } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import {
  DIRECTIONS,
  PLOTS_AVAILABLE,
  PRICE_MIN,
  VILLAGE_COUNT,
  panel,
  plural,
} from "./common";

/**
 * Первый экран. Секция вытянута под фиксированную шапку (-mt-20),
 * чтобы аврора уходила ей за спину, а не обрывалась полосой.
 */
export default function Hero({ plotsAvailable }: { plotsAvailable?: number } = {}) {
  // Живая сумма из Земекс; без неё — цифра из data.ts.
  const available = plotsAvailable ?? PLOTS_AVAILABLE;
  const lite = useTier() === "lite";

  const stats: {
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
    hint: string;
  }[] = [
    {
      value: VILLAGE_COUNT,
      label: plural(VILLAGE_COUNT, "посёлок", "посёлка", "посёлков"),
      hint: `${DIRECTIONS} ${plural(DIRECTIONS, "направление", "направления", "направлений")} Подмосковья`,
    },
    {
      value: available,
      label: "свободных участков",
      hint: "сейчас в продаже",
    },
    {
      value: PRICE_MIN,
      prefix: "от ",
      suffix: " ₽",
      label: "за сотку",
      hint: "минимальная цена в каталоге",
    },
  ];

  return (
    <section className="relative -mt-20 overflow-hidden pt-20">
      <Aurora />

      <div className="relative mx-auto max-w-[1400px] px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        <Reveal>
          <Eyebrow>Коттеджные посёлки Подмосковья</Eyebrow>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mt-5 max-w-[16ch] text-[38px] font-extrabold leading-[1.03] tracking-[-0.02em] sm:text-6xl lg:text-[72px]">
            Ваш участок
            <br />
            для <Accent>жизни мечты</Accent>
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-white/60 sm:mt-6 sm:text-[18px]">
            Готовые коттеджные посёлки Подмосковья с газом, электричеством,
            асфальтом и охраной. Подбор участка за 15 минут.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <CTA href="/v3/catalog" className="w-full sm:w-auto">
              <MapPin className="h-4 w-4" />
              Выбрать участок
              <ArrowRight className="h-4 w-4" />
            </CTA>
            <CTA href="#quiz" variant="ghost" className="w-full sm:w-auto">
              <CalendarClock className="h-4 w-4 text-emerald-300" />
              Записаться на просмотр
            </CTA>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <div
            className="mt-10 grid divide-y divide-white/[0.08] overflow-hidden rounded-[24px] sm:mt-14 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            style={panel(lite)}
          >
            {stats.map((s) => (
              <div key={s.label} className="px-5 py-5 sm:px-6 sm:py-7">
                <div className="text-[26px] font-extrabold leading-none tracking-[-0.02em] text-white sm:text-[34px]">
                  {s.prefix && <span className="text-white/45">{s.prefix}</span>}
                  <Counter to={s.value} />
                  {s.suffix}
                </div>
                <div className="mt-2 text-[13px] font-bold text-emerald-300">{s.label}</div>
                <div className="mt-0.5 text-[12px] text-white/40">{s.hint}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
