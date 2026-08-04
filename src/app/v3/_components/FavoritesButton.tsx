"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";

/**
 * Избранное со счётчиком в шапке /v3.
 *
 * Хранилище общее с боевым сайтом: FavoritesProvider смонтирован в корневом
 * layout, поэтому здесь достаточно подписки. Отличие от боевого
 * FavoritesCounter только в оформлении — стекло и изумруд вместо белой пилюли.
 *
 * Бейдж появляется лишь после `hydrated`: на сервере localStorage не прочитать,
 * и цифра в первой разметке разошлась бы с клиентской.
 */
export default function FavoritesButton({ className = "" }: { className?: string }) {
  const { count, hydrated } = useFavorites();
  const showBadge = hydrated && count > 0;

  return (
    <Link
      href="/v3/favorites"
      aria-label={showBadge ? `Избранное: ${count}` : "Избранное"}
      title="Избранное"
      className={`relative grid shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:text-white ${className}`}
    >
      <Heart
        className={`h-[22px] w-[22px] transition-colors ${
          showBadge ? "fill-rose-400 text-rose-400" : "text-white/75"
        }`}
      />
      {showBadge && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-emerald-500 px-1 text-[9px] font-extrabold leading-none text-[#06120c] tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
