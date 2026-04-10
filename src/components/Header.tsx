"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Phone,
  Star,
  TreePine,
  Building2,
  Calculator,
  MessageSquare,
  ListChecks,
  PhoneCall,
} from "lucide-react";
import Logo from "./Logo";
import FavoritesCounter from "./FavoritesCounter";
import SiteSearch from "./SiteSearch";

const navLinks = [
  { href: "#advantages", label: "Преимущества", Icon: Star },
  { href: "#catalog", label: "Посёлки", Icon: TreePine },
  { href: "#infrastructure", label: "Инфраструктура", Icon: Building2 },
  { href: "#calculator", label: "Ипотека", Icon: Calculator },
  { href: "#reviews", label: "Отзывы", Icon: MessageSquare },
  { href: "#steps", label: "Как купить", Icon: ListChecks },
  { href: "#contacts", label: "Контакты", Icon: PhoneCall },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto px-2 sm:px-4 lg:px-6 max-w-[1400px]">
        <div className="flex items-center h-16">
          {/* Logo — прижат к левому краю */}
          <a href="/" className="shrink-0 mr-4">
            <Logo />
          </a>

          {/* Desktop Nav — pill container, v3 Stitch-inspired */}
          <nav className="hidden lg:flex items-center flex-1 justify-center">
            <div className="flex items-center bg-gray-100/80 rounded-full p-1 gap-0.5 border border-gray-200/80">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-full hover:bg-white hover:text-green-700 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  <link.Icon className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Phone + CTA */}
          <div className="hidden md:flex items-center gap-2 shrink-0 ml-4">
            <SiteSearch />
            <FavoritesCounter />
            <a
              href="tel:+79859052555"
              className="flex items-center gap-1.5 text-gray-800 font-bold hover:text-green-600 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <span className="hidden xl:inline text-xs">+7 (985) 905-25-55</span>
            </a>
            <a
              href="#contacts"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all duration-200 text-xs shadow-sm shadow-green-600/25 whitespace-nowrap"
            >
              Записаться на просмотр
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
              href="#contacts"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-xl font-semibold text-center text-sm shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              Записаться на просмотр
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
