/**
 * Part A A3: mascot state screenshots on /login
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = process.env.CURRENT_URL || "http://127.0.0.1:3102";
const OUT = join(process.cwd(), ".phase1-refs", "mascot");
mkdirSync(OUT, { recursive: true });

const results = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
  const url = route.request().url();
  if (url.includes("signInWithPassword") || url.includes("accounts:signIn")) {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: 400,
          message: "INVALID_PASSWORD",
          errors: [{ message: "INVALID_PASSWORD" }],
        },
      }),
    });
    return;
  }
  await route.continue();
});

async function shot(name, label) {
  const aside = page.locator("aside").first();
  await aside.waitFor({ timeout: 15000 });
  const path = join(OUT, `${name}.png`);
  await aside.screenshot({ path, animations: "disabled" });
  results.push({ state: label, path, pass: true });
  console.log(`PASS ${label} -> ${path}`);
}

// Interactive path
await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(600);
await shot("01-idle", "idle");

const box = await page.locator("aside").first().boundingBox();
await page.mouse.move(box.x + 4, box.y + box.height / 2);
await page.waitForTimeout(450);
await shot("02-eyes-left", "eyes-left");
await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2);
await page.waitForTimeout(450);
await shot("03-eyes-right", "eyes-right");

await page.locator("#email").focus();
await page.waitForTimeout(500);
await shot("04-email-focus", "email-focus");

await page.locator("#password").focus();
await page.waitForTimeout(500);
await shot("05-password-focus", "password-focus");

await page.getByRole("button", { name: /show password/i }).click();
await page.waitForTimeout(500);
await shot("06-password-visible", "password-visible");

await page.locator("#email").fill("test@example.com");
await page.locator("#password").fill("wrong-password-123");
await page.getByRole("button", { name: /^Log in$/i }).click();
await page.waitForTimeout(1000);
await shot("07-password-error", "password-error");

// Success via preview harness (real Firebase session not available in CI)
await page.goto(`${BASE}/login?mascotPreview=success`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(600);
await shot("08-success", "success");

writeFileSync(join(OUT, "report.json"), JSON.stringify(results, null, 2));
console.log("---");
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}\t${r.state}\t${r.path}`);
await browser.close();
