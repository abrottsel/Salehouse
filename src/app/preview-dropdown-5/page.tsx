"use client";

import { useState } from "react";
import { MapPin, Route, Navigation2, X, Search } from "lucide-react";

const PHOTO = "/villages/favorit/01.jpg";

type Variant = "A" | "B" | "C" | "D" | "E";

const VARIANTS: Record<
  Variant,
  { width: number; padLeft: number | "center" | "right"; label: string; scale: number }
> = {
  A: { width: 340, padLeft: 0, label: "Левый край ряда, 340px", scale: 1 },
  B: { width: 340, padLeft: "center", label: "Центр между пилюлями, 340px", scale: 1 },
  C: { width: 280, padLeft: "center", label: "Компакт 280px по центру", scale: 0.9 },
  D: { width: 380, padLeft: "center", label: "Широкий 380px по центру", scale: 1 },
  E: { width: 320, padLeft: 0, label: "320px слева + компакт высота", scale: 0.85 },
};

export default function Page() {
  const [v, setV] = useState<Variant>("B");
  const cfg = VARIANTS[v];

  // Mock: pills row left=16, pill1 ends at ~290, pill2 starts at ~300 ends at ~450
  const rowLeft = 16;
  const pill2Right = 450;
  const rowCenter = (rowLeft + pill2Right) / 2;

  const left =
    cfg.padLeft === "center"
      ? rowCenter - cfg.width / 2
      : rowLeft;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Controls */}
      <div className="fixed top-4 left-4 right-4 z-[200] flex flex-wrap gap-2 bg-black/70 backdrop-blur-md p-3 rounded-2xl">
        {(Object.keys(VARIANTS) as Variant[]).map((k) => (
          <button
            key={k}
            onClick={() => setV(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
              v === k ? "bg-emerald-500 text-white" : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            {k}
          </button>
        ))}
        <div className="text-white text-sm flex items-center ml-2 font-bold">
          {cfg.label}
        </div>
      </div>

      {/* Mock hero */}
      <div className="relative w-full h-screen overflow-hidden">
        <img src={PHOTO} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* Pills row */}
        <div className="absolute top-20 left-0 right-0 px-4 sm:px-8 lg:px-16 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/40 ring-1 ring-white/25 text-white text-[11px] font-bold backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5" />
              Каширское шоссе · 30 км от МКАД
            </div>
            <div className="inline-flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-full bg-black/40 ring-1 ring-white/25 text-white text-[11px] font-bold backdrop-blur-md">
              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Route className="w-3 h-3" />
              </span>
              Дорога к мечте
            </div>
          </div>
        </div>

        {/* Dropdown */}
        <div
          className="absolute text-white rounded-[20px] [&_*]:drop-shadow-[0_2px_4px_rgba(0,0,0,1)] hd-glass-tile"
          style={{
            top: 128,
            left: Math.max(8, left),
            width: cfg.width,
            backdropFilter: "blur(1px) saturate(2)",
            WebkitBackdropFilter: "blur(1px) saturate(2)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
            boxShadow:
              "inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -0.5px 0 rgba(255,255,255,0.12), 0 8px 32px -4px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              padding: `${12 * cfg.scale}px ${16 * cfg.scale}px`,
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <h3
                  className="font-black flex items-center gap-1.5 tracking-tight text-emerald-300"
                  style={{ fontSize: `${18 * cfg.scale}px` }}
                >
                  <Route
                    className="text-emerald-300 flex-shrink-0"
                    style={{ width: 18 * cfg.scale, height: 18 * cfg.scale }}
                  />
                  Дорога к мечте
                </h3>
                <p
                  className="text-white mt-0.5 font-bold leading-snug"
                  style={{ fontSize: `${14 * cfg.scale}px` }}
                >
                  Сколько ехать от вашего дома
                </p>
              </div>
              <button className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/40"
              style={{
                height: 44 * cfg.scale,
                fontSize: `${16 * cfg.scale}px`,
                marginTop: 4 * cfg.scale,
              }}
            >
              <Navigation2 className="w-4 h-4" /> Моё местоположение
            </button>

            <p
              className="text-white text-center font-semibold"
              style={{
                fontSize: `${11 * cfg.scale}px`,
                marginTop: 6 * cfg.scale,
              }}
            >
              Координаты не покидают браузер
            </p>

            <div
              className="text-center"
              style={{ margin: `${10 * cfg.scale}px 0` }}
            >
              <span
                className="uppercase text-white tracking-[0.15em] font-black"
                style={{ fontSize: `${11 * cfg.scale}px` }}
              >
                или укажите адрес
              </span>
            </div>

            <div className="relative">
              <Search
                className="absolute top-1/2 -translate-y-1/2 text-white/85"
                style={{ left: 12, width: 16, height: 16 }}
              />
              <input
                type="text"
                placeholder="Москва, Тверская, 1"
                className="w-full rounded-lg bg-white/15 ring-1 ring-white/40 text-white placeholder:text-white/70 font-bold"
                style={{
                  height: 44 * cfg.scale,
                  paddingLeft: 36,
                  paddingRight: 12,
                  fontSize: `${14 * cfg.scale}px`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Title — to check overlap */}
        <div className="absolute bottom-20 left-0 right-0 px-4 sm:px-8 lg:px-16">
          <h1 className="text-5xl sm:text-7xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Фаворит
          </h1>
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
