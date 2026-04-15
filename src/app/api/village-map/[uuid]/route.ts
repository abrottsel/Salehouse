import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 hour

interface RawPlot {
  number?: string;
  area?: number;
  price_per_hundred?: number;
  total_cost?: number;
  status_name?: string;
  coords?: [number, number][];
  center?: [number, number];
  kadastr?: string;
  price_tier?: number;
}

interface RawResponse {
  village?: {
    id?: string;
    name?: string;
    center?: [number, number];
  };
  plots?: RawPlot[];
  village_coords?: [number, number][];
  price_tiers?: number[];
  statistics?: {
    free?: number;
    sold?: number;
    reserved?: number;
    other?: number;
  };
  cached_at?: string;
}

export interface NormalizedPlot {
  number: string;
  area: number;
  pricePerHundred: number;
  totalCost: number;
  statusName: string;
  coords: [number, number][];
  center: [number, number];
  kadastr: string;
  priceTier: number;
}

export interface NormalizedVillageMap {
  villageId: string;
  villageName: string;
  center: [number, number];
  villageCoords: [number, number][];
  priceTiers: number[];
  statistics: {
    free: number;
    sold: number;
    reserved: number;
    other: number;
  };
  plots: NormalizedPlot[];
}

// Simple in-memory cache
const cache = new Map<string, { data: NormalizedVillageMap; expires: number }>();
const CACHE_MS = 60 * 60 * 1000; // 1 hour

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  if (!/^[a-f0-9-]{36}$/i.test(uuid)) {
    return NextResponse.json({ error: "Invalid UUID" }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(uuid);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const apiUrl = `http://map.zemexx.ru/v2/api.php?village_id=${encodeURIComponent(uuid)}`;
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      );
    }

    const raw = (await res.json()) as RawResponse;

    // Upstream's `price_tier` field is a raw group number from zemexx's CMS
    // (we've observed values like 1, 3, 6 for a 5-tier village), not an
    // index into `price_tiers`. Remap it by scanning the plot's
    // pricePerHundred against the sorted priceTiers array so the UI can
    // safely use `TIER_COLORS[priceTier]` without falling through to the
    // default color for most plots.
    const sortedTiers = [...(raw.price_tiers ?? [])].sort((a, b) => a - b);
    const resolveTier = (pricePerHundred: number): number => {
      if (sortedTiers.length === 0) return 0;
      // Index of the largest tier threshold that's <= price. A plot priced
      // exactly at a threshold lands on that threshold.
      let idx = 0;
      for (let i = 0; i < sortedTiers.length; i++) {
        if (sortedTiers[i] <= pricePerHundred) idx = i;
        else break;
      }
      return idx;
    };

    const plots: NormalizedPlot[] = (raw.plots ?? []).map((p) => {
      const pricePerHundred = p.price_per_hundred ?? 0;
      return {
        number: p.number ?? "",
        area: p.area ?? 0,
        pricePerHundred,
        totalCost: p.total_cost ?? 0,
        statusName: p.status_name ?? "",
        coords: p.coords ?? [],
        center: p.center ?? [0, 0],
        kadastr: p.kadastr ?? "",
        priceTier: resolveTier(pricePerHundred),
      };
    });

    // Compute statistics from plot statuses (upstream `statistics` block is often missing)
    const stats = { free: 0, sold: 0, reserved: 0, other: 0 };
    for (const p of plots) {
      const s = p.statusName;
      if (s === "Свободен" || s === "Свободный") stats.free++;
      else if (s === "Продан" || s === "Продано") stats.sold++;
      else if (s === "Бронь" || s === "Забронирован") stats.reserved++;
      else stats.other++;
    }

    const normalized: NormalizedVillageMap = {
      villageId: raw.village?.id ?? uuid,
      villageName: raw.village?.name ?? "",
      center: raw.village?.center ?? [0, 0],
      villageCoords: raw.village_coords ?? [],
      priceTiers: raw.price_tiers ?? [],
      statistics: {
        free: raw.statistics?.free ?? stats.free,
        sold: raw.statistics?.sold ?? stats.sold,
        reserved: raw.statistics?.reserved ?? stats.reserved,
        other: raw.statistics?.other ?? stats.other,
      },
      plots,
    };

    cache.set(uuid, { data: normalized, expires: Date.now() + CACHE_MS });

    return NextResponse.json(normalized, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (err) {
    console.error("village-map proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch map data" },
      { status: 500 }
    );
  }
}
