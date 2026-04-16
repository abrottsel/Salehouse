"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Landmark,
  TrendingDown,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const banks = [
  { name: "ВТБ", rate: "6.5%", dot: "#002D5F" },
  { name: "Сбер", rate: "7.0%", dot: "#1A9F29" },
  { name: "Альфа", rate: "6.9%", dot: "#EF3124" },
  { name: "ГПБ", rate: "6.8%", dot: "#0072C6" },
  { name: "РСХБ", rate: "6.7%", dot: "#009540" },
  { name: "Т-Банк", rate: "7.2%", dot: "#FFDD2D" },
];

export default function MortgageCalculator() {
  const [price, setPrice] = useState(2000000);
  const [downPayment, setDownPayment] = useState(20);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(7);

  const result = useMemo(() => {
    const loanAmount = price * (1 - downPayment / 100);
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    if (monthlyRate === 0) {
      return {
        monthlyPayment: Math.round(loanAmount / months),
        totalPayment: loanAmount,
        overpayment: 0,
        loanAmount,
      };
    }

    const monthlyPayment = Math.round(
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
        (Math.pow(1 + monthlyRate, months) - 1)
    );

    const totalPayment = monthlyPayment * months;
    const overpayment = totalPayment - loanAmount;

    return { monthlyPayment, totalPayment, overpayment, loanAmount };
  }, [price, downPayment, years, rate]);

  const formatPrice = (val: number) =>
    val.toLocaleString("ru-RU") + "\u00A0₽";

  return (
    <section
      id="calculator"
      className="py-5 lg:py-8 bg-gradient-to-b from-white to-emerald-50/40 scroll-mt-16"
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Landmark className="w-3.5 h-3.5" />
            Ипотека
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-3 leading-tight">
            Свой участок{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              дешевле аренды квартиры
            </span>
          </h2>
          <div className="flex flex-wrap justify-center gap-1.5 mb-1">
            {banks.map((b) => (
              <div
                key={b.name}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white ring-1 ring-emerald-200 shadow-sm"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: b.dot }}
                />
                <span className="text-[11px] font-black text-gray-900">
                  {b.name}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold tabular-nums">
                  {b.rate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 ring-1 ring-gray-100 overflow-hidden">
          <div className="lg:grid lg:grid-cols-5">
            {/* Inputs */}
            <div className="lg:col-span-3 p-5 sm:p-7">
              <div className="space-y-5">
                <Slider
                  label="Стоимость участка"
                  value={formatPrice(price)}
                  min={500000}
                  max={20000000}
                  step={100000}
                  current={price}
                  onChange={setPrice}
                  minLabel="500 000"
                  maxLabel="20 000 000"
                />
                <Slider
                  label="Первоначальный взнос"
                  value={`${downPayment}% · ${formatPrice(
                    Math.round((price * downPayment) / 100)
                  )}`}
                  min={10}
                  max={90}
                  step={5}
                  current={downPayment}
                  onChange={setDownPayment}
                  minLabel="10%"
                  maxLabel="90%"
                />
                <Slider
                  label="Срок кредита"
                  value={`${years}\u00A0лет`}
                  min={1}
                  max={30}
                  step={1}
                  current={years}
                  onChange={setYears}
                  minLabel="1 год"
                  maxLabel="30 лет"
                />
                <Slider
                  label="Процентная ставка"
                  value={`${rate}%`}
                  min={5}
                  max={20}
                  step={0.5}
                  current={rate}
                  onChange={setRate}
                  minLabel="5%"
                  maxLabel="20%"
                />
              </div>
            </div>

            {/* Result panel */}
            <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 p-6 sm:p-8 text-white flex flex-col relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
              <div
                className="absolute -bottom-4 -right-2 text-white/5 font-black leading-none pointer-events-none select-none tracking-tighter"
                style={{ fontSize: "9rem" }}
              >
                ₽
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-1.5 mb-5 text-emerald-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    Ежемесячный платёж
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-black tracking-tight mb-1 leading-none tabular-nums">
                  {formatPrice(result.monthlyPayment)}
                </div>
                <p className="text-emerald-100/85 text-[11px] mb-6">
                  при ставке {rate}% на {years}&nbsp;лет
                </p>

                <div className="space-y-2 pt-5 border-t border-white/15 text-xs">
                  <div className="flex justify-between">
                    <span className="text-emerald-100/80">Сумма кредита</span>
                    <span className="font-bold tabular-nums">
                      {formatPrice(result.loanAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100/80">Общая выплата</span>
                    <span className="font-bold tabular-nums">
                      {formatPrice(result.totalPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100/80">Переплата</span>
                    <span className="font-bold tabular-nums">
                      {formatPrice(result.overpayment)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold">
                    <Check className="w-2.5 h-2.5" />6 банков
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold">
                    <TrendingDown className="w-2.5 h-2.5" />
                    Одобрение 2 дня
                  </span>
                </div>

                <a
                  href="#contacts"
                  className="mt-5 inline-flex items-center justify-center gap-1.5 bg-white text-emerald-700 hover:bg-emerald-50 px-5 h-12 rounded-xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all w-full"
                >
                  Получить одобрение
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="mt-2 text-[9px] text-center text-emerald-100/60 uppercase tracking-widest">
                  Предварительный расчёт · не оферта
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-sm font-black text-gray-900 tabular-nums">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
