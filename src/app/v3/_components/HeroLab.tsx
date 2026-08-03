"use client";

import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import AuroraPlus from "./ui/backdrops/AuroraPlus";
import CadastreGrid from "./ui/backdrops/CadastreGrid";
import Spotlight from "./ui/backdrops/Spotlight";
import LivePhoto from "./ui/backdrops/LivePhoto";
import { Accent, CTA, Eyebrow, glassStyle } from "./ui/primitives";

/**
 * Лаборатория фонов первого экрана.
 *
 * Заказчик: у звёзд нет вау-эффекта, их не видно без максимальной
 * яркости экрана. Здесь четыре варианта на выбор — переключаются на
 * месте, поверх каждого настоящий контент героя, чтобы было видно,
 * читается ли по нему текст.
 */

const VARIANTS = [
  {
    key: "aurora",
    title: "A · Аврора+",
    note: "звёзды крупнее и ярче, добавлены метеоры",
    Backdrop: AuroraPlus,
  },
  {
    key: "grid",
    title: "B · Кадастровая сетка",
    note: "сетка участков к горизонту, бежит подсветка",
    Backdrop: CadastreGrid,
  },
  {
    key: "spot",
    title: "C · Прожектор",
    note: "за курсором, на телефоне дрейфует сам",
    Backdrop: Spotlight,
  },
  {
    key: "photo",
    title: "D · Живое фото",
    note: "аэросъёмка с медленным наездом",
    Backdrop: LivePhoto,
  },
] as const;

export default function HeroLab() {
  const [active, setActive] = useState(0);
  const { Backdrop } = VARIANTS[active];

  return (
    <main>
      {/* Экран героя целиком, чтобы оценивать честно */}
      <section className="relative -mt-20 flex min-h-[100svh] items-center overflow-hidden">
        <Backdrop />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 pt-24 sm:px-6">
          <Eyebrow>Коттеджные посёлки Подмосковья</Eyebrow>
          <h1 className="mt-4 text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
            Ваш участок
            <br />
            для <Accent>жизни мечты</Accent>
          </h1>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-white/65 sm:text-[18px]">
            Готовые посёлки с газом, электричеством, асфальтом и охраной.
            Подбор участка за 15 минут.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CTA href="/v3/catalog">
              <MapPin className="h-4 w-4" />
              Выбрать участок
              <ArrowRight className="h-4 w-4" />
            </CTA>
            <CTA href="/v3" variant="ghost">
              Записаться на просмотр
            </CTA>
          </div>
        </div>
      </section>

      {/* Переключатель — липкий снизу, чтобы на телефоне был под большим пальцем */}
      <div className="sticky bottom-3 z-40 mx-auto w-[calc(100%-1.5rem)] max-w-[1000px]">
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

      <div className="mx-auto max-w-[1000px] px-4 pb-20 pt-10 sm:px-6">
        <p className="text-[13px] leading-relaxed text-white/45">
          Все четыре видны при обычной яркости экрана — прежние звёзды тонули
          потому, что были 1–2 пикселя при непрозрачности 8%. На слабых
          устройствах и при системной настройке «меньше движения» каждый
          вариант сам падает на статичный вид.
        </p>
      </div>
    </main>
  );
}
