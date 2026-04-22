import { test, expect } from "@playwright/test";

/**
 * CSP violation detector. Fails if the browser's console fires any
 * "Content Security Policy" / "Refused to load" / "Refused to connect"
 * messages on the key pages we ship with /v4.
 */

const PAGES = ["/v4", "/v4/village/favorit"];

for (const path of PAGES) {
  test(`CSP clean on ${path}`, async ({ page }, testInfo) => {
    const violations: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (/(content security policy|refused to (load|connect|execute|apply))/i.test(text)) {
        violations.push(`[console.${msg.type()}] ${text}`);
      }
    });
    page.on("pageerror", (err) => violations.push(`[pageerror] ${err.message}`));

    await page.addInitScript(() => {
      window.localStorage.setItem(
        "zemplus_user_places",
        JSON.stringify([{ id: "qa", label: "Дом", address: "Москва", coords: [55.75, 37.61] }]),
      );
    });
    await page.goto(path, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(4000); // let late-loading scripts (ymaps3) run
    // For village page: click Путь to force ymaps3 + route fetch
    if (path.includes("village")) {
      const pill = page.getByRole("button", { name: /Показать маршрут/ });
      if (await pill.isVisible().catch(() => false)) {
        await pill.click();
        await page.waitForTimeout(4000);
      }
    }
    if (violations.length) {
      testInfo.attach("violations.txt", {
        body: Buffer.from(violations.join("\n")),
        contentType: "text/plain",
      });
    }
    expect(violations, `CSP violations on ${path}`).toEqual([]);
  });
}
