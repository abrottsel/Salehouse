import { notFound } from "next/navigation";
import { villages } from "@/lib/data";
import VillageGallery from "@/components/VillageGallery";
import PlotsList from "@/components/PlotsList";
import VillageMap from "@/components/VillageMap";
import { MapPin, ArrowLeft, Shield, Zap, Car } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return villages.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const village = villages.find((v) => v.slug === slug);
  if (!village) return { title: "Посёлок не найден" };
  return {
    title: `${village.name} — земельные участки от ${village.priceFrom.toLocaleString("ru-RU")} руб./сот. | ЗемПлюс`,
    description: village.description,
  };
}

export default async function VillagePage({ params }: Props) {
  const { slug } = await params;
  const village = villages.find((v) => v.slug === slug);
  if (!village) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a
            href="/#catalog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Все посёлки
          </a>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {village.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {village.direction}, {village.distance} км от МКАД
            </span>
            {village.readiness === 100 ? (
              <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Готовый посёлок
              </span>
            ) : (
              <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Готовность {village.readiness}%
              </span>
            )}
          </div>

          <p className="text-lg text-gray-300 max-w-3xl">
            {village.description}
          </p>
        </div>
      </div>

      {/* Gallery */}
      <VillageGallery photos={village.photos} name={village.name} />

      {/* Info Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                от {village.priceFrom.toLocaleString("ru-RU")} &#8381;
              </div>
              <div className="text-sm text-gray-600">за сотку</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {village.plotsAvailable}
              </div>
              <div className="text-sm text-gray-600">участков свободно</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {village.areaFrom}–{village.areaTo}
              </div>
              <div className="text-sm text-gray-600">соток</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {village.plotsCount}
              </div>
              <div className="text-sm text-gray-600">всего участков</div>
            </div>
          </div>

          {/* Features */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Инфраструктура и удобства</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
            {village.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4"
              >
                {feature.includes("Газ") && <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />}
                {feature.includes("Охрана") && <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />}
                {feature.includes("Асфальт") && <Car className="w-5 h-5 text-green-600 flex-shrink-0" />}
                {!feature.includes("Газ") && !feature.includes("Охрана") && !feature.includes("Асфальт") && (
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                )}
                <span className="text-gray-700 text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plots */}
      {village.plots && village.plots.length > 0 && (
        <PlotsList plots={village.plots} villageName={village.name} priceFrom={village.priceFrom} />
      )}

      {/* Map */}
      <VillageMap coords={village.coords} name={village.name} />

      {/* CTA */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Хотите посмотреть участки в {village.name}?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Запишитесь на бесплатный просмотр. Мы организуем экскурсию
            и покажем все доступные участки.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#contacts"
              className="inline-flex items-center justify-center bg-white text-green-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors"
            >
              Записаться на просмотр
            </a>
            <a
              href="tel:+79859052555"
              className="inline-flex items-center justify-center bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/30"
            >
              +7 (985) 905-25-55
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
