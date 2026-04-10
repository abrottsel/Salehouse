import { Star, Quote } from "lucide-react";
import { reviews } from "@/lib/data";

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Отзывы наших клиентов
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Довольные клиенты — лучшая рекомендация. Вот что говорят владельцы участков.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-green-200 mb-4" />

              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                {review.text}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {review.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Посёлок {review.village}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats — v3 Stitch-inspired: white cards with rounded-3xl and uppercase captions */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: "30+", label: "посёлков в каталоге" },
            { value: "100%", label: "юридическая чистота" },
            { value: "0 \u20BD", label: "скрытых платежей" },
            { value: "24/7", label: "охрана посёлков" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 lg:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all"
            >
              <div className="text-4xl lg:text-5xl font-black text-green-600 mb-2 leading-none tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
