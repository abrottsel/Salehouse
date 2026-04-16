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
  ShieldCheck,
  Landmark,
  HelpCircle,
} from "lucide-react";
import Logo from "./Logo";
import FavoritesCounter from "./FavoritesCounter";
import SiteSearch from "./SiteSearch";

const navLinksMain = [
  { href: "#catalog", label: "Посёлки", Icon: TreePine },
  { href: "#calculator", label: "Ипотека", Icon: Calculator },
  { href: "#steps-block", label: "Как купить", Icon: ListChecks },
  { href: "#contacts", label: "Контакты", Icon: PhoneCall },
];

const navLinksV2 = [
  { href: "/v2#catalog", label: "Посёлки", Icon: TreePine },
  { href: "/v2/about", label: "О нас", Icon: ShieldCheck },
  { href: "/v2/mortgage", label: "Ипотека", Icon: Landmark },
  { href: "/v2/how-to-buy", label: "Как купить", Icon: ListChecks },
  { href: "/v2/faq", label: "Вопросы", Icon: HelpCircle },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "";
  const isV2 = pathname.startsWith("/v2");
  const isHome = pathname === "/";
  // Inner pages (e.g. /village/[slug]) don't contain the catalog /
  // calculator / steps-block anchors, so nav links that target those
  // hash fragments need a leading "/" to jump back to the home page.
  // The #contacts anchor works in place on village pages because the
  // contact form is rendered there too — keep it hash-only.
  const rewriteHref = (href: string) => {
    if (!href.startsWith("#")) return href;
    if (isV2) return href;
    if (isHome) return href;
    if (href === "#contacts") return href;
    return `/${href}`;
  };
  const rawNavLinks = isV2 ? navLinksV2 : navLinksMain;
  const navLinks = rawNavLinks.map((l) => ({ ...l, href: rewriteHref(l.href) }));
  const ctaHref = isV2
    ? "#callback"
    : isHome
      ? "#contacts"
      : "#contacts"; // stays in-page on village pages (form is present)
  const logoHref = isV2 ? "/v2" : "/";
  const rowHeight = isV2 ? "h-12" : "h-16";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="mx-auto px-2 sm:px-4 lg:px-6 max-w-[1600px]">
        <div className={`flex items-center ${rowHeight}`}>
          {/* Logo — прижат к левому краю */}
          <a href={logoHref} className="shrink-0 mr-4">
            <Logo />
          </a>

          {/* Desktop Nav — pill container, icon-only on lg, text on xl+ */}
          <nav className="hidden lg:flex items-center flex-1 justify-center min-w-0">
            <div className="flex items-center bg-gray-100/80 rounded-full p-1 gap-0.5 border border-gray-200/80">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  className="group flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1.5 text-xs font-semibold text-gray-700 rounded-full hover:bg-white hover:text-green-700 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  <link.Icon className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="hidden xl:inline">{link.label}</span>
                </a>
              ))}
            </div>
          </nav>

          {/* Phone + CTA */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0 ml-2 lg:ml-4">
            <SiteSearch />
            <FavoritesCounter />
            <a
              href="tel:+79859052555"
              className="flex items-center gap-1.5 text-gray-800 font-bold hover:text-green-600 transition-colors"
              aria-label="Позвонить +7 (985) 905-25-55"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <span className="hidden 2xl:inline text-xs">+7 (985) 905-25-55</span>
            </a>
            <a
              href={ctaHref}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all duration-200 text-xs shadow-sm shadow-green-600/25 whitespace-nowrap"
            >
              <span className="2xl:hidden">Посмотреть вживую</span>
              <span className="hidden 2xl:inline">Посмотреть вживую</span>
            </a>
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden ml-auto flex items-center gap-2">
            <div className="md:hidden">
              <SiteSearch />
            </div>
            <div className="md:hidden">
              <FavoritesCounter />
            </div>
            <a href="tel:+79859052555" className="md:hidden w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-green-600" />
            </a>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
        <div className="lg:hidden border-t border-gray-100 bg-white pb-4">
          <nav className="px-4 flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors font-semibold"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <link.Icon className="w-4 h-4 text-green-600" />
                </div>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="px-4 mt-3 flex flex-col gap-2">
            <a
              href="tel:+79859052555"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-xl font-bold text-sm"
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
    </header>
  );
}
