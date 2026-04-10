"use client";

import { useState, useMemo } from "react";
import { Calculator, ArrowRight } from "lucide-react";

export default function MortgageCalculator() {
  const [price, setPrice] = useState(2000000);
  const [downPayment, setDownPayment] = useState(20);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(18);

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
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
    );

    const totalPayment = monthlyPayment * months;
    const overpayment = totalPayment - loanAmount;

    return { monthlyPayment, totalPayment, overpayment, loanAmount };
  }, [price, downPayment, years, rate]);

  const formatPrice = (val: number) =>
    val.toLocaleString("ru-RU") + " \u20BD";

  return (
    <section id="calculator" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ипотечный калькулятор
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Рассчитайте ежемесячный платёж по ипотеке на земельный участок.
            Мы поможем подобрать лучшие условия от банков-партнёров.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="lg:grid lg:grid-cols-5">
            {/* Inputs */}
            <div className="lg:col-span-3 p-6 lg:p-8">
              <div className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Стоимость участка
                    </label>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(price)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={20000000}
                    step={100000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>500 000</span>
                    <span>20 000 000</span>
                  </div>
                </div>

                {/* Down payment */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Первоначальный взнос
                    </label>
                    <span className="text-sm font-semibold text-gray-900">
                      {downPayment}% ({formatPrice(Math.round(price * downPayment / 100))})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    step={5}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10%</span>
                    <span>90%</span>
                  </div>
                </div>

                {/* Years */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Срок кредита
                    </label>
                    <span className="text-sm font-semibold text-gray-900">
                      {years} лет
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 год</span>
                    <span>30 лет</span>
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Процентная ставка
                    </label>
                    <span className="text-sm font-semibold text-gray-900">
                      {rate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={0.5}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results — v3 Stitch inspired: big number, premium green panel */}
            <div className="lg:col-span-2 bg-green-600 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
              {/* Decorative blur orb */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8 text-green-100">
                  <Calculator className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                    Ежемесячный платёж
                  </span>
                </div>

                <div className="text-4xl lg:text-6xl font-black tracking-tight mb-2 leading-none">
                  {formatPrice(result.monthlyPayment)}
                </div>
                <p className="text-green-100 text-xs mb-8">
                  при ставке {rate}% на {years} лет
                </p>

                <div className="space-y-3 pt-6 border-t border-white/15">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-100">Сумма кредита</span>
                    <span className="font-semibold">
                      {formatPrice(result.loanAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-100">Общая выплата</span>
                    <span className="font-semibold">
                      {formatPrice(result.totalPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-100">Переплата</span>
                    <span className="font-semibold">
                      {formatPrice(result.overpayment)}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="#contacts"
                className="relative z-10 mt-8 inline-flex items-center justify-center gap-2 bg-white text-green-700 px-6 py-4 rounded-xl font-bold hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl w-full"
              >
                Рассчитать ипотеку
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="relative z-10 mt-3 text-[10px] text-center text-green-100/70 uppercase tracking-widest">
                Предварительный расчёт, не публичная оферта
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
