"use client";

import {
  FileSearch,
  FileSignature,
  Home as HomeIcon,
  Lock,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { steps } from "@/lib/data";
import { SectionTitle } from "../ui/primitives";
import { Reveal, StaggerItem, StaggerList } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { panel } from "./common";

/**
 * Шаги покупки. Заголовок, подзаголовок, иконки и подписи «сколько займёт» —
 * из боевого src/components/Steps.tsx, сами шаги — из steps в data.ts.
 * Таймлайн: горизонтальный на десктопе, вертикальный с боковой линией на мобиле.
 */

const STEP_META: { Icon: LucideIcon; duration: string }[] = [
  { Icon: Phone, duration: "5 мин" },
  { Icon: MapPin, duration: "1–2 дня" },
  { Icon: Lock, duration: "15 мин" },
  { Icon: FileSearch, duration: "1 день" },
  { Icon: FileSignature, duration: "5–7 дней" },
  { Icon: HomeIcon, duration: "готово!" },
];

export default function StepsSection() {
  const lite = useTier() === "lite";

  return (
    <section id="steps" className="mx-auto mt-20 max-w-[1400px] scroll-mt-24 px-4 sm:mt-28 sm:px-6">
      <Reveal>
        <SectionTitle
          eyebrow="Как купить участок"
          title="От звонка до ключей —"
          accent="две недели"
          sub="Шесть понятных шагов. Мы рядом на каждом — документы, юрист, сопровождение в Росреестре."
        />
      </Reveal>

      <div className="relative">
        {/* линия таймлайна: сбоку на мобиле, поперёк на десктопе */}
        <div className="pointer-events-none absolute bottom-0 left-[27px] top-2 w-px bg-gradient-to-b from-emerald-400/40 via-emerald-400/20 to-transparent lg:hidden" />
        <div className="pointer-events-none absolute left-[8%] right-[8%] top-[26px] hidden h-px bg-gradient-to-r from-emerald-400/10 via-emerald-400/40 to-emerald-400/10 lg:block" />

        <StaggerList className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-3">
          {steps.map((step, i) => {
            const meta = STEP_META[i] ?? STEP_META[0];
            const Icon = meta.Icon;
            return (
              <StaggerItem key={step.number} className="h-full">
                <div className="flex h-full items-start gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                  <div className="relative shrink-0">
                    <div
                      className="grid h-14 w-14 place-items-center rounded-2xl ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1"
                      style={panel(lite)}
                    >
                      <Icon className="h-5 w-5 text-emerald-300" strokeWidth={2.4} />
                    </div>
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-[#0b0e13]">
                      {step.number}
                    </span>
                  </div>

                  <div className="min-w-0 lg:mt-4">
                    <h3 className="text-[15px] font-extrabold leading-tight">{step.title}</h3>
                    <span className="mt-1.5 inline-flex rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/50 ring-1 ring-white/10">
                      {meta.duration}
                    </span>
                    <p className="mt-2 max-w-[38ch] text-[12px] leading-snug text-white/50 lg:mx-auto lg:max-w-[22ch]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerList>
      </div>
    </section>
  );
}
