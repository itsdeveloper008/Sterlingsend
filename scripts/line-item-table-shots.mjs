/**
 * Screenshots of items table under stress values for 6 layouts × 3 widths,
 * plus PDF download capture and print preview.
 *
 * Usage: node scripts/line-item-table-shots.mjs [baseUrl]
 * Writes: .design-review/line-items-*.png
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = path.join(process.cwd(), ".design-review");
mkdirSync(OUT, { recursive: true });

const WIDTHS = [1440, 768, 390];
const LAYOUTS = [
  ["classic", "Classic"],
  ["ledger", "Ledger"],
  ["corporate", "Corporate"],
  ["split", "Split Page"],
  ["compact", "Compact"],
  ["ribbon", "Ribbon"],
];

const FIVE_LINE =
  "Line one of the description\nLine two with more detail\nLine three continues here\nLine four adds context\nLine five finishes the note";

async function prepare(page, layoutId) {
  await page.addInitScript((id) => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
    localStorage.removeItem("ss_guest_invoice");
    localStorage.removeItem("ss_guest_invoice_draft");
    localStorage.removeItem("ss_guest_invoice");
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
  await page.waitForSelector(".builder-table tbody tr", { timeout: 30000 });

  const f = { force: true };
  const desc = page.locator(".builder-table textarea").first();
  await desc.fill(FIVE_LINE, f);

  const qty = page.getByLabel("Quantity").first();
  await qty.fill("99999", f);
  await qty.blur();

  const price = page.getByLabel("Price").first();
  await price.click(f);
  await price.fill("1234567.89", f);
  await price.blur();

  const suffix = page.locator(".builder-discount-suffix").first();
  let aria = (await suffix.getAttribute("aria-label")) || "";
  if (/switch to percent/i.test(aria)) await suffix.click(f);
  const discPct = page.getByLabel("Discount percent").first();
  await discPct.fill("100", f);
  await discPct.blur();

  const vat = page.getByLabel("VAT percent").first();
  await vat.fill("20", f);
  await vat.blur();

  await page.waitForTimeout(150);
}

const browser = await chromium.launch({ headless: true });
const paths = [];

for (const [layoutId] of LAYOUTS) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 1100 },
    });
    const page = await context.newPage();
    await prepare(page, layoutId);

    const table = page.locator(".builder-table").first();
    const file = path.join(OUT, `line-items-${layoutId}-${width}.png`);
    await table.screenshot({ path: file });
    paths.push(file);
    console.log("shot", file);

    // Fixed discount stress shot at 1440 only
    if (width === 1440) {
      const suffix = page.locator(".builder-discount-suffix").first();
      const aria = (await suffix.getAttribute("aria-label")) || "";
      if (/switch to pounds/i.test(aria)) await suffix.click({ force: true });
      const amt = page.getByLabel("Discount amount").first();
      await amt.fill("99999.99", { force: true });
      await amt.blur();
      const file2 = path.join(OUT, `line-items-${layoutId}-1440-fixed.png`);
      await table.screenshot({ path: file2 });
      paths.push(file2);
      console.log("shot", file2);
    }

    await context.close();
  }
}

// PDF download + print preview (classic @ 1440)
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  await prepare(page, "classic");

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 60000 }),
    page.getByRole("button", { name: /Download PDF/i }).click(),
  ]);
  const pdfPath = path.join(OUT, "line-items-classic-download.pdf");
  await download.saveAs(pdfPath);
  paths.push(pdfPath);
  console.log("pdf", pdfPath);

  // Print preview: emulate print and screenshot table
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(300);
  const printShot = path.join(OUT, "line-items-classic-print.png");
  await page.locator(".builder-table").first().screenshot({ path: printShot });
  paths.push(printShot);
  console.log("print", printShot);

  await context.close();
}

writeFileSync(
  path.join(OUT, "line-items-index.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), paths }, null, 2),
);

await browser.close();
console.log(`\nWrote ${paths.length} artefacts to ${OUT}`);
