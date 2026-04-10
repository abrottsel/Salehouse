"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "./FavoritesProvider";
import type { FavoritePlot } from "@/lib/favorites";

type Variant = "light" | "dark" | "inline";

interface VillageHeartProps {
  kind: "village";
  slug: string;
  variant?: Variant;
  className?: string;
  stopPropagation?: boolean;
}

interface PlotHeartProps {
  kind: "plot";
  plot: Omit<FavoritePlot, "type" | "addedAt">;
  variant?: Variant;
  className?: string;
  stopPropagation?: boolean;
}

type Props = VillageHeartProps | PlotHeartProps;

const baseBtn =
  "inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-green-500/40";

const variantClasses: Record<Variant, string> = {
  light:
    "w-9 h-9 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-md",
  dark:
    "w-10 h-10 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/20",
  inline: "w-10 h-10 bg-gray-100 text-gray-700 hover:bg-gray-200",
};

export default function FavoriteHeart(props: Props) {
  const { variant = "light", className = "", stopPropagation = true } = props;
  const fav = useFavorites();

  let active: boolean;
  if (props.kind === "village") {
    active = fav.isVillageFav(props.slug);
  } else {
    active = fav.isPlotFav(props.plot.villageSlug, props.plot.plotNumber);
  }

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (props.kind === "village") {
      fav.toggleVillage(props.slug);
    } else {
      fav.togglePlot(props.plot);
    }
  };

  const label = active ? "Убрать из избранного" : "Добавить в избранное";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleClick}
      className={`${baseBtn} ${variantClasses[variant]} ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-all ${
          active ? "fill-red-500 text-red-500 scale-110" : ""
        }`}
        strokeWidth={2.2}
      />
    </button>
  );
}
