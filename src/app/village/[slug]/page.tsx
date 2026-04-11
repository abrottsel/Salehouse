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
import {
  Shield,
  Zap,
  Car,
  TreePine,
  CheckCircle2,
  Droplets,
  Lightbulb,
  MapPin,
  Wallet,
  LayoutGrid,
  Ruler,
  Home as HomeIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/* ─── feature → icon + pastel color mapping ─── */
interface FeaturePalette {
  Icon: LucideIcon;
  bg: string;
  ring: string;
  iconBg: string;
}

function featureStyle(feature: string, fallbackIndex: number): FeaturePalette {
  const f = feature.toLowerCase();
  if (f.includes("газ"))
    return {
      Icon: Zap,
      bg: "bg-gradient-to-br from-amber-100 to-orange-200",
      ring: "ring-amber-300/70",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    };
  if (f.includes("электр"))
    return {
      Icon: Lightbulb,
      bg: "bg-gradient-to-br from-yellow-100 to-amber-200",
      ring: "ring-yellow-300/70",
      iconBg: "bg-gradient-to-br from-yellow-500 to-amber-600",
    };
  if (f.includes("вод") || f.includes("рек") || f.includes("озер"))
    return {
      Icon: Droplets,
      bg: "bg-gradient-to-br from-sky-100 to-blue-200",
      ring: "ring-sky-300/70",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    };
  if (f.includes("асфальт") || f.includes("дорог"))
    return {
      Icon: Car,
      bg: "bg-gradient-to-br from-slate-100 to-gray-200",
      ring: "ring-slate-300/70",
      iconBg: "bg-gradient-to-br from-slate-600 to-gray-800",
    };
  if (f.includes("охран") || f.includes("кпп") || f.includes("безопасн"))
    return {
      Icon: Shield,
      bg: "bg-gradient-to-br from-rose-100 to-pink-200",
      ring: "ring-rose-300/70",
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    };
  if (f.includes("лес") || f.includes("природ") || f.includes("хвой"))
    return {
      Icon: TreePine,
      bg: "bg-gradient-to-br from-emerald-100 to-green-200",
      ring: "ring-emerald-300/70",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    };
  if (f.includes("шоссе") || f.includes("направлен"))
    return {
      Icon: MapPin,
      bg: "bg-gradient-to-br from-teal-100 to-cyan-200",
      ring: "ring-teal-300/70",
      iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    };
  if (f.includes("детск") || f.includes("дом") || f.includes("ижс"))
    return {
      Icon: HomeIcon,
      bg: "bg-gradient-to-br from-violet-100 to-purple-200",
      ring: "ring-violet-300/70",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    };
  // Fallback — cycle through bold gradients
  const palettes: FeaturePalette[] = [
    {
      Icon: CheckCircle2,
      bg: "bg-gradient-to-br from-emerald-100 to-green-200",
      ring: "ring-emerald-300/70",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    },
    {
      Icon: CheckCircle2,
      bg: "bg-gradient-to-br from-sky-100 to-blue-200",
      ring: "ring-sky-300/70",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    },
    {
      Icon: CheckCircle2,
      bg: "bg-gradient-to-br from-amber-100 to-orange-200",
      ring: "ring-amber-300/70",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      Icon: CheckCircle2,
      bg: "bg-gradient-to-br from-violet-100 to-purple-200",
      ring: "ring-violet-300/70",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    },
  ];
  return palettes[fallbackIndex % palettes.length];
}

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

        {/* Info Grid + Features — bold gradients */}
        <section className="py-8 lg:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 4 stat cards — bold gradients */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-emerald-100 to-green-200 ring-1 ring-emerald-300/70 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-900/15">
                    <Wallet className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/80">
                    за сотку
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-950 leading-none tabular-nums">
                  от&nbsp;{village.priceFrom.toLocaleString("ru-RU")}&nbsp;&#8381;
                </div>
              </div>

              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-sky-100 to-blue-200 ring-1 ring-sky-300/70 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-900/15">
                    <LayoutGrid className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900/80">
                    свободно
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-sky-950 leading-none tabular-nums">
                  {village.plotsAvailable}
                </div>
              </div>

              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-amber-100 to-orange-200 ring-1 ring-amber-300/70 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-900/15">
                    <Ruler className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80">
                    соток
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-950 leading-none tabular-nums">
                  {village.areaFrom}–{village.areaTo}
                </div>
              </div>

              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-violet-100 to-purple-200 ring-1 ring-violet-300/70 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-900/15">
                    <HomeIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-900/80">
                    всего участков
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-violet-950 leading-none tabular-nums">
                  {village.plotsCount}
                </div>
              </div>
            </div>

            {/* Features header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Инфраструктура и удобства
              </div>
            </div>

            {/* Features — grid, last orphan spans 2 on mobile if needed */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              {village.features.map((feature, i) => {
                const style = featureStyle(feature, i);
                const { Icon } = style;
                const isLastOddMobile =
                  village.features.length % 2 === 1 &&
                  i === village.features.length - 1;
                return (
                  <div
                    key={feature}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 ${
                      style.bg
                    } ring-1 ${
                      style.ring
                    } shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default ${
                      isLastOddMobile ? "col-span-2 md:col-span-1" : ""
                    }`}
                  >
                    <div
                      className={`shrink-0 w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center shadow-md shadow-black/15 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-gray-900 text-sm font-bold leading-tight">
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
