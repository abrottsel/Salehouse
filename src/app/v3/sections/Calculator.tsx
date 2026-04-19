"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator as CalcIcon, Sparkles } from "lucide-react";

/**
 * /v3 — Calculator section.
 * Warm Premium aesthetic: cream/emerald gradient band, large rounded card,
 * inline mortgage math (annuity), bank-rate toggles, primary CTA.
 */

const BANKS = [
  { name: "Сбер", rate: 6.5, color: "#1A9F29" },
  { name: "ВТБ", rate: 6.7, color: "#002D5F" },
  { name: "Альфа", rate: 6.9, color: "#EF3124" },
] as const;

const fmtRub = (n: number) =>
  Math.round(n).toLocaleString("ru-RU") + "\u00A0₽";

export default function Calculator() {
  const [cost, setCost] = useState(2_500_000);
  const [downPct, setDownPct] = useState(20);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState<number>(BANKS[0].rate);

  const monthly = useMemo(() => {
    const loan = cost * (1 - downPct / 100);
    const m = rate / 100 / 12;
    const n = years * 12;
    if (m === 0) return loan / n;
    return (loan * (m * Math.pow(1 + m, n))) / (Math.pow(1 + m, n) - 1);
  }, [cost, downPct, years, rate]);

  return (
    <section
      id="v3-calculator"
      className="relative py-16 lg:py-24 scroll-mt-16"
      style={{
        background:
          "linear-gradient(180deg,#fffaf3 0%,#f0fdf4 45%,#ecfdf5 100%)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-4">
            <CalcIcon className="w-3.5 h-3.5" />
            Калькулятор ипотеки
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            Рассчитайте платёж прямо сейчас
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Ипотека от 6.5% · 6 банков · расчёт за 30 секунд
          </p>
        </div>

        <div className="rounded-3xl bg-white shadow-[0_10px_40px_-15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-100/70 overflow-hidden">
          <div className="grid lg:grid-cols-[1.2fr_1fr]">
            {/* Inputs */}
            <div className="p-6 sm:p-10 space-y-7">
              <Field
                label="Стоимость участка"
                value={fmtRub(cost)}
                min={500_000}
                max={20_000_000}
                step={50_000}
                v={cost}
                set={setCost}
                minLabel="500 тыс ₽"
                maxLabel="20 млн ₽"
              />
              <Field
                label="Первоначальный взнос"
                value={`${downPct}% · ${fmtRub((cost * downPct) / 100)}`}
                min={10}
                max={90}
                step={5}
                v={downPct}
                set={setDownPct}
                minLabel="10%"
                maxLabel="90%"
              />
              <Field
                label="Срок кредита"
                value={`${years} ${years === 1 ? "год" : years < 5 ? "года" : "лет"}`}
                min={1}
                max={30}
                step={1}
                v={years}
                set={setYears}
                minLabel="1 год"
                maxLabel="30 лет"
              />

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Банк-партнёр
                </div>
                <div className="flex flex-wrap gap-2">
                  {BANKS.map((b) => {
                    const active = rate === b.rate;
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => setRate(b.rate)}
                        className={`inline-flex items-center gap-2 px-4 h-11 rounded-full text-sm font-bold transition-all ${
                          active
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 ring-1 ring-gray-200"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: active ? "#fff" : b.color,
                          }}
                        />
                        {b.name} {b.rate}%
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Result panel */}
            <div className="p-6 sm:p-10 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-amber-50/40 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-emerald-100/70">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-700/70 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    Ежемесячно
                  </span>
                </div>
                <div className="text-5xl sm:text-6xl font-black text-emerald-600 tracking-tight leading-none tabular-nums mb-2">
                  {fmtRub(monthly)}
                </div>
                <p className="text-sm text-emerald-900/60">
                  ставка {rate}% на {years}&nbsp;лет
                </p>

                <dl className="mt-8 space-y-3 text-sm">
                  <Row k="Сумма кредита" v={fmtRub(cost * (1 - downPct / 100))} />
                  <Row k="Первый взнос" v={fmtRub((cost * downPct) / 100)} />
                  <Row k="Стоимость участка" v={fmtRub(cost)} />
                </dl>
              </div>

              <a
                href="#v3-final-cta"
                className="mt-8 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 h-14 rounded-full font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 transition-all"
              >
                Получить точный расчёт от менеджера
                <ArrowRight className="w-5 h-5" />
              </a>
              <p className="mt-3 text-[10px] text-center text-emerald-900/40 uppercase tracking-widest">
                Предварительный расчёт · не оферта
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-emerald-200/40 pb-2">
      <dt className="text-emerald-900/55">{k}</dt>
      <dd className="font-bold text-gray-900 tabular-nums">{v}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  v,
  set,
  minLabel,
  maxLabel,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  v: number;
  set: (n: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-base font-black text-gray-900 tabular-nums">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => set(Number(e.target.value))}
        className="w-full h-2 bg-emerald-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-emerald-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 font-medium">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
