"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";
import FavoriteHeartDark from "./FavoriteHeartDark";
import RouteChipDark from "./RouteChipDark";
import { Reveal, StaggerItem, StaggerList } from "./ui/motion";
import { CTA, Eyebrow, Glass } from "./ui/primitives";

interface CatalogItem {
  slug: string;
  name: string;
  direction: string;
  distance: number;
  priceFrom: number;
  plotsAvailable: number;
  readiness: number;
  photo: string;
  coords: [number, number];
}

/**
 * Список отмеченного.
 *
 * Читаем через FavoritesProvider, а не напрямую из localStorage: снятие
 * отметки прямо здесь меняет состояние в этой же вкладке, а событие
 * `storage` в своей вкладке не срабатывает — список остался бы прежним
 * до перезагрузки. Через провайдер он и шапка обновляются одновременно.
 */
export default function FavoritesList({ catalog }: { catalog: CatalogItem[] }) {
  const { villages, hydrated } = useFavorites();
  const slugs = new Set(villages.map((v) => v.slug));
  const chosen = catalog.filter((c) => slugs.has(c.slug));

  return (
    <>
      <Reveal>
        <Eyebrow>Избранное</Eyebrow>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          Что вы отметили
        </h1>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-white/55">
          Список хранится в вашем браузере и никуда не отправляется.
        </p>
      </Reveal>

      {/* До чтения localStorage список неизвестен: без этой паузы у человека
          с отметками сначала мелькает «Пока пусто». */}
      {!hydrated ? null : chosen.length === 0 ? (
        <Reveal delay={0.1}>
          <Glass className="mt-10 p-10 text-center">
            <Heart className="mx-auto h-8 w-8 text-white/25" />
            <p className="mt-4 text-[16px] font-bold">Пока пусто</p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-white/50">
              Открывайте посёлки и нажимайте на сердечко — они соберутся здесь.
            </p>
            <div className="mt-6">
              <CTA href="/v3/catalog">Открыть каталог</CTA>
            </div>
          </Glass>
        </Reveal>
      ) : (
        <StaggerList className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {chosen.map((v) => (
            <StaggerItem key={v.slug}>
              <Link
                href={`/v3/village/${v.slug}`}
                className="group block overflow-hidden rounded-[24px] ring-1 ring-white/10 transition-transform hover:-translate-y-1"
              >
                {/* v3-on-dark: всё поверх фото остаётся белым и в светлой теме. */}
                <div className="v3-on-dark relative aspect-[4/3] overflow-hidden bg-white/5">
                  {v.photo && (
                    <Image
                      src={v.photo}
                      alt={v.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
                  <div className="absolute right-3 top-3">
                    <FavoriteHeartDark slug={v.slug} />
                  </div>
                  {/* Чип маршрута: сам не рендерится, пока адрес дома
                      не сохранён — как на карточках каталога. */}
                  <div className="absolute inset-x-3 bottom-3 flex items-end gap-2">
                    <RouteChipDark villageCoords={v.coords} villageName={v.name} />
                  </div>
                  <div className="absolute inset-x-4 bottom-12">
                    <div className="text-[19px] font-extrabold">{v.name}</div>
                    <div className="flex items-center gap-1.5 text-[12px] text-white/65">
                      <MapPin className="h-3 w-3" />
                      {v.direction}, {v.distance} км от МКАД
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white/[0.04] px-4 py-3">
                  <span className="text-[14px] font-bold tabular-nums">
                    от {v.priceFrom.toLocaleString("ru-RU")} ₽/сот
                  </span>
                  <span className="text-[12px] text-white/50 tabular-nums">
                    свободно {v.plotsAvailable}
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </>
  );
}
