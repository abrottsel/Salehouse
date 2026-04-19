import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Route, Hammer } from "lucide-react";
import { villages } from "@/lib/data";

/**
 * VillagesShowcase — flagship product grid for the v3 landing.
 * Native horizontal scroll-snap (no swiper dep). Premium photo cards.
 */

function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU");
}

export default function VillagesShowcase() {
  const items = villages.slice(0, 8);

  return (
    <section className="relative bg-gradient-to-b from-white dark:from-stone-900 via-stone-50 dark:via-stone-950 to-white dark:to-stone-900 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            Посёлки, в которых
            <br />
            <span className="text-emerald-600">хочется жить</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
            31 готовый посёлок от 180&nbsp;000&nbsp;₽/сотка. Выберите направление,
            готовность и цену.
          </p>
        </div>
      </div>

      {/* Horizontal scroll-snap rail (full-bleed for premium feel) */}
      <div className="mt-12 lg:mt-16">
        <div
          className="flex gap-5 lg:gap-7 overflow-x-auto pb-8 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollPaddingLeft: "1.5rem" }}
        >
          {/* Spacer to align first card with content */}
          <div className="shrink-0 w-0 lg:w-[calc((100vw-80rem)/2)]" aria-hidden />

          {items.map((v) => {
            const cover = v.photos[0] ?? "/villages/placeholder.jpg";
            return (
              <Link
                key={v.slug}
                href={`/village/${v.slug}`}
                className="group relative shrink-0 snap-start w-[78vw] sm:w-[58vw] md:w-[42vw] lg:w-[340px] xl:w-[380px] aspect-[4/5] rounded-3xl overflow-hidden bg-stone-200 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ease-out ring-1 ring-stone-200 dark:ring-stone-800"
              >
                {/* Cover photo */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={cover}
                    alt={v.name}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 380px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>

                {/* Bottom dark gradient */}
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

                {/* Top-right "Осталось N" pill */}
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-stone-800/95 backdrop-blur shadow-sm">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                    Осталось {v.plotsAvailable}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight drop-shadow-sm">
                    {v.name}
                  </h3>
                  <div className="mt-2 text-base sm:text-lg font-semibold text-white/95">
                    от{" "}
                    <span className="text-emerald-300 font-black tabular-nums">
                      {formatPrice(v.priceFrom)} ₽
                    </span>{" "}
                    <span className="text-white/80 text-sm">/&nbsp;сот</span>
                  </div>

                  {/* Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold ring-1 ring-white/20">
                      <MapPin className="w-3 h-3" />
                      {v.direction}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold ring-1 ring-white/20 tabular-nums">
                      <Route className="w-3 h-3" />
                      {v.distance} км
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-[11px] font-bold tabular-nums">
                      <Hammer className="w-3 h-3" />
                      {v.readiness}%
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* End spacer */}
          <div className="shrink-0 w-4 lg:w-8" aria-hidden />
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16 text-center">
        <Link
          href="/villages"
          className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-emerald-600 text-white text-base sm:text-lg font-bold shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.02] transition-all duration-300"
        >
          Смотреть все 31 посёлок
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
