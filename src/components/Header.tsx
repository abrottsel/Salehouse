"use client";

import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import Logo from "./Logo";

const navLinks = [
  { href: "#advantages", label: "Преимущества" },
  { href: "#catalog", label: "Посёлки" },
  { href: "#infrastructure", label: "Инфраструктура" },
  { href: "#calculator", label: "Ипотека" },
  { href: "#reviews", label: "Отзывы" },
  { href: "#steps", label: "Как купить" },
  { href: "#contacts", label: "Контакты" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <Logo />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Phone & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:+79859052555"
              className="flex items-center gap-2 text-gray-900 font-semibold hover:text-green-600 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              +7 (985) 905-25-55
            </a>
            <a
              href="#contacts"
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm shadow-sm shadow-green-600/20"
            >
              Записаться на просмотр
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Меню"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100">
            <nav className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 px-3 flex flex-col gap-2">
              <a href="tel:+79859052555" className="flex items-center gap-2 font-semibold">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                +7 (985) 905-25-55
              </a>
              <a
                href="#contacts"
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium text-center shadow-sm shadow-green-600/20"
                onClick={() => setIsOpen(false)}
              >
                Записаться на просмотр
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
