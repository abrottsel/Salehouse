"use client";

import Image from "next/image";
import { ArrowRight, Shield, TreePine, Home } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[82vh] flex items-center pt-14 overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop"
        alt="Коттеджный посёлок в Подмосковье — вид с высоты"
        fill
        className="object-cover"
        priority
      />
      {/* Dark overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="max-w-3xl">
          {/* H1 + УТП */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            Ваш участок
            <br />
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
              для жизни мечты
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 mb-6 max-w-2xl leading-relaxed">
            Готовые посёлки с коммуникациями в Подмосковье от 180 000 руб./сот.
            Газ, электричество, асфальт. Юридическая чистота. Рассрочка без переплат.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-green-700 transition-colors shadow-lg"
            >
              Выбрать участок
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#contacts"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-white/20 transition-colors border border-white/30"
            >
              Записаться на просмотр
            </a>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
              <Shield className="w-6 h-6 text-green-300 flex-shrink-0" />
              <div>
                <div className="text-white font-medium text-xs sm:text-sm">Юридическая чистота</div>
                <div className="text-white/50 text-[10px] sm:text-xs hidden sm:block">Гарантия по договору</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
              <TreePine className="w-6 h-6 text-green-300 flex-shrink-0" />
              <div>
                <div className="text-white font-medium text-xs sm:text-sm">30+ посёлков</div>
                <div className="text-white/50 text-[10px] sm:text-xs hidden sm:block">В разных направлениях</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
              <Home className="w-6 h-6 text-green-300 flex-shrink-0" />
              <div>
                <div className="text-white font-medium text-xs sm:text-sm">Категория ИЖС</div>
                <div className="text-white/50 text-[10px] sm:text-xs hidden sm:block">Для проживания</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
