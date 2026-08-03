"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Reveal } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { panel, plural } from "./common";
import {
  AVG_RATING_LABEL,
  AVG_RATING_STARS,
  REVIEWS_COUNT,
} from "../reviews-summary";

/**
 * Строка доверия вместо блока отзывов на главной.
 *
 * Сами карточки уехали в раздел /v3/reviews (заказчик: «отзывы прячем
 * вверху сайта в разделе отзывы»), здесь остаётся только рейтинг,
 * количество и ссылка. Одна строка на десктопе, столбик на телефоне —
 * ссылка на всю ширину, чтобы попадать пальцем.
 */
export default function ReviewsTeaser() {
  const lite = useTier() === "lite";

  return (
    <section className="mx-auto mt-16 max-w-[1400px] px-4 sm:mt-24 sm:px-6">
      <Reveal>
        <Link
          href="/v3/reviews"
          className="group flex flex-col gap-4 rounded-[24px] p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
          style={panel(lite)}
        >
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-[18px] w-[18px] ${
                    i < AVG_RATING_STARS
                      ? "fill-amber-400 text-amber-400"
                      : "fill-white/10 text-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-[22px] font-extrabold leading-none tabular-nums">
              {AVG_RATING_LABEL}
            </span>
            <span className="text-[12px] font-semibold text-white/45">
              из 5 · {REVIEWS_COUNT}&nbsp;
              {plural(REVIEWS_COUNT, "отзыв", "отзыва", "отзывов")}
            </span>
          </div>

          <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-white/55 sm:text-[15px]">
            Семьи, которые уже построились в наших посёлках, рассказали, как
            прошли сделка, стройка и переезд.
          </p>

          <span className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white/[0.07] px-5 text-[14px] font-bold text-white ring-1 ring-white/15 transition-colors group-hover:bg-white/[0.13]">
            Читать отзывы
            <ArrowRight className="h-4 w-4 text-emerald-300 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
