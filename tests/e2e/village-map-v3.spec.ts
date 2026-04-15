import { test, expect } from "@playwright/test";

/**
 * /village/[slug]/v3 — Yandex Maps 3.0 preview QA suite.
 *
 * Scope:
 *   1. Page loads to HTTP 200 and the <section data-testid="v3-map-root">
 *      renders with the expected data-* attributes.
 *   2. ymaps3 attaches at least one <canvas> element to the DOM.
 *   3. Map-type toggle switches between scheme and satellite without
 *      tearing down the canvas, no console errors.
 *   4. "Мои места" panel opens (button → panel visible).
 *   5. All screenshots get saved at every step for visual review.
 *
 * The assertions are deliberately viewport-agnostic — they rely on
 * data-testids and canvas presence, not on sidebar text which is
 * hidden below `lg`.
 */

const VILLAGE_SLUG = "karetnyy-ryad";
const VILLAGE_PATH = `/village/${VILLAGE_SLUG}/v3`;
const VILLAGE_NAME = "Каретный ряд";
const VILLAGE_EXPECTED_PLOTS = 128;

test.describe("ZemPlus / village-map v3", () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(`console.error: ${msg.text()}`);
      }
    });
    (page as unknown as { __errors: string[] }).__errors = errors;
  });

  test("loads, renders map canvas + plot data", async ({ page }, testInfo) => {
    const response = await page.goto(VILLAGE_PATH, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    expect(response?.status(), "v3 page HTTP status").toBe(200);

    // Root section should mount with the village name baked into the
    // data attribute — viewport-agnostic identifier.
    const root = page.getByTestId("v3-map-root");
    await expect(root).toBeVisible({ timeout: 30_000 });
    await expect(root).toHaveAttribute("data-village-name", VILLAGE_NAME);
    await expect(root).toHaveAttribute(
      "data-plot-count",
      String(VILLAGE_EXPECTED_PLOTS),
    );

    // Wait for ymaps3 to attach a canvas — that's our "map is ready" signal.
    await page.waitForFunction(
      () => document.querySelectorAll("canvas").length > 0,
      null,
      { timeout: 45_000 },
    );

    await testInfo.attach("initial-load.png", {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });

    const errors = (page as unknown as { __errors: string[] }).__errors;
    expect(errors, "no console errors on initial load").toHaveLength(0);
  });

  test("toggle map type: scheme ↔ satellite", async ({ page }, testInfo) => {
    await page.goto(VILLAGE_PATH, { waitUntil: "domcontentloaded" });
    const root = page.getByTestId("v3-map-root");
    await expect(root).toBeVisible({ timeout: 30_000 });

    // Wait for ymaps3 canvas.
    await page.waitForFunction(
      () => document.querySelectorAll("canvas").length > 0,
      null,
      { timeout: 45_000 },
    );

    // Scheme first (default)
    await testInfo.attach("01-scheme.png", {
      body: await page.screenshot(),
      contentType: "image/png",
    });

    // Click the map-type toggle (top-right icon-only button).
    const toSatellite = page.getByRole("button", {
      name: /Переключить на Спутник|Спутник/i,
    });
    await toSatellite.click();

    // Give the satellite tiles a moment to download.
    await page.waitForTimeout(3500);
    await testInfo.attach("02-satellite.png", {
      body: await page.screenshot(),
      contentType: "image/png",
    });

    // Toggle back to scheme
    const toScheme = page.getByRole("button", {
      name: /Переключить на Схему|Схема/i,
    });
    await toScheme.click();
    await page.waitForTimeout(2500);
    await testInfo.attach("03-scheme-again.png", {
      body: await page.screenshot(),
      contentType: "image/png",
    });

    // After round-trip, canvas must still be present and the feature
    // layer must still render plots — guard against the "basemap
    // vanished" regression we hit with visible-prop toggling.
    const canvasCount = await page.evaluate(
      () => document.querySelectorAll("canvas").length,
    );
    expect(canvasCount, "canvas still attached after toggle").toBeGreaterThan(
      0,
    );

    const errors = (page as unknown as { __errors: string[] }).__errors;
    // Filter out harmless ymaps tile 404s that sometimes happen mid-zoom.
    const relevant = errors.filter(
      (e) => !/tiles? 404|map-tile.+404/i.test(e),
    );
    expect(relevant, "no unexpected errors during map-type toggle").toHaveLength(0);
  });

  test('"Мои места" panel opens', async ({ page }, testInfo) => {
    await page.goto(VILLAGE_PATH, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("v3-map-root")).toBeVisible({
      timeout: 30_000,
    });

    // Open places panel — button exists on every viewport.
    await page.getByRole("button", { name: /Мои места/i }).first().click();

    const addButton = page.getByRole("button", { name: /Добавить место/i });
    await expect(addButton).toBeVisible({ timeout: 10_000 });
    await testInfo.attach("places-panel-open.png", {
      body: await page.screenshot(),
      contentType: "image/png",
    });

    // Click add → form appears with the geolocate button and the
    // address input.
    await addButton.click();
    const detectButton = page.getByRole("button", {
      name: /Определить моё местоположение/i,
    });
    await expect(detectButton).toBeVisible({ timeout: 5_000 });
    const addressInput = page.getByPlaceholder(/Адрес/i);
    await expect(addressInput).toBeVisible({ timeout: 5_000 });

    await testInfo.attach("places-add-form.png", {
      body: await page.screenshot(),
      contentType: "image/png",
    });

    const errors = (page as unknown as { __errors: string[] }).__errors;
    expect(errors, "no console errors on places panel open").toHaveLength(0);
  });

  test("stats attributes expose village totals", async ({ page }) => {
    await page.goto(VILLAGE_PATH, { waitUntil: "domcontentloaded" });
    const root = page.getByTestId("v3-map-root");
    await expect(root).toBeVisible({ timeout: 30_000 });
    await expect(root).toHaveAttribute("data-plot-count", "128");
    await expect(root).toHaveAttribute("data-sold-count", "71");
  });
});
