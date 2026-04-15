import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Ruler,
  CheckCircle2,
  Phone,
  MessageCircle,
} from "lucide-react";
import FavoriteHeart from "./FavoriteHeart";

interface Props {
  slug: string;
  name: string;
  direction: string;
  distance: number;
  readiness: number;
  description: string;
  priceFrom: number;
  plotsAvailable: number;
  plotsCount: number;
  areaFrom: number;
  areaTo: number;
  heroPhoto: string;
}

export default function VillageHero({
  slug,
  name,
  direction,
  distance,
  readiness,
  description,
  priceFrom,
  plotsAvailable,
  plotsCount,
  areaFrom,
  areaTo,
  heroPhoto,
}: Props) {
  return (
    <section className="relative min-h-[78vh] lg:min-h-[82vh] flex items-end pt-20 pb-10 lg:pb-16 overflow-hidden">
      {/* Background photo */}
      <Image
        src={heroPhoto}
        alt={`${name} — аэрофотография посёлка`}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent lg:to-black/40" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 gap-3">
          <a
            href="/#catalog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Все посёлки
          </a>
          <FavoriteHeart kind="village" slug={slug} variant="dark" />
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-end">
          {/* Left — title + description */}
          <div className="lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {readiness === 100 ? (
                <span className="bg-green-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Готовый посёлок
                </span>
              ) : (
                <span className="bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Готовность {readiness}%
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                ИЖС
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-4">
              {name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80 mb-5 text-sm sm:text-base">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-green-400" />
                {direction}, {distance} км от МКАД
              </span>
              <span className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-green-400" />
                {areaFrom}–{areaTo} соток
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                {plotsAvailable} из {plotsCount} свободно
              </span>
            </div>

            <p className="text-base lg:text-lg text-white/80 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>

          {/* Right — CTA card */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 lg:p-7 shadow-2xl">
              <div className="mb-5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-green-300 mb-1">
                  Стоимость
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs text-white/70">от</span>
                  <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                    {priceFrom.toLocaleString("ru-RU")} &#8381;
                  </span>
                </div>
                <div className="text-xs text-white/60 mt-1">
                  за сотку, без скрытых платежей
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="#contact-form"
                  className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-green-600/40 hover:shadow-xl hover:shadow-green-500/50"
                >
                  Записаться на просмотр
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+79859052555"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-3 py-3 rounded-xl font-semibold text-sm border border-white/20 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Позвонить
                  </a>
                  <a
                    href="https://t.me/zemplus_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-3 py-3 rounded-xl font-semibold text-sm border border-white/20 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
