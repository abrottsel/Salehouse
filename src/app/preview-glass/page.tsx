"use client";

import {
  TreePine,
  CalendarCheck,
  Calculator,
  Star,
  ArrowRight,
} from "lucide-react";

const VARIANTS = [
  { label: "1 — Текущий (white/14%→5%, blur 28px)", bgFrom: 0.14, bgTo: 0.05, blur: 28, sat: 1.8, borderAlpha: 0.2, highlightAlpha: 0.25, specularAlpha: 0.4 },
  { label: "2 — Чуть прозрачнее (white/10%→3%)", bgFrom: 0.10, bgTo: 0.03, blur: 30, sat: 1.8, borderAlpha: 0.18, highlightAlpha: 0.22, specularAlpha: 0.35 },
  { label: "3 — Средний (white/7%→2%)", bgFrom: 0.07, bgTo: 0.02, blur: 32, sat: 1.9, borderAlpha: 0.15, highlightAlpha: 0.18, specularAlpha: 0.3 },
  { label: "4 — Почти прозрачный (white/4%→1%)", bgFrom: 0.04, bgTo: 0.01, blur: 36, sat: 2.0, borderAlpha: 0.12, highlightAlpha: 0.15, specularAlpha: 0.25 },
  { label: "5 — Максимальная прозрачность (white/2%→0%)", bgFrom: 0.02, bgTo: 0, blur: 40, sat: 2.2, borderAlpha: 0.1, highlightAlpha: 0.12, specularAlpha: 0.2 },
];

const TILES = [
  { title: "Каталог посёлков", subtitle: "31 посёлок · 1 769+ участков", iconBg: "bg-gradient-to-br from-emerald-400 to-green-600", Icon: TreePine, wide: true },
  { title: "Записаться на просмотр", subtitle: "Бесплатно, с выездом", iconBg: "bg-gradient-to-br from-emerald-400 to-green-600", Icon: CalendarCheck },
  { title: "Ипотека от 6.5%", subtitle: "Расчёт за 30 секунд", iconBg: "bg-gradient-to-br from-sky-400 to-cyan-600", Icon: Calculator },
  { title: "Преимущества", subtitle: "Почему выбирают нас", iconBg: "bg-gradient-to-br from-sky-400 to-cyan-600", Icon: Star },
];

export default function PreviewGlassPage() {
  return (
    <main className="min-h-screen bg-black">
      {VARIANTS.map((v, vi) => (
        <section
          key={vi}
          className="relative min-h-[420px] bg-cover bg-center bg-no-repeat flex flex-col justify-end pb-8 px-4 sm:px-8 lg:px-16"
          style={{ backgroundImage: "url(/hero-home.jpg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/65" />

          <div className="relative z-10">
            <h2 className="text-white text-xl font-black mb-4 drop-shadow-lg">{v.label}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
              {TILES.map((tile) => (
                <div
                  key={tile.title + vi}
                  className={`group relative overflow-hidden rounded-[22px] p-4 lg:p-5 ${
                    tile.wide ? "col-span-2 flex flex-col items-center text-center" : ""
                  }`}
                  style={{
                    backdropFilter: `blur(${v.blur}px) saturate(${v.sat})`,
                    WebkitBackdropFilter: `blur(${v.blur}px) saturate(${v.sat})`,
                    background: `linear-gradient(135deg, rgba(255,255,255,${v.bgFrom}) 0%, rgba(255,255,255,${v.bgTo}) 100%)`,
                    boxShadow: `inset 0 1px 1px 0 rgba(255,255,255,${v.highlightAlpha}), inset 0 -1px 1px 0 rgba(255,255,255,0.05), 0 8px 32px -4px rgba(0,0,0,0.3)`,
                    border: `1px solid rgba(255,255,255,${v.borderAlpha})`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
                    style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,${v.specularAlpha}), transparent)` }}
                  />
                  <div
                    className={`w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] ${tile.iconBg} flex items-center justify-center mb-3`}
                    style={{ boxShadow: "0 4px 16px -2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)" }}
                  >
                    <tile.Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-white text-sm sm:text-base font-semibold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    {tile.title}
                  </div>
                  {tile.subtitle && (
                    <div className="text-white/60 text-[11px] sm:text-xs mt-1 leading-snug">{tile.subtitle}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
