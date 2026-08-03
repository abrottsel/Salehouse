"use client";

import { Quote, Star } from "lucide-react";
import { reviews } from "@/lib/data";
import { SectionTitle } from "../ui/primitives";
import { Reveal, StaggerItem, StaggerList } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { panel, plural } from "./common";

/**
 * Отзывы. Тексты, имена, посёлки и оценки — из reviews в data.ts,
 * заголовок и сводный рейтинг — по боевому src/components/Reviews.tsx.
 */

const AVATAR_TINTS = [
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-violet-400 to-purple-600",
];

function initials(name: string): string {
  return name
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ReviewsSection() {
  const lite = useTier() === "lite";
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section id="reviews" className="mx-auto mt-20 max-w-[1400px] scroll-mt-24 px-4 sm:mt-28 sm:px-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Отзывы клиентов"
            title="Нас выбирают и"
            accent="рекомендуют"
            className="max-w-[40ch]"
          />
          <div
            className="mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 sm:mb-12"
            style={panel(lite)}
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-white/10 text-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-[15px] font-extrabold tabular-nums">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-[12px] font-semibold text-white/45">
              из 5 · {reviews.length}&nbsp;
              {plural(reviews.length, "отзыв", "отзыва", "отзывов")}
            </span>
          </div>
        </div>
      </Reveal>

      <StaggerList className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review, i) => (
          <StaggerItem key={review.id} className="h-full">
            <figure
              className="relative flex h-full flex-col rounded-[24px] p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6"
              style={panel(lite)}
            >
              <Quote
                className="absolute right-4 top-4 h-6 w-6 text-emerald-400/20"
                strokeWidth={2.4}
              />

              <figcaption className="mb-4 flex items-center gap-3">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[13px] font-black text-white ${
                    AVATAR_TINTS[i % AVATAR_TINTS.length]
                  }`}
                >
                  {initials(review.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold">{review.name}</div>
                  <div className="flex items-center gap-1.5 text-[12px] text-white/45">
                    <span className="truncate">Посёлок {review.village}</span>
                    <span className="text-white/20">·</span>
                    <span className="flex shrink-0 gap-0.5">
                      {Array.from({ length: review.rating }).map((_, s) => (
                        <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  </div>
                </div>
              </figcaption>

              <blockquote className="text-[13px] leading-relaxed text-white/60 sm:text-[14px]">
                {review.text}
              </blockquote>
            </figure>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}
