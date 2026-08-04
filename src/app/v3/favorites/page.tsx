import type { Metadata } from "next";
import { villages } from "@/lib/data";
import FavoritesList from "../_components/FavoritesList";

export const metadata: Metadata = {
  title: "Избранное",
  description: "Посёлки и участки, которые вы отметили.",
};

export default function FavoritesPage() {
  // Отдаём клиенту только то, что нужно карточке: список избранного
  // живёт в localStorage, на сервере он неизвестен.
  const catalog = villages.map((v) => ({
    slug: v.slug,
    name: v.name,
    direction: v.direction,
    distance: v.distance,
    priceFrom: v.priceFrom,
    plotsAvailable: v.plotsAvailable,
    readiness: v.readiness,
    photo: v.photos[0] ?? "",
    coords: v.coords,
  }));

  return (
    // Отступ сверху меньше, чем на остальных страницах: избранное
    // открывают, чтобы сразу увидеть отмеченное, а не заголовок —
    // карточки должны попадать в первый экран.
    <main className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 sm:pt-6">
      <FavoritesList catalog={catalog} />
    </main>
  );
}
