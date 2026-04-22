import type { NextConfig } from "next";

// Baseline security headers. These are additive — Cloudflare / nginx
// may still add their own. Chose conservatively so we don't break
// existing integrations (Yandex Maps, DaData, Metrika, zemexx iframe).
// Tightening CSP (script-src 'self'...) is a follow-up after inventory.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    // 2 years + includeSubDomains. Only safe if the whole apex truly
    // runs HTTPS (Cloudflare terminates + redirects :80 → :443).
    value: "max-age=63072000; includeSubDomains",
  },
  {
    // Sites we own can embed themselves in an iframe (e.g. preview).
    // Blocks the whole world from putting us in a fishing-frame.
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Stops the browser from MIME-sniffing responses — helps if a
    // user-uploaded file is ever served from the same origin.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Don't leak full URLs (with query strings) to cross-origin hosts.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Lock down browser APIs we don't use, allow only what we do.
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=()",
  },
  {
    // Strict CSP. Inventory сделан по src/ — если добавляется новая
    // интеграция (новый скрипт, iframe, fetch-upstream), ЭТОТ файл тоже
    // надо обновить, иначе браузер заблокирует и фича не поедет.
    // 'unsafe-inline' на style-src нужен для React inline style={{}}
    // объектов (они не eval, но CSP трактует их одинаково).
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' / 'unsafe-eval' временно — Next.js 16 + React 19
      // кладут inline <script> для hydration + runtime tag patching.
      // Настоящий nonce через middleware — отдельный follow-up.
      // Защита всё ещё работает: нельзя подгрузить ВНЕШНИЙ чужой JS.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api-maps.yandex.ru",
      "connect-src 'self' https://api-maps.yandex.ru https://map.zemexx.ru https://suggestions.dadata.ru",
      "frame-src 'self' https://map.zemexx.ru https://yandex.ru",
      "img-src 'self' data: https://images.unsplash.com https://zemexx.ru https://*.zemexx.ru https://mc.yandex.ru",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow dev server to serve HMR/client JS to LAN devices (iPhone via
  // Wi-Fi at http://192.168.x.x:3000). Ignored in production builds.
  allowedDevOrigins: ["192.168.3.194"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Next.js 15+ restricts allowed quality values; defaults to only [75].
    // Explicitly allow the qualities used across the codebase.
    qualities: [50, 60, 70, 75, 80, 85, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "zemexx.ru",
      },
      {
        protocol: "https",
        hostname: "zemexx.ru",
      },
    ],
  },
};

export default nextConfig;
