"use client";

import { CheckCircle2, Compass, Map, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Counter, StaggerItem, StaggerList } from "../ui/motion";
import { ink, type ToneName } from "../tones";
import { useTier } from "../../_lib/perf";
import { DIRECTIONS, DISTANCE_MIN, PLOTS_TOTAL, READY_COUNT, panel, plural } from "./common";

/**
 * Полоса доверия. Цифры намеренно другие, чем в hero, — повторять те же
 * три числа второй раз подряд бессмысленно.
 */
const items: {
  Icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  /** Днём у каждой цифры свой цвет — четыре одинаково зелёные иконки
   *  подряд читаются как одна плашка. Ночью все остаются зелёными. */
  tone: ToneName;
}[] = [
  { Icon: Compass, value: DIRECTIONS, label: "направления от МКАД", tone: "sky" },
  { Icon: Route, value: DISTANCE_MIN, label: "км до ближайшего посёлка", tone: "amber" },
  { Icon: Map, value: PLOTS_TOTAL, label: "участков на картах посёлков", tone: "violet" },
  {
    Icon: CheckCircle2,
    tone: "emerald",
    value: READY_COUNT,
    label: `${plural(READY_COUNT, "посёлок готов", "посёлка готовы", "посёлков готовы")} на 100%`,
  },
];

export default function TrustBar() {
  const lite = useTier() === "lite";

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <StaggerList className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((it) => (
          <StaggerItem key={it.label}>
            <div
              className="h-full rounded-[20px] px-4 py-5 transition-transform duration-300 hover:-translate-y-1 sm:px-5"
              style={panel(lite)}
            >
              <it.Icon className={`h-5 w-5 ${ink[it.tone]}`} strokeWidth={2.2} />
              <div className="mt-3 text-[24px] font-extrabold leading-none tracking-[-0.02em] sm:text-[30px]">
                <Counter to={it.value} />
                {it.suffix}
              </div>
              <div className="mt-1.5 text-[12px] leading-snug text-white/50 sm:text-[13px]">
                {it.label}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}
