"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { steps } from "@/lib/data";
import { glassStyle } from "../ui/primitives";
import { useTier } from "../../_lib/perf";
import { metaFor } from "../steps-meta";

/**
 * Вертикальный таймлайн покупки — «оживающий» по мере скролла.
 *
 * Тексты шагов — из `steps` (@/lib/data), иконки и длительности — из
 * ../steps-meta (перенос из боевого Steps.tsx), ничего не переписано.
 * Меняется только подача:
 *   • линия слева заполняется вместе со скроллом (useScroll → scaleY),
 *     по ней едет светящаяся «капля»;
 *   • пройденные шаги загораются своим цветом, текущий — со свечением;
 *   • карточки выезжают поочерёдно с разных сторон;
 *   • крупный номер шага — фоновой графикой внутри карточки.
 *
 * На "lite" (см. _lib/perf): без свечений и параллакса, линия сразу залита,
 * появление — короткий fade. Клиентский компонент: без скролл-прогресса
 * эффекта не будет, но JS тут минимальный — ни картинок, ни данных.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function BuyTimeline() {
  const lite = useTier() === "lite";
  const listRef = useRef<HTMLOListElement>(null);

  // Прогресс считаем от момента, когда верх списка поднялся до середины
  // экрана, до момента, когда его низ дошёл до нижней четверти: так на
  // первом экране горит только первый шаг, а последний зажигается ровно
  // тогда, когда список дочитан.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.6", "end 0.75"],
  });

  const dotTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Индекс шага, до которого доскроллили. -1 — ещё ни одного.
  const [active, setActive] = useState(-1);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(steps.length - 1, Math.floor(p * steps.length));
    setActive((prev) => (prev === next ? prev : next));
  });

  return (
    // overflow-x-clip: карточки выезжают на ±40px по горизонтали, без
    // подрезки на мобиле появлялась бы горизонтальная прокрутка.
    // Именно clip, а не hidden — вертикальный overflow остаётся видимым.
    <ol ref={listRef} className="relative overflow-x-clip">
      {/* Рельса: тусклый жёлоб + заполняемая полоса поверх */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-6 top-8 w-px -translate-x-1/2 bg-white/[0.07] sm:left-7"
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-6 top-8 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300 via-emerald-400 to-lime-300 sm:left-7"
        style={{
          originY: 0,
          scaleY: lite ? 1 : scrollYProgress,
          opacity: lite ? 0.5 : 1,
          boxShadow: lite ? undefined : "0 0 12px rgba(52,211,153,0.55)",
        }}
      />
      {!lite && (
        // Обёртка нужна, чтобы проценты в `top` считались от длины рельсы,
        // а не от всего списка — иначе капля уезжает ниже конца линии.
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-6 top-8 z-10 w-0 sm:left-7"
        >
          <motion.span
            className="absolute left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-200"
            style={{
              top: dotTop,
              boxShadow: "0 0 0 6px rgba(163,230,53,0.14), 0 0 22px 4px rgba(163,230,53,0.6)",
            }}
          />
        </span>
      )}

      {steps.map((step, i) => {
        const meta = metaFor(i);
        const Icon = meta.Icon;
        const reached = lite || i <= active;
        const isCurrent = !lite && i === active;

        return (
          <li key={step.number} className="relative">
            <motion.div
              className="flex gap-3 pb-3 sm:gap-5 sm:pb-4"
              initial={{ opacity: 0, x: lite ? 0 : i % 2 === 0 ? -40 : 40, y: lite ? 0 : 14 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: lite ? 0.25 : 0.65, ease: EASE }}
            >
              {/* Плитка с иконкой сидит на линии */}
              <div className="relative shrink-0">
                {/* без backdrop-filter: внутри анимируемого по opacity
                    родителя Chromium иногда рисует его подложку не по
                    радиусу — плитка на миг становится квадратом */}
                {/* подложка и рамка — инлайном: цвет шага динамический,
                    а инлайновый box-shadow всё равно перебил бы ring-* */}
                <div
                  className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-all duration-500 sm:h-14 sm:w-14 ${
                    isCurrent ? "scale-105" : ""
                  }`}
                  style={{
                    // Непройденный шаг — переменными: белила в 4% днём
                    // растворялись на белом полотне (см. --v3-idle-* в v3.css).
                    background: reached ? `${meta.hex}1f` : "var(--v3-idle-bg, rgba(255,255,255,0.04))",
                    boxShadow: isCurrent
                      ? `inset 0 0 0 1px ${meta.hex}80, 0 0 0 5px ${meta.hex}1a, 0 14px 34px -14px ${meta.hex}`
                      : reached
                        ? `inset 0 0 0 1px ${meta.hex}59`
                        : "inset 0 0 0 1px var(--v3-idle-ring, rgba(255,255,255,0.10))",
                  }}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors duration-500 sm:h-6 sm:w-6 ${
                      reached ? meta.tone : "text-white/35"
                    }`}
                    strokeWidth={2.2}
                  />
                </div>
                <span
                  // Кружок вырезает плитку из линии таймлайна, поэтому залит
                  // цветом полотна — var(--v3-page), а не литеральным ночным.
                  style={{ background: "var(--v3-page, #0b0e13)" }}
                  className={`absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full text-[10px] font-black tabular-nums ring-1 transition-colors duration-500 ${
                    reached ? `${meta.tone} ring-current` : "text-white/40 ring-white/15"
                  }`}
                >
                  {step.number}
                </span>
              </div>

              <div
                className="relative min-w-0 flex-1 overflow-hidden rounded-[22px] px-4 py-4 ring-1 ring-white/[0.06] sm:px-6 sm:py-5"
                style={lite ? { ...glassStyle, backdropFilter: "none" } : glassStyle}
              >
                {/* Крупный номер шага фоновой графикой */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-7 select-none text-[104px] font-black leading-none tabular-nums text-transparent transition-opacity duration-500 sm:-top-9 sm:text-[132px]"
                  style={{
                    WebkitTextStroke: `1px ${meta.hex}`,
                    opacity: reached ? 0.16 : 0.07,
                  }}
                >
                  {step.number}
                </span>

                {/* Подсветка текущего шага. Отдельным слоем, чтобы не
                    пересчитывать box-shadow стекла. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[22px] transition-opacity duration-500"
                  style={{
                    opacity: isCurrent ? 1 : 0,
                    boxShadow: `inset 0 0 0 1px ${meta.hex}59, 0 22px 60px -30px ${meta.hex}`,
                  }}
                />

                <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="text-[16px] font-extrabold leading-tight sm:text-[20px]">
                    {step.title}
                  </h3>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ring-1 transition-colors duration-500"
                    style={
                      reached
                        ? {
                            color: meta.hex,
                            background: `${meta.hex}14`,
                            boxShadow: `inset 0 0 0 1px ${meta.hex}3d`,
                          }
                        : {
                            color: "var(--v3-idle-ink, rgba(255,255,255,0.6))",
                            background: "var(--v3-idle-bg, rgba(255,255,255,0.06))",
                            boxShadow:
                              "inset 0 0 0 1px var(--v3-idle-ring, rgba(255,255,255,0.10))",
                          }
                    }
                  >
                    {meta.duration}
                  </span>
                </div>
                <p className="relative mt-2 max-w-[60ch] text-[13.5px] leading-relaxed text-white/55 sm:text-[15px]">
                  {step.description}
                </p>
              </div>
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}
