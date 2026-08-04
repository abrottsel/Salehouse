"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageOff, MapPin, Ruler } from "lucide-react";
import type { Village } from "@/lib/data";
import FavoriteHeartDark from "../FavoriteHeartDark";
import RouteChipDark from "../RouteChipDark";
import { areaLabel, money, plotsWord } from "./data";

/** Ширина картинки по брейкпоинтам сетки: 1 / 2 / 3 / 4 колонки. */
const SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw";

export default function VillageCard({
  village,
  lite,
  eager = false,
  liveAvailable,
}: {
  village: Village;
  /** Слабое устройство: без лифта карточки и без зума фото. */
  lite: boolean;
  /** Первый экран — грузим сразу, остальное лениво. */
  eager?: boolean;
  /** Живое число свободных из Земекс. Без него берём цифру из data.ts,
   *  которая местами устарела: у Фаворита там 12, а в реальности 42. */
  liveAvailable?: number;
}) {
  const available = liveAvailable ?? village.plotsAvailable;
  const photo = village.photos[0];
  const ready = village.readiness === 100;

  return (
    <Link
      href={`/v3/village/${village.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[22px] bg-white/[0.035] ring-1 ring-white/10 transition-all duration-300 hover:bg-white/[0.06] hover:ring-emerald-400/35 ${
        lite ? "" : "hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.9)]"
      }`}
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-white/[0.04]">
        {photo ? (
          <Image
            src={photo}
            alt={village.name}
            fill
            sizes={SIZES}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            className={`object-cover ${
              lite ? "" : "transition-transform duration-700 group-hover:scale-[1.06]"
            }`}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/25">
            <ImageOff className="h-8 w-8" />
          </div>
        )}

        {/* Затемнение снизу — под ним читается чип «свободно». */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0e13] via-[#0b0e13]/15 to-transparent" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/15 backdrop-blur-[2px]">
          <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-400" : "bg-amber-400"}`} />
          {ready ? "Готовый" : `Готовность ${village.readiness}%`}
        </span>

        <div className="absolute right-3 top-3">
          <FavoriteHeartDark slug={village.slug} />
        </div>

        {/* Нижний ряд одной строкой: «Дорога к мечте» слева, остаток справа.
            Чип маршрута исчезает, когда адрес дома не задан, поэтому «свободно»
            прижат ml-auto, а не justify-between — иначе он уезжал бы влево. */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
          <RouteChipDark villageCoords={village.coords} villageName={village.name} />
          <span className="ml-auto inline-flex h-7 shrink-0 items-baseline gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-extrabold leading-5 text-[#06120c]">
            {available}
            <span className="text-[10px] font-bold opacity-70">свободно</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-[17px] font-extrabold leading-tight transition-colors group-hover:text-emerald-300 sm:text-[19px]">
          {village.name}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-white/50">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-300/70" />
          {village.direction}, {village.distance} км от МКАД
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-white/45">
          <Ruler className="h-3.5 w-3.5 shrink-0 text-emerald-300/50" />
          {areaLabel(village)}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-4">
          <div className="leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              от
            </div>
            <div className="text-[20px] font-extrabold text-emerald-300">
              {money(village.priceFrom)} ₽
            </div>
            <div className="text-[10px] text-white/35">за сотку</div>
          </div>

          <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/[0.07] px-3.5 text-[12px] font-bold text-white ring-1 ring-white/12 transition-colors group-hover:bg-emerald-500 group-hover:text-[#06120c] group-hover:ring-emerald-400">
            Подробнее
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <span className="sr-only">
          {available} {plotsWord(village.plotsAvailable)} в продаже
        </span>
      </div>
    </Link>
  );
}
