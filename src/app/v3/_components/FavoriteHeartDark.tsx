"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";

/**
 * Сердечко на карточке /v3.
 *
 * Хранилище и логика — боевые: тот же FavoritesProvider, что и у
 * src/components/FavoriteHeart.tsx, поэтому отметки общие между версиями
 * сайта и подхватываются на /v3/favorites. Своя обёртка нужна из-за
 * размера и палитры: боевая кнопка 36×36 (меньше пальца) и красная
 * заливка, здесь — 44×44 и роза, как у счётчика в шапке /v3.
 *
 * Кнопка лежит поверх карточки-ссылки, поэтому клик гасим: иначе тап по
 * сердцу уводил бы в посёлок.
 */
export default function FavoriteHeartDark({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { isVillageFav, toggleVillage } = useFavorites();
  const active = isVillageFav(slug);
  const label = active ? "Убрать из избранного" : "Добавить в избранное";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleVillage(slug);
      }}
      // v3-on-dark: кнопка лежит на фото, оно тёмное в обеих темах.
      className={`v3-on-dark grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur-[2px] transition-colors hover:bg-black/70 active:scale-90 ${className}`}
    >
      <Heart
        className={`h-[18px] w-[18px] transition-all ${
          active ? "scale-110 fill-rose-400 text-rose-400" : "text-white/85"
        }`}
        strokeWidth={2.2}
      />
    </button>
  );
}
