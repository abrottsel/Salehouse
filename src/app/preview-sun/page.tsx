"use client";

/**
 * /preview-sun — ВАРИАНТЫ оверлея «направление солнца» поверх карты Земекс.
 * Стенд для выбора одного варианта. Прод посёлков НЕ трогаем.
 *
 * Гео: Подмосковье ~55.5°N — солнце в южной части неба.
 * Карта предполагается «север сверху»: N=верх, S=низ, E=право, W=лево.
 * Солнце: восход E(право) → полдень S(низ) → закат W(лево). Тень — на север.
 */

import { useState } from "react";
import { Sun, Compass, SunMedium, Moon } from "lucide-react";

const FAVORIT_MAP =
  "https://map.zemexx.ru/v2/index.php?village_id=bbefc754-d030-11eb-944a-ac1f6b478593";

// ── Точка на дуге E→S→W (квадратичная Безье в SVG 0..100) по t (0=восход,1=закат)
function sunPoint(t: number) {
  const p0 = { x: 100, y: 50 }; // E (восток / право)
  const p1 = { x: 50, y: 104 }; // низ (юг) — точка управления
  const p2 = { x: 0, y: 50 }; // W (запад / лево)
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

function timeLabel(t: number) {
  const h = Math.round(6 + t * 15); // 6:00 → 21:00
  return `${String(h).padStart(2, "0")}:00`;
}
function sideLabel(t: number) {
  if (t < 0.33) return "солнце с востока — утренний свет, тень на запад";
  if (t < 0.66) return "солнце на юге (зенит) — максимум света, тень на север";
  return "солнце с запада — вечерний свет, тень на восток";
}

const GLASS = "rounded-2xl bg-black/45 backdrop-blur-md ring-1 ring-white/20 text-white";

// ─────────────────────────────────────────────────────────────────────
// Variant A — Компас + статичная дуга солнца

function VariantCompass() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Cardinal labels */}
      <Cardinal />
      {/* Sun arc */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M100,50 Q50,104 0,50" fill="none" stroke="rgba(251,191,36,0.9)" strokeWidth="0.8" strokeDasharray="2 1.5" />
      </svg>
      <SunDot t={0.5} />
      {/* Caption */}
      <div className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-3 px-3.5 py-2 ${GLASS}`}>
        <p className="text-[13px] font-semibold flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-amber-300" /> Юг — солнечная сторона весь день
        </p>
        <p className="text-[11px] text-white/70 mt-0.5">Восток — утро · Запад — вечер · Север — тень</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Variant B — Интерактивный ползунок времени

function VariantInteractive() {
  const [t, setT] = useState(0.5);
  const sun = sunPoint(t);
  // тень: из центра в противоположную от солнца сторону
  const cx = 50, cy = 50;
  const shadow = { x: cx + (cx - sun.x) * 0.7, y: cy + (cy - sun.y) * 0.7 };
  return (
    <div className="absolute inset-0">
      <Cardinal />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 w-full h-full">
        <path d="M100,50 Q50,104 0,50" fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="0.6" strokeDasharray="2 1.5" />
        {/* shadow arrow from center */}
        <defs>
          <marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(30,41,59,0.85)" />
          </marker>
        </defs>
        <line x1={cx} y1={cy} x2={shadow.x} y2={shadow.y} stroke="rgba(30,41,59,0.85)" strokeWidth="1.2" markerEnd="url(#ah)" />
      </svg>
      <SunDot t={t} />
      {/* Control */}
      <div className={`absolute left-1/2 -translate-x-1/2 bottom-3 w-[86%] max-w-md px-4 py-3 ${GLASS}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-bold flex items-center gap-1.5">
            <SunMedium className="w-4 h-4 text-amber-300" /> {timeLabel(t)}
          </span>
          <span className="text-[11px] text-white/70">тень →</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(Number(e.target.value))}
          className="w-full accent-amber-400" />
        <p className="text-[11px] text-white/80 mt-1.5 leading-snug">{sideLabel(t)}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Variant C — Подсветка сторон (солнечная / тень)

function VariantSides() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* South warm band (bottom) */}
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top, rgba(251,191,36,0.35), rgba(251,191,36,0))" }} />
      {/* North cool band (top) */}
      <div className="absolute inset-x-0 top-0 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(59,130,246,0.28), rgba(59,130,246,0))" }} />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 px-3.5 py-1.5 rounded-full bg-amber-400/90 text-amber-950 text-[12px] font-black flex items-center gap-1.5">
        <Sun className="w-4 h-4" /> ЮГ · солнечная сторона
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-3 px-3 py-1.5 rounded-full bg-blue-500/85 text-white text-[12px] font-bold flex items-center gap-1.5">
        <Moon className="w-3.5 h-3.5" /> СЕВЕР · тень
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-semibold">🌅 Восток · утро</div>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-semibold">🌇 Запад · вечер</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Variant D — Компас (без дуги) + подсветка сторон, вкл/выкл кнопкой
// Кнопка стоит левее «Спутник» (у карты Земекс он вверху справа).

