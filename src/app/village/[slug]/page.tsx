import { notFound } from "next/navigation";
import { villages } from "@/lib/data";
import VillageHero from "@/components/VillageHero";
import VillageGallery from "@/components/VillageGallery";
import PlotsSection from "@/components/PlotsSection";
import VillageMap from "@/components/VillageMap";
import InteractivePlotMap from "@/components/InteractivePlotMap";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Shield, Zap, Car, TreePine, CheckCircle2 } from "lucide-react";

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

  // Fallback when no photos available yet (new villages waiting for upload)
  const FALLBACK_HERO =
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop";
  const heroPhoto = village.photos[0] ?? FALLBACK_HERO;
  const restPhotos = village.photos.slice(1);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero with background photo */}
        <VillageHero
          slug={village.slug}
          name={village.name}
          direction={village.direction}
          distance={village.distance}
          readiness={village.readiness}
          description={village.description}
          priceFrom={village.priceFrom}
          plotsAvailable={village.plotsAvailable}
          plotsCount={village.plotsCount}
          areaFrom={village.areaFrom}
          areaTo={village.areaTo}
          heroPhoto={heroPhoto}
        />

        {/* Gallery — auto-carousel + arrows + thumbnails */}
        {restPhotos.length > 0 && (
          <VillageGallery photos={restPhotos} name={village.name} />
        )}

        {/* Info Grid + Features */}
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-green-600 leading-none mb-2">
                  от {village.priceFrom.toLocaleString("ru-RU")}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                  &#8381; за сотку
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-gray-900 leading-none mb-2">
                  {village.plotsAvailable}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                  свободно
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-gray-900 leading-none mb-2">
                  {village.areaFrom}–{village.areaTo}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                  соток
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-gray-900 leading-none mb-2">
                  {village.plotsCount}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                  всего участков
                </div>
              </div>
            </div>

            {/* Features */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Инфраструктура и удобства
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {village.features.map((feature) => {
                let Icon = CheckCircle2;
                if (feature.includes("Газ")) Icon = Zap;
                else if (feature.includes("Охрана")) Icon = Shield;
                else if (feature.includes("Асфальт")) Icon = Car;
                else if (feature.includes("Лес") || feature.includes("Природ"))
                  Icon = TreePine;

                return (
                  <div
                    key={feature}
                    className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-green-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-800 text-sm font-medium">
                      {feature}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interactive plot map — only for villages with map UUID */}
        {village.mapUuid ? (
          <InteractivePlotMap
            villageUuid={village.mapUuid}
            villageName={village.name}
            villageSlug={village.slug}
          />
        ) : (
          village.plots && village.plots.length > 0 && (
            <PlotsSection
              plots={village.plots}
              villageName={village.name}
              priceFrom={village.priceFrom}
            />
          )
        )}

        {/* General village location map */}
        <VillageMap coords={village.coords} name={village.name} />

        {/* Contact form anchor */}
        <div id="contact-form">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
