import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Geocoding proxy using Nominatim (OpenStreetMap) — free, no API key needed.
 *
 * Forward geocode:   GET /api/geocode?q=Москва+Тверская+1
 * Reverse geocode:   GET /api/geocode?lat=55.7&lon=37.5
 *
 * Response:
 *   { lat, lon, address }
 *   or { error } with 4xx/5xx status
 */

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

const USER_AGENT = "ZemPlus/1.0 (https://zemplus.ru)";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  try {
    // Reverse geocode
    if (lat && lon) {
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("lat", lat);
      url.searchParams.set("lon", lon);
      url.searchParams.set("format", "json");
      url.searchParams.set("accept-language", "ru");
      url.searchParams.set("zoom", "18");

      const res = await fetch(url.toString(), {
        headers: { "User-Agent": USER_AGENT, "Accept-Language": "ru" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: `nominatim ${res.status}` },
          { status: 502 }
        );
      }
      const data = (await res.json()) as NominatimResult;
      if (!data?.lat || !data?.lon) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      return NextResponse.json({
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        address: data.display_name,
      });
    }

    // Forward geocode
    if (!q || q.trim().length < 3) {
      return NextResponse.json(
        { error: "query too short" },
        { status: 400 }
      );
    }

    // Nominatim search. Bias to Russia unless query already contains other country.
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q.trim());
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("accept-language", "ru");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "ru");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ru" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `nominatim ${res.status}` },
        { status: 502 }
      );
    }
    const data = (await res.json()) as NominatimResult[];
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const first = data[0];
    return NextResponse.json({
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      address: first.display_name,
    });
  } catch (e) {
    console.error("geocode proxy error:", e);
    return NextResponse.json({ error: "geocode failed" }, { status: 500 });
  }
}
