"use client";

/**
 * SunOverlay — направление солнца поверх карты Земекс (вариант 4).
 * Заливка-подсветка (тёплый юг / холодный север) + буквы С/Ю/В/З в emerald.
 * Кнопка «Солнце» вкл/выкл — левее «Спутник» (верх-право карты).
 *
 * ⚠️ Отдельный оверлей, НЕ трогает IframeMapOverlay («Дорога к мечте») и
 * iframe «Спутник». Карта Земекс — «север сверху».
 *
 * Пока за флагом ?sun=1 (тест на одном посёлке). По умолчанию не рендерится.
 */

import { useEffect, useState } from "react";
import { Sun } from "lucide-react";

function Cardinal() {
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
      <span className={`${chipCls} left-1/2 -translate-x-1/2 bottom-3`} style={glass}>Ю</span>
      <span className={`${chipCls} right-3 top-1/2 -translate-y-1/2`} style={glass}>В</span>
      <span className={`${chipCls} left-3 top-1/2 -translate-y-1/2`} style={glass}>З</span>
    </div>
  );
}

export default function SunOverlay() {
  const [enabled, setEnabled] = useState(false); // флаг ?sun=1
  const [on, setOn] = useState(true);

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("sun") === "1") {
        setEnabled(true);
      }
    } catch {}
  }, []);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 z-20">
      {/* Кнопка вкл/выкл — левее «Спутник» (верх-право карты) */}
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`pointer-events-auto absolute top-3 right-[112px] inline-flex items-center gap-1.5 h-[34px] px-3 rounded-md text-[13px] font-semibold shadow-md ring-1 transition ${
          on ? "bg-amber-400 text-amber-950 ring-amber-300" : "bg-white text-gray-700 ring-black/10 hover:bg-gray-50"
        }`}
        title="Направление солнца"
      >
        <Sun className={`w-4 h-4 ${on ? "text-amber-700" : "text-gray-400"}`} />
        Солнце
      </button>

      {on && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top, rgba(251,191,36,0.32), rgba(251,191,36,0))" }} />
          <div className="absolute inset-x-0 top-0 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(59,130,246,0.22), rgba(59,130,246,0))" }} />
          <Cardinal />
        </div>
      )}
    </div>
  );
}
