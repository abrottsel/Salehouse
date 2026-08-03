import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone, Star } from "lucide-react";
import { LEGAL } from "@/lib/legal";
import PageHero from "../_components/pages/PageHero";
import ReviewsGrid from "../_components/pages/ReviewsGrid";
import {
  AVG_RATING_LABEL,
  AVG_RATING_STARS,
  REVIEWS_COUNT,
} from "../_components/reviews-summary";
import { plural } from "../_components/home/common";
import { Glass } from "../_components/ui/primitives";
import { Reveal } from "../_components/ui/motion";

export const metadata: Metadata = {
  title: "Отзывы",
  description: `Отзывы покупателей участков в коттеджных посёлках ЗемПлюс: средняя оценка ${AVG_RATING_LABEL} из 5 по ${REVIEWS_COUNT} отзывам о сделке, коммуникациях и жизни в посёлке.`,
};

/**
 * /v3/reviews — отдельный раздел отзывов.
 *
 * С главной блок убран: заказчик просил вынести отзывы в свой раздел,
 * а на главной оставить только строку доверия со ссылкой сюда.
 */
export default function V3ReviewsPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-2 sm:px-6 sm:pt-4">
      <PageHero
        eyebrow="Отзывы клиентов"
        title="Нас выбирают и"
        accent="рекомендуют"
        sub="Пишут те, кто уже купил участок и построился: как прошла сделка, что с коммуникациями и дорогами, каково жить в посёлке круглый год."
      >
        <div className="mt-6 inline-flex flex-wrap items-center gap-2.5 rounded-full bg-white/[0.06] px-4 py-2.5 ring-1 ring-white/10">
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < AVG_RATING_STARS
                    ? "fill-amber-400 text-amber-400"
                    : "fill-white/10 text-white/20"
                }`}
              />
            ))}
          </span>
          <span className="text-[15px] font-extrabold tabular-nums">
            {AVG_RATING_LABEL}
          </span>
          <span className="text-[12px] font-semibold text-white/45">
            из 5 · {REVIEWS_COUNT}&nbsp;
            {plural(REVIEWS_COUNT, "отзыв", "отзыва", "отзывов")}
          </span>
        </div>
      </PageHero>

      <div className="mt-9 sm:mt-14">
        <ReviewsGrid />
      </div>

      <Reveal className="mt-8 sm:mt-12">
        <Glass className="p-6 ring-1 ring-white/[0.07] sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-[22px] font-extrabold leading-tight sm:text-[28px]">
                Хотите так же?
              </h2>
              <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-white/55">
                Съездим на участок вместе — покажем границы, коммуникации и
                соседей. Бесплатно и без обязательств.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href={`tel:${LEGAL.phoneRaw}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-[14px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]"
              >
                <Phone className="h-4 w-4" />
                {LEGAL.phone}
              </a>
              <Link
                href="/v3/catalog"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/[0.07] px-6 text-[14px] font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.13]"
              >
                <MessageCircle className="h-4 w-4 text-emerald-300" />
                Выбрать посёлок
              </Link>
            </div>
          </div>
        </Glass>
      </Reveal>
    </main>
  );
}
