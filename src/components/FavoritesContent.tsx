"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Heart,
  Trash2,
  MapPin,
  Ruler,
  ArrowRight,
  Phone,
  X,
  Sparkles,
} from "lucide-react";
import { useFavorites } from "./FavoritesProvider";
import { villages } from "@/lib/data";
import type { Village } from "@/lib/data";
import type { FavoritePlot } from "@/lib/favorites";

type Tab = "all" | "villages" | "plots";

const villageBySlug: Record<string, Village> = Object.fromEntries(
  villages.map((v) => [v.slug, v])
);

function formatRub(n: number): string {
  return `${n.toLocaleString("ru-RU")} \u20BD`;
}

export default function FavoritesContent() {
  const fav = useFavorites();
  const [tab, setTab] = useState<Tab>("all");

  const favoriteVillages = useMemo(
    () =>
      fav.villages
        .map((v) => villageBySlug[v.slug])
        .filter((v): v is Village => Boolean(v))
        .sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [fav.villages]
  );

  const favoritePlots = useMemo(
    () =>
      [...fav.plots].sort(
        (a, b) => b.addedAt - a.addedAt
      ),
    [fav.plots]
  );

  // SSR-safe: until hydrated, show neutral skeleton (we don't know the count)
  if (!fav.hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 w-64 bg-gray-200 rounded-2xl animate-pulse mb-6" />
        <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (fav.count === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Header
        villageCount={fav.villageCount}
        plotCount={fav.plotCount}
        onClear={fav.clearAll}
      />

      <Tabs tab={tab} setTab={setTab} fav={fav} />

      <div className="space-y-12">
        {(tab === "all" || tab === "villages") && favoriteVillages.length > 0 && (
          <section>
            <SectionTitle
              title="Посёлки"
              count={favoriteVillages.length}
              icon="house"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoriteVillages.map((village) => (
                <VillageCard
                  key={village.slug}
                  village={village}
                  onRemove={() => fav.removeVillage(village.slug)}
                />
              ))}
            </div>
          </section>
        )}

        {(tab === "all" || tab === "plots") && favoritePlots.length > 0 && (
          <section>
            <SectionTitle
              title="Участки"
              count={favoritePlots.length}
              icon="plot"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoritePlots.map((plot) => (
                <PlotCard
                  key={`${plot.villageSlug}::${plot.plotNumber}`}
                  plot={plot}
                  onRemove={() => fav.removePlot(plot.villageSlug, plot.plotNumber)}
                />
              ))}
            </div>
          </section>
        )}

        {tab === "villages" && favoriteVillages.length === 0 && (
          <EmptyTab kind="villages" />
        )}
        {tab === "plots" && favoritePlots.length === 0 && (
          <EmptyTab kind="plots" />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────── header ───────────────────────────── */

function Header({
  villageCount,
  plotCount,
  onClear,
}: {
  villageCount: number;
  plotCount: number;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">
          <Heart className="w-4 h-4 fill-rose-500" />
          Ваше избранное
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {villageCount + plotCount} объектов сохранено
        </h1>
        <p className="text-gray-600">
          {villageCount > 0 && `${villageCount} посёлков`}
          {villageCount > 0 && plotCount > 0 && " · "}
          {plotCount > 0 && `${plotCount} участков`}
        </p>
      </div>
      <button
        onClick={() => {
          if (confirm("Очистить всё избранное?")) onClear();
        }}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 self-start sm:self-end"
      >
        <Trash2 className="w-4 h-4" />
        Очистить всё
      </button>
    </div>
  );
}

/* ────────────────────────────── tabs ─────────────────────────────── */

function Tabs({
  tab,
  setTab,
  fav,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  fav: { count: number; villageCount: number; plotCount: number };
}) {
  const items: { value: Tab; label: string; count: number }[] = [
    { value: "all", label: "Всё", count: fav.count },
    { value: "villages", label: "Посёлки", count: fav.villageCount },
    { value: "plots", label: "Участки", count: fav.plotCount },
  ];

  return (
    <div className="inline-flex items-center bg-white rounded-2xl p-1.5 border border-gray-200 shadow-sm mb-8">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => setTab(item.value)}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === item.value
              ? "bg-green-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {item.label}
          <span
            className={`inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
              tab === item.value
                ? "bg-white/20 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {item.count}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── section title ───────────────────────── */

function SectionTitle({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: "house" | "plot";
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <span className="w-1 h-6 bg-green-600 rounded-full" />
        {title}
        <span className="text-sm font-medium text-gray-400">{count}</span>
      </h2>
    </div>
  );
}

/* ────────────────────────── village card ─────────────────────────── */

function VillageCard({
  village,
  onRemove,
}: {
  village: Village;
  onRemove: () => void;
}) {
  const photo = village.photos[0];
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative">
      <a
        href={`/village/${village.slug}`}
        className="block aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-green-100 to-emerald-200"
      >
        {photo ? (
          <Image
            src={photo}
            alt={village.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : null}
      </a>

      <button
        onClick={onRemove}
        aria-label="Убрать из избранного"
        className="absolute top-3 right-3 w-9 h-9 bg-white/95 hover:bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shadow-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-5">
        <a
          href={`/village/${village.slug}`}
          className="text-lg font-bold text-gray-900 hover:text-green-700 transition-colors block mb-1"
        >
          {village.name}
        </a>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {village.direction}, {village.distance} км от МКАД
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              от
            </div>
            <div className="text-lg font-extrabold text-green-600">
              {formatRub(village.priceFrom)}
            </div>
            <div className="text-[10px] text-gray-400">за сотку</div>
          </div>
          <a
            href={`/village/${village.slug}`}
            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            Подробнее
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── plot card ─────────────────────────── */

function PlotCard({
  plot,
  onRemove,
}: {
  plot: FavoritePlot;
  onRemove: () => void;
}) {
  const statusColor =
    plot.status === "Свободен" || plot.status === "Свободный"
      ? "bg-green-100 text-green-700"
      : plot.status === "Бронь" || plot.status === "Забронирован"
      ? "bg-amber-100 text-amber-700"
      : plot.status === "Продан" || plot.status === "Продано"
      ? "bg-gray-100 text-gray-500"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 p-5 relative">
      <button
        onClick={onRemove}
        aria-label="Убрать из избранного"
        className="absolute top-4 right-4 w-9 h-9 bg-gray-50 hover:bg-rose-50 text-rose-600 rounded-full flex items-center justify-center transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">
        Участок №{plot.plotNumber}
      </div>
      <div className="text-2xl font-black text-gray-900 mb-1 flex items-baseline gap-2">
        {plot.area} <span className="text-sm font-semibold text-gray-400">соток</span>
      </div>

      <a
        href={`/village/${plot.villageSlug}`}
        className="text-sm text-gray-600 hover:text-green-700 transition-colors flex items-center gap-1.5 mb-3"
      >
        <MapPin className="w-3.5 h-3.5" />
        Посёлок {plot.villageName}
      </a>

      <span
        className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full mb-4 ${statusColor}`}
      >
        {plot.status}
      </span>

      <div className="space-y-1.5 pt-4 border-t border-gray-100 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Цена за сотку</span>
          <span className="font-semibold text-gray-900">
            {formatRub(plot.pricePerHundred)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Стоимость</span>
          <span className="font-extrabold text-green-600 text-base">
            {formatRub(plot.totalCost)}
          </span>
        </div>
      </div>

      <a
        href={`/village/${plot.villageSlug}#contact-form`}
        className="mt-4 w-full inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm"
      >
        Забронировать
      </a>
    </div>
  );
}

/* ─────────────────────────── empty states ────────────────────────── */

function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 mb-6">
        <Heart className="w-9 h-9 text-rose-400" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        Здесь будет ваша подборка
      </h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Нажмите на сердечко на карточке посёлка или участка — он сразу появится
        здесь. Вы сможете вернуться к нему позже или обсудить с менеджером.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/#catalog"
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-green-600/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Открыть каталог
        </a>
        <a
          href="tel:+79859052555"
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all"
        >
          <Phone className="w-4 h-4" />
          +7 (985) 905-25-55
        </a>
      </div>
    </div>
  );
}

function EmptyTab({ kind }: { kind: "villages" | "plots" }) {
  return (
    <div className="text-center py-16">
      <Heart className="w-10 h-10 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">
        {kind === "villages"
          ? "Здесь пока нет сохранённых посёлков"
          : "Здесь пока нет сохранённых участков"}
      </p>
      {kind === "plots" && (
        <p className="text-xs text-gray-400 mt-2">
          Откройте посёлок Каретный ряд и нажмите сердечко на любом участке карты
        </p>
      )}
    </div>
  );
}

// avoid unused import warning
export const _Ruler = Ruler;
