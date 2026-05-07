import { notFound } from "next/navigation";
import { villages } from "@/lib/data";
import VillageHeroSwiper from "@/components/VillageHeroSwiper";
import VillageAdvantages from "@/components/VillageAdvantages";
import InteractivePlotMap from "@/components/InteractivePlotMap3";
import QuizSection from "@/components/QuizSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import IframeMapOverlay from "@/components/IframeMapOverlay";
import ShowRouteButton from "@/components/ShowRouteButton";
import IframeDisclosureBanner from "@/components/IframeDisclosureBanner";

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

// Revalidate each village page every 15 minutes for live plot counts
export const revalidate = 900;

export default async function VillagePage({ params }: Props) {
  const { slug } = await params;
  const village = villages.find((v) => v.slug === slug);
  if (!village) notFound();

  // Fetch live plot stats from zemexx (cached 15 min, falls back to data.ts)
  const { fetchVillageStats, extractVillageUuid } = await import("@/lib/village-stats");
  const uuid = extractVillageUuid(village.iframeMapUrl, village.mapUuid);
  const stats = uuid
    ? await fetchVillageStats(uuid, {
        plotsAvailable: village.plotsAvailable,
        plotsCount: village.plotsCount,
      })
    : { plotsAvailable: village.plotsAvailable, plotsCount: village.plotsCount };

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
          plotsAvailable={stats.plotsAvailable}
          plotsCount={stats.plotsCount}
          areaFrom={village.areaFrom}
          areaTo={village.areaTo}
          photos={photos}
          coords={village.coords}
        />

        {/* 2. Advantages + infrastructure */}
        <VillageAdvantages
          name={village.name}
          direction={village.direction}
          distance={village.distance}
          readiness={village.readiness}
          priceFrom={village.priceFrom}
          plotsAvailable={stats.plotsAvailable}
          plotsCount={stats.plotsCount}
          areaFrom={village.areaFrom}
          areaTo={village.areaTo}
          features={village.features}
        />

        {/* 3. Interactive plot map — either our ymaps3 widget or an
            external iframe for villages that don't have a mapUuid */}
        {village.iframeMapUrl ? (
          <section id="plots-map" className="px-2 sm:px-3 lg:px-4 pb-6">
            <div className="max-w-[1920px] mx-auto overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-lg">
              <IframeDisclosureBanner villageName={village.name} />
              <div className="relative">
                <iframe
                  src={village.iframeMapUrl}
                  width="100%"
                  height="850"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block border-0 w-full min-h-[750px] lg:min-h-[85vh]"
                  title={`Карта участков — ${village.name}`}
                />
                <IframeMapOverlay
                  villageCoords={village.coords}
                  villageName={village.name}
                />
                <ShowRouteButton
                  villageCoords={village.coords}
                  villageName={village.name}
                />
              </div>
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

        {/* 4. Quiz — подбор участка */}
        <QuizSection />
      </main>
      <Footer />
    </>
  );
}
