/**
 * Premium redesign screenshots at 1440 and 390.
 * Usage: node scripts/premium-shots.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const OUT = path.join(process.cwd(), ".design-review");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  const file = path.join(OUT, `premium-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(file);
}

for (const w of [1440, 390]) {
  const context = await browser.newContext({
    viewport: { width: w, height: w === 390 ? 844 : 1100 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
  });

  for (const route of ["/", "/create-invoice", "/tools", "/templates"]) {
    const slug = route === "/" ? "home" : route.slice(1).replace(/\//g, "-");
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await shot(page, `${slug}-${w}`);
  }

  if (w === 1440) {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const pdf = page.getByRole("button", { name: /PDF tools/i });
    if (await pdf.count()) {
      await pdf.hover();
      await page.waitForTimeout(400);
      await shot(page, `nav-pdf-open-${w}`);
    }
  }

  if (w === 390) {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const menu = page.getByRole("button", { name: /Open menu|menu/i }).first();
    if (await menu.count()) {
      await menu.click();
      await page.waitForTimeout(400);
      await shot(page, `nav-mobile-open-${w}`);
    }
  }

  await context.close();
}

await browser.close();
console.log("done");
