import type { Metadata } from "next";
import SectionLab from "../_components/SectionLab";

export const metadata: Metadata = {
  title: "Фоны секций — выбор",
  description: "Семь фоновых анимаций для секций, переключаются на месте.",
  robots: { index: false, follow: false },
};

export default function SectionLabPage() {
  return <SectionLab />;
}