function VariantToggle() {
  const [on, setOn] = useState(true);
  return (
    <div className="absolute inset-0">
      {/* Кнопка вкл/выкл — левее «Спутник» (верх-право карты) */}
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`pointer-events-auto absolute top-3 right-[112px] z-30 inline-flex items-center gap-1.5 h-[34px] px-3 rounded-md text-[13px] font-semibold shadow-md ring-1 transition ${
          on ? "bg-amber-400 text-amber-950 ring-amber-300" : "bg-white text-gray-700 ring-black/10 hover:bg-gray-50"
        }`}
        title="Показать направление солнца"
      >
        <Sun className={`w-4 h-4 ${on ? "text-amber-700" : "text-gray-400"}`} />
        Солнце
      </button>

      {/* Просто стороны света С/Ю/В/З — как в примере 1 */}
      {on && <Cardinal />}
    </div>
  );
}

// ── shared bits
function Cardinal() {
  // Фирменное emerald-стекло «Пушка»: зелёный полупрозрачный кружок с белой
  // буквой, тонкая светлая рамка и мягкая тень. Читаемо на светлой карте,
  // но не грубо-чёрное.
  const chipCls =
    "absolute w-9 h-9 flex items-center justify-center rounded-full border border-white/45 text-white font-black text-base";
  const glass: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(16,185,129,0.92) 0%, rgba(5,150,105,0.85) 100%)",
    backdropFilter: "blur(6px) saturate(1.4)",
    WebkitBackdropFilter: "blur(6px) saturate(1.4)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 12px -2px rgba(0,0,0,0.4)",
  };
  return (
    <div className="pointer-events-none absolute inset-0">
      <span className={`${chipCls} left-1/2 -translate-x-1/2 top-3`} style={glass}>С</span>
      <span className={`${chipCls} left-1/2 -translate-x-1/2 bottom-14`} style={glass}>Ю</span>
      <span className={`${chipCls} right-3 top-1/2 -translate-y-1/2`} style={glass}>В</span>
      <span className={`${chipCls} left-3 top-1/2 -translate-y-1/2`} style={glass}>З</span>
    </div>
  );
}
function SunDot({ t }: { t: number }) {
  const p = sunPoint(t);
  return (
    <div className="pointer-events-none absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}>
      <div className="w-7 h-7 rounded-full bg-amber-300 shadow-[0_0_24px_8px_rgba(251,191,36,0.6)] flex items-center justify-center">
        <Sun className="w-4 h-4 text-amber-700" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "toggle", label: "4 · Компас + стороны (вкл/выкл) ★", Icon: Sun },
  { key: "compass", label: "1 · Компас + дуга", Icon: Compass },
  { key: "interactive", label: "2 · Интерактив (время)", Icon: SunMedium },
  { key: "sides", label: "3 · Подсветка сторон", Icon: Sun },
] as const;

export default function PreviewSunPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("toggle");
  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400 mb-2">Ревью · не прод</p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Солнце над картой посёлка — варианты</h1>
        <p className="text-white/70 mt-2 text-sm leading-relaxed">
          Оверлей поверх карты Земекс (Фаворит). Карта — «север сверху»: солнце идёт
          восток→юг→запад, южная сторона участка солнечная. Выбери вариант — реализую на прод.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((tb) => {
            const active = tab === tb.key;
            return (
              <button key={tb.key} type="button" onClick={() => setTab(tb.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${active ? "bg-amber-400 text-amber-950" : "bg-white/10 text-white hover:bg-white/20"}`}>
                <tb.Icon className="w-4 h-4" /> {tb.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 relative w-full aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/15 bg-gray-800">
          <iframe src={FAVORIT_MAP} className="absolute inset-0 w-full h-full" title="Карта Фаворит" loading="lazy" />
          {tab === "toggle" && <VariantToggle />}
          {tab === "compass" && <VariantCompass />}
          {tab === "interactive" && <VariantInteractive />}
          {tab === "sides" && <VariantSides />}
        </div>

        <p className="text-xs text-white/40 mt-4">
          Примечание: точная привязка севера — по факту ориентации карты Земекс; при необходимости
          повернём оверлей на угол калибровки конкретного посёлка.
        </p>
      </div>
    </main>
  );
}
