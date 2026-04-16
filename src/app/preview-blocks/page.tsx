"use client";

import { useState } from "react";
import {
  ShieldCheck, Flame, Car, ShieldAlert, Wallet, BadgePercent, Landmark, FileCheck2,
  PiggyBank, Sparkles, Calculator, Check, TrendingDown, ArrowRight,
} from "lucide-react";

const ADVANTAGES = [
  { Icon: ShieldCheck, title: "Юридическая чистота", desc: "Гарантия чистой сделки в договоре" },
  { Icon: Flame, title: "Газ, свет, вода", desc: "Все коммуникации подключены" },
  { Icon: Car, title: "Асфальтовые дороги", desc: "Твёрдое покрытие внутри посёлка" },
  { Icon: ShieldAlert, title: "Охрана 24/7", desc: "Видеонаблюдение и КПП" },
  { Icon: Wallet, title: "Прозрачные цены", desc: "Без скрытых платежей" },
  { Icon: BadgePercent, title: "Рассрочка 0%", desc: "До 12 месяцев без переплат" },
  { Icon: Landmark, title: "Ипотека 6 банков", desc: "ВТБ, Сбер, Альфа и ещё 3" },
  { Icon: FileCheck2, title: "Категория ИЖС", desc: "Прописка и маткапитал" },
];

