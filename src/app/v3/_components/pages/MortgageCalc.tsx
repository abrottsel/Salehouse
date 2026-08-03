"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, TrendingDown, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CTA, glassStyle } from "../ui/primitives";
import { useTier } from "../../_lib/perf";
import LocalLeadForm from "./LocalLeadForm";

/**
 * Калькулятор ипотеки.
 *
 * Аннуитетная формула и список банков со ставками перенесены один в один
 * из боевого `src/components/MortgageCalculator.tsx` — цифры на витрине и
 * на проде обязаны совпадать.
 *
 * Отличие от прода: кнопка «Оставить заявку» открывает локальную форму,
 * которая ничего не отправляет (см. LocalLeadForm).
 */

const banks = [
  { name: "ВТБ", rate: "6.5%", dot: "#002D5F" },
  { name: "Сбер", rate: "7.0%", dot: "#1A9F29" },
  { name: "Альфа", rate: "6.9%", dot: "#EF3124" },
  { name: "ГПБ", rate: "6.8%", dot: "#0072C6" },
  { name: "РСХБ", rate: "6.7%", dot: "#009540" },
  { name: "Т-Банк", rate: "7.2%", dot: "#FFDD2D" },
];

/** Разряды вручную, а не toLocaleString: результат обязан совпасть на
 *  сервере и в браузере, иначе React ругается на расхождение гидрации. */
function group(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
const fmt = (val: number) => `${group(val)} ₽`;

export default function MortgageCalc() {
  const [price, setPrice] = useState(2000000);
  const [downPayment, setDownPayment] = useState(20);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(7);
  const [formOpen, setFormOpen] = useState(false);

  const tier = useTier();
  const lite = tier === "lite";

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
    return { monthlyPayment, totalPayment, overpayment: totalPayment - loanAmount, loanAmount };
  }, [price, downPayment, years, rate]);

  // Модалка: Esc и блокировка прокрутки фона.
  useEffect(() => {
    if (!formOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFormOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [formOpen]);

  return (
    <div>
      {/* Банки-партнёры */}
      <div className="mb-5 flex flex-wrap gap-2">
        {banks.map((b) => (
          <span
            key={b.name}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.06] px-3.5 ring-1 ring-white/10"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: b.dot }} />
            <span className="text-[12px] font-black">{b.name}</span>
            <span className="text-[11px] font-bold tabular-nums text-emerald-300">{b.rate}</span>
          </span>
        ))}
      </div>

      <div
        className="overflow-hidden rounded-[26px] ring-1 ring-white/[0.07]"
        style={glassStyle}
      >
        <div className="lg:grid lg:grid-cols-[1.05fr_1fr]">
          {/* Ползунки */}
          <div className="space-y-6 p-5 sm:p-7">
            <Slider
              label="Стоимость участка"
              value={fmt(price)}
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
              value={`${downPayment}% · ${fmt(Math.round((price * downPayment) / 100))}`}
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
              value={`${years} лет`}
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

          {/* Результат */}
          <div className="relative overflow-hidden border-t border-white/[0.07] bg-gradient-to-br from-emerald-500/[0.13] to-emerald-600/[0.04] p-5 sm:p-7 lg:border-l lg:border-t-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-6 -right-3 select-none text-[9rem] font-black leading-none tracking-tighter text-emerald-300/[0.05]"
            >
              ₽
            </div>

            <div className="relative flex h-full flex-col">
              <div className="mb-4 flex items-center gap-1.5 text-emerald-300/80">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Ежемесячный платёж
                </span>
              </div>

              <div className="text-[34px] font-black leading-none tabular-nums tracking-tight sm:text-[46px]">
                {fmt(result.monthlyPayment)}
              </div>
              <p className="mt-2 text-[12px] text-emerald-200/60">
                при ставке {rate}% на {years}&nbsp;лет
              </p>

              <dl className="mt-6 space-y-2 border-t border-white/10 pt-5 text-[13px]">
                <Row label="Сумма кредита" value={fmt(result.loanAmount)} />
                <Row label="Общая выплата" value={fmt(result.totalPayment)} />
                <Row label="Переплата" value={fmt(result.overpayment)} />
              </dl>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200 ring-1 ring-emerald-400/20">
                  <Check className="h-3 w-3" />6 банков
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200 ring-1 ring-emerald-400/20">
                  <TrendingDown className="h-3 w-3" />
                  Одобрение 2 дня
                </span>
              </div>

              <CTA onClick={() => setFormOpen(true)} className="mt-6 w-full">
                Оставить заявку <ArrowRight className="h-4 w-4" />
              </CTA>
              <p className="mt-2.5 text-center text-[11px] font-semibold tracking-wide text-emerald-200/60">
                Предварительный расчёт · не оферта
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Локальная форма заявки — без единого запроса на сервер */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            // data-float-guard — под полупрозрачной подложкой модалки
            // плавающие мессенджеры не должны просвечивать.
            data-float-guard
            className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/70 p-3 sm:items-center sm:p-6"
            style={lite ? undefined : { backdropFilter: "blur(6px)" }}
            onClick={() => setFormOpen(false)}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, y: lite ? 0 : 24, scale: lite ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: lite ? 0 : 16, scale: lite ? 1 : 0.98 }}
              transition={{ duration: lite ? 0.2 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Заявка на ипотеку"
              className="relative w-full max-w-[440px] rounded-[26px] p-5 ring-1 ring-white/10 sm:p-7"
              style={glassStyle}
            >
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Закрыть"
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="pr-10 text-[20px] font-extrabold leading-tight sm:text-[24px]">
                Заявка на ипотеку
              </h3>
              <p className="mb-5 mt-1.5 text-[13px] leading-relaxed text-white/50">
                Подберём банк под ваш расчёт и поможем собрать документы.
              </p>

              <LocalLeadForm
                submitLabel="Отправить заявку"
                note="Предварительный расчёт · не оферта"
                summary={
                  <div className="mb-4 space-y-1.5 rounded-2xl bg-emerald-400/[0.07] px-4 py-3 text-[12px] ring-1 ring-emerald-400/20">
                    <div className="flex justify-between gap-3">
                      <span className="text-white/50">Стоимость</span>
                      <span className="font-bold tabular-nums">{fmt(price)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-white/50">Взнос</span>
                      <span className="font-bold tabular-nums">
                        {downPayment}% · {fmt(Math.round((price * downPayment) / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-white/50">Срок и ставка</span>
                      <span className="font-bold tabular-nums">
                        {years}&nbsp;лет · {rate}%
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-white/10 pt-1.5">
                      <span className="text-white/50">Платёж в месяц</span>
                      <span className="font-black tabular-nums text-emerald-300">
                        {fmt(result.monthlyPayment)}
                      </span>
                    </div>
                  </div>
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-white/45">{label}</dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
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
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">
          {label}
        </span>
        {/* nowrap: на 375px «20% · 400 000 ₽» иначе рвётся на две строки */}
        <span className="shrink-0 whitespace-nowrap text-[14px] font-black tabular-nums sm:text-[15px]">
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
        aria-label={label}
        // pan-y — иначе на мобиле палец по ползунку блокирует прокрутку страницы
        style={{ touchAction: "pan-y" }}
        className="v3-range w-full cursor-pointer"
      />
      <div className="mt-1 flex justify-between text-[10px] font-medium text-white/30">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
