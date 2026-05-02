import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-side IP geolocation fallback.
 *
 * Why this exists: in Russia, both `navigator.geolocation` stages
 * (high-accuracy GPS and Wi-Fi/Google lookup) fail for most desktop
 * users because Google's Geolocation API endpoint is blocked at the
 * network level. Yandex Maps 2.1 `ymaps.geolocation.get` requires a
 * paid API key we don't have. The only reliable path is to hit a
 * third-party IP→location service from our Moscow server (which has
 * full outbound network access) and return approximate coords to the
 * browser.
 *
 * Accuracy is city/district level — good enough for a "distance from
 * home to village" estimate. The user can then edit the address
 * manually if they want street-level precision.
 *
 * Provider: ip-api.com — free, no key required, 45 req/min per IP.
 * We could fall back to ipapi.co if ip-api fails; for now, one
 * provider keeps the flow simple.
 */
export async function GET(req: NextRequest) {
  // Extract the client IP from Cloudflare / nginx headers, in order of
  // trust. Cloudflare's `cf-connecting-ip` is the canonical real IP.
  const cfIp = req.headers.get("cf-connecting-ip");
  const xForwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const xReal = req.headers.get("x-real-ip");
  const ip = cfIp || xForwarded || xReal || "";

  // ip-api.com lets you look up a specific IP or "yourself" by
  // hitting the unauthenticated endpoint without an IP in the path.
  // We always pass the explicit IP (when available) so the result
  // matches the real visitor, not our Moscow server.
  const url = ip
    ? `http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon,timezone,query&lang=ru`
    : `http://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon,timezone,query&lang=ru`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ZemPlus/1.0 (https://zem.plus)" },
      signal: AbortSignal.timeout(7000),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `upstream ${res.status}`, ip },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      status?: string;
      message?: string;
      country?: string;
      regionName?: string;
      city?: string;
      lat?: number;
      lon?: number;
      timezone?: string;
      query?: string;
    };

    if (data.status !== "success" || typeof data.lat !== "number") {
      return NextResponse.json(
        {
          ok: false,
          error: data.message || "lookup failed",
          ip: data.query || ip,
        },
        { status: 404 },
      );
    }

    const address = [data.city, data.regionName, data.country]
      .filter(Boolean)
      .join(", ");

    return NextResponse.json({
      ok: true,
      lat: data.lat,
      lon: data.lon,
      address,
      city: data.city,
      region: data.regionName,
      country: data.country,
      ip: data.query || ip,
      provider: "ip-api.com",
      approximate: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[my-ip-location] fetch failed:", msg);
    return NextResponse.json(
      { ok: false, error: msg, ip },
      { status: 500 },
    );
  }
}
