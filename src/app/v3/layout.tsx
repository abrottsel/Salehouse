import type { Metadata } from "next";
import Nav from "./_components/Nav";
import SiteFooter from "./_components/SiteFooter";
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
    <div className="min-h-screen bg-[#0b0e13] text-white antialiased">
      <Nav />
      <div className="pt-20">{children}</div>
      <SiteFooter />
    </div>
  );
}
