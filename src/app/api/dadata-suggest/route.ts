import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * DaData Suggest proxy — true autocomplete for Russian addresses.
 *
 * Usage:  GET /api/dadata-suggest?q=Хим
 * Returns: { results: [{ lat, lon, display_name }, ...] }
 *
 * Requires DADATA_TOKEN in env. If absent → returns empty results
 * (caller falls back to Nominatim).
 *
 * Free tier: 10 000 requests/day. Sign up: https://dadata.ru/api/
 */

interface DadataAddress {
  value: string;
  data: {
    geo_lat?: string | null;
    geo_lon?: string | null;
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const token = process.env.DADATA_TOKEN;
  if (!token) {
    // No token configured → empty so frontend falls back to Nominatim
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ query: q.trim(), count: 6 }),
        next: { revalidate: 600 },
      },
    );
    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }
    const json = (await res.json()) as { suggestions?: DadataAddress[] };
    const results =
      json.suggestions
        ?.filter((s) => s.data.geo_lat && s.data.geo_lon)
        .map((s) => ({
          lat: parseFloat(s.data.geo_lat as string),
          lon: parseFloat(s.data.geo_lon as string),
          display_name: s.value,
        })) ?? [];
    return NextResponse.json({ results });
  } catch (e) {
    console.error("dadata-suggest error:", e);
    return NextResponse.json({ results: [] });
  }
}
