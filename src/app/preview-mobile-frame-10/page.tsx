"use client";

import { useState } from "react";
import { Route, Navigation2, X, Search, MapPin } from "lucide-react";

type Variant = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

interface Config {
  label: string;
  /** Смещение пилюли сверху (px) */
  pillTop: number;
  /** Положение пилюли — правый край iframe (8px) или центр */
  pillAlign: "right" | "center";
  /** Ширина панели */
  width: number;
  /** Позиция панели: right — прижата к правому краю пилюли, center — по центру под пилюлей */
  dropAlign: "right" | "center" | "left" | "full";
  /** Отступ от пилюли сверху */
  gap: number;
  /** Дополнительный верхний сдвиг панели (отрицательный — приближает к пилюле) */
  topShift?: number;
}

const VARIANTS: Record<Variant, Config> = {
  A: { label: "Пилюля наверху, панель 260px справа", pillTop: 12, pillAlign: "right", width: 260, dropAlign: "right", gap: 8 },
  B: { label: "Пилюля наверху, панель 220px справа", pillTop: 12, pillAlign: "right", width: 220, dropAlign: "right", gap: 8 },
  C: { label: "Пилюля наверху, панель 200px справа", pillTop: 12, pillAlign: "right", width: 200, dropAlign: "right", gap: 8 },
  D: { label: "Пилюля на уровне фильтров, панель 260px справа", pillTop: 150, pillAlign: "right", width: 260, dropAlign: "right", gap: 8 },
  E: { label: "Пилюля на уровне фильтров, панель 220px справа", pillTop: 150, pillAlign: "right", width: 220, dropAlign: "right", gap: 8 },
  F: { label: "Пилюля на уровне фильтров, панель 200px справа", pillTop: 150, pillAlign: "right", width: 200, dropAlign: "right", gap: 8 },
  G: { label: "Пилюля наверху, панель на всю ширину внизу", pillTop: 12, pillAlign: "right", width: 0, dropAlign: "full", gap: 8 },
  H: { label: "Пилюля наверху, панель 240px прижата вплотную", pillTop: 12, pillAlign: "right", width: 240, dropAlign: "right", gap: 4 },
  I: { label: "Пилюля наверху по центру, панель 240px по центру", pillTop: 12, pillAlign: "center", width: 240, dropAlign: "center", gap: 8 },
  J: { label: "Пилюля на уровне фильтров, панель 240px вплотную", pillTop: 150, pillAlign: "right", width: 240, dropAlign: "right", gap: 4 },
};

