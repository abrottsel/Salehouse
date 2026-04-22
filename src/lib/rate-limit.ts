/**
 * Simple in-memory fixed-window rate limiter.
 *
 * Scope: per-process only (PM2 runs a single Node worker for zemplus).
 * Survives hot reload of Next routes because the Map is captured in the
 * module-level closure. Wipes on process restart — acceptable for spam
 * mitigation since a restart every few hours isn't a free pass.
 *
 * Cloudflare rate-limit rules are the primary defense and complement
 * this (edge-level, global IP-level). This module is belt-and-braces
 * for when CF is disabled, bypassed, or an attacker targets the origin
 * IP directly.
 *
 * Usage:
 *   import { rateLimit } from "@/lib/rate-limit";
 *   const { ok, retryAfterSec } = rateLimit(ip, "leads", 5, 60);
 *   if (!ok) return NextResponse.json({ error: "rate_limited" },
 *     { status: 429, headers: { "Retry-After": String(retryAfterSec) } });
 */

interface Bucket {
  count: number;
  windowStart: number; // epoch ms
}

// key = `${endpoint}:${ip}`
const store = new Map<string, Bucket>();

// GC stale entries so the Map doesn't grow unbounded. Runs every 60s.
// Pauses under vitest / SSR-only by checking `setInterval` availability.
if (typeof setInterval !== "undefined") {
  const MAX_WINDOW_MS = 15 * 60 * 1000; // nothing we rate-limit is longer
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store.entries()) {
      if (now - v.windowStart > MAX_WINDOW_MS) store.delete(k);
    }
  }, 60 * 1000).unref?.();
}

export function rateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  windowSec: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const key = `${endpoint}:${ip}`;
  const windowMs = windowSec * 1000;
  const existing = store.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { ok: true, retryAfterSec: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    const retryAfterSec = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  return { ok: true, retryAfterSec: 0 };
}

/**
 * Extract client IP. Prefer CF-Connecting-IP (Cloudflare proxy header,
 * the only one that's tamper-proof on our setup) → X-Real-IP from
 * nginx → X-Forwarded-For first entry. Falls back to a sentinel if none
 * are present (which means the request skipped all proxies — unusual).
 */
export function clientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
