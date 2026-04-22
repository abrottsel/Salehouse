import { notFound } from "next/navigation";
import { villages } from "@/lib/data";
// v4-isolated copies of prod components (HomeDistanceBadge, IframeMapOverlay,
// VillageHeroSwiper) — include mobile fixes for crosshair hit-area and
// scroll-close. Mainline /village/[slug] imports from @/components/... and
// keeps the unchanged prod behavior.
import VillageHeroSwiper from "../../_components/VillageHeroSwiper";
import IframeMapOverlay from "../../_components/IframeMapOverlay";
import VillageAdvantages from "@/components/VillageAdvantages";
import InteractivePlotMap from "@/components/InteractivePlotMap3";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShowRouteButton from "../../_components/ShowRouteButton";

/**
 * /v4/village/[slug] — same content as /village/[slug] **plus** the
 * "Путь" button that opens RouteMapModal (fullscreen ymaps3 overlay
 * with the driving polyline from the user's saved home to the village).
 *
 * Mainline /village/[slug] remains untouched — /v4 is an opt-in preview
 * route for A/B testing the route feature on production.
 *
 * Noindex (robots) so Yandex/Google don't split ranking between /village
 * and /v4/village.
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
    )} руб./сот. | ЗемПлюс (v4)`,
    description: village.description,
    robots: { index: false, follow: false },
  };
}

// Revalidate each village page every 15 minutes for live plot counts
export const revalidate = 900;

export default async function VillagePageV4({ params }: Props) {
  const { slug } = await params;
  const village = villages.find((v) => v.slug === slug);
  if (!village) notFound();

  // Fetch live plot stats from zemexx (cached 15 min, falls back to data.ts)
  const { fetchVillageStats, extractVillageUuid } = await import(
    "@/lib/village-stats"
  );
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

        {/* 3. Interactive plot map — same layout as prod, but for
            iframe villages we add <ShowRouteButton> which opens
            RouteMapModal (fullscreen ymaps3 overlay with the polyline
            route from the user's saved home to the village). */}
        {village.iframeMapUrl ? (
          <section id="plots-map" className="px-2 sm:px-3 lg:px-4 pb-6">
            <div className="max-w-[1920px] mx-auto relative overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-lg">
              <iframe
                src={village.iframeMapUrl}
                width="100%"
                height="850"
                allow="fullscreen"
                // Sandbox ограничивает что может делать zemexx: JS работает,
                // формы и попапы открываются, но iframe не может менять
                // window.top (clickjacking-protection) и не может вытянуть
                // cookie с zem-plus.ru.
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
