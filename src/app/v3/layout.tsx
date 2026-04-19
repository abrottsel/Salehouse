import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export const metadata: Metadata = {
  title: "ЗемПлюс v3 — Земельные участки в Подмосковье премиум-класса",
  description:
    "31 готовый коттеджный посёлок с газом, электричеством, асфальтом и охраной. Ипотека от 6.5%. Подбор участка за 15 минут.",
  robots: { index: false, follow: false },
};

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen transition-colors">
      {/* Floating top-right controls */}
      <div className="fixed top-5 right-5 sm:top-6 sm:right-8 z-50 flex items-center gap-3">
        <Link
          href="tel:+79859052555"
          className="hidden sm:inline-flex items-center gap-2 px-5 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
        >
          +7 985 905-25-55
        </Link>
        <ThemeToggle />
      </div>

      {/* Floating top-left brand */}
      <Link
        href="/"
        className="fixed top-5 left-5 sm:top-6 sm:left-8 z-50 inline-flex items-center gap-2 px-4 h-11 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 text-white font-extrabold text-sm hover:bg-white/20 transition-all"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
        ЗемПлюс
      </Link>

      {children}
    </div>
  );
}
