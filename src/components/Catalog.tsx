"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Ruler, ArrowRight, SlidersHorizontal } from "lucide-react";
import { villages } from "@/lib/data";

const directions = ["Все", "Каширское шоссе", "Симферопольское шоссе", "Дмитровское шоссе", "Новорижское шоссе"];

export default function Catalog() {
  const [activeDirection, setActiveDirection] = useState("Все");

  const filtered = activeDirection === "Все"
    ? villages
    : villages.filter((v) => v.direction === activeDirection);

  return (
    <section id="catalog" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Наши посёлки
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Выберите идеальный посёлок по направлению, расстоянию и бюджету.
            Все участки — категория ИЖС.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {directions.map((dir) => (
            <button
              key={dir}
              onClick={() => setActiveDirection(dir)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeDirection === dir
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200"
              }`}
            >
              {dir}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((village) => (
            <a
              key={village.id}
              href={`/village/${village.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group block"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={village.photos[0]}
                  alt={village.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                {village.readiness === 100 && (
                  <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Готовый
                  </span>
                )}
                {village.readiness < 100 && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Готовность {village.readiness}%
                  </span>
                )}
                <span className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                  {village.plotsAvailable} уч. свободно
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                  {village.name}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {village.direction}, {village.distance} км от МКАД
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {village.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {village.features.slice(0, 4).map((f) => (
                    <span
                      key={f}
                      className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Area */}
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <Ruler className="w-3.5 h-3.5" />
                  от {village.areaFrom} до {village.areaTo} соток
                </div>

                {/* Price and CTA */}
                <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">от</div>
                    <div className="text-xl font-bold text-green-600">
                      {village.priceFrom.toLocaleString("ru-RU")} &#8381;
                    </div>
                    <div className="text-xs text-gray-500">за сотку</div>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-green-700 transition-colors">
                    Подробнее
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-green-600 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">
            Не нашли подходящий посёлок?
          </h3>
          <p className="text-green-100 mb-6 max-w-lg mx-auto">
            У нас более 30 посёлков в разных направлениях. Оставьте заявку,
            и мы подберём участок под ваши требования.
          </p>
          <a
            href="#contacts"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Получить подборку участков
          </a>
        </div>
      </div>
    </section>
  );
}
