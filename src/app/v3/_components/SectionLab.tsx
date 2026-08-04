"use client";

import { useState, type ComponentType } from "react";
import AdvantagesSection from "./home/AdvantagesSection";
import StepsSection from "./home/StepsSection";
import Breath from "./ui/section-backdrops/Breath";
import Cadastre from "./ui/section-backdrops/Cadastre";
import Topo from "./ui/section-backdrops/Topo";
import CursorGlow from "./ui/section-backdrops/CursorGlow";
import ScrollTint from "./ui/section-backdrops/ScrollTint";
import Pollen from "./ui/section-backdrops/Pollen";
import EdgeBeam from "./ui/section-backdrops/EdgeBeam";
import { glassStyle } from "./ui/primitives";

/**
 * Лаборатория фоновых анимаций для секций.
 *
 * Заказчик спросил, можно ли под контентом звёзды, как в героe. Под
 * текстом мигающие точки мешают читать, поэтому здесь семь других приёмов
 * плюс нынешний пустой фон для сравнения. Переключаются на месте, поверх
 * каждого — настоящие секции главной, чтобы сразу было видно, читается
 * ли по фону текст и не спорит ли он с карточками.
 *
 * Обе темы: фон набран переменными --v3-sec-* (см. v3.css), днём они
 * заметно жиже. Переключатель темы — солнышком в шапке.
 */

const VARIANTS: Array<{
  key: string;
  title: string;
  note: string;
  Backdrop: ComponentType | null;
}> = [
  { key: "none", title: "0 · Без фона", note: "как сейчас на сайте", Backdrop: null },
  { key: "breath", title: "A · Дыхание", note: "свечение медленно пульсирует", Backdrop: Breath },
  { key: "cadastre", title: "B · Кадастр", note: "сетка участков, загорается ячейка", Backdrop: Cadastre },
  { key: "topo", title: "C · Топография", note: "изолинии рельефа, тихий дрейф", Backdrop: Topo },
  { key: "cursor", title: "D · Курсор", note: "свет за курсором, на телефоне сам", Backdrop: CursorGlow },
  { key: "scroll", title: "E · Скролл", note: "волна идёт по мере прокрутки", Backdrop: ScrollTint },
  { key: "pollen", title: "F · Пыльца", note: "светлячки поднимаются вверх", Backdrop: Pollen },
  { key: "edge", title: "G · Кромка", note: "блик по границам, под текстом пусто", Backdrop: EdgeBeam },
];

export default function SectionLab() {
  const [active, setActive] = useState(0);
  const { Backdrop } = VARIANTS[active];

  return (
    <main className="pb-4">
      <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Фоны секций — выбор</h1>
        <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-white/55">
          Ниже две настоящие секции главной. Фон переключается кнопками внизу,
          тема — солнышком в шапке. На слабых устройствах и при системной
          настройке «меньше движения» каждый вариант сам падает на статичный вид.
        </p>
      </div>

      {/* isolate — чтобы фон гарантированно остался под контентом секций */}
      <div className="relative isolate overflow-hidden">
        {Backdrop && <Backdrop />}
        <div className="relative">
          <AdvantagesSection />
          <StepsSection />
        </div>
      </div>

      {/* Переключатель липкий снизу — на телефоне под большим пальцем.
          z выше баннера cookie (у него z-[100]): иначе на телефоне баннер
          закрывает ровно те кнопки, ради которых страница и заведена. */}
      <div className="sticky bottom-3 z-[110] mx-auto mt-10 w-[calc(100%-1.5rem)] max-w-[1100px]">
        <div className="rounded-[24px] p-2" style={glassStyle}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {VARIANTS.map((v, i) => {
              const on = i === active;
              return (
                <button
                  key={v.key}
                  onClick={() => setActive(i)}
                  className={`min-h-[56px] rounded-2xl px-3 py-2 text-left transition-all ${
                    on
                      ? "bg-emerald-500 text-white"
                      : "bg-white/[0.05] text-white/75 ring-1 ring-white/10 hover:bg-white/[0.1]"
                  }`}
                >
                  <div className="text-[13px] font-bold leading-tight">{v.title}</div>
                  <div
                    className={`mt-0.5 text-[11px] leading-tight ${
                      on ? "text-white/80" : "text-white/40"
                    }`}
                  >
                    {v.note}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
