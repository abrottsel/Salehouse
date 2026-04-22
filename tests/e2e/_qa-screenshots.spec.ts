import { test } from "@playwright/test";

const HOME_PLACE = {
  id: "qa-home",
  label: "Дом",
  address: "Москва, Красная площадь, 1",
  coords: [55.7539, 37.6208] as [number, number],
};

test("screenshot overlay open", async ({ page, context }, testInfo) => {
  await context.addInitScript((p) => {
    window.localStorage.setItem("zemplus_user_places", JSON.stringify([p]));
  }, HOME_PLACE);
  await page.goto("/v4/village/favorit", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("iframe[src*='zemexx']", { timeout: 15_000 });
  await page.locator("[data-frame-overlay]").scrollIntoViewIfNeeded();
  const putPill = page.getByRole("button", { name: /Показать маршрут от Дом до/ });
  await putPill.click();
  await page.waitForSelector('button[aria-label="Закрыть маршрут"]', { timeout: 5000 });
  await page.waitForTimeout(2500); // wait for ymaps3 to render tiles
  const shot = await page.locator("#plots-map").screenshot();
  await testInfo.attach("overlay.png", { body: shot, contentType: "image/png" });
});
