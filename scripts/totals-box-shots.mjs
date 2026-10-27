/**
 * Screenshots of the totals box for 6 layouts × 3 widths, plus PDF/print.
 * Usage: node scripts/totals-box-shots.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = path.join(process.cwd(), ".design-review");
mkdirSync(OUT, { recursive: true });

const WIDTHS = [1440, 768, 390];
const LAYOUTS = ["classic", "statement", "clay", "seal", "ribbon", "compact"];

async function prepare(page, layoutId) {
  await page.addInitScript((id) => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
    localStorage.removeItem("ss_guest_invoice");
    localStorage.removeItem("ss_guest_invoice_draft");
    try {
      sessionStorage.setItem("ss_template", id);
    } catch {
      /* ignore */
    }
  }, layoutId);
  await page.goto(`${BASE}/create-invoice`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForSelector(".builder-total-final", { timeout: 30000 });
  await page.evaluate(() => {
    const bar = document.querySelector(".builder-mobile-bar");
    if (bar instanceof HTMLElement) bar.style.display = "none";
  });
  const f = { force: true };
  await page.getByLabel("Quantity").first().fill("1", f);
  await page.getByLabel("Quantity").first().blur();
  await page.getByLabel("VAT percent").first().fill("20", f);
  await page.getByLabel("VAT percent").first().blur();
  await page.getByLabel("Discount percent").first().fill("0", f).catch(() => {});
  await page.getByLabel("Price").first().click(f);
  await page.getByLabel("Price").first().fill("1531", f);
  await page.getByLabel("Price").first().blur();
  await page.waitForTimeout(150);
}

const chromePath =
  process.env.CHROME_PATH ||
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  undefined;
const browser = await chromium.launch({
  headless: true,
  ...(chromePath ? { executablePath: chromePath } : {}),
});
const paths = [];

for (const layout of LAYOUTS) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 1100 },
    });
    const page = await context.newPage();
    await prepare(page, layout);
    const file = path.join(OUT, `totals-box-${layout}-${width}.png`);
    await page.locator(".builder-totals").screenshot({ path: file });
    paths.push(file);
    console.log("shot", file);
    await context.close();
  }
}

{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();
  await prepare(page, "classic");
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 60000 }),
    page.getByRole("button", { name: /Download PDF/i }).click(),
  ]);
  const pdfPath = path.join(OUT, "totals-box-classic-download.pdf");
  await download.saveAs(pdfPath);
  paths.push(pdfPath);
  console.log("pdf", pdfPath);

  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(200);
  const printShot = path.join(OUT, "totals-box-classic-print.png");
  await page.locator(".builder-totals").screenshot({ path: printShot });
  paths.push(printShot);
  console.log("print", printShot);
  await context.close();
}

writeFileSync(
  path.join(OUT, "totals-box-index.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), paths }, null, 2),
);
await browser.close();
console.log(`\nWrote ${paths.length} artefacts to ${OUT}`);
