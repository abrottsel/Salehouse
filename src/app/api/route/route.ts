import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Car route proxy.
 *
 * GET /api/route?from=lat,lon&to=lat,lon
 *
 * Returns: { distanceKm, durationMin, geometry: [[lat,lon], ...] }
 *
 * Why a proxy: OSRM's public demo server supports CORS but we can't
 * reach it directly from many Russian networks. Hitting it from our
 * Moscow box is reliable and lets us cache on the server side later
 * if needed. Also keeps the client code simple — it just gets back
 * a ready-to-render polyline in [lat, lon] order that matches Yandex
 * Maps' coordinate convention.
 *
 * Provider: router.project-osrm.org — free, no key, backed by
 * OpenStreetMap. Accuracy is road-level; time estimate is OSRM's own.
 */

type OSRMResponse = {
  code?: string;
  routes?: Array<{
    distance?: number; // meters
    duration?: number; // seconds
    geometry?: { coordinates?: [number, number][]; type?: string };
  }>;
  message?: string;
};

function parseLatLon(s: string | null): [number, number] | null {
  if (!s) return null;
  const parts = s.split(",").map((x) => parseFloat(x.trim()));
  if (parts.length !== 2) return null;
  const [lat, lon] = parts;
  if (!isFinite(lat) || !isFinite(lon)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lon < -180 || lon > 180) return null;
  return [lat, lon];
}

export async function GET(req: NextRequest) {
  const from = parseLatLon(req.nextUrl.searchParams.get("from"));
  const to = parseLatLon(req.nextUrl.searchParams.get("to"));

  if (!from || !to) {
    return NextResponse.json(
      { ok: false, error: "invalid from/to" },
      { status: 400 },
    );
  }

  // OSRM expects lon,lat order, opposite of Yandex.
  const coordsPath = `${from[1]},${from[0]};${to[1]},${to[0]}`;
  const url =
    `https://router.project-osrm.org/route/v1/driving/${coordsPath}` +
    `?overview=full&geometries=geojson&alternatives=false&steps=false`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ZemPlus/1.0 (https://zem.plus)" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `upstream ${res.status}` },
        { status: 502 },
      );
    }
    const data = (await res.json()) as OSRMResponse;
    if (data.code !== "Ok" || !data.routes?.length) {
      return NextResponse.json(
        { ok: false, error: data.message || "no route" },
        { status: 404 },
      );
    }
    const route = data.routes[0];
    const distanceKm = (route.distance ?? 0) / 1000;
    const durationMin = (route.duration ?? 0) / 60;

    // OSRM returns [lon, lat] in GeoJSON; convert to Yandex's [lat, lon].
    const geomCoords = route.geometry?.coordinates ?? [];
    const geometry: [number, number][] = geomCoords.map(([lon, lat]) => [
      lat,
      lon,
    ]);

    return NextResponse.json({
      ok: true,
      distanceKm,
      durationMin,
      geometry,
      provider: "osrm",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[route] proxy failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
