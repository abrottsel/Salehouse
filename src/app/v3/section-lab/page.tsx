import type { Metadata } from "next";
import { Suspense } from "react";
import SectionLab from "../_components/SectionLab";

export const metadata: Metadata = {
  title: "Фоны секций — выбор",
  description: "Семь фоновых анимаций для секций, переключаются на месте.",
  robots: { index: false, follow: false },
};

export default function SectionLabPage() {
  // Suspense обязателен: внутри useSearchParams (вариант приходит в
  // ?bg=...), без границы сборка требует её явно и валится.
  return (
    <Suspense fallback={null}>
      <SectionLab />
    </Suspense>
  );
}
