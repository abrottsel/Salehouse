/**
 * Site admin auth — cookie-based session for /admin (lead viewer + site editor).
 * Independent of /admin/vpn (which has its own ADMIN_VPN_PASSWORD + admin_vpn cookie).
 *
 * Flow:
 *   POST /api/admin/site/login { password } → setAuthCookie() → cookie "admin_site"
 *   /admin/(panel)/* server pages call isAuthenticated() in layout → redirect to login if false
 *   POST /api/admin/site/logout → clearAuthCookie()
 *
 * Cookie value is `ok.<HMAC-SHA256(ADMIN_SITE_SECRET, "ok")>` — reproducible only
 * if the attacker knows the secret. Same shape as lib/admin-auth.ts (VPN).
 */

import { cookies } from "next/headers";
import crypto from "node:crypto";

const ADMIN_PASSWORD = process.env.ADMIN_SITE_PASSWORD || "";
const COOKIE_NAME = "admin_site";

function sign(value: string): string {
  const secret = process.env.ADMIN_SITE_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "ADMIN_SITE_SECRET is not configured (or too short) — admin cookie signing is insecure without it",
    );
  }
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function validToken(): string {
  return `ok.${sign("ok")}`;
}

export function passwordMatches(pwd: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  if (pwd.length !== ADMIN_PASSWORD.length) return false;
  return crypto.timingSafeEqual(Buffer.from(pwd), Buffer.from(ADMIN_PASSWORD));
}

export async function setAuthCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, validToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 3600, // 7 days
  });
}

export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME);
  if (!cookie) return false;
  try {
    return cookie.value === validToken();
  } catch {
    // sign() can throw if secret is missing — treat as unauthenticated
    return false;
  }
}
