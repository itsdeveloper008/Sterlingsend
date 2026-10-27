/**
 * Design-review screenshots for nav / sheet / colour / layouts redesign.
 * Usage: node scripts/design-review-redesign.mjs http://127.0.0.1:3000
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const OUT = path.join(process.cwd(), ".design-review");
mkdirSync(OUT, { recursive: true });

const chromePath =
  process.env.CHROME_PATH ||
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  undefined;
const browser = await chromium.launch({
  headless: true,
  ...(chromePath ? { executablePath: chromePath } : {}),
});

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(file);
}

async function withViewport(width, height, fn) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
  });
  try {
    await fn(page);
  } finally {
    await context.close();
  }
}

// Home + create-invoice at 1440 and 390
for (const w of [1440, 390]) {
  await withViewport(w, w === 390 ? 844 : 1100, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await shot(page, `home-${w}`);

    await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-invoice-builder-card]");
    await shot(page, `create-collapsed-${w}`);

    for (const label of ["payment details", "discount", "phone"]) {
      const btn = page.locator(`button:has-text("+ Add ${label}")`);
      if (await btn.count()) await btn.click();
    }
    await page.waitForTimeout(200);
    await shot(page, `create-optional-open-${w}`);
  });
}

// Colour Rose / Charcoal on create-invoice
await withViewport(1440, 1100, async (page) => {
  await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-invoice-builder-card]");
  await page.evaluate(() => {
    sessionStorage.setItem("ss_accent", "#BE123C");
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-invoice-builder-card]");
  // Apply via evaluate if panel exists
  await page.evaluate(() => {
    const card = document.querySelector("[data-invoice-builder-card]");
    if (card) {
      card.style.setProperty("--inv-accent", "#BE123C");
    }
  });
  // Prefer clicking Rose swatch if visible
  const rose = page.locator('button[aria-label="Rose"]');
  if (await rose.count()) await rose.click();
  await page.waitForTimeout(200);
  await shot(page, "create-colour-rose-1440");

  const charcoal = page.locator('button[aria-label="Charcoal"]');
  if (await charcoal.count()) await charcoal.click();
  await page.waitForTimeout(200);
  await shot(page, "create-colour-charcoal-1440");
});

// All 12 layouts
const layouts = [
  "classic",
  "minimal",
  "modern",
  "band",
  "sidebar",
  "split",
  "studio",
  "ledger",
  "corporate",
  "elegant",
  "soft",
  "noir",
];
await withViewport(1100, 1400, async (page) => {
  for (const id of layouts) {
    await page.goto(`${BASE}/dev/template-thumb?id=${id}`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector("[data-invoice-builder-card]");
    await page.locator("[data-invoice-builder-card]").screenshot({
      path: path.join(OUT, `layout-${id}.png`),
    });
    console.log(path.join(OUT, `layout-${id}.png`));
  }
});

// Nav guest + History hint + PDF mega + mobile menu
await withViewport(1440, 900, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shot(page, "nav-guest-1440");

  await page.context().addCookies([
    { name: "ss_auth", value: "1", url: BASE },
  ]);
  await page.reload({ waitUntil: "networkidle" });
  await shot(page, "nav-auth-hint-1440");

  const pdfBtn = page.getByRole("button", { name: /PDF tools/i });
  if (await pdfBtn.count()) {
    await pdfBtn.hover();
    await page.waitForTimeout(300);
    await shot(page, "nav-pdf-tools-open-1440");
  }
});

await withViewport(390, 844, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const menu = page.getByRole("button", { name: /Open menu|menu/i }).first();
  if (await menu.count()) {
    await menu.click();
    await page.waitForTimeout(400);
    await shot(page, "nav-mobile-menu-390");
  }
});

await browser.close();
console.log("done");