const VARIANTS = [
  {
    label: "1 — Стекло на фото (как секции)",
    sectionClass: "bg-cover bg-center bg-no-repeat",
    sectionBg: "/hero-home.jpg",
    overlay: "bg-gradient-to-b from-black/50 via-black/30 to-black/50",
    cardStyle: {
      backdropFilter: "blur(4px) saturate(1.8)",
      background: "linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -1px 0 rgba(255,255,255,0.05),0 8px 24px -4px rgba(0,0,0,0.25)",
    },
    textColor: "text-white",
    descColor: "text-white/60",
    iconBg: "bg-white/20",
    rainbow: true,
    calcBg: "linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))",
    calcResultBg: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))",
  },
  {
    label: "2 — Матовое стекло на зелёном",
    sectionClass: "",
    sectionBg: undefined,
    sectionGradient: "linear-gradient(135deg,#1a3a2a,#2d5a3f,#1a3a2a)",
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(8px) saturate(1.6)",
      background: "linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25),0 6px 20px -4px rgba(0,0,0,0.2)",
    },
    textColor: "text-white",
    descColor: "text-white/60",
    iconBg: "bg-white/15",
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))",
    calcResultBg: "linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.06))",
  },
  {
    label: "3 — Белое стекло на тёмном",
    sectionClass: "bg-slate-900",
    sectionBg: undefined,
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(16px) saturate(1.5)",
      background: "linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2),0 8px 32px -4px rgba(0,0,0,0.3)",
    },
    textColor: "text-white",
    descColor: "text-white/50",
    iconBg: "bg-white/15",
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))",
    calcResultBg: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))",
  },
  {
    label: "4 — Цветной gradient mesh на тёмном",
    sectionClass: "bg-slate-950",
    sectionBg: undefined,
    overlay: undefined,
    cardColors: [
      "rgba(16,185,129,0.12)", "rgba(245,158,11,0.12)", "rgba(100,116,139,0.12)", "rgba(244,63,94,0.12)",
      "rgba(20,184,166,0.12)", "rgba(139,92,246,0.12)", "rgba(14,165,233,0.12)", "rgba(234,179,8,0.12)",
    ],
    cardStyle: {
      backdropFilter: "blur(2px) saturate(2)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15),0 8px 32px -4px rgba(0,0,0,0.3)",
    },
    textColor: "text-white",
    descColor: "text-white/50",
    iconBg: undefined,
    iconColors: ["bg-emerald-500/30","bg-amber-500/30","bg-slate-500/30","bg-rose-500/30","bg-teal-500/30","bg-violet-500/30","bg-sky-500/30","bg-yellow-500/30"],
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.05))",
    calcResultBg: "linear-gradient(135deg,rgba(16,185,129,0.25),rgba(5,150,105,0.1))",
  },
  {
    label: "5 — Frosted glass на пастели",
    sectionClass: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
    sectionBg: undefined,
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(12px) saturate(1.4)",
      background: "linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.5))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9),0 4px 16px -4px rgba(0,0,0,0.08)",
    },
    textColor: "text-gray-900",
    descColor: "text-gray-500",
    iconBg: "bg-emerald-600",
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,255,255,0.6))",
    calcResultBg: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))",
  },

  // ── 6-10: Frosted variations ──
  {
    label: "6 — Frosted на тёплой пастели (песочный)",
    sectionClass: "bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50",
    sectionBg: undefined,
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(14px) saturate(1.5)",
      background: "linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,255,255,0.55))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95),0 4px 20px -4px rgba(0,0,0,0.07)",
    },
    textColor: "text-gray-900",
    descColor: "text-gray-500",
    iconBg: "bg-amber-500",
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(255,255,255,0.85),rgba(255,255,255,0.6))",
    calcResultBg: "linear-gradient(135deg,rgba(245,158,11,0.12),rgba(217,119,6,0.06))",
  },
  {
    label: "7 — Frosted на голубой пастели (небо)",
    sectionClass: "bg-gradient-to-br from-sky-50 via-blue-50/30 to-indigo-50/20",
    sectionBg: undefined,
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(14px) saturate(1.5)",
      background: "linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.5))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9),0 4px 20px -4px rgba(0,0,0,0.06)",
    },
    textColor: "text-gray-900",
    descColor: "text-gray-500",
    iconBg: "bg-sky-500",
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,255,255,0.55))",
    calcResultBg: "linear-gradient(135deg,rgba(14,165,233,0.12),rgba(2,132,199,0.06))",
  },
  {
    label: "8 — Frosted на мятно-лавандовой пастели",
    sectionClass: "bg-gradient-to-br from-emerald-50/80 via-violet-50/30 to-sky-50/40",
    sectionBg: undefined,
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(16px) saturate(1.6)",
      background: "linear-gradient(145deg,rgba(255,255,255,0.7),rgba(255,255,255,0.45))",
      boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.95),inset 0 -0.5px 0 rgba(255,255,255,0.3),0 6px 24px -6px rgba(0,0,0,0.08)",
    },
    textColor: "text-gray-900",
    descColor: "text-gray-500",
    iconBg: "bg-emerald-600",
    rainbow: true,
    calcBg: "linear-gradient(145deg,rgba(255,255,255,0.75),rgba(255,255,255,0.5))",
    calcResultBg: "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(139,92,246,0.06))",
  },
  {
    label: "9 — Frosted с зелёным тинтом карточек",
    sectionClass: "bg-gradient-to-br from-green-50 via-emerald-50/40 to-teal-50/30",
    sectionBg: undefined,
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(12px) saturate(1.5)",
      background: "linear-gradient(135deg,rgba(236,253,245,0.8),rgba(209,250,229,0.4))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9),0 4px 16px -4px rgba(5,150,105,0.1)",
    },
    textColor: "text-gray-900",
    descColor: "text-emerald-800/60",
    iconBg: "bg-emerald-600",
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(236,253,245,0.85),rgba(209,250,229,0.5))",
    calcResultBg: "linear-gradient(135deg,rgba(16,185,129,0.18),rgba(5,150,105,0.08))",
  },
  {
    label: "10 — Frosted на розовой пастели (тепло)",
    sectionClass: "bg-gradient-to-br from-rose-50/80 via-pink-50/30 to-orange-50/20",
    sectionBg: undefined,
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(14px) saturate(1.4)",
      background: "linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,255,255,0.52))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92),0 4px 20px -4px rgba(0,0,0,0.06)",
    },
    textColor: "text-gray-900",
    descColor: "text-gray-500",
    iconBg: "bg-rose-500",
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.58))",
    calcResultBg: "linear-gradient(135deg,rgba(244,63,94,0.1),rgba(251,113,133,0.05))",
  },
  {
    label: "11 — Тёпло-зелёный frosted (зелень + золото)",
    sectionClass: "bg-gradient-to-br from-green-50 via-emerald-50/60 to-amber-50/30",
    sectionBg: undefined,
    overlay: undefined,
    cardStyle: {
      backdropFilter: "blur(12px) saturate(1.5)",
      background: "linear-gradient(140deg,rgba(236,253,245,0.75),rgba(254,252,232,0.4))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9),0 4px 16px -4px rgba(5,150,105,0.1)",
    },
    textColor: "text-gray-900",
    descColor: "text-emerald-900/55",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    rainbow: true,
    calcBg: "linear-gradient(140deg,rgba(236,253,245,0.8),rgba(254,252,232,0.5))",
    calcResultBg: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(180,155,100,0.08))",
  },
  {
    label: "12 — Мятный (как баннер «Не нашли посёлок»)",
    sectionClass: "",
    sectionBg: undefined,
    overlay: undefined,
    sectionGradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 60%, #d1fae5 80%, #ecfdf5 100%)",
    cardStyle: {
      backdropFilter: "blur(12px) saturate(1.4)",
      background: "linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.45))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95),0 4px 16px -4px rgba(5,150,105,0.08)",
    },
    textColor: "text-gray-900",
    descColor: "text-emerald-900/55",
    iconBg: "bg-emerald-600",
    rainbow: true,
    calcBg: "linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.5))",
    calcResultBg: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))",
  },
];

