"use client";

import { useState } from "react";
import {
  X,
  Edit3,
  Home,
  Briefcase,
  RotateCw,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Send,
  MessageCircle,
  Navigation2,
  MapPin,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Clock,
  Ruler,
} from "lucide-react";

type V =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

const LABELS: Record<V, string> = {
  1: "Full-screen, stats BOTTOM — baseline",
  2: "Full-screen, stats TOP",
  3: "Bottom sheet 85% с drag handle",
  4: "Bottom sheet 60% — карта выглядывает",
  5: "Center dialog 80%×80%, rounded-24",
  6: "Right-side drawer (desktop 500px)",
  7: "Split: карта 60% + инфо-панель 40%",
  8: "Floating glass card поверх карты",
  9: "Dark theme (gray-900)",
  10: "Light theme (white)",
  11: "С «Редактировать адрес дома» в header",
  12: "Переключатель Дом / Работа",
  13: "Multi-route — Дом + Работа (2 линии)",
  14: "Loading skeleton",
  15: "Error — не удалось построить",
  16: "Empty — нет сохранённого дома + «Дорога к мечте»",
  17: "Mobile full-screen rounded top (iOS sheet)",
  18: "С turn-by-turn списком снизу",
  19: "Сохранён в избранное (сердце)",
  20: "Share — копировать / Telegram / WhatsApp",
};

// ---------- mock data ----------
const HOME = { label: "Дом", address: "Москва, Тверская, 1", coords: [55.7558, 37.6176] as [number, number] };
const WORK = { label: "Работа", address: "Москва, Пресненская наб., 10", coords: [55.7497, 37.5396] as [number, number] };
const VILLAGE = { name: "Фаворит", coords: [55.3988, 38.1512] as [number, number] };
const ROUTE = { distanceKm: 87, durationMin: 68 };

// 24 точки ломаной — упрощённая трасса Москва → Фаворит
const POLYLINE: [number, number][] = [
  [55.7558, 37.6176],
  [55.7401, 37.6310],
  [55.7240, 37.6490],
  [55.7080, 37.6720],
  [55.6920, 37.6910],
  [55.6760, 37.7080],
  [55.6600, 37.7250],
  [55.6430, 37.7420],
  [55.6260, 37.7600],
  [55.6080, 37.7780],
  [55.5890, 37.7960],
  [55.5700, 37.8140],
  [55.5510, 37.8330],
  [55.5320, 37.8520],
  [55.5130, 37.8720],
  [55.4950, 37.8930],
  [55.4790, 37.9150],
  [55.4640, 37.9390],
  [55.4500, 37.9650],
  [55.4370, 37.9930],
  [55.4250, 38.0230],
  [55.4150, 38.0550],
  [55.4070, 38.0880],
  [55.4020, 38.1200],
  [55.3988, 38.1512],
];

// Для «Работа» — другой путь (сдвиг влево)
const POLYLINE_WORK: [number, number][] = POLYLINE.map(([la, lo], i) => [
  la - 0.003 * Math.sin(i * 0.4),
  lo - 0.020 + 0.012 * Math.cos(i * 0.3),
]);

function durationLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}ч ${m}м` : `${m}м`;
}

// ---------- mock map ----------
function MockMap({
  height = "100%",
  lines = [{ points: POLYLINE, color: "#10b981", width: 4 }],
  showEndpoints = true,
  dark = false,
  className = "",
}: {
  height?: string | number;
  lines?: { points: [number, number][]; color: string; width?: number }[];
  showEndpoints?: boolean;
  dark?: boolean;
  className?: string;
}) {
  // bounding box по всем линиям
  const all = lines.flatMap((l) => l.points);
  const lats = all.map((p) => p[0]);
  const lons = all.map((p) => p[1]);
  const minLa = Math.min(...lats), maxLa = Math.max(...lats);
  const minLo = Math.min(...lons), maxLo = Math.max(...lons);
  const padX = 40, padY = 40;
  const W = 1000, H = 600;
  const project = (la: number, lo: number) => {
    const x = padX + ((lo - minLo) / (maxLo - minLo || 1)) * (W - 2 * padX);
    const y = padY + ((maxLa - la) / (maxLa - minLa || 1)) * (H - 2 * padY);
    return [x, y] as const;
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* фон — фото с тёмным оверлеем, имитирует карту */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/villages/favorit/01.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? "linear-gradient(180deg, rgba(10,20,35,0.85), rgba(10,20,35,0.75))"
            : "linear-gradient(180deg, rgba(20,35,55,0.55), rgba(20,35,55,0.45))",
        }}
      />
      {/* сетка «карты» */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {lines.map((l, idx) => {
          const d = l.points
            .map((p, i) => {
              const [x, y] = project(p[0], p[1]);
              return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <g key={idx}>
              <path d={d} stroke="rgba(0,0,0,0.45)" strokeWidth={(l.width ?? 4) + 4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} stroke={l.color} strokeWidth={l.width ?? 4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>

      {showEndpoints && lines.length > 0 && (
        <>
          {/* Дом — первая точка основной линии */}
          <Pill
            position={projectPercent(lines[0].points[0], lines[0].points)}
            color="blue"
            text={HOME.label}
          />
          {/* Village — последняя точка */}
          <Pill
            position={projectPercent(
              lines[0].points[lines[0].points.length - 1],
              lines[0].points
            )}
            color="green"
            text={VILLAGE.name}
          />
        </>
      )}
    </div>
  );

  function projectPercent(p: [number, number], pts: [number, number][]) {
    const lats2 = pts.map((x) => x[0]);
    const lons2 = pts.map((x) => x[1]);
    const mnLa = Math.min(...lats2), mxLa = Math.max(...lats2);
    const mnLo = Math.min(...lons2), mxLo = Math.max(...lons2);
    const padPct = 0.08;
    const x = padPct + ((p[1] - mnLo) / (mxLo - mnLo || 1)) * (1 - 2 * padPct);
    const y = padPct + ((mxLa - p[0]) / (mxLa - mnLa || 1)) * (1 - 2 * padPct);
    return { left: `${(x * 100).toFixed(1)}%`, top: `${(y * 100).toFixed(1)}%` };
  }
}

function Pill({
  position,
  color,
  text,
}: {
  position: { left: string; top: string };
  color: "blue" | "green";
  text: string;
}) {
  const dot = color === "blue" ? "bg-blue-400" : "bg-emerald-400";
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 ring-1 ring-white/25 text-white text-[11px] font-bold backdrop-blur-md whitespace-nowrap"
      style={{ left: position.left, top: position.top }}
    >
      <span className={`w-2 h-2 rounded-full ${dot} ring-2 ring-white/80`} />
      {text}
    </div>
  );
}

// ---------- stats chip ----------
function StatsRow({ dark = false }: { dark?: boolean }) {
  const base = dark
    ? "bg-white/5 text-white ring-white/10"
    : "bg-white/90 text-gray-900 ring-black/5";
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl ring-1 ${base} backdrop-blur-md`}>
      <div className="flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-emerald-500" />
        <span className="font-bold text-sm">{durationLabel(ROUTE.durationMin)}</span>
      </div>
      <span className={dark ? "text-white/30" : "text-gray-300"}>·</span>
      <div className="flex items-center gap-1.5">
        <Ruler className="w-4 h-4 text-emerald-500" />
        <span className="font-bold text-sm">{ROUTE.distanceKm} км</span>
      </div>
    </div>
  );
}

