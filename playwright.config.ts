import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for ZemPlus QA pipeline.
 *
 * Runs against prod by default (https://zem-plus.ru). Override via
 * `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test` for
 * local dev validation.
 *
 * 12 device profiles covering the most popular RU-market viewports:
 *   - 4 mobiles (iPhone 15 Pro, iPhone SE, Galaxy S23, Redmi Note 12)
 *   - 1 tablet (iPad Mini)
 *   - 2 laptops (MBP 13" default, MBP 13" Retina native 2560)
 *   - 3 desktops (Full HD, 2K, 4K)
 *
 * Each project is one run of every test file at that viewport.
 * Screenshots are saved under `test-results/<project>/<test-name>/`
 * so the QA reviewer can pick up every frame.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: "test-results/playwright-report.json",
      },
    ],
    ["html", { outputFolder: "test-results/html", open: "never" }],
  ],
  outputDir: "test-results/artifacts",
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "https://zem-plus.ru",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "on",
    // Video disabled — requires ffmpeg which the Playwright installer
    // tries to download from the Microsoft CDN and hangs through the
    // current VPN route. Screenshots at every step are enough for the
    // QA review sub-agent, and traces capture actions on failure.
    video: "off",
    // Use the system Chrome installation instead of downloading
    // Playwright's bundled Chromium. Works around the Microsoft CDN
    // being unreachable through some Russian VPN exits.
    channel: "chrome",
    // The site is in Russian; make sure browser locale matches.
    locale: "ru-RU",
    timezoneId: "Europe/Moscow",
    // Bypass Cloudflare's bot defence by looking like a real browser.
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  },

  projects: [
    // ─── Mobiles ────────────────────────────────────────────────
    // All mobile profiles run on Chromium (system Chrome) with
    // manual viewport + UA overrides instead of spreading
    // devices["iPhone X"] because that bakes in `browserName: webkit`
    // which can't accept the `channel: "chrome"` we need to avoid
    // Playwright's bundled browser downloads.
    {
      name: "iphone-15-pro",
      use: {
        browserName: "chromium",
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "iphone-se",
      use: {
        browserName: "chromium",
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "galaxy-s23",
      use: {
        browserName: "chromium",
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
      },
    },
    {
      name: "redmi-note-12",
      use: {
        browserName: "chromium",
        viewport: { width: 393, height: 873 },
        deviceScaleFactor: 2.75,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (Linux; Android 13; 23028RA60L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
      },
    },

    // ─── Tablet ─────────────────────────────────────────────────
    {
      name: "ipad-mini",
      use: {
        browserName: "chromium",
        viewport: { width: 744, height: 1133 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    },

    // ─── Macbooks ───────────────────────────────────────────────
    {
      name: "mba-13",
      // MacBook Air 13" M2/M3 — default scaled viewport
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1470, height: 956 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "mbp-13-default",
      // Default MBP 13" scaled Retina — effective 1440x900
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "mbp-13-retina-2560",
      // MBP 13" running the display at native 2560x1664 / "more space"
      // scaling — what the project owner uses daily.
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1680, height: 1050 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "mbp-14",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1512, height: 982 },
        deviceScaleFactor: 2,
      },
    },

    // ─── Windows desktops ───────────────────────────────────────
    {
      name: "win-full-hd",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "win-2k",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 2560, height: 1440 },
      },
    },
    {
      name: "win-4k",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 3840, height: 2160 },
      },
    },

    // ─── Safari (WebKit) sanity check ───────────────────────────
    // Disabled in Phase 1 — requires Playwright's bundled WebKit
    // which fails to download from the Microsoft CDN through the
    // current VPN exit. Will re-enable when we can pin a mirror.
  ],
});
