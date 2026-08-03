"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { steps } from "@/lib/data";
import { SectionTitle } from "../ui/primitives";
import { Reveal } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { metaFor } from "../steps-meta";
import { panel } from "./common";

/**
 * Шаги покупки на главной. Заголовок, подзаголовок, иконки и подписи
 * «сколько займёт» — из боевого src/components/Steps.tsx, сами шаги — из
 * `steps` в data.ts. Ни одного текста не переписано.
 *
 * Подача: лента, которая «зажигается» по мере скролла. Линия таймлайна
 * заполняется (useScroll → scaleX/scaleY), по ней едет светящаяся капля,
 * шаг под кареткой подсвечивается своим цветом, номера шагов работают
 * фоновой графикой. Мобиле — вертикаль, десктопу — горизонтальная лента.
 *
 * На "lite" линия залита сразу, свечения и капли нет, появление — короткий
 * fade (см. _lib/perf).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function StepsSection() {
  const lite = useTier() === "lite";
  const railRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.6", "end 0.75"],
  });
  const runner = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [active, setActive] = useState(-1);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(steps.length - 1, Math.floor(p * steps.length));
    setActive((prev) => (prev === next ? prev : next));
  });

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

      {/* overflow-x-clip: карточки выезжают на ±34px вбок, иначе на мобиле
          появлялась бы горизонтальная прокрутка. */}
      <div ref={railRef} className="relative overflow-x-clip">
        {/* Рельса вертикальная — только на мобиле, где карточки в один столбец */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-[28px] top-6 w-px -translate-x-1/2 bg-white/[0.07] sm:hidden"
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-[28px] top-6 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300 via-emerald-400 to-lime-300 sm:hidden"
          style={{
            originY: 0,
            scaleY: lite ? 1 : scrollYProgress,
            opacity: lite ? 0.5 : 1,
            boxShadow: lite ? undefined : "0 0 12px rgba(52,211,153,0.55)",
          }}
        />
        {!lite && (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-[28px] top-6 z-10 w-0 sm:hidden"
          >
            <motion.span
              className="absolute left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-200"
              style={{
                top: runner,
                boxShadow: "0 0 0 6px rgba(163,230,53,0.14), 0 0 22px 4px rgba(163,230,53,0.6)",
              }}
            />
          </span>
        )}

        {/* Рельса горизонтальная — лента десктопа */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[8%] right-[8%] top-[28px] hidden h-px bg-white/[0.07] lg:block"
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-[8%] right-[8%] top-[27px] hidden h-[2px] rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-lime-300 lg:block"
          style={{
            originX: 0,
            scaleX: lite ? 1 : scrollYProgress,
            opacity: lite ? 0.5 : 1,
            boxShadow: lite ? undefined : "0 0 12px rgba(52,211,153,0.55)",
          }}
        />
        {!lite && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-[8%] right-[8%] top-[28px] z-10 hidden h-0 lg:block"
          >
            <motion.span
              className="absolute top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-200"
              style={{
                left: runner,
                boxShadow: "0 0 0 6px rgba(163,230,53,0.14), 0 0 22px 4px rgba(163,230,53,0.6)",
              }}
            />
          </span>
        )}

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-3">
          {steps.map((step, i) => {
            const meta = metaFor(i);
            const Icon = meta.Icon;
            const reached = lite || i <= active;
            const isCurrent = !lite && i === active;

            return (
              <motion.div
                key={step.number}
                className="h-full"
                initial={{ opacity: 0, x: lite ? 0 : i % 2 === 0 ? -34 : 34, y: lite ? 0 : 14 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: lite ? 0.25 : 0.6,
                  delay: lite ? 0 : i * 0.07,
                  ease: EASE,
                }}
              >
                <div className="group flex h-full items-start gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                  <div className="relative shrink-0">
                    {/* подложка и рамка — инлайном: цвет шага динамический,
                        а инлайновый box-shadow стекла всё равно перебил бы ring-* */}
                    <div
                      className={`relative grid h-14 w-14 place-items-center rounded-2xl transition-all duration-500 group-hover:-translate-y-1 ${
                        isCurrent ? "scale-105" : ""
                      }`}
                      style={{
                        ...panel(lite),
                        background: reached
                          ? `linear-gradient(160deg, ${meta.hex}2e, ${meta.hex}12)`
                          : "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                        boxShadow: isCurrent
                          ? `inset 0 0 0 1px ${meta.hex}80, 0 0 0 5px ${meta.hex}1a, 0 16px 36px -14px ${meta.hex}`
                          : reached
                            ? `inset 0 0 0 1px ${meta.hex}59`
                            : "inset 0 0 0 1px rgba(255,255,255,0.10)",
                      }}
                    >
                      <Icon
                        className={`h-5 w-5 transition-colors duration-500 ${
                          reached ? meta.tone : "text-white/35"
                        }`}
                        strokeWidth={2.4}
                      />
                    </div>
                    <span
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full text-[10px] font-black tabular-nums ring-2 ring-[#0b0e13] transition-colors duration-500"
                      style={{
                        background: reached ? meta.hex : "rgba(255,255,255,0.14)",
                        color: reached ? "#07121a" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <div className="relative min-w-0 lg:mt-4 lg:w-full">
                    {/* Цветное зарево под пройденным шагом. Крупных номеров
                        здесь нет намеренно: колонка ленты узкая, цифра лезла
                        бы под заголовок (на /v3/how-to-buy место есть — там
                        номера как фоновая графика и остались). */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-12 left-1/2 hidden h-28 w-40 -translate-x-1/2 transition-opacity duration-700 lg:block"
                      style={{
                        opacity: reached ? 1 : 0,
                        background: `radial-gradient(50% 50% at 50% 50%, ${meta.hex}26 0%, ${meta.hex}00 70%)`,
                      }}
                    />

                    <h3 className="relative text-[15px] font-extrabold leading-tight">
                      {step.title}
                    </h3>
                    <span
                      className="relative mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-500"
                      style={
                        reached
                          ? {
                              color: meta.hex,
                              background: `${meta.hex}14`,
                              boxShadow: `inset 0 0 0 1px ${meta.hex}3d`,
                            }
                          : {
                              color: "rgba(255,255,255,0.5)",
                              background: "rgba(255,255,255,0.06)",
                              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
                            }
                      }
                    >
                      {meta.duration}
                    </span>
                    <p className="relative mt-2 max-w-[38ch] text-[12px] leading-snug text-white/50 lg:mx-auto lg:max-w-[22ch]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
