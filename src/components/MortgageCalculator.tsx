"use client";

import { useState, useMemo } from "react";
import {
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
      return { monthlyPayment: Math.round(loanAmount / months), totalPayment: loanAmount, overpayment: 0, loanAmount };
    }
    const monthlyPayment = Math.round(
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
        (Math.pow(1 + monthlyRate, months) - 1)
    );
    const totalPayment = monthlyPayment * months;
    return { monthlyPayment, totalPayment, overpayment: totalPayment - loanAmount, loanAmount };
  }, [price, downPayment, years, rate]);

  const fmt = (val: number) => val.toLocaleString("ru-RU") + "\u00A0₽";

  return (
    <section
      id="calculator"
      className="py-6 lg:py-10 scroll-mt-16"
      style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 60%, #d1fae5 80%, #ecfdf5 100%)" }}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Landmark className="w-3.5 h-3.5" />
            Ипотека
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-3 leading-tight">
            Свой участок{" "}
            <span className="text-emerald-700">дешевле аренды квартиры</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-1.5 mb-1">
            {banks.map((b) => (
              <div
                key={b.name}
                className="calc-bank-pill inline-flex items-center gap-1.5 px-3 h-8 rounded-full shadow-sm"
                style={{
                  backdropFilter: "blur(12px) saturate(1.4)",
                  background: "linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.45))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9),0 2px 8px -2px rgba(0,0,0,0.06)",
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.dot }} />
                <span className="text-[11px] font-black text-gray-900">{b.name}</span>
                <span className="text-[10px] text-emerald-700 font-bold tabular-nums">{b.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main card — frosted glass */}
        <div
          className="calc-glass-card rounded-3xl overflow-hidden relative"
          style={{
            backdropFilter: "blur(12px) saturate(1.4)",
            background: "linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.5))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95),0 4px 16px -4px rgba(5,150,105,0.08)",
          }}
        >
          {/* Specular */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="lg:grid lg:grid-cols-2">
            {/* Inputs */}
            <div className="p-5 sm:p-7">
              <div className="space-y-5">
                <Slider label="Стоимость участка" value={fmt(price)} min={500000} max={20000000} step={100000} current={price} onChange={setPrice} minLabel="500 000" maxLabel="20 000 000" />
                <Slider label="Первоначальный взнос" value={`${downPayment}% · ${fmt(Math.round((price * downPayment) / 100))}`} min={10} max={90} step={5} current={downPayment} onChange={setDownPayment} minLabel="10%" maxLabel="90%" />
                <Slider label="Срок кредита" value={`${years}\u00A0лет`} min={1} max={30} step={1} current={years} onChange={setYears} minLabel="1 год" maxLabel="30 лет" />
                <Slider label="Процентная ставка" value={`${rate}%`} min={5} max={20} step={0.5} current={rate} onChange={setRate} minLabel="5%" maxLabel="20%" />
              </div>
            </div>

            {/* Result panel — green tinted glass */}
            <div
              className="p-6 sm:p-8 flex flex-col relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))" }}
            >
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
              <div
                className="absolute -bottom-4 -right-2 text-emerald-600/[0.06] font-black leading-none pointer-events-none select-none tracking-tighter"
                style={{ fontSize: "9rem" }}
              >₽</div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-1.5 mb-5 text-emerald-700/60">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ежемесячный платёж</span>
                </div>

                <div className="text-4xl sm:text-5xl font-black tracking-tight mb-1 leading-none tabular-nums text-gray-900">
                  {fmt(result.monthlyPayment)}
                </div>
                <p className="text-emerald-800/60 text-[11px] mb-6">
                  при ставке {rate}% на {years}&nbsp;лет
                </p>

                <div className="space-y-2 pt-5 border-t border-emerald-600/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-emerald-900/50">Сумма кредита</span>
                    <span className="font-bold tabular-nums text-gray-900">{fmt(result.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900/50">Общая выплата</span>
                    <span className="font-bold tabular-nums text-gray-900">{fmt(result.totalPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900/50">Переплата</span>
                    <span className="font-bold tabular-nums text-gray-900">{fmt(result.overpayment)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-emerald-600/10 px-2 py-1 rounded-full text-[10px] font-bold text-emerald-800">
                    <Check className="w-2.5 h-2.5" />6 банков
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-600/10 px-2 py-1 rounded-full text-[10px] font-bold text-emerald-800">
                    <TrendingDown className="w-2.5 h-2.5" />Одобрение 2 дня
                  </span>
                </div>

                <a
                  href="#contacts"
                  className="mt-5 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 h-12 rounded-xl font-black text-sm shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all w-full"
                >
                  Получить одобрение <ArrowRight className="w-4 h-4" />
                </a>
                <p className="mt-2 text-[9px] text-center text-emerald-800/40 uppercase tracking-widest">
                  Предварительный расчёт · не оферта
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .calc-glass-card { position: relative; }
        .calc-glass-card::before {
          content: '';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;
          background:conic-gradient(from 0deg,rgba(255,0,0,0.25),rgba(255,165,0,0.25),rgba(255,255,0,0.18),rgba(0,255,0,0.18),rgba(0,200,255,0.25),rgba(100,100,255,0.25),rgba(200,0,255,0.25),rgba(255,0,0,0.25));
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:1;
        }
        .calc-bank-pill { position: relative; }
        .calc-bank-pill::before {
          content:'';position:absolute;inset:-1px;border-radius:inherit;padding:1px;
          background:conic-gradient(from 90deg,rgba(255,0,0,0.2),rgba(255,165,0,0.2),rgba(255,255,0,0.15),rgba(0,255,0,0.15),rgba(0,200,255,0.2),rgba(100,100,255,0.2),rgba(200,0,255,0.2),rgba(255,0,0,0.2));
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;
        }
      `}</style>
    </section>
  );
}

function Slider({ label, value, min, max, step, current, onChange, minLabel, maxLabel }: {
  label: string; value: string; min: number; max: number; step: number; current: number; onChange: (v: number) => void; minLabel: string; maxLabel: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-xs font-semibold text-emerald-900/55 uppercase tracking-wider">{label}</label>
        <span className="text-sm font-black text-gray-900 tabular-nums">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-emerald-200/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-emerald-800/40 mt-1 font-medium">
        <span>{minLabel}</span><span>{maxLabel}</span>
      </div>
    </div>
  );
}
