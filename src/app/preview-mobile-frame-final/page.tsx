"use client";

import { useState } from "react";
import { Route, Navigation2, X, Search } from "lucide-react";

type Variant = "U" | "V" | "W" | "X" | "Y" | "Z";

interface Config {
  label: string;
  /** Ширина панели */
  width: number;
  /** Отступ пилюли сверху относительно iframe */
  pillTop: number;
  /** Короткий ли текст в пилюле */
  shortPill: boolean;
  /** Сдвиг панели влево (положительный = влево) */
  leftNudge?: number;
}

/** Общая основа для всех U-Z: пилюля прижата ВПЛОТНУЮ к правому краю (под Спутник),
    панель right-aligned под пилюлей, одинаковый компакт-шрифт 0.85x.
    Отличие — ширина панели и короткий/длинный текст пилюли. */
const VARIANTS: Record<Variant, Config> = {
  U: { label: "Панель 200px, пилюля «Дорога к мечте»", width: 200, pillTop: 48, shortPill: false },
  V: { label: "Панель 210px, пилюля «Дорога к мечте»", width: 210, pillTop: 48, shortPill: false },
  W: { label: "Панель 220px, пилюля «Дорога к мечте»", width: 220, pillTop: 48, shortPill: false },
  X: { label: "Панель 220px, пилюля короче «К мечте»", width: 220, pillTop: 48, shortPill: true },
  Y: { label: "Панель 230px, пилюля «К мечте»", width: 230, pillTop: 48, shortPill: true },
  Z: { label: "Панель 195px, сдвиг 16px влево (~4мм)", width: 195, pillTop: 38, shortPill: false, leftNudge: 16 },
};

export default function Page() {
  const [v, setV] = useState<Variant>("V");
  const cfg = VARIANTS[v];
  const scale = 0.85;

  const VP_W = 375;
  const IFRAME_PAD = 12;
  const iframeRight = VP_W - IFRAME_PAD;
  const iframeLeft = IFRAME_PAD;

  // pill — прижата к правому краю iframe
  const pillText = cfg.shortPill ? "К мечте" : "Дорога к мечте";
  const pillTextWidth = cfg.shortPill ? 60 : 110;
  const pillWidth = pillTextWidth + 26;
  const pillH = 30;
  const pillRight = iframeRight - 3; // ровно под Спутник (right-3)
  const pillLeft = pillRight - pillWidth;
  const pillBottom = cfg.pillTop + pillH;

  // dropdown — right-aligned к пилюле, ширина по cfg.width
  const dropWidth = cfg.width;
  let dropLeft = pillRight - dropWidth - (cfg.leftNudge ?? 0);
  dropLeft = Math.max(iframeLeft + 2, dropLeft);
  const dropTop = pillBottom + 6;

  const pad = 12 * scale;
  const titleSize = 15 * scale;
  const subSize = 11 * scale;
  const btnH = 40 * scale;
  const btnFont = 13 * scale;
  const smallSize = 10 * scale;
  const inpH = 38 * scale;
  const inpFont = 12 * scale;

  return (
    <div className="min-h-screen bg-gray-900 pt-4 pb-12 px-2">
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

      <div
        className="relative mx-auto bg-white rounded-[40px] overflow-hidden shadow-2xl"
        style={{ width: VP_W, height: 700 }}
      >
        <div className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-100">
          <div className="font-black text-lg">Зем+Плюс</div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100" />
            <div className="w-8 h-8 rounded-full bg-emerald-500" />
          </div>
        </div>

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

        <div
          className="relative bg-[url('/villages/favorit/01.jpg')] bg-cover bg-center"
          style={{ height: 560, margin: IFRAME_PAD }}
        >
          <div className="absolute inset-0 bg-white/25" />

          {/* Legend */}
          <div
            className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 shadow-lg text-xs font-bold"
            style={{ width: 140 }}
          >
            <div className="font-black mb-1">Фаворит</div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Свободен
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Продан
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Забронирован
            </div>
            <div className="mt-1 text-[10px] text-gray-500 uppercase">Цена / сотку</div>
            <div className="text-[10px]">490 000 ₽</div>
            <div className="text-[10px]">620 000 ₽</div>
          </div>

          {/* Спутник native */}
          <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1.5 shadow text-xs font-bold">
            Спутник
          </div>

          {/* Pill — right-aligned под Спутник */}
          <div
            className="absolute inline-flex items-center gap-1.5 rounded-full bg-black/60 ring-1 ring-white/25 text-white font-bold backdrop-blur-md shadow-lg whitespace-nowrap"
            style={{
              top: cfg.pillTop,
              left: pillLeft,
              height: pillH,
              paddingLeft: 8,
              paddingRight: 10,
              fontSize: 11,
            }}
          >
            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Route className="w-2.5 h-2.5 text-white" />
            </span>
            {pillText}
          </div>

          {/* Dropdown */}
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
            <div style={{ padding: `${pad}px ${pad}px` }}>
              <div className="flex items-start justify-between gap-2" style={{ marginBottom: 4 }}>
                <h3
                  className="font-black flex items-center gap-1.5 tracking-tight text-emerald-300"
                  style={{ fontSize: titleSize }}
                >
                  <Route
                    className="text-emerald-300 flex-shrink-0"
                    style={{ width: titleSize, height: titleSize }}
                  />
                  Дорога к мечте
                </h3>
                <X className="text-white flex-shrink-0" style={{ width: 10, height: 10, marginTop: 4 }} />
              </div>
              <p
                className="text-white font-bold leading-snug"
                style={{ fontSize: subSize, marginBottom: 8 }}
              >
                Сколько ехать от вашего дома
              </p>
              <button
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/40"
                style={{ height: btnH, fontSize: btnFont }}
              >
                <Navigation2 style={{ width: btnFont, height: btnFont }} />
                Моё местоположение
              </button>
              <p
                className="text-white text-center leading-snug font-semibold"
                style={{ fontSize: smallSize, marginTop: 4 }}
              >
                Координаты не покидают браузер
              </p>
              <div className="text-center" style={{ margin: `${8 * scale}px 0` }}>
                <span
                  className="uppercase text-white tracking-[0.15em] font-black"
                  style={{ fontSize: smallSize }}
                >
                  или укажите адрес
                </span>
              </div>
              <div className="relative">
                <Search
                  className="absolute top-1/2 -translate-y-1/2 text-white/85"
                  style={{ left: 10, width: 14, height: 14 }}
                />
                <input
                  type="text"
                  placeholder="Москва, Тверская, 1"
                  className="w-full rounded-lg bg-white/15 ring-1 ring-white/40 text-white placeholder:text-white/70 font-bold"
                  style={{
                    height: inpH,
                    paddingLeft: 30,
                    paddingRight: 8,
                    fontSize: inpFont,
                  }}
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
