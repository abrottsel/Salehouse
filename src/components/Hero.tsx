"use client";

import Image from "next/image";
import { ArrowRight, Shield, TreePine, Home } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-svh flex items-start pt-16 sm:items-center sm:pt-20 overflow-hidden">
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

          {/* Trust badges */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
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
                <div className="text-white font-medium text-sm">30+ посёлков</div>
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

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
