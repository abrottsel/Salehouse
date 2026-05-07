"use client";

import React, { useState } from "react";
import {
  MapPin,
  Ruler,
  Wallet,
  RotateCcw,
  ChevronDown,
  TreePine,
  SlidersHorizontal,
  Filter,
  Check,
} from "lucide-react";

/* ─── shared demo data ─── */
const DIRS = ["Все", "Каширское", "Симферопольское", "Дмитровское", "Новорижское"];

/* ─── shell wrapper for each variant ─── */
function VariantShell({
  n,
  title,
  desc,
  children,
  bg = "bg-gray-50",
}: {
  n: number;
  title: string;
  desc: string;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-5xl font-black text-gray-100 tabular-nums select-none leading-none">
          {String(n).padStart(2, "0")}
        </span>
        <div>
          <h2 className="text-base font-extrabold text-gray-900">{title}</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className={`rounded-2xl border border-gray-100 shadow-sm ${bg} px-4 py-4 overflow-x-auto`}>
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V1 — Пилюли+
   Текущий стиль, доведённый: rounded-full, мягкий
   emerald active, subtle border, compact h-9
   ════════════════════════════════════════════════ */
function V1() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);
  const any = dir !== "Все" || priceOn || areaOn;

  const chip = (active: boolean) =>
    `inline-flex items-center h-9 rounded-full border text-xs font-semibold px-3.5 gap-1.5 cursor-pointer select-none transition-all duration-150 ${
      active
        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={chip(dir !== "Все")} onClick={() => setDir(dir === "Все" ? "Каширское" : "Все")}>
        <span className={`text-[10px] font-normal ${dir !== "Все" ? "text-emerald-500" : "text-gray-400"}`}>
          Направление:
        </span>
        <span>{dir === "Все" ? "Любое" : dir}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-40" />
      </div>
      <div className={chip(priceOn)} onClick={() => setPriceOn(!priceOn)}>
        <span className={`text-[10px] font-normal ${priceOn ? "text-emerald-500" : "text-gray-400"}`}>Цена:</span>
        <span>{priceOn ? "1–3 млн ₽" : "Любая"}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-40" />
      </div>
      <div className={chip(areaOn)} onClick={() => setAreaOn(!areaOn)}>
        <span className={`text-[10px] font-normal ${areaOn ? "text-emerald-500" : "text-gray-400"}`}>Площадь:</span>
        <span>{areaOn ? "5–25 соток" : "Любая"}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-40" />
      </div>
      {any && (
        <button
          className="inline-flex items-center gap-1 h-9 px-3 rounded-full text-xs font-medium text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          onClick={() => { setDir("Все"); setPriceOn(false); setAreaOn(false); }}
        >
          <RotateCcw className="w-3 h-3" /> Сброс
        </button>
      )}
      <div className="ml-auto inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-500/30">
        <span className="font-extrabold tabular-nums">12</span> посёлков
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V2 — Цветные теги
   Каждое направление — пастельный цвет. Active = заливка.
   Вдохновлено референсом.
   ════════════════════════════════════════════════ */
const CMAP: Record<string, { rest: string; on: string }> = {
  "Все":             { rest: "bg-gray-100 text-gray-600 ring-1 ring-gray-200/80",          on: "bg-gray-600 text-white" },
  "Каширское":       { rest: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/80",           on: "bg-rose-500 text-white" },
  "Симферопольское": { rest: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/80",     on: "bg-violet-600 text-white" },
  "Дмитровское":     { rest: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/80",              on: "bg-sky-500 text-white" },
  "Новорижское":     { rest: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",        on: "bg-amber-500 text-white" },
};

function V2() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);

  return (
    <div className="space-y-2">
      {/* Direction: colored tags row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mr-0.5 shrink-0">
          Шоссе:
        </span>
        {DIRS.map((d) => (
          <button
            key={d}
            className={`h-7 px-3 rounded-full text-[11px] font-bold transition-all duration-150 ${dir === d ? CMAP[d].on : CMAP[d].rest}`}
            onClick={() => setDir(d)}
          >
            {d.replace(" шоссе", "")}
          </button>
        ))}
      </div>
      {/* Range row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          className={`inline-flex items-center h-8 rounded-full border text-[11px] font-semibold px-3 gap-1.5 transition-all ${priceOn ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
          onClick={() => setPriceOn(!priceOn)}
        >
          <Wallet className="w-3 h-3" />
          {priceOn ? "1–3 млн ₽" : "Цена"}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        <button
          className={`inline-flex items-center h-8 rounded-full border text-[11px] font-semibold px-3 gap-1.5 transition-all ${areaOn ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
          onClick={() => setAreaOn(!areaOn)}
        >
          <Ruler className="w-3 h-3" />
          {areaOn ? "5–25 соток" : "Площадь"}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        <div className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-sm shadow-emerald-500/25">
          12 посёлков
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V3 — Сегмент
   iOS segmented control для направлений + pill-чипы
   ════════════════════════════════════════════════ */
function V3() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Segmented */}
      <div className="inline-flex items-center bg-gray-100 rounded-[14px] p-[3px] gap-0 shrink-0">
        {DIRS.map((d) => (
          <button
            key={d}
            className={`h-[30px] px-2.5 rounded-[11px] text-[11px] font-bold whitespace-nowrap transition-all duration-150 ${
              dir === d ? "bg-white text-emerald-700 shadow-sm shadow-black/10" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setDir(d)}
          >
            {d.replace(" шоссе", "")}
          </button>
        ))}
      </div>
      {/* Range chips */}
      <button
        className={`inline-flex items-center h-9 rounded-full border text-xs font-semibold px-3.5 gap-1.5 transition-all ${priceOn ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
        onClick={() => setPriceOn(!priceOn)}
      >
        <Wallet className="w-3.5 h-3.5 opacity-70" />
        {priceOn ? "1–3 млн ₽" : "Цена"}
        <ChevronDown className="w-3 h-3 opacity-40" />
      </button>
      <button
        className={`inline-flex items-center h-9 rounded-full border text-xs font-semibold px-3.5 gap-1.5 transition-all ${areaOn ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
        onClick={() => setAreaOn(!areaOn)}
      >
        <Ruler className="w-3.5 h-3.5 opacity-70" />
        {areaOn ? "5–25 соток" : "Площадь"}
        <ChevronDown className="w-3 h-3 opacity-40" />
      </button>
      <div className="ml-auto inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-sm shadow-emerald-500/25">
        12 посёлков
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V4 — Стекло
   Frosted dark-emerald bar, все элементы внутри
   ════════════════════════════════════════════════ */
function V4() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);
  const any = dir !== "Все" || priceOn || areaOn;

  const btn = (active: boolean) =>
    `inline-flex items-center h-8 rounded-full text-[11px] font-semibold px-3.5 gap-1.5 cursor-pointer transition-all duration-150 ${
      active ? "bg-white text-emerald-800 shadow-sm" : "bg-white/12 text-white/85 hover:bg-white/20"
    }`;

  return (
    <div
      className="relative flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(6,78,59,0.90) 0%, rgba(4,120,87,0.82) 100%)",
        backdropFilter: "blur(10px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 20px -4px rgba(4,120,87,0.5)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className={btn(dir !== "Все")} onClick={() => setDir(dir === "Все" ? "Каширское" : "Все")}>
        <MapPin className="w-3 h-3" />
        {dir === "Все" ? "Направление" : dir}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </div>
      <div className={btn(priceOn)} onClick={() => setPriceOn(!priceOn)}>
        <Wallet className="w-3 h-3" />
        {priceOn ? "1–3 млн ₽" : "Цена"}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </div>
      <div className={btn(areaOn)} onClick={() => setAreaOn(!areaOn)}>
        <Ruler className="w-3 h-3" />
        {areaOn ? "5–25 соток" : "Площадь"}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </div>
      {any && (
        <button
          className="h-8 px-2.5 rounded-full text-[11px] font-medium text-white/50 hover:text-white/80 transition-colors"
          onClick={() => { setDir("Все"); setPriceOn(false); setAreaOn(false); }}
        >
          Сброс
        </button>
      )}
      <div className="ml-auto inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white/15 text-white text-[11px] font-bold ring-1 ring-white/25">
        12 посёлков
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V5 — Минимум
   Ultra-flat: текст + зелёная черта снизу
   ════════════════════════════════════════════════ */
function V5() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);

  const tab = (active: boolean) =>
    `relative text-xs font-semibold pb-2 transition-colors whitespace-nowrap ${
      active ? "text-emerald-700" : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-4 pb-0 border-b border-gray-200">
      {DIRS.map((d) => (
        <button key={d} className={tab(dir === d)} onClick={() => setDir(d)}>
          {d.replace(" шоссе", "")}
          {dir === d && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-emerald-500" />}
        </button>
      ))}
      <div className="w-px h-4 bg-gray-200 self-center shrink-0" />
      <button
        className={`${tab(priceOn)} inline-flex items-center gap-1`}
        onClick={() => setPriceOn(!priceOn)}
      >
        {priceOn ? "1–3 млн ₽" : "Цена"}
        <ChevronDown className="w-3 h-3" />
        {priceOn && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-emerald-500" />}
      </button>
      <button
        className={`${tab(areaOn)} inline-flex items-center gap-1`}
        onClick={() => setAreaOn(!areaOn)}
      >
        {areaOn ? "5–25 соток" : "Площадь"}
        <ChevronDown className="w-3 h-3" />
        {areaOn && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-emerald-500" />}
      </button>
      <div className="ml-auto pb-2 text-xs font-bold text-emerald-700 tabular-nums">12 посёлков</div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V6 — Жирный акцент
   Active = solid emerald fill, inactive = ghost outline
   ════════════════════════════════════════════════ */
function V6() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);
  const any = dir !== "Все" || priceOn || areaOn;

  const chip = (active: boolean, content: React.ReactNode) => (
    <button
      className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold transition-all duration-150 ${
        active
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
          : "bg-white ring-1 ring-gray-200 text-gray-600 hover:ring-emerald-300 hover:text-emerald-700"
      }`}
    >
      {content}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div onClick={() => setDir(dir === "Все" ? "Каширское" : "Все")}>
        {chip(dir !== "Все", dir === "Все" ? "Направление" : `${dir} ×`)}
      </div>
      <div onClick={() => setPriceOn(!priceOn)}>
        {chip(priceOn, priceOn ? "1–3 млн ₽ ×" : <><Wallet className="w-3.5 h-3.5" /> Цена</>)}
      </div>
      <div onClick={() => setAreaOn(!areaOn)}>
        {chip(areaOn, areaOn ? "5–25 соток ×" : <><Ruler className="w-3.5 h-3.5" /> Площадь</>)}
      </div>
      {any && (
        <button
          className="h-9 px-3 rounded-full text-xs font-semibold text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          onClick={() => { setDir("Все"); setPriceOn(false); setAreaOn(false); }}
        >
          Сброс
        </button>
      )}
      <div className="ml-auto inline-flex items-center h-9 px-4 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 tabular-nums">
        12 посёлков
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V7 — Иконки
   Цветной иконочный значок внутри чипа
   ════════════════════════════════════════════════ */