export default function PreviewBlocksPage() {
  return (
    <main className="min-h-screen bg-gray-200 py-8 space-y-16">
      <h1 className="text-center text-3xl font-black text-gray-900">
        Ипотека + Преимущества — 12 вариантов
      </h1>

      <style>{`
        .pv-rainbow { position: relative; }
        .pv-rainbow::before {
          content: '';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;
          background:conic-gradient(from 0deg,rgba(255,0,0,0.3),rgba(255,165,0,0.3),rgba(255,255,0,0.2),rgba(0,255,0,0.2),rgba(0,200,255,0.3),rgba(100,100,255,0.3),rgba(200,0,255,0.3),rgba(255,0,0,0.3));
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:1;
        }
      `}</style>

      {VARIANTS.map((v, vi) => (
        <div key={vi}>
          <h2 className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-xl font-black text-gray-800 mb-4">
            {v.label}
          </h2>

          {/* === ИПОТЕКА === */}
          <div
            className={`py-6 lg:py-8 ${v.sectionClass} relative overflow-hidden mb-4`}
            style={{
              ...(v.sectionBg ? { backgroundImage: `url(${v.sectionBg})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
              ...((v as any).sectionGradient ? { background: (v as any).sectionGradient } : {}),
            }}
          >
            {v.overlay && <div className={`absolute inset-0 ${v.overlay}`} />}
            {(v as any).sectionGradient && (
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle,rgba(180,155,100,0.4) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
            )}
            <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-5">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${vi >= 4 ? "bg-emerald-100 text-emerald-800" : "bg-white/10 ring-1 ring-white/20 text-white/90"} text-[11px] font-bold uppercase tracking-wider mb-2`}>
                  <Landmark className="w-3.5 h-3.5" />Ипотека
                </div>
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3 ${v.textColor}`}>
                  Свой участок <span className={vi >= 4 ? "text-emerald-600" : "text-emerald-300"}>дешевле аренды квартиры</span>
                </h2>
              </div>
              <div
                className={`rounded-3xl overflow-hidden ${v.rainbow ? "pv-rainbow" : ""}`}
                style={{ ...v.cardStyle, background: v.calcBg }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/[0.3] to-transparent" />
                <div className="lg:grid lg:grid-cols-5">
                  <div className="lg:col-span-3 p-5 sm:p-7">
                    <div className="space-y-4">
                      {["Стоимость участка — 2 000 000 ₽", "Первоначальный взнос — 20%", "Срок кредита — 15 лет", "Ставка — 7%"].map((s) => (
                        <div key={s} className={`flex justify-between text-xs font-semibold ${v.descColor} uppercase tracking-wider`}>
                          <span>{s.split("—")[0]}</span>
                          <span className={`${v.textColor} font-black`}>{s.split("—")[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2 p-6 relative" style={{ background: v.calcResultBg }}>
                    <div className={`flex items-center gap-1.5 mb-4 ${v.descColor}`}>
                      <Sparkles className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase tracking-widest">Платёж</span>
                    </div>
                    <div className={`text-4xl font-black tabular-nums ${v.textColor}`}>14 381 ₽</div>
                    <div className={`text-xs mt-1 ${v.descColor}`}>при ставке 7% на 15 лет</div>
                    <div className="mt-4 space-y-1.5 pt-4 border-t border-white/10 text-xs">
                      <div className="flex justify-between"><span className={v.descColor}>Кредит</span><span className={`font-bold ${v.textColor}`}>1 600 000 ₽</span></div>
                      <div className="flex justify-between"><span className={v.descColor}>Всего</span><span className={`font-bold ${v.textColor}`}>2 588 580 ₽</span></div>
                      <div className="flex justify-between"><span className={v.descColor}>Переплата</span><span className={`font-bold ${v.textColor}`}>988 580 ₽</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === ПРЕИМУЩЕСТВА === */}
          <div
            className={`py-6 lg:py-8 ${v.sectionClass} relative overflow-hidden`}
            style={{
              ...(v.sectionBg ? { backgroundImage: `url(${v.sectionBg})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
              ...((v as any).sectionGradient ? { background: (v as any).sectionGradient } : {}),
            }}
          >
            {v.overlay && <div className={`absolute inset-0 ${v.overlay}`} />}
            {(v as any).sectionGradient && (
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle,rgba(180,155,100,0.4) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
            )}
            <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-5">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${vi >= 4 ? "bg-green-100 text-green-800" : "bg-white/10 ring-1 ring-white/20 text-white/90"} text-[11px] font-bold uppercase tracking-wider mb-2`}>
                  <PiggyBank className="w-3.5 h-3.5" />Преимущества
                </div>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${v.textColor}`}>
                  Всё включено <span className={vi >= 4 ? "text-green-600" : "text-emerald-300"}>для комфортной жизни</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ADVANTAGES.map((a, ai) => {
                  const cardBg = (v as any).cardColors
                    ? `linear-gradient(135deg,${(v as any).cardColors[ai]},rgba(255,255,255,0.02))`
                    : v.cardStyle.background;
                  const iBg = (v as any).iconColors ? (v as any).iconColors[ai] : v.iconBg;
                  return (
                    <div
                      key={a.title}
                      className={`rounded-[18px] p-4 ${v.rainbow ? "pv-rainbow" : "ring-1 ring-white/10"} overflow-hidden relative`}
                      style={{ ...v.cardStyle, background: cardBg }}
                    >
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/[0.25] to-transparent" />
                      <div className={`w-10 h-10 rounded-xl ${iBg} flex items-center justify-center shadow-md mb-2`}>
                        <a.Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className={`text-sm font-black ${v.textColor} leading-tight`}>{a.title}</h3>
                      <p className={`text-[11px] mt-1 ${v.descColor} leading-snug`}>{a.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