// ---------- modal variants ----------
function Modal({ v, onClose, isMobile }: { v: V; onClose: () => void; isMobile: boolean }) {
  switch (v) {
    case 1:
      return (
        <Shell onClose={onClose}>
          <Header title="Маршрут до Фаворита" onClose={onClose} />
          <div className="flex-1 relative">
            <MockMap />
          </div>
          <div className="p-4 bg-white border-t border-black/5">
            <StatsRow />
            <CTA className="mt-3">Построить в Яндекс.Картах</CTA>
          </div>
        </Shell>
      );
    case 2:
      return (
        <Shell onClose={onClose}>
          <Header title="Маршрут до Фаворита" onClose={onClose} />
          <div className="p-4 bg-white border-b border-black/5">
            <StatsRow />
          </div>
          <div className="flex-1 relative">
            <MockMap />
          </div>
        </Shell>
      );
    case 3:
      return (
        <SheetShell onClose={onClose} heightPct={85}>
          <DragHandle />
          <Header title="Маршрут до Фаворита" onClose={onClose} />
          <div className="flex-1 relative">
            <MockMap />
          </div>
          <div className="p-4 bg-white border-t border-black/5">
            <StatsRow />
          </div>
        </SheetShell>
      );
    case 4:
      return (
        <SheetShell onClose={onClose} heightPct={60} showMapBehind>
          <DragHandle />
          <Header title="Маршрут" onClose={onClose} />
          <div className="flex-1 relative">
            <MockMap />
          </div>
          <div className="p-4 bg-white border-t border-black/5">
            <StatsRow />
          </div>
        </SheetShell>
      );
    case 5:
      return (
        <CenterShell onClose={onClose}>
          <Header title="Маршрут до Фаворита" onClose={onClose} />
          <div className="flex-1 relative">
            <MockMap />
          </div>
          <div className="p-4 bg-white border-t border-black/5">
            <StatsRow />
          </div>
        </CenterShell>
      );
    case 6:
      return (
        <DrawerShell onClose={onClose} isMobile={isMobile}>
          <Header title="Маршрут до Фаворита" onClose={onClose} />
          <div className="flex-1 relative">
            <MockMap />
          </div>
          <div className="p-4 bg-white border-t border-black/5">
            <StatsRow />
            <CTA className="mt-3">Открыть в Яндекс.Картах</CTA>
          </div>
        </DrawerShell>
      );
    case 7:
      return (
        <Shell onClose={onClose}>
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            <aside className="md:w-2/5 p-4 bg-white md:border-r border-black/5 overflow-y-auto">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-lg font-bold text-gray-900">Маршрут до Фаворита</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <StatsRow />
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <Row icon={<Home className="w-4 h-4 text-blue-500" />} label={HOME.address} />
                <Row icon={<MapPin className="w-4 h-4 text-emerald-500" />} label={`${VILLAGE.name} — посёлок`} />
              </div>
              <CTA className="mt-4">Построить в Яндекс.Картах</CTA>
            </aside>
            <div className="flex-1 relative min-h-[240px]">
              <MockMap />
            </div>
          </div>
        </Shell>
      );
    case 8:
      return (
        <div className="absolute inset-0 bg-black">
          <MockMap height="100%" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 ring-1 ring-white/25 text-white flex items-center justify-center backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute left-1/2 bottom-6 -translate-x-1/2 w-[92%] max-w-md rainbow-border">
            <div className="relative rounded-3xl p-4 bg-white/[0.03] backdrop-blur-[1px] saturate-200 text-white">
              <div className="text-[13px] font-semibold text-emerald-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                Маршрут до Фаворита
              </div>
              <div className="mt-2">
                <StatsRow dark />
              </div>
            </div>
          </div>
        </div>
      );
    case 9:
      return (
        <Shell onClose={onClose} dark>
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">Маршрут до Фаворита</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <MockMap dark />
          </div>
          <div className="p-4 bg-gray-900 border-t border-white/10">
            <StatsRow dark />
          </div>
        </Shell>
      );
    case 10:
      return (
        <Shell onClose={onClose}>
          <Header title="Маршрут до Фаворита" onClose={onClose} />
          <div className="flex-1 relative">
            <MockMap />
          </div>
          <div className="p-4 bg-white border-t border-black/5">
            <StatsRow />
          </div>
        </Shell>
      );
    case 11:
      return (
        <Shell onClose={onClose}>
          <div className="p-4 bg-white border-b border-black/5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Маршрут до Фаворита</h3>
                <button className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  <Edit3 className="w-3.5 h-3.5" />
                  Редактировать адрес дома
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <MockMap />
          </div>
          <div className="p-4 bg-white border-t border-black/5">
            <StatsRow />
          </div>
        </Shell>
      );
    case 12: {
      return <Variant12 onClose={onClose} />;
    }
    case 13:
      return (
        <Shell onClose={onClose}>
          <Header title="Дом · Работа → Фаворит" onClose={onClose} />
          <div className="flex-1 relative">
            <MockMap
              lines={[
                { points: POLYLINE, color: "#10b981", width: 4 },
                { points: POLYLINE_WORK, color: "#3b82f6", width: 4 },
              ]}
              showEndpoints={false}
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 text-white ring-1 ring-white/25 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Дом · 87 км
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 text-white ring-1 ring-white/25 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Работа · 92 км
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border-t border-black/5 flex gap-2">
            <div className="flex-1 rounded-2xl bg-emerald-50 ring-1 ring-emerald-500/30 px-3 py-2">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Дом</div>
              <div className="text-sm font-bold">1ч 8м · 87 км</div>
            </div>
            <div className="flex-1 rounded-2xl bg-blue-50 ring-1 ring-blue-500/30 px-3 py-2">
              <div className="text-[10px] font-bold text-blue-700 uppercase">Работа</div>
              <div className="text-sm font-bold">1ч 15м · 92 км</div>
            </div>
          </div>
        </Shell>
      );
    case 14:
      return (
        <Shell onClose={onClose}>
          <Header title="Строим маршрут…" onClose={onClose} />
          <div className="flex-1 relative bg-gray-100 flex items-center justify-center">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-100" />
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin relative" />
          </div>
          <div className="p-4 bg-white border-t border-black/5 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
          </div>
        </Shell>
      );
    case 15:
      return (
        <Shell onClose={onClose}>
          <Header title="Маршрут" onClose={onClose} />
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
            <div className="text-lg font-bold text-gray-900">Не удалось построить маршрут</div>
            <div className="text-sm text-gray-600 mt-1">Проверьте интернет или попробуйте позже.</div>
            <button className="mt-4 inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">
              <RotateCw className="w-4 h-4" /> Повторить
            </button>
          </div>
        </Shell>
      );
    case 16:
      return (
        <Shell onClose={onClose}>
          <Header title="Маршрут до Фаворита" onClose={onClose} />
          <div className="flex-1 relative">
            <MockMap />
            <div className="absolute inset-0 flex items-end justify-center p-4">
              <div className="w-full max-w-sm rainbow-border">
                <div className="relative rounded-3xl p-4 bg-white/[0.03] backdrop-blur-[1px] saturate-200 text-white">
                  <div className="text-emerald-300 font-bold text-base drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    Дорога к мечте
                  </div>
                  <div className="text-white/90 text-xs mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    Сохраните адрес дома — покажем маршрут
                  </div>
                  <input
                    placeholder="Москва, Тверская, 1"
                    className="mt-3 w-full h-10 rounded-xl bg-white/10 ring-1 ring-white/20 px-3 text-sm placeholder-white/50 text-white"
                  />
                  <button className="mt-2 w-full h-10 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">
                    Сохранить адрес дома
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Shell>
      );
    case 17:
      return (
        <div className="absolute inset-0 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative w-full bg-white rounded-t-[28px] overflow-hidden flex flex-col" style={{ height: "92%" }}>
            <DragHandle />
            <Header title="Маршрут до Фаворита" onClose={onClose} />
            <div className="flex-1 relative">
              <MockMap />
            </div>
            <div className="p-4 bg-white border-t border-black/5 pb-6">
              <StatsRow />
            </div>
          </div>
        </div>
      );
    case 18:
      return (
        <Shell onClose={onClose}>
          <Header title="Маршрут до Фаворита" onClose={onClose} />
          <div className="h-[45%] relative">
            <MockMap />
          </div>
          <div className="flex-1 overflow-y-auto bg-white border-t border-black/5">
            <div className="p-4">
              <StatsRow />
            </div>
            <ul className="px-4 pb-4 space-y-2">
              {[
                ["По Тверской", "0.4 км"],
                ["Направо на Садовое кольцо", "2.1 км"],
                ["По МКАД на юго-восток", "15 км"],
                ["Съезд на М5 «Урал»", "3 км"],
                ["По Каширскому шоссе", "45 км"],
                ["Поворот на Фаворит", "1.5 км"],
              ].map(([t, d], i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 ring-1 ring-black/5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 text-sm font-medium text-gray-800">{t}</div>
                  <div className="text-xs font-bold text-gray-500">{d}</div>
                </li>
              ))}
            </ul>
          </div>
        </Shell>
      );
    case 19:
      return (
        <Shell onClose={onClose}>
          <div className="flex items-center justify-between p-4 border-b border-black/5 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Маршрут до Фаворита</h3>
                <div className="text-[11px] font-semibold text-pink-600">В избранном</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <MockMap />
            <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-emerald-600 fill-emerald-500" />
            </button>
          </div>
          <div className="p-4 bg-white border-t border-black/5">
            <StatsRow />
          </div>
        </Shell>
      );
    case 20:
      return (
        <SheetShell onClose={onClose} heightPct={70}>
          <DragHandle />
          <div className="flex items-center justify-between px-4 pt-2 pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-500" />
              Поделиться маршрутом
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[45%] relative mx-4 rounded-2xl overflow-hidden">
            <MockMap />
          </div>
          <div className="p-4 pt-5 flex-1">
            <StatsRow />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <ShareBtn icon={<Copy className="w-5 h-5" />} label="Копировать" color="bg-gray-100 text-gray-900" />
              <ShareBtn icon={<Send className="w-5 h-5" />} label="Telegram" color="bg-sky-100 text-sky-600" />
              <ShareBtn icon={<MessageCircle className="w-5 h-5" />} label="WhatsApp" color="bg-emerald-100 text-emerald-600" />
            </div>
          </div>
        </SheetShell>
      );
  }
}

