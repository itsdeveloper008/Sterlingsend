/**
 * Screenshots for 18 templates + mint theme pass.
 * Usage: node scripts/design-review-18-theme.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const OUT = path.join(process.cwd(), ".design-review");
mkdirSync(OUT, { recursive: true });

const LAYOUTS = [
  "classic","ledger","editorial","receipt","statement","split","corporate","compact",
  "ribbon","fold","stack","pillar","clay","cube","tab","emboss","seal","noir",
];
const ACCENTS = [
  { id: "default", hex: "#0D9488" },
  { id: "light", hex: "#FDE68A" },
  { id: "dark", hex: "#1F2937" },
];
const DEPTH = ["ribbon","fold","stack","pillar","clay","cube","tab","emboss","seal","noir"];

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(file);
}

async function withVp(width, height, fn) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.setItem("ss_consent", JSON.stringify({ value: "rejected", at: new Date().toISOString() }));
  });
  try { await fn(page); } finally { await ctx.close(); }
}

for (const w of [1440, 390]) {
  await withVp(w, w === 390 ? 844 : 1100, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await shot(page, `home-${w}`);
    const strip = page.locator("section").filter({ hasText: "Invoice templates" }).first();
    if (await strip.count()) await strip.screenshot({ path: path.join(OUT, `home-templates-strip-${w}.png`) });
    const cta = page.locator("section").filter({ hasText: "Join freelancers and firms" }).first();
    if (await cta.count()) await cta.screenshot({ path: path.join(OUT, `home-cta-${w}.png`) });

    await page.goto(`${BASE}/tools`, { waitUntil: "networkidle" });
    await shot(page, `tools-${w}`);
    await page.goto(`${BASE}/templates`, { waitUntil: "networkidle" });
    await shot(page, `templates-gallery-${w}`);
    await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-invoice-builder-card]");
    await shot(page, `create-invoice-${w}`);
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await shot(page, `login-${w}`);
  });
}

await withVp(1440, 900, async (page) => {
  await page.goto(`${BASE}/templates`, { waitUntil: "networkidle" });
  const preview = page.getByRole("button", { name: /Preview Classic/i });
  if (await preview.count()) await preview.click();
  else await page.locator(".tpl-card-stage").first().click();
  await page.waitForTimeout(400);
  await shot(page, "templates-dialog-1440");
});

await withVp(1100, 1400, async (page) => {
  for (const id of LAYOUTS) {
    for (const acc of ACCENTS) {
      await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
      await page.evaluate(({ layout, hex }) => {
        sessionStorage.setItem("ss_template", layout);
        sessionStorage.setItem("ss_accent", hex);
      }, { layout: id, hex: acc.hex });
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForSelector("[data-invoice-builder-card]");
      await page.waitForTimeout(200);
      await page.locator("[data-invoice-builder-card]").screenshot({
        path: path.join(OUT, `layout-${id}-${acc.id}.png`),
      });
      console.log(path.join(OUT, `layout-${id}-${acc.id}.png`));
    }
  }
});

const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1100, height: 1400 } });
const page = await ctx.newPage();
await page.addInitScript(() => {
  localStorage.setItem("ss_consent", JSON.stringify({ value: "rejected", at: new Date().toISOString() }));
});
for (const id of DEPTH) {
  await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
  await page.evaluate((layout) => {
    sessionStorage.setItem("ss_template", layout);
    sessionStorage.setItem("ss_accent", "#0D9488");
  }, id);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  try {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 60000 }),
      page.getByRole("button", { name: /Download PDF/i }).first().click(),
    ]);
    await download.saveAs(path.join(OUT, `pdf-depth-${id}.pdf`));
    console.log(path.join(OUT, `pdf-depth-${id}.pdf`));
  } catch (e) {
    console.log("pdf-fail", id, e.message.split("\n")[0]);
  }
}
await ctx.close();

// Count home strip cards
await withVp(1440, 900, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const n = await page.locator("section").filter({ hasText: "Invoice templates" }).locator("ul > li").count();
  writeFileSync(path.join(OUT, "home-strip-count.txt"), `cards=${n}\n`);
  console.log("home strip cards", n);
});

await browser.close();
console.log("done");
