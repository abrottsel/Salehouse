"use client";

import Image from "next/image";
import { ArrowRight, Shield, TreePine, Home } from "lucide-react";
import { villages } from "@/lib/data";

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

// Dynamic stats — auto-update when villages data changes
const VILLAGE_COUNT = villages.length;
const PLOTS_AVAILABLE = villages.reduce((s, v) => s + (v.plotsAvailable || 0), 0);
const PLOTS_AVAILABLE_FMT = PLOTS_AVAILABLE.toLocaleString("ru-RU");
const VILLAGE_LABEL = plural(VILLAGE_COUNT, "посёлок", "посёлка", "посёлков");

export default function Hero() {
  return (
    <section className="relative min-h-svh flex items-start pt-16 sm:items-center sm:pt-20 overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-home.jpg"
        alt="Коттеджный посёлок в Подмосковье — вид с высоты"
        fill
        className="object-cover"
        priority
        sizes="100vw"
        quality={85}
      />
      {/* Dark overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-24">
        <div className="max-w-3xl">
          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-4 sm:mb-6">
            Ваш участок
            <br />
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
              для жизни мечты
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
            От 180 000 руб. за сотку. Готовые посёлки с газом, электричеством
            и асфальтированными дорогами. Юридическая чистота гарантирована.
            Рассрочка без переплат.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Выбрать участок
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#contacts"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/30"
            >
              Записаться на просмотр
            </a>
          </div>

          {/* Trust badges — clickable, scroll to relevant section */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                Icon: Shield,
                title: "Юридическая чистота",
                sub: "Гарантия по договору",
                href: "#steps",
                ariaLabel: "Посмотреть шаги покупки и юридические гарантии",
              },
              {
                Icon: TreePine,
                title: `${VILLAGE_COUNT} ${VILLAGE_LABEL}`,
                sub: `${PLOTS_AVAILABLE_FMT}+ свободных участков`,
                href: "#catalog",
                ariaLabel: "Перейти к каталогу посёлков",
              },
              {
                Icon: Home,
                title: "Категория ИЖС",
                sub: "Для постоянного проживания",
                href: "#faq",
                ariaLabel: "Подробнее про ИЖС и прописку",
              },
            ].map(({ Icon, title, sub, href, ariaLabel }) => (
              <a
                key={title}
                href={href}
                aria-label={ariaLabel}
                className="group flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 hover:bg-white/20 hover:border-green-300/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-400/25 group-hover:border-green-300/50 transition-colors">
                  <Icon className="w-5 h-5 text-green-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-white/60 text-xs">{sub}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-green-300 transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
