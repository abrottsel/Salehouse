import type { Metadata } from "next";
import Nav from "./_components/Nav";
import SiteFooter from "./_components/SiteFooter";
import FloatingMessengers from "./_components/FloatingMessengers";
import PagePollen from "./_components/ui/section-backdrops/PagePollen";
import "./v3.css";

export const metadata: Metadata = {
  title: {
    default: "ЗемПлюс — земельные участки в Подмосковье",
    template: "%s | ЗемПлюс",
  },
  description:
    "Готовые коттеджные посёлки Подмосковья с газом, электричеством, асфальтом и охраной. Подбор участка за 15 минут.",
  // Пока витрина обкатывается — из индекса убрана. Снять перед заменой прода.
  robots: { index: false, follow: false },
};

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    // v3-scope — корень темы ветки: держит палитровые переменные и полотно.
    // Класс dark на <html> ставит скрипт в корневом layout до первой отрисовки,
    // так что светлая тема применяется без вспышки тёмной.
    <div className="v3-scope v3-canvas min-h-screen text-white antialiased">
      {/* Фон секций — «Пыльца», выбрана в /v3/section-lab. Слой лежит на
          дне, поэтому весь контент поднят на z-10: без этого закреплённый
          слой красился бы поверх обычного потока. */}
      <PagePollen />
      <Nav />
      <div className="relative z-10">
        <div className="pt-20">{children}</div>
        <SiteFooter />
      </div>
      <FloatingMessengers />
    </div>
  );
}
