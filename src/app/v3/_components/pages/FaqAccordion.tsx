"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { glassStyle } from "../ui/primitives";
import { useTier } from "../../_lib/perf";
import { faqItems } from "./faq-data";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Аккордеон вопросов.
 *
 * Раскрытие независимое (не «один открыт — остальные схлопнулись»): на
 * проде все ответы видны сразу, потому что скрытый ответ = неснятое
 * возражение. Первый пункт открыт по умолчанию, чтобы блок не выглядел
 * мёртвым списком заголовков.
 *
 * Тексты не дублируются: и разметка FAQPage на странице, и этот список
 * читают один массив из faq-data.
 */
export default function FaqAccordion() {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  const tier = useTier();
  const lite = tier === "lite";

  return (
    <div className="space-y-3">
      {faqItems.map((item, i) => {
        const isOpen = Boolean(open[i]);
        return (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: lite ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: lite ? 0.2 : 0.5,
              delay: lite ? 0 : Math.min(i, 5) * 0.05,
              ease: EASE,
            }}
            className={`overflow-hidden rounded-[22px] transition-shadow ${
              isOpen ? "ring-1 ring-emerald-400/25" : "ring-1 ring-white/[0.06]"
            }`}
            style={glassStyle}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                className="flex w-full items-start gap-3 px-4 py-4 text-left sm:gap-4 sm:px-6 sm:py-5"
              >
                <span
                  className={`mt-[3px] grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black tabular-nums transition-colors sm:h-7 sm:w-7 sm:text-[12px] ${
                    isOpen
                      ? "bg-emerald-500 text-white"
                      : "bg-white/[0.07] text-white/50 ring-1 ring-white/10"
                  }`}
                >
                  {i + 1}
                </span>

                <span className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-white sm:text-[17px]">
                  {item.q}
                </span>

                <span
                  className={`mt-[2px] grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 transition-transform duration-300 sm:h-8 sm:w-8 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <Plus
                    className={`h-4 w-4 transition-colors ${
                      isOpen ? "text-emerald-300" : "text-white/60"
                    }`}
                  />
                </span>
              </button>
            </h3>

            {/* Свёрнутый ответ остаётся в DOM (height: 0), а не удаляется:
                на проде все восемь ответов есть в разметке, и терять этот
                текст при замене прода нельзя — он индексируется. */}
            {/* Раскрытие — на CSS (grid-template-rows 0fr → 1fr), а не на
                JS-анимации: высота считается браузером сама, кадры для этого
                не нужны, и в фоновой вкладке ответ не остаётся схлопнутым.
                На Safari 15 переход просто мгновенный — открывается всё равно. */}
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              className="grid transition-all ease-out motion-reduce:transition-none"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
                transitionDuration: lite ? "180ms" : "340ms",
              }}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-5 pl-[52px] text-[14px] leading-relaxed text-white/60 sm:px-6 sm:pb-6 sm:pl-[70px] sm:text-[15px]">
                  {item.a}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
