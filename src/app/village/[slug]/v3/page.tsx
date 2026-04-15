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
      <main className="min-h-screen bg-stone-50 pt-20">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 pb-8">
          {/* Breadcrumb back to the real village page */}
          <div className="mb-3 flex items-center gap-2 text-xs">
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

          <div className="mt-4 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 text-[11px] text-amber-900 leading-relaxed">
            <b>Phase 1 scope:</b> карта + полигоны + маркеры + выбор + zoom / scheme-satellite.
            Остальное (sidebar, фильтры, «Мои места», маршрут) — в Phase 2–3.
            Эта страница скрыта от поисковиков (<code>robots: noindex</code>)
            и доступна только по прямой ссылке.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