function V7() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={`inline-flex items-center h-9 rounded-2xl border text-xs font-semibold pl-1.5 pr-3.5 gap-2 transition-all ${dir !== "Все" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"}`}
        onClick={() => setDir(dir === "Все" ? "Каширское" : "Все")}
      >
        <span className="w-6 h-6 rounded-[10px] bg-emerald-500 flex items-center justify-center shadow-sm shrink-0">
          <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </span>
        {dir === "Все" ? "Направление" : dir}
        <ChevronDown className="w-3 h-3 opacity-40" />
      </button>
      <button
        className={`inline-flex items-center h-9 rounded-2xl border text-xs font-semibold pl-1.5 pr-3.5 gap-2 transition-all ${priceOn ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"}`}
        onClick={() => setPriceOn(!priceOn)}
      >
        <span className="w-6 h-6 rounded-[10px] bg-amber-500 flex items-center justify-center shadow-sm shrink-0">
          <Wallet className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </span>
        {priceOn ? "1–3 млн ₽" : "Цена"}
        <ChevronDown className="w-3 h-3 opacity-40" />
      </button>
      <button
        className={`inline-flex items-center h-9 rounded-2xl border text-xs font-semibold pl-1.5 pr-3.5 gap-2 transition-all ${areaOn ? "bg-sky-50 border-sky-200 text-sky-800" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"}`}
        onClick={() => setAreaOn(!areaOn)}
      >
        <span className="w-6 h-6 rounded-[10px] bg-sky-500 flex items-center justify-center shadow-sm shrink-0">
          <Ruler className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </span>
        {areaOn ? "5–25 соток" : "Площадь"}
        <ChevronDown className="w-3 h-3 opacity-40" />
      </button>
      <div className="ml-auto inline-flex items-center gap-1.5 h-9 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-sm shadow-emerald-500/25">
        <TreePine className="w-3.5 h-3.5" />
        12 посёлков
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V8 — Инлайн
   Всё в одной строке внутри rounded-2xl контейнера
   ════════════════════════════════════════════════ */
