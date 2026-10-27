/**
 * Part G design-review screenshots for glass + clay pass.
 * Usage: node scripts/design-review-glass-clay.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const OUT = path.join(process.cwd(), ".design-review");
mkdirSync(OUT, { recursive: true });

const LAYOUTS = [
  "classic",
  "ribbon",
  "clay",
  "pillar",
  "fold",
  "stack",
  "cube",
  "ledger",
  "editorial",
  "aurora",
  "tab",
  "noir",
];

const chromePath =
  process.env.CHROME_PATH ||
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  undefined;
const browser = await chromium.launch({
  headless: true,
  ...(chromePath ? { executablePath: chromePath } : {}),
});

async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, ...opts });
  console.log(file);
  return file;
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

const notes = [];

for (const w of [1440, 390]) {
  const h = w === 390 ? 844 : 900;
  await withViewport(w, h, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await shot(page, `home-${w}`);

    await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-invoice-builder-card]");
    await shot(page, `create-panel-stamp-collapsed-${w}`);

    const stamp = page.locator(".inv-panel button", { hasText: /Stamp/i }).first();
    if ((await stamp.count()) && (await stamp.isVisible())) {
      await stamp.click({ force: true });
      await page.waitForTimeout(200);
      await shot(page, `create-panel-stamp-open-${w}`);
    }

    const rose = page.locator('.inv-panel button[aria-label="Rose"]').first();
    if ((await rose.count()) && (await rose.isVisible())) {
      await rose.click({ force: true });
      await page.waitForTimeout(200);
      await shot(page, `create-colour-changed-${w}`);
    }

    if (w === 1440) {
      const sheetH = await page.evaluate(() => {
        const el = document.querySelector("[data-invoice-builder-card]");
        return el ? Math.round(el.getBoundingClientRect().height) : 0;
      });
      notes.push(`sheet height @1440/780-ish: ${sheetH}px`);
      writeFileSync(path.join(OUT, "sheet-height.txt"), `${sheetH}\n`);
    }
  });
}

await withViewport(1440, 900, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const pdfBtn = page.getByRole("button", { name: /PDF tools/i });
  if (await pdfBtn.count()) {
    await pdfBtn.click();
    await page.waitForTimeout(400);
    await shot(page, "nav-pdf-tools-over-hero-1440");
  }
});

await withViewport(1440, 900, async (page) => {
  await page.goto(`${BASE}/templates`, { waitUntil: "networkidle" });
  const openBtn = page.getByRole("button", { name: /Use this template|Preview|Open/i }).first();
  const cardBtn = page.locator("button, a").filter({ hasText: /Classic|Ribbon|Use/i }).first();
  if (await openBtn.count()) {
    await openBtn.click();
  } else if (await cardBtn.count()) {
    await cardBtn.click();
  }
  await page.waitForTimeout(500);
  const dialog = page.locator('[data-slot="dialog-content"]');
  if (await dialog.count()) {
    await dialog.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      const scroll = el.querySelector(".overflow-y-auto, [class*='overflow-y']");
      if (scroll) scroll.scrollTop = scroll.scrollHeight;
    });
    await page.waitForTimeout(200);
    await shot(page, "templates-dialog-scrolled-1440");
  } else {
    notes.push("template dialog not found for scrolled shot");
  }
});

await withViewport(1100, 1400, async (page) => {
  for (const id of LAYOUTS) {
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

await withViewport(1440, 900, async (page) => {
  await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-invoice-builder-card]");
  const logoBox = page.locator(".builder-logo-box").first();
  if (await logoBox.count()) {
    await logoBox.screenshot({ path: path.join(OUT, "logo-upload-size-1440.png") });
    console.log(path.join(OUT, "logo-upload-size-1440.png"));
  }
});

for (const w of [1200, 1440, 1000]) {
  await withViewport(w, 900, async (page) => {
    await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-invoice-builder-card]");
    const clip = await page.evaluate(() => {
      const panel = document.querySelector(".inv-panel");
      if (!panel) return { missing: true };
      const r = panel.getBoundingClientRect();
      const overflow =
        panel.scrollWidth > panel.clientWidth + 1 ||
        panel.scrollHeight > panel.clientHeight + 2;
      return {
        width: Math.round(r.width),
        height: Math.round(r.height),
        overflow,
      };
    });
    notes.push(`panel @${w}: ${JSON.stringify(clip)}`);
    await shot(page, `create-panel-verify-${w}`);
  });
}

writeFileSync(path.join(OUT, "notes.txt"), notes.join("\n") + "\n");
console.log("notes:", notes.join(" | "));
await browser.close();
console.log("done");
