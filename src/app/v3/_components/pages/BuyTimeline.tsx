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
    // isolate + явные слои: в WebKit анимируемая рельса (у неё transform)
    // поднималась в свой композиционный слой и рисовалась ПОВЕРХ плиток —
    // линия разрезала мини-блок пополам. В Chromium порядок был обратный,
    // поэтому баг ловился только на маке и айфоне.
    <ol ref={listRef} className="relative isolate overflow-x-clip">
      {/* Рельса: тусклый жёлоб + заполняемая полоса поверх */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-6 top-8 z-0 w-px -translate-x-1/2 bg-white/[0.07] sm:left-7"
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-6 top-8 z-0 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300 via-emerald-400 to-lime-300 sm:left-7"
        style={{
          originY: 0,
          scaleY: lite ? 1 : scrollYProgress,
          opacity: lite ? 0.5 : 1,
        }}
      />
      {!lite && (
        // Обёртка нужна, чтобы проценты в `top` считались от длины рельсы,
        // а не от всего списка — иначе капля уезжает ниже конца линии.
        // z-0, а не z-10: рельса идёт ровно по центру плиток, и капля
        // при прокрутке наезжала на иконку шага — на телефоне плитка
        // пропадала под ней целиком. Теперь капля проезжает позади.
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-6 top-8 z-0 w-0 sm:left-7"
        >
          <motion.span
            className="absolute left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-200"
            style={{
              top: dotTop,
              // Без внешнего гало: размытое пятно вокруг капли ползло
              // по плиткам шагов и читалось как грязный зацвет.
              boxShadow: "0 0 0 4px rgba(163,230,53,0.12)",
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
          <li key={step.number} className="relative z-10">
            <motion.div
              className="flex gap-3 pb-3 sm:gap-5 sm:pb-4"
              // Только вертикаль. Прежний въезд с боков (x: ±40) уводил
              // плитку шага за левый край экрана: на телефоне ряд начинается
              // в 16px от края, и на время анимации мини-блок оказывался
              // срезанным. amount 0.15 вместо 0.35 — чтобы шаг доезжал до
              // места раньше, чем читатель до него доскроллит.
              initial={{ opacity: 0, y: lite ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: lite ? 0.25 : 0.65, ease: EASE }}
            >
              {/* Плитка с иконкой сидит на линии */}
              <div className="relative z-10 shrink-0">
                {/* без backdrop-filter: внутри анимируемого по opacity
                    родителя Chromium иногда рисует его подложку не по
                    радиусу — плитка на миг становится квадратом */}
                {/* подложка и рамка — инлайном: цвет шага динамический,
                    а инлайновый box-shadow всё равно перебил бы ring-* */}
                <div
                  className={`relative z-10 grid h-12 w-12 place-items-center rounded-2xl transition-all duration-500 sm:h-14 sm:w-14 ${
                    isCurrent ? "scale-105" : ""
                  }`}
                  style={{
                    // Заливка непрозрачная: цвет шага лежит на полотне
                    // страницы. Полупрозрачная пропускала сквозь себя
                    // рельсу и каплю — иконка читалась через них.
                    // Непройденный шаг — переменными: белила в 4% днём
                    // растворялись на белом полотне (см. --v3-idle-* в v3.css).
                    background: reached
                      ? `linear-gradient(${meta.hex}1f, ${meta.hex}1f), var(--v3-page, #0b0e13)`
                      : // Непройденный шаг тоже на непрозрачной базе. Без неё
                        // сквозь плитку просвечивала рельса и разрезала её
                        // пополам — левая половина читалась как срезанная.
                        `var(--v3-idle-bg, linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))), var(--v3-page, #0b0e13)`,
                    // У текущего шага только рамка и мягкое кольцо. Прежняя
                    // размытая тень тем же цветом (0 14px 34px -14px) при
                    // прокрутке расползалась вокруг плитки грязным тёмным
                    // пятном — на тёмном полотне цветной блюр читается
                    // именно так, а не как свечение.
                    boxShadow: isCurrent
                      ? `inset 0 0 0 1px ${meta.hex}80`
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
                  // z-20: у плитки z-10, и без своего слоя кружок уходил
                  // под неё — оставалась одна дуга, номер пропадал.
                  className={`absolute -right-1 -top-1 z-20 grid h-5 w-5 place-items-center rounded-full text-[10px] font-black tabular-nums ring-1 transition-colors duration-500 ${
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
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none text-[64px] font-black leading-none tabular-nums text-transparent transition-opacity duration-500 sm:right-6 sm:text-[92px]"
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
                    boxShadow: `inset 0 0 0 1px ${meta.hex}59`,
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
