"use client";

import { ArrowRight, Shield, TreePine, Home } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900" />
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm mb-8 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Более 9 лет на рынке &middot; 15 000+ проданных участков
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Земельные участки
            <br />
            <span className="text-green-300">в Подмосковье</span>
            <br />
            от 180 000 руб./сот.
          </h1>

          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
            Готовые посёлки с газом, электричеством и асфальтированными дорогами.
            Юридическая чистота гарантирована. Рассрочка без переплат.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg"
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

          {/* Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <Shield className="w-8 h-8 text-green-300 flex-shrink-0" />
              <div>
                <div className="text-white font-medium text-sm">Юридическая чистота</div>
                <div className="text-white/60 text-xs">Гарантия по договору</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <TreePine className="w-8 h-8 text-green-300 flex-shrink-0" />
              <div>
                <div className="text-white font-medium text-sm">50+ посёлков</div>
                <div className="text-white/60 text-xs">В разных направлениях</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <Home className="w-8 h-8 text-green-300 flex-shrink-0" />
              <div>
                <div className="text-white font-medium text-sm">Категория ИЖС</div>
                <div className="text-white/60 text-xs">Для постоянного проживания</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
