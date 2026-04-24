"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "./FavoritesProvider";

interface Props {
  variant?: "compact" | "full";
}

export default function FavoritesCounter({ variant = "compact" }: Props) {
  const { count, hydrated } = useFavorites();
  // Until hydrated, render the icon without the badge to avoid SSR mismatch
  const showBadge = hydrated && count > 0;

  if (variant === "full") {
    return (
      <a
        href="/favorites"
        aria-label={`Избранное (${count})`}
        className="group relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-700 hover:text-rose-700 transition-all duration-200 text-sm font-semibold"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            showBadge ? "fill-rose-500 text-rose-500" : ""
          }`}
        />
        <span>Избранное</span>
        {showBadge && (
          <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold leading-none">
            {count}
          </span>
        )}
      </a>
    );
  }

  return (
    <a
      href="/favorites"
      aria-label={`Избранное${showBadge ? ` (${count})` : ""}`}
      title="Избранное"
      className="relative inline-flex items-center justify-center w-11 h-11 md:w-9 md:h-9 rounded-full bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-700 hover:text-rose-700 transition-all duration-200"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          showBadge ? "fill-rose-500 text-rose-500" : ""
        }`}
      />
      {showBadge && (
        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none border-2 border-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  );
}
