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

import { useState } from "react";
import { Sunrise } from "lucide-react";

function Cardinal() {
  const chipCls =
    "absolute w-7 h-7 flex items-center justify-center rounded-full border border-white/45 text-white font-black text-sm";
  const glass: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(16,185,129,0.92) 0%, rgba(5,150,105,0.85) 100%)",
    backdropFilter: "blur(6px) saturate(1.4)",
    WebkitBackdropFilter: "blur(6px) saturate(1.4)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 12px -2px rgba(0,0,0,0.4)",
  };
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* На мобиле «С» чуть левее центра — чтобы иконка солнца не налезала на неё */}
      <span className={`${chipCls} left-[calc(50%-16px)] sm:left-1/2 -translate-x-1/2 top-3`} style={glass}>С</span>
      {/* На мобиле «Спутник» карты — снизу по центру, поэтому Ю поднимаем выше */}
      <span className={`${chipCls} left-1/2 -translate-x-1/2 bottom-14 sm:bottom-3`} style={glass}>Ю</span>
      <span className={`${chipCls} right-3 top-1/2 -translate-y-1/2`} style={glass}>В</span>
      <span className={`${chipCls} left-3 top-1/2 -translate-y-1/2`} style={glass}>З</span>
    </div>
  );
}

export default function SunOverlay() {
  const [on, setOn] = useState(true);

  return (
    // pointer-events-none на контейнере: оверлей НЕ перехватывает клики по
    // карте, маршруту, «Дороге к мечте», «Спутник». Кликабельна только кнопка.
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Только иконка (Sunrise) в белом кружке: на мобиле — левее «Дороги к
          мечте», на ПК — левее «Спутник». Контейнер pointer-events-none —
          «Дорогу к мечте»/«Спутник» не перекрывает, кликается только иконка. */}
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        title="Направление солнца"
        className="pointer-events-auto absolute top-3 right-[140px] sm:right-[114px] w-7 h-7 sm:w-[34px] sm:h-[34px] inline-flex items-center justify-center rounded-full"
        style={{
          // Высота: мобайл 28px (как «Дорога к мечте»), ПК 34px (как «Спутник»).
          background: "#fff",
          boxShadow: "rgba(0,0,0,0.18) 0px 2px 14px 0px",
          border: "none",
        }}
      >
        <Sunrise className="w-[15px] h-[15px] sm:w-4 sm:h-4" style={{ color: on ? "#f59e0b" : "#9ca3af" }} />
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
