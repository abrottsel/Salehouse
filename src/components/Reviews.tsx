import { Star, Quote, Sparkles } from "lucide-react";
import { reviews } from "@/lib/data";

/**
 * Reviews — компактные карточки с aggregate rating на hero-строке.
 * Изюминка: большой aggregate 4.9★ + количество отзывов сверху.
 */

function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
}

// Deterministic pastel color per name — so avatars look diverse but stable
const AVATAR_COLORS = [
  "bg-gradient-to-br from-emerald-400 to-green-600",
  "bg-gradient-to-br from-sky-400 to-blue-600",
  "bg-gradient-to-br from-amber-400 to-orange-600",
  "bg-gradient-to-br from-rose-400 to-pink-600",
  "bg-gradient-to-br from-violet-400 to-purple-600",
  "bg-gradient-to-br from-teal-400 to-cyan-600",
];

function hashIdx(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

export default function Reviews() {
  const avgRating =
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section
      id="reviews"
      className="py-6 lg:py-10 bg-white scroll-mt-16 relative overflow-hidden"
    >
      {/* Soft bg accent */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with aggregate rating — the hook */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Отзывы клиентов
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-3 leading-tight">
            Нас выбирают и{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              рекомендуют
            </span>
          </h2>

          {/* Aggregate rating pill */}
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 ring-1 ring-amber-200 px-4 py-2 rounded-full shadow-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-amber-100 text-amber-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-base font-black text-gray-900 tabular-nums">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              из 5 · {reviews.length}&nbsp;отзывов
            </span>
          </div>
        </div>

        {/* Review cards — compact 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {reviews.map((review) => {
            const colorIdx = hashIdx(review.name, AVATAR_COLORS.length);
            return (
              <div
                key={review.id}
                className="group relative bg-white rounded-2xl p-5 ring-1 ring-gray-200 hover:ring-emerald-300 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {/* Big quote mark in corner */}
                <Quote
                  className="absolute top-3 right-3 w-6 h-6 text-emerald-100 group-hover:text-emerald-200 transition-colors"
                  strokeWidth={2.5}
                />

                {/* Author row */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`shrink-0 w-11 h-11 rounded-full ${AVATAR_COLORS[colorIdx]} flex items-center justify-center text-white font-black text-sm shadow-md shadow-black/10`}
                  >
                    {initials(review.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900 text-sm truncate">
                      {review.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="truncate">Посёлок {review.village}</span>
                      <span className="text-gray-300">·</span>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote text */}
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-5">
                  {review.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust stats — compact 2x2 on mobile, 4 in row on desktop */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[
            { value: "30+", label: "посёлков" },
            { value: "100%", label: "юр. чистота" },
            { value: "0 ₽", label: "скрытых платежей" },
            { value: "24/7", label: "охрана" },
          ].map((stat, i) => (
            <div
              key={i}
              className="px-4 py-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl ring-1 ring-emerald-200/70 text-center"
            >
              <div className="text-2xl font-black text-emerald-700 leading-none tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/70 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
