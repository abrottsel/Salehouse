"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  TreePine,
  Calculator,
  ListChecks,
  PhoneCall,
  Sun,
  Moon,
} from "lucide-react";
import Logo from "./Logo";
import FavoritesCounter from "./FavoritesCounter";
import SiteSearch from "./SiteSearch";
import { useTheme } from "./v2/ThemeContext";

const navLinksMain = [
  { href: "#catalog", label: "Посёлки", Icon: TreePine },
  { href: "#calculator", label: "Ипотека", Icon: Calculator },
  { href: "#steps-block", label: "Как купить", Icon: ListChecks },
  { href: "/contacts", label: "Контакты", Icon: PhoneCall },
];


export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "";
  const isV2 = pathname.startsWith("/v2");
  const theme = useTheme();
  // /v2 — клон главной с доработками: шапка ведёт себя как на главной
  // (якоря работают на месте, та же навигация и высота).
  const isHome = pathname === "/" || isV2;
  // Inner pages (e.g. /village/[slug]) don't contain the catalog /
  // calculator / steps-block anchors, so nav links that target those
  // hash fragments need a leading "/" to jump back to the home page.
  // The #contacts anchor works in place on village pages because the
  // contact form is rendered there too — keep it hash-only.
  const rewriteHref = (href: string) => {
    if (!href.startsWith("#")) return href;
    if (isHome) return href;
    if (href === "#contacts") return href;
    return `/${href}`;
  };
  const navLinks = navLinksMain.map((l) => ({ ...l, href: rewriteHref(l.href) }));
  const ctaHref = "#contacts";
  const logoHref = isV2 ? "/v2" : "/";
  const rowHeight = "h-14";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-6 pt-2 sm:pt-2.5">
      <div className="bg-white shadow-md rounded-2xl sm:rounded-3xl overflow-hidden dark:bg-gray-900/80 dark:backdrop-blur-xl dark:shadow-none dark:ring-1 dark:ring-white/10">
      {/* Зелёная градиентная полоска сверху — как в подвале */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

      <div className="mx-auto px-2 sm:px-4 lg:px-6 max-w-[1600px]">
        <div className={`flex items-center ${rowHeight}`}>
          {/* Logo */}
          <a
            href={logoHref}
            className="shrink-0 mr-4"
            onClick={(e) => {
              if (pathname === logoHref) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "instant" });
              }
            }}
          >
            <Logo />
          </a>

          {/* Desktop Nav — ghost pill на активном, голый текст на остальных */}
          <nav className="hidden lg:flex items-center flex-1 justify-center min-w-0">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = !isHome && (pathname === link.href || pathname.startsWith(link.href + "/"));
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={[
                      "px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150",
                      "border-[1.5px]",
                      isActive
                        ? "border-emerald-500 text-emerald-600 font-semibold dark:text-emerald-400"
                        : "border-transparent text-gray-500 hover:text-green-700 hover:bg-green-50 dark:text-gray-300 dark:hover:text-emerald-300 dark:hover:bg-white/5",
                    ].join(" ")}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </nav>

          {/* Phone + CTA */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0 ml-2 lg:ml-4">
            <SiteSearch />
            {isV2 && theme && (
              <button
                type="button"
                onClick={theme.toggle}
                aria-label={theme.dark ? "Светлая тема" : "Тёмная тема"}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
              >
                {theme.dark
                  ? <Sun className="w-5 h-5 text-yellow-400" />
                  : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>
            )}
            <FavoritesCounter />
            <a
              href="tel:+79859052555"
              className="flex items-center gap-1.5 text-gray-800 font-bold hover:text-green-600 transition-colors dark:text-gray-100 dark:hover:text-emerald-400"
              aria-label="Позвонить +7 (985) 905-25-55"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center dark:bg-emerald-500/15">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <span className="hidden 2xl:inline text-xs">+7 (985) 905-25-55</span>
            </a>
            <a
              href={ctaHref}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all duration-200 text-xs shadow-sm shadow-green-600/25 whitespace-nowrap"
            >
              Посмотреть вживую
            </a>
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden ml-auto flex items-center gap-2">
            <div className="md:hidden">
              <SiteSearch />
            </div>
            {isV2 && theme && (
              <button
                type="button"
                onClick={theme.toggle}
                aria-label={theme.dark ? "Светлая тема" : "Тёмная тема"}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
              >
                {theme.dark
                  ? <Sun className="w-5 h-5 text-yellow-400" />
                  : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>
            )}
            <div className="md:hidden">
              <FavoritesCounter />
            </div>
            <a href="tel:+79859052555" className="md:hidden w-11 h-11 bg-green-100 rounded-full flex items-center justify-center dark:bg-emerald-500/15">
              <Phone className="w-4 h-4 text-green-600" />
            </a>
            <button
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-100 dark:hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Меню"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white pb-4 dark:border-white/10 dark:bg-gray-900/80 dark:backdrop-blur-xl">
          <nav className="px-4 flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors font-semibold dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-emerald-300"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 dark:bg-emerald-500/15">
                  <link.Icon className="w-4 h-4 text-green-600" />
                </div>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="px-4 mt-3 flex flex-col gap-2">
            <a
              href="tel:+79859052555"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-xl font-bold text-sm dark:bg-white/5 dark:text-gray-100"
            >
              <Phone className="w-4 h-4 text-green-600" />
              +7 (985) 905-25-55
            </a>
            <a
              href={ctaHref}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-xl font-semibold text-center text-sm shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              Посмотреть вживую
            </a>
          </div>
        </div>
      )}
      </div>
    </header>
  );
}
