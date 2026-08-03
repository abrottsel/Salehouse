"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Ruler } from "lucide-react";
import { SectionTitle } from "../ui/primitives";
import { Reveal, StaggerItem, StaggerList } from "../ui/motion";
import { useTier } from "../../_lib/perf";
import { TOP_VILLAGES, VILLAGE_COUNT, panel, plural, rub } from "./common";

/**
 * Превью каталога: шесть готовых посёлков с наибольшим выбором.
 * Полный список — на /v3/catalog.
 */
export default function CatalogPreview({
  liveAvailable,
}: {
  /** slug → живое число свободных участков из Земекс. */
  liveAvailable?: Record<string, number>;
} = {}) {
  const lite = useTier() === "lite";

  return (
    <section className="mx-auto mt-20 max-w-[1400px] px-4 sm:mt-28 sm:px-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Каталог"
            title="Посёлки, готовые"
            accent="к переезду"
            sub="Готовность 100% и самый большой выбор свободных участков. Коммуникации подведены, дороги сделаны — можно строиться сразу."
            className="max-w-[46ch]"
          />
          <Link
            href="/v3/catalog"
            className="mb-8 inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.07] px-5 text-[13px] font-bold ring-1 ring-white/15 transition-colors hover:bg-white/[0.13] sm:mb-12"
          >
            Смотреть все {VILLAGE_COUNT}
            <ArrowRight className="h-4 w-4 text-emerald-300" />
          </Link>
        </div>
      </Reveal>

      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOP_VILLAGES.map((v, i) => (
          <StaggerItem key={v.slug} className="h-full">
            <Link href={`/v3/village/${v.slug}`} className="group block h-full">
              <article
                className="flex h-full flex-col overflow-hidden rounded-[24px] transition-transform duration-300 group-hover:-translate-y-1.5"
                style={panel(lite)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={v.photos[0]}
                    alt={`Посёлок ${v.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={i < 2}
                    className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e13] via-[#0b0e13]/25 to-transparent" />

                  <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
                    Готовность {v.readiness}%
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-500/85 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-emerald-300/40">
                    {liveAvailable?.[v.slug] ?? v.plotsAvailable}{" "}
                    {plural(liveAvailable?.[v.slug] ?? v.plotsAvailable, "свободный", "свободных", "свободных")}
                  </span>

                  <h3 className="absolute inset-x-4 bottom-3 text-[22px] font-extrabold leading-tight tracking-[-0.01em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                    {v.name}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center gap-1.5 text-[13px] text-white/55">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                    <span className="truncate">
                      {v.direction} · {v.distance} км от МКАД
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[13px] text-white/45">
                    <Ruler className="h-3.5 w-3.5 shrink-0" />
                    от {v.areaFrom} до {v.areaTo} соток
                  </div>

                  <div className="mt-auto flex items-end justify-between border-t border-white/[0.08] pt-4">
                    <div className="leading-tight">
                      <div className="text-[11px] uppercase tracking-widest text-white/35">от</div>
                      <div className="text-[20px] font-extrabold text-emerald-300">
                        {rub(v.priceFrom)} ₽
                      </div>
                      <div className="text-[11px] text-white/35">за сотку</div>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/15 transition-colors group-hover:bg-emerald-500 group-hover:ring-emerald-400">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}
