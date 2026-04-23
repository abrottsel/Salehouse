import { test, expect } from "@playwright/test";

test("prod /village/favorit: ShowRouteButton appears with saved home", async ({ page, context }) => {
  await context.addInitScript(() => {
    window.localStorage.setItem(
      "zemplus_user_places",
      JSON.stringify([{ id: "qa", label: "Дом", address: "Москва", coords: [55.75, 37.61] }]),
    );
  });
  await page.goto("/village/favorit", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector("iframe[src*='zemexx']", { timeout: 15_000 });
  await page.locator("[data-frame-overlay]").scrollIntoViewIfNeeded();
  const pill = page.getByRole("button", { name: /Показать маршрут от Дом до/ });
  await expect(pill).toBeVisible({ timeout: 5_000 });
  await pill.click();
  await expect(page.getByRole("button", { name: "Закрыть маршрут" })).toBeVisible({ timeout: 5_000 });
});

test("prod /village/karetnyy-ryad: использует native InteractivePlotMap3 — iframe нет", async ({ page }) => {
  await page.goto("/village/karetnyy-ryad", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(3000);
  const iframe = await page.locator("iframe[src*='zemexx']").count();
  expect(iframe, "Каретный ряд НЕ должен иметь iframe zemexx").toBe(0);
  await page.locator("#plots-map").scrollIntoViewIfNeeded();
  const canvas = page.locator("#plots-map canvas").first();
  await expect(canvas).toBeVisible({ timeout: 15_000 });
});
