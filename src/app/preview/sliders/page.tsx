"use client";

import { useState } from "react";
import SliderA from "@/components/sliders/SliderA";
import SliderB from "@/components/sliders/SliderB";
import SliderC from "@/components/sliders/SliderC";
import SliderD from "@/components/sliders/SliderD";

export default function SlidersPreview() {
  const [a, setA] = useState<[number, number]>([5, 20]);
  const [b, setB] = useState<[number, number]>([5, 20]);
  const [c, setC] = useState<[number, number]>([5, 20]);
  const [d, setD] = useState<[number, number]>([5, 20]);

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Варианты слайдеров — выберите
          </h1>
          <p className="text-sm text-gray-500">
            4 варианта двойного ползунка. Подвигайте оба конца, посмотрите как
            смотрится в каждом положении. Напишите «A», «B», «C» или «D» — я
            поставлю выбранный в основной каталог.
          </p>
        </header>

        {/* Variant A */}
        <section className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                A — Классический
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Зелёная заливка + тёмно-зелёный бордер + drop shadow. 24px.
              </p>
            </div>
            <div className="font-mono text-sm text-gray-700 tabular-nums">
              от {a[0]} до {a[1]}
            </div>
          </div>
          <SliderA min={3} max={30} step={1} value={a} onChange={setA} />
        </section>

        {/* Variant B */}
        <section className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">B — Material</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Солидный зелёный + тонкое halo-кольцо. 28px. Мягкий вариант.
              </p>
            </div>
            <div className="font-mono text-sm text-gray-700 tabular-nums">
              от {b[0]} до {b[1]}
            </div>
          </div>
          <SliderB min={3} max={30} step={1} value={b} onChange={setB} />
        </section>

        {/* Variant C */}
        <section className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                C — Shadcn-style
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Белая заливка + толстая зелёная обводка. 20px. Минималистично.
              </p>
            </div>
            <div className="font-mono text-sm text-gray-700 tabular-nums">
              от {c[0]} до {c[1]}
            </div>
          </div>
          <SliderC min={3} max={30} step={1} value={c} onChange={setC} />
        </section>

        {/* Variant D */}
        <section className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">D — Premium</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Большой градиентный диск с белой точкой в центре. 32px. Трендовый.
              </p>
            </div>
            <div className="font-mono text-sm text-gray-700 tabular-nums">
              от {d[0]} до {d[1]}
            </div>
          </div>
          <SliderD min={3} max={30} step={1} value={d} onChange={setD} />
        </section>

        <div className="text-center text-xs text-gray-400 pt-4">
          Все варианты — кастомные видимые thumbs + скрытые native inputs.
          Пиксель-в-пиксель точное позиционирование от 0% до 100%.
        </div>
      </div>
    </main>
  );
}
