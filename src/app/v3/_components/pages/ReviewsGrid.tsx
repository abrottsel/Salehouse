"use client";

import { Quote, Star } from "lucide-react";
import { reviews } from "@/lib/data";
import { StaggerItem, StaggerList } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { panel } from "../home/common";

/**
 * Карточки отзывов. Раньше жили секцией на главной, теперь — раздел
 * /v3/reviews: заказчик просил «прячем отзывы вверху сайта в разделе
 * отзывы», а на главной осталась только строка доверия со ссылкой сюда.
 *
 * Тексты, имена, посёлки и оценки берутся из reviews в data.ts как есть.
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

export default function ReviewsGrid() {
  const lite = useTier() === "lite";

  return (
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
  );
}
