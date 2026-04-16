import { notFound } from "next/navigation";
import { villages } from "@/lib/data";
import VillageHeroSwiper from "@/components/VillageHeroSwiper";
import VillageAdvantages from "@/components/VillageAdvantages";
import InteractivePlotMap from "@/components/InteractivePlotMap3";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

/**
 * /village/[slug] — full village detail page.
 *
 * After the Phase A rework the page is built from four blocks:
 *   1. VillageHeroSwiper — full-screen photo carousel w/ lightbox
 *   2. VillageAdvantages — signature card + feature tiles + infra
 *   3. InteractivePlotMap (ymaps3 v3) — plot picker with sidebar
 *   4. ContactForm — "Готовы обсудить?"
 *
 * Legacy components intentionally not imported:
 *   - VillageHero + VillageGallery (replaced by VillageHeroSwiper)
 *   - PlotsSection (all villages now have map UUIDs)
 *   - VillageMap (static google-ish widget, no longer needed)
 *   - InteractivePlotMap 2.1 (kept in repo for rollback)
 */

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
    title: `${village.name} — земельные участки от ${village.priceFrom.toLocaleString(
      "ru-RU",
    )} руб./сот. | ЗемПлюс`,
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
  const photos = village.photos.length > 0 ? village.photos : [FALLBACK_HERO];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* 1. Full-screen hero photo carousel */}
        <VillageHeroSwiper
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
          photos={photos}
        />

        {/* 2. Advantages + infrastructure */}
        <VillageAdvantages
          name={village.name}
          direction={village.direction}
          distance={village.distance}
          readiness={village.readiness}
          priceFrom={village.priceFrom}
          plotsAvailable={village.plotsAvailable}
          plotsCount={village.plotsCount}
          areaFrom={village.areaFrom}
          areaTo={village.areaTo}
          features={village.features}
        />

        {/* 3. Interactive plot map — either our ymaps3 widget or an
            external iframe for villages that don't have a mapUuid */}
        {village.iframeMapUrl ? (
          <section id="plots-map" className="px-2 sm:px-3 lg:px-4 pb-6">
            <div className="max-w-[1920px] mx-auto overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-lg">
              <iframe
                src={village.iframeMapUrl}
                width="100%"
                height="750"
                allow="fullscreen"
                className="block border-0"
                title={`Карта участков — ${village.name}`}
              />
            </div>
          </section>
        ) : village.mapUuid ? (
          <section id="plots-map" className="px-2 sm:px-3 lg:px-4 pb-6">
            <InteractivePlotMap
              villageUuid={village.mapUuid}
              villageName={village.name}
              villageSlug={village.slug}
            />
          </section>
        ) : null}

        {/* 4. Contact form */}
        <div id="contact-form">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
