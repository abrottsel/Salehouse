/**
 * Fetch live plot statistics from zemexx API.
 *
 * Endpoint: https://map.zemexx.ru/v2/api.php?village_id={UUID}
 * Returns: { stat: { free, sold, reserved, other }, ... }
 *
 * We cache results for 15 minutes via Next.js fetch cache so the site
 * stays in sync with zemexx without manual edits after each sale.
 */

export interface VillageStats {
  plotsAvailable: number; // free + reserved often shown together; we use free
  plotsCount: number; // total plots
  reserved: number;
  sold: number;
  /** True if fetched live from zemexx; false if we fell back to cached data.ts */
  fresh: boolean;
}

/**
 * Extract village UUID from an iframeMapUrl like
 * `https://map.zemexx.ru/v2/index.php?village_id=abda6f53-fe62-11eb-944b-ac1f6b478593`
 */
export function extractVillageUuid(
  iframeMapUrl: string | undefined,
  mapUuid: string | undefined,
): string | null {
  if (mapUuid) return mapUuid;
  if (!iframeMapUrl) return null;
  const match = iframeMapUrl.match(/village_id=([0-9a-f-]+)/i);
  return match ? match[1] : null;
}

/**
 * Fetch fresh stats for a single village.
 * Cached for 15 minutes via Next.js `revalidate: 900`.
 * Falls back to fallbackStats on any error (network, parsing).
 */
export async function fetchVillageStats(
  uuid: string,
  fallback: { plotsAvailable: number; plotsCount: number },
): Promise<VillageStats> {
  try {
    const res = await fetch(
      `https://map.zemexx.ru/v2/api.php?village_id=${uuid}`,
      { next: { revalidate: 900 } }, // 15 min ISR
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const stat = data?.stat;
    if (
      !stat ||
      typeof stat.free !== "number" ||
      typeof stat.sold !== "number"
    ) {
      throw new Error("invalid stat shape");
    }
    const free = stat.free || 0;
    const sold = stat.sold || 0;
    const reserved = stat.reserved || 0;
    const other = stat.other || 0;
    return {
      plotsAvailable: free,
      plotsCount: free + sold + reserved + other,
      reserved,
      sold,
      fresh: true,
    };
  } catch {
    return {
      plotsAvailable: fallback.plotsAvailable,
      plotsCount: fallback.plotsCount,
      reserved: 0,
      sold: Math.max(0, fallback.plotsCount - fallback.plotsAvailable),
      fresh: false,
    };
  }
}

/**
 * Fetch stats for many villages in parallel, keyed by slug.
 */
export async function fetchAllVillageStats<
  V extends {
    slug: string;
    plotsAvailable: number;
    plotsCount: number;
    iframeMapUrl?: string;
    mapUuid?: string;
  },
>(villages: V[]): Promise<Record<string, VillageStats>> {
  const entries = await Promise.all(
    villages.map(async (v) => {
      const uuid = extractVillageUuid(v.iframeMapUrl, v.mapUuid);
      if (!uuid) {
        return [
          v.slug,
          {
            plotsAvailable: v.plotsAvailable,
            plotsCount: v.plotsCount,
            reserved: 0,
            sold: 0,
            fresh: false,
          } as VillageStats,
        ] as const;
      }
      const stats = await fetchVillageStats(uuid, {
        plotsAvailable: v.plotsAvailable,
        plotsCount: v.plotsCount,
      });
      return [v.slug, stats] as const;
    }),
  );
  return Object.fromEntries(entries);
}
