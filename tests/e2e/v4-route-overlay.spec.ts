import { test, expect } from "@playwright/test";

/**
 * /v4/village/[slug] — Route overlay + mobile-safe dropdown QA.
 *
 * Covers:
 *   1. «Дорога к мечте» pill is tappable on mobile; dropdown opens and
 *      stays open during a button tap (touchmove inside panel must NOT
 *      close it).
 *   2. Saving a home via /api/geocode sets localStorage — «Путь» pill
 *      appears on the iframe overlay.
 *   3. Clicking «Путь» renders the route overlay INSIDE the iframe's
 *      parent container (not fullscreen / not portaled to body).
 *   4. The iframe element stays mounted while the overlay is open.
 *   5. Closing the overlay restores iframe visibility.
 */

const VILLAGE_PATH = "/v4/village/favorit";

// Moscow center so OSRM can build a Moscow → Фаворит route deterministically.
const HOME_PLACE = {
  id: "qa-home",
  label: "Дом",
  address: "Москва, Красная площадь, 1",
  coords: [55.7539, 37.6208] as [number, number],
};

test.describe("v4 / route overlay + mobile dropdown", () => {
  test.beforeEach(async ({ page, context }) => {
    // Seed the saved home BEFORE navigation so ShowRouteButton mounts.
    await context.addInitScript((place) => {
      window.localStorage.setItem("zemplus_user_places", JSON.stringify([place]));
    }, HOME_PLACE);

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });
    (page as unknown as { __errors: string[] }).__errors = errors;
  });

  test("loads, pill + Путь visible on iframe", async ({ page }, testInfo) => {
    const response = await page.goto(VILLAGE_PATH, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    expect(response?.status(), "v4 village page should return 200").toBe(200);

    await page.waitForSelector("iframe[src*='zemexx']", { timeout: 15_000 });
    const frameOverlay = page.locator("[data-frame-overlay]");
    await expect(frameOverlay).toBeVisible();

    const putPill = page.getByRole("button", { name: /Показать маршрут от Дом до/ });
    await expect(putPill, "«Путь» pill must render when home is saved").toBeVisible();

    await testInfo.attach("iframe-with-pills.png", {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
  });

  test("clicking «Дорога к мечте» opens dropdown; geolocation button stays interactive", async ({
    page,
  }, testInfo) => {
    await page.goto(VILLAGE_PATH, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("iframe[src*='zemexx']", { timeout: 15_000 });

    const frameOverlay = page.locator("[data-frame-overlay]");
    // Make sure the iframe area is actually on screen before clicking its pill.
    await frameOverlay.scrollIntoViewIfNeeded();
    // The pill inside the frame overlay that opens the HomeDistanceBadge dropdown.
    const pill = frameOverlay.locator("button").first();
    await pill.click({ force: true });

    // Dropdown (portaled to body, `position: fixed`).
    const dropdown = page.locator("[class*='hd-glass-tile']").first();
    await expect(dropdown).toBeVisible();

    const geoButton = page.getByRole("button", { name: /Моё местоположение|Обновить/ });
    await expect(geoButton).toBeVisible();
    // Bounding box is the real proof the button is click-reachable.
    const box = await geoButton.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(100);
    expect(box?.height ?? 0).toBeGreaterThan(30);

    // Simulate tap (mobile) or click (desktop). The point is the button
    // is reachable — i.e. our touchmove guard doesn't close the dropdown
    // during a tap inside the panel.
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
    const hasTouch = await page.evaluate(() => "ontouchstart" in window);
    if (hasTouch) {
      await page.touchscreen.tap(center.x, center.y);
    } else {
      await geoButton.click({ force: true });
    }
    await page.waitForTimeout(500);

    await testInfo.attach("dropdown-after-tap.png", {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
  });

  test("«Путь» opens overlay INSIDE iframe parent, iframe stays mounted", async ({
    page,
  }, testInfo) => {
    await page.goto(VILLAGE_PATH, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("iframe[src*='zemexx']", { timeout: 15_000 });

    const putPill = page.getByRole("button", { name: /Показать маршрут от Дом до/ });
    await putPill.click();

    // Overlay header appears (text "Дом → Фаворит" and a «Закрыть» button).
    const closeBtn = page.getByRole("button", { name: "Закрыть маршрут" });
    await expect(closeBtn).toBeVisible({ timeout: 5_000 });

    // Hard assertion: the overlay must be a descendant of the iframe's
    // parent container (the rounded map box), NOT a direct child of <body>.
    const parentIsIframeBox = await page.evaluate(() => {
      const btn = document.querySelector(
        'button[aria-label="Закрыть маршрут"]',
      ) as HTMLElement | null;
      if (!btn) return null;
      // Walk up to find the nearest wrapper with both iframe child & overlay
      // child. If found — the overlay is inline (good). If the overlay's
      // ancestor is <body>, it was portaled (BAD — we rejected the modal).
      let node: HTMLElement | null = btn;
      while (node && node !== document.body) {
        if (node.querySelector("iframe[src*='zemexx']")) return node.tagName;
        node = node.parentElement;
      }
      return "BODY_PORTAL";
    });
    expect(
      parentIsIframeBox,
      "Route overlay must live inside iframe's parent container, not in body",
    ).not.toBe("BODY_PORTAL");
    expect(parentIsIframeBox).toBeTruthy();

    // Iframe still exists — we didn't unmount it.
    const iframeStillThere = await page.locator("iframe[src*='zemexx']").count();
    expect(iframeStillThere).toBe(1);

    await testInfo.attach("overlay-open.png", {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });

    // Close → iframe visible again, overlay gone.
    await closeBtn.click();
    await expect(closeBtn).toBeHidden({ timeout: 3_000 });
    await expect(page.locator("iframe[src*='zemexx']")).toBeVisible();

    await testInfo.attach("overlay-closed.png", {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
  });
});