function Variant12({ onClose }: { onClose: () => void }) {
  const [src, setSrc] = useState<"home" | "work">("home");
  const pts = src === "home" ? POLYLINE : POLYLINE_WORK;
  const dist = src === "home" ? 87 : 92;
  const dur = src === "home" ? 68 : 75;
  return (
    <Shell onClose={onClose}>
      <div className="p-4 bg-white border-b border-black/5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-900">Маршрут до Фаворита</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="inline-flex p-1 bg-gray-100 rounded-xl">
          {[
            { k: "home" as const, icon: <Home className="w-4 h-4" />, label: "Дом" },
            { k: "work" as const, icon: <Briefcase className="w-4 h-4" />, label: "Работа" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setSrc(t.k)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm font-semibold transition ${
                src === t.k ? "bg-white shadow text-emerald-600" : "text-gray-600"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative">
        <MockMap lines={[{ points: pts, color: src === "home" ? "#10b981" : "#3b82f6", width: 4 }]} />
      </div>
      <div className="p-4 bg-white border-t border-black/5">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl ring-1 ring-black/5 bg-white">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-sm">{durationLabel(dur)}</span>
          </div>
          <span className="text-gray-300">·</span>
          <div className="flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-sm">{dist} км</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ---------- shells ----------
function Shell({ children, dark = false }: { children: React.ReactNode; onClose: () => void; dark?: boolean }) {
  return (
    <div className={`absolute inset-0 flex flex-col ${dark ? "bg-gray-900" : "bg-white"}`}>
      {children}
    </div>
  );
}
function SheetShell({
  children,
  heightPct,
  showMapBehind = false,
  onClose,
}: {
  children: React.ReactNode;
  heightPct: number;
  showMapBehind?: boolean;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-end bg-black/40" onClick={onClose}>
      {showMapBehind && (
        <div className="absolute inset-0">
          <MockMap />
        </div>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-white rounded-t-[24px] overflow-hidden flex flex-col shadow-2xl"
        style={{ height: `${heightPct}%` }}
      >
        {children}
      </div>
    </div>
  );
}
function CenterShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] h-[85%] md:w-4/5 md:h-4/5 bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}
function DrawerShell({
  children,
  onClose,
  isMobile,
}: {
  children: React.ReactNode;
  onClose: () => void;
  isMobile: boolean;
}) {
  return (
    <div className="absolute inset-0 bg-black/40 flex justify-end" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white h-full flex flex-col shadow-2xl"
        style={{ width: isMobile ? "100%" : 500 }}
      >
        {children}
      </div>
    </div>
  );
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-black/5 bg-white">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
function DragHandle() {
  return (
    <div className="pt-2 pb-1 flex justify-center">
      <div className="w-10 h-1 rounded-full bg-gray-300" />
    </div>
  );
}
function CTA({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={`w-full h-11 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 flex items-center justify-center gap-2 ${className}`}>
      <Navigation2 className="w-4 h-4" /> {children}
    </button>
  );
}
function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
      {icon}
      <span>{label}</span>
    </div>
  );
}
function ShareBtn({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <button className={`flex flex-col items-center gap-2 py-3 rounded-2xl ${color} ring-1 ring-black/5 text-sm font-semibold hover:opacity-90`}>
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">{icon}</div>
      {label}
    </button>
  );
}

// ---------- iphone / desktop frames ----------
function IPhoneFrame({ v }: { v: V }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative">
      <div className="text-center text-xs text-white/70 mb-2">iPhone 375×700</div>
      <div
        className="relative rounded-[40px] bg-black p-3 shadow-2xl"
        style={{ width: 375 + 24, height: 700 + 24 }}
      >
        <div className="relative rounded-[32px] overflow-hidden bg-gray-100" style={{ width: 375, height: 700 }}>
          {/* статус-бар */}
          <div className="absolute top-0 inset-x-0 h-9 bg-white flex items-center justify-between px-6 text-[11px] font-bold z-10">
            <span>9:41</span>
            <span>●●● 100%</span>
          </div>
          {/* «сайт» снизу, чтобы модалка поверх имела смысл */}
          <div className="absolute inset-0 pt-9 bg-gradient-to-b from-gray-100 to-gray-200">
            <div className="p-4">
              <div className="h-40 rounded-2xl bg-white shadow" />
              <div className="mt-3 h-4 w-2/3 rounded bg-white shadow-sm" />
              <div className="mt-2 h-4 w-1/2 rounded bg-white shadow-sm" />
              <button
                onClick={() => setOpen(true)}
                className="mt-4 h-10 px-4 rounded-xl bg-emerald-500 text-white font-bold"
              >
                Показать маршрут
              </button>
            </div>
          </div>
          {open && <Modal v={v} onClose={() => setOpen(false)} isMobile={true} />}
        </div>
      </div>
    </div>
  );
}

function DesktopFrame({ v }: { v: V }) {
  const [open, setOpen] = useState(true);
  const scale = 0.5;
  return (
    <div className="relative">
      <div className="text-center text-xs text-white/70 mb-2">Desktop 1280×800 (×0.5)</div>
      <div
        className="relative rounded-xl bg-gray-800 overflow-hidden shadow-2xl"
        style={{ width: 1280 * scale, height: 800 * scale }}
      >
        <div
          className="relative origin-top-left bg-white"
          style={{ width: 1280, height: 800, transform: `scale(${scale})` }}
        >
          <div className="absolute top-0 inset-x-0 h-10 bg-white border-b border-black/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="ml-4 text-xs text-gray-500">zem-plus.ru / village / favorit</div>
          </div>
          <div className="absolute inset-0 pt-10 bg-gradient-to-b from-gray-50 to-gray-100 p-10">
            <div className="h-72 rounded-3xl bg-white shadow" />
            <button
              onClick={() => setOpen(true)}
              className="mt-6 h-12 px-6 rounded-xl bg-emerald-500 text-white font-bold"
            >
              Показать маршрут
            </button>
          </div>
          {open && <Modal v={v} onClose={() => setOpen(false)} isMobile={false} />}
        </div>
      </div>
    </div>
  );
}

// ---------- page ----------
export default function Page() {
  const [v, setV] = useState<V>(1);
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <style>{`
        .rainbow-border { position: relative; }
        .rainbow-border::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: conic-gradient(from 0deg,
            #ef4444, #f59e0b, #eab308, #84cc16, #10b981,
            #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          pointer-events: none;
        }
        .rainbow-border > * {
          border-radius: inherit;
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-3 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm font-bold mb-2">/preview-route-modal-20 — 20 вариантов модалки маршрута</div>
          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>
            {(Array.from({ length: 20 }, (_, i) => (i + 1) as V)).map((n) => (
              <button
                key={n}
                onClick={() => setV(n)}
                className={`h-9 rounded-lg text-sm font-bold transition ${
                  v === n ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-2 text-center text-xs text-emerald-300 font-semibold">
            #{v} — {LABELS[v]}
          </div>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-8 justify-center items-start">
          <IPhoneFrame key={`m-${v}`} v={v} />
          <DesktopFrame key={`d-${v}`} v={v} />
        </div>
      </main>
    </div>
  );
}
