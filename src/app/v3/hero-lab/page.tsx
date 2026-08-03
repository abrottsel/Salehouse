import type { Metadata } from "next";
import HeroLab from "../_components/HeroLab";

export const metadata: Metadata = {
  title: "Фоны первого экрана — выбор",
  description: "Четыре варианта фона героя, переключаются на месте.",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  return <HeroLab />;
}
