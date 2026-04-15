import { redirect, permanentRedirect } from "next/navigation";

/**
 * Phase 5 switchover redirect.
 *
 * The ymaps3 preview used to live here while the v3 component
 * matured in parallel with the legacy 2.1 component on
 * /village/[slug]. After switchover the main village page
 * renders the new ymaps3 component directly, so this /v3 path
 * is now just a 308 permanent redirect back to /village/[slug].
 *
 * Kept as a stub for a release or two so any external links or
 * bookmarks to the preview URL still land on the real page.
 */

interface Props {
  params: Promise<{ slug: string }>;
}

// Static generation — redirect is per-slug, no network.
export async function generateStaticParams() {
  const { villages } = await import("@/lib/data");
  return villages.map((v) => ({ slug: v.slug }));
}

export default async function VillageV3Redirect({ params }: Props) {
  const { slug } = await params;
  // permanentRedirect throws a NEXT_REDIRECT with a 308 status.
  // Browsers and crawlers treat it as "moved permanently, update
  // your bookmark". Use redirect() for a 307 during dev if we
  // ever need to flip the preview back on.
  void redirect;
  permanentRedirect(`/village/${slug}`);
}
