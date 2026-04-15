import { notFound } from "next/navigation";
import Link from "next/link";
import { villages } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractivePlotMap3 from "@/components/InteractivePlotMap3";
import { ArrowLeft } from "lucide-react";

/**
 * Parallel `/village/[slug]/v3` route — renders the village plot map
 * on Yandex Maps JS API 3.0. The regular `/village/[slug]` route still
 * uses the legacy 2.1 component until this v3 version reaches feature
 * parity and we cut the switchover.
 *
 * Kept deliberately minimal (no Hero, no gallery, no contact form) so
 * the focus is purely on validating the new map component during
 * Phase 1–4 of the migration.
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
  if (!village) return { title: "Посёлок — превью карты v3" };
  return {
    title: `${village.name} — карта участков (превью v3) | ЗемПлюс`,
    description: `Превью новой карты на Yandex Maps 3.0 для посёлка ${village.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function VillageV3Page({ params }: Props) {
  const { slug } = await params;
  const village = villages.find((v) => v.slug === slug);
  if (!village) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50 pt-16 lg:pt-20">
        {/* Full-bleed layout — no max-width. On 2560 px monitors the
            map fills the entire width so nothing feels cramped, and
            the sidebar + map can both breathe at their xl / 2xl sizes. */}
        <div className="px-2 sm:px-3 lg:px-4 pb-6">
          {/* Breadcrumb back to the real village page */}
          <div className="mb-2 flex items-center gap-2 text-xs">
            <Link
              href={`/village/${village.slug}`}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Назад к {village.name}
            </Link>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">
              Превью карты на Yandex Maps 3.0
            </span>
          </div>

          <InteractivePlotMap3
            villageUuid={village.mapUuid ?? ""}
            villageName={village.name}
            villageSlug={village.slug}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
