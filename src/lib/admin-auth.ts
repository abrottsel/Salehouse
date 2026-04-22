/**
 * Simple cookie-based admin auth for /admin/vpn.
 * Not production-grade (no JWT, no CSRF) but enough to keep casual
 * visitors out. Password is compared against ADMIN_VPN_PASSWORD env.
 */

import { cookies } from "next/headers";
import crypto from "node:crypto";

const ADMIN_PASSWORD = process.env.ADMIN_VPN_PASSWORD || "";
const COOKIE_NAME = "admin_vpn";

function sign(value: string): string {
  const secret = process.env.DEPLOY_SECRET;
  if (!secret || secret.length < 16) {
    // Без секрета подпись предсказуема — это равносильно отсутствию
    // защиты. Падаем громко, чтобы проблему увидели в логах + юзер
    // получил 500 вместо «молчаливой» уязвимости.
    throw new Error(
      "DEPLOY_SECRET is not configured (or too short) — admin cookie signing is insecure without it",
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
    secure: true,
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
  return cookie.value === validToken();
}