function V8() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);

  return (
    <div className="flex items-center bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm px-2.5 py-1.5 gap-0 overflow-x-auto">
      <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-2.5" />
      {DIRS.map((d) => (
        <button
          key={d}
          className={`h-7 px-2.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
            dir === d ? "bg-emerald-100 text-emerald-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
          onClick={() => setDir(d)}
        >
          {d.replace(" шоссе", "")}
        </button>
      ))}
      <div className="w-px h-4 bg-gray-200 mx-2 shrink-0" />
      <button
        className={`inline-flex items-center h-7 px-2.5 rounded-xl text-[11px] font-semibold gap-1 whitespace-nowrap transition-all ${priceOn ? "bg-emerald-100 text-emerald-700" : "text-gray-500 hover:bg-gray-50"}`}
        onClick={() => setPriceOn(!priceOn)}
      >
        <Wallet className="w-3 h-3" />
        {priceOn ? "1–3 млн" : "Цена"}
      </button>
      <button
        className={`inline-flex items-center h-7 px-2.5 rounded-xl text-[11px] font-semibold gap-1 whitespace-nowrap transition-all ${areaOn ? "bg-emerald-100 text-emerald-700" : "text-gray-500 hover:bg-gray-50"}`}
        onClick={() => setAreaOn(!areaOn)}
      >
        <Ruler className="w-3 h-3" />
        {areaOn ? "5–25 сот." : "Площадь"}
      </button>
      <div className="ml-3 shrink-0 inline-flex items-center h-7 px-3 rounded-xl bg-emerald-500 text-white text-[11px] font-bold">
        12
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V9 — Тёмный
   Charcoal фон, белые и emerald акценты
   ════════════════════════════════════════════════ */
function V9() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);
  const any = dir !== "Все" || priceOn || areaOn;

  const btn = (active: boolean) =>
    `inline-flex items-center h-8 rounded-full text-[11px] font-semibold px-3.5 gap-1.5 transition-all duration-150 ${
      active ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/40" : "bg-white/10 text-white/75 hover:bg-white/16"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2 bg-gray-900 rounded-2xl px-4 py-3">
      <div className={btn(dir !== "Все")} onClick={() => setDir(dir === "Все" ? "Каширское" : "Все")} style={{cursor:"pointer"}}>
        <MapPin className="w-3 h-3" />
        {dir === "Все" ? "Направление" : dir}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </div>
      <div className={btn(priceOn)} onClick={() => setPriceOn(!priceOn)} style={{cursor:"pointer"}}>
        <Wallet className="w-3 h-3" />
        {priceOn ? "1–3 млн ₽" : "Цена"}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </div>
      <div className={btn(areaOn)} onClick={() => setAreaOn(!areaOn)} style={{cursor:"pointer"}}>
        <Ruler className="w-3 h-3" />
        {areaOn ? "5–25 соток" : "Площадь"}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </div>
      {any && (
        <button
          className="h-8 px-3 rounded-full text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors"
          onClick={() => { setDir("Все"); setPriceOn(false); setAreaOn(false); }}
        >
          Сброс
        </button>
      )}
      <div className="ml-auto text-[11px] font-bold text-emerald-400 tabular-nums">
        12 посёлков →
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   V10 — Каскад
   Первый ряд — крупные direction-теги с градиентом
   Второй ряд — компактные range-чипы с input-стилем
   ════════════════════════════════════════════════ */
function V10() {
  const [dir, setDir] = useState("Все");
  const [priceOn, setPriceOn] = useState(false);
  const [areaOn, setAreaOn] = useState(false);

  return (
    <div className="space-y-2">
      {/* Row 1: direction */}
      <div className="flex flex-wrap items-center gap-1.5">
        {DIRS.map((d) => (
          <button
            key={d}
            className={`h-8 px-3.5 rounded-xl text-xs font-bold transition-all duration-150 ${
              dir === d
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-emerald-300 hover:text-emerald-700"
            }`}
            onClick={() => setDir(d)}
          >
            {d.replace(" шоссе", "")}
          </button>
        ))}
      </div>
      {/* Row 2: range + count */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          className={`inline-flex items-center h-8 rounded-xl text-[11px] font-semibold px-3 gap-1.5 border transition-all ${priceOn ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
          onClick={() => setPriceOn(!priceOn)}
        >
          <Wallet className="w-3 h-3" />
          {priceOn ? "1–3 млн ₽" : "Цена, ₽"}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
        <button
          className={`inline-flex items-center h-8 rounded-xl text-[11px] font-semibold px-3 gap-1.5 border transition-all ${areaOn ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
          onClick={() => setAreaOn(!areaOn)}
        >
          <Ruler className="w-3 h-3" />
          {areaOn ? "5–25 соток" : "Площадь"}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
        {(dir !== "Все" || priceOn || areaOn) && (
          <button
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-xl text-[11px] text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            onClick={() => { setDir("Все"); setPriceOn(false); setAreaOn(false); }}
          >
            <RotateCcw className="w-3 h-3" /> Сброс
          </button>
        )}
        <div className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-500 text-white text-[11px] font-bold shadow-sm shadow-emerald-500/25">
          12 посёлков
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════ */
export default function PreviewFilters() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
            <Filter className="w-3.5 h-3.5" />
            Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            10 вариантов фильтра
          </h1>
          <p className="text-sm text-gray-500">
            Кликай на элементы — увидишь активное состояние
          </p>
        </div>

        <VariantShell
          n={1}
          title="Пилюли+"
          desc="Текущий стиль: rounded-full, мягкий emerald active, label:value внутри чипа"
        >
          <V1 />
        </VariantShell>

        <VariantShell
          n={2}
          title="Цветные теги"
          desc="Каждое направление — своя пастельная метка. Вдохновлено референсом."
        >
          <V2 />
        </VariantShell>

        <VariantShell
          n={3}
          title="Сегмент"
          desc="iOS-style segmented control для направлений + pill-чипы для диапазонов"
        >
          <V3 />
        </VariantShell>

        <VariantShell
          n={4}
          title="Стекло"
          desc="Тёмная изумрудная стеклянная панель, все чипы внутри — glass morphism"
          bg="bg-emerald-900/5"
        >
          <V4 />
        </VariantShell>

        <VariantShell
          n={5}
          title="Минимум"
          desc="Ultra-flat: текстовые вкладки с зелёной чертой снизу, без бордеров и теней"
        >
          <V5 />
        </VariantShell>

        <VariantShell
          n={6}
          title="Жирный акцент"
          desc="Active = solid emerald fill + white text. Inactive = ghost outline. Контрастный выбор."
        >
          <V6 />
        </VariantShell>

        <VariantShell
          n={7}
          title="Иконки"
          desc="Цветной иконочный значок (rounded-[10px]) внутри каждого чипа, разные акценты"
        >
          <V7 />
        </VariantShell>

        <VariantShell
          n={8}
          title="Инлайн"
          desc="Все фильтры в одной строке внутри единого rounded-2xl контейнера"
        >
          <V8 />
        </VariantShell>

        <VariantShell
          n={9}
          title="Тёмный"
          desc="Charcoal фон, белые ghost-чипы, emerald active — для тёмных секций сайта"
          bg="bg-gray-800"
        >
          <V9 />
        </VariantShell>

        <VariantShell
          n={10}
          title="Каскад"
          desc="Ряд 1: крупные gradient direction-теги. Ряд 2: компактные range-чипы."
        >
          <V10 />
        </VariantShell>
      </div>
    </main>
  );
}