export default function Page() {
  const [v, setV] = useState<Variant>("A");
  const cfg = VARIANTS[v];

  // iPhone viewport 375x812, iframe inside takes ~full width
  const VP_W = 375;
  const IFRAME_PAD = 12;
  const iframeRight = VP_W - IFRAME_PAD;
  const iframeLeft = IFRAME_PAD;

  // pill dimensions ~150x32
  const pillWidth = 150;
  const pillLeft =
    cfg.pillAlign === "right"
      ? iframeRight - pillWidth - 4
      : (VP_W - pillWidth) / 2;
  const pillRight = pillLeft + pillWidth;
  const pillBottom = cfg.pillTop + 32;

  // dropdown position
  let dropLeft: number, dropWidth: number;
  if (cfg.dropAlign === "full") {
    dropLeft = iframeLeft;
    dropWidth = iframeRight - iframeLeft;
  } else if (cfg.dropAlign === "right") {
    dropWidth = cfg.width;
    dropLeft = pillRight - dropWidth;
  } else if (cfg.dropAlign === "center") {
    dropWidth = cfg.width;
    dropLeft = (VP_W - dropWidth) / 2;
  } else {
    dropWidth = cfg.width;
    dropLeft = pillLeft;
  }
  // clamp
  dropLeft = Math.max(iframeLeft, Math.min(dropLeft, iframeRight - dropWidth));
  const dropTop = pillBottom + cfg.gap + (cfg.topShift || 0);

  return (
    <div className="min-h-screen bg-gray-900 pt-4 pb-12 px-2">
      {/* Controls */}
      <div className="max-w-sm mx-auto mb-4">
        <div className="flex flex-wrap gap-2 bg-black/60 backdrop-blur-md p-3 rounded-2xl">
          {(Object.keys(VARIANTS) as Variant[]).map((k) => (
            <button
              key={k}
              onClick={() => setV(k)}
              className={`w-9 h-9 rounded-lg text-sm font-bold ${
                v === k
                  ? "bg-emerald-500 text-white"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="text-white text-sm font-bold mt-2 px-1">
          <span className="inline-block bg-emerald-500 text-white px-2 py-0.5 rounded mr-2">
            {v}
          </span>
          {cfg.label}
        </div>
      </div>

      {/* iPhone mock */}
      <div
        className="relative mx-auto bg-white rounded-[40px] overflow-hidden shadow-2xl"
        style={{ width: VP_W, height: 700 }}
      >
        {/* Header mock */}
        <div className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-100">
          <div className="font-black text-lg">Зем+Плюс</div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100" />
            <div className="w-8 h-8 rounded-full bg-gray-100" />
            <div className="w-8 h-8 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Filters row (filters at top, mock) */}
        <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-gradient-to-r from-emerald-400 to-teal-500">
          {["Газ", "Электр.", "Асфальт", "Охрана"].map((f) => (
            <div
              key={f}
              className="flex-shrink-0 h-7 px-2.5 rounded-full bg-white/90 text-[11px] font-bold flex items-center"
            >
              {f}
            </div>
          ))}
        </div>

        {/* Iframe map mock (with legend left + dropdown overlay) */}
        <div
          className="relative bg-[url('/villages/favorit/01.jpg')] bg-cover bg-center"
          style={{ height: 560, margin: IFRAME_PAD }}
        >
          {/* Light overlay so we see markers */}
          <div className="absolute inset-0 bg-white/30" />

          {/* Legend top-left */}
          <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 shadow-lg text-xs font-bold">
            <div className="font-black mb-1">Фаворит</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Свободен</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" />Продан</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Забронирован</div>
            <div className="mt-1 text-[10px] text-gray-500 uppercase">Цена / сотку</div>
            <div className="text-[10px]">490 000 ₽</div>
            <div className="text-[10px]">620 000 ₽</div>
          </div>

          {/* Yandex native Satellite button mock top-right */}
          <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1.5 shadow text-xs font-bold">
            Спутник
          </div>

          {/* Our pill */}
          <div
            className="absolute inline-flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-full bg-black/60 ring-1 ring-white/25 text-white text-xs font-bold backdrop-blur-md shadow-lg"
            style={{ top: cfg.pillTop, left: pillLeft }}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Route className="w-3 h-3 text-white" />
            </span>
            Дорога к мечте
          </div>

          {/* Dropdown panel */}
          <div
            className="absolute rounded-[20px] text-white [&_*]:drop-shadow-[0_2px_4px_rgba(0,0,0,1)] hd-glass-tile"
            style={{
              top: dropTop,
              left: dropLeft,
              width: dropWidth,
              backdropFilter: "blur(1px) saturate(2)",
              WebkitBackdropFilter: "blur(1px) saturate(2)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
              boxShadow:
                "inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -0.5px 0 rgba(255,255,255,0.12), 0 8px 32px -4px rgba(0,0,0,0.25)",
            }}
          >
            <div className="px-3 pt-2.5 pb-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base font-black flex items-center gap-1.5 tracking-tight text-emerald-300">
                  <Route className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                  Дорога к мечте
                </h3>
                <X className="w-3 h-3 text-white flex-shrink-0 mt-1.5" />
              </div>
              <p className="text-xs text-white mt-0.5 font-bold leading-snug mb-2">
                Сколько ехать от вашего дома
              </p>
              <button className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/40">
                <Navigation2 className="w-3.5 h-3.5" /> Моё местоположение
              </button>
              <p className="text-[10px] text-white text-center mt-1 leading-snug font-semibold">
                Координаты не покидают браузер
              </p>
              <div className="text-center my-2">
                <span className="text-[10px] uppercase text-white tracking-[0.15em] font-black">
                  или укажите адрес
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/85" />
                <input
                  type="text"
                  placeholder="Москва, Тверская, 1"
                  className="w-full h-10 pl-8 pr-2.5 rounded-lg bg-white/15 ring-1 ring-white/40 text-[13px] text-white placeholder:text-white/70 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hd-glass-tile::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          padding: 3px;
          background: conic-gradient(
            from 45deg,
            rgba(255,255,255,0.85),
            rgba(180,255,180,0.7),
            rgba(255,255,255,0.6),
            rgba(180,220,255,0.7),
            rgba(255,255,255,0.85),
            rgba(255,200,180,0.7),
            rgba(255,255,255,0.6),
            rgba(200,180,255,0.7),
            rgba(255,255,255,0.85)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
