/**
 * Confirm guest PDF path renders chosen ss_template by comparing two templates.
 * Usage: node scripts/compare-guest-templates-b2.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const OUT = path.join(process.cwd(), ".phase1-refs", "diff");
await mkdir(OUT, { recursive: true });

async function downloadGuestPdf(page, templateId) {
  await page.goto(`${BASE}/create-invoice`, { waitUntil: "domcontentloaded" });
  await page.evaluate((id) => {
    sessionStorage.setItem("ss_template", id);
  }, templateId);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Download PDF/i }).waitFor({
    state: "visible",
    timeout: 30000,
  });

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 90000 }),
    page.getByRole("button", { name: /Download PDF/i }).click(),
  ]);
  const filePath = await download.path();
  const fs = await import("node:fs/promises");
  return new Uint8Array(await fs.readFile(filePath));
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
await page.addInitScript(() => {
  localStorage.setItem(
    "ss_consent",
    JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
  );
});

const a = await downloadGuestPdf(page, "classic-teal");
const b = await downloadGuestPdf(page, "bold-navy");
await browser.close();

const sameBytes =
  a.byteLength === b.byteLength && a.every((v, i) => v === b[i]);
console.log("| template A | template B | bytes A | bytes B | identical bytes |");
console.log("|------------|------------|--------:|--------:|-----------------|");
console.log(
  `| classic-teal | bold-navy | ${a.byteLength} | ${b.byteLength} | ${sameBytes ? "YES" : "NO"} |`,
);

await writeFile(path.join(OUT, "guest-classic-teal.pdf"), a);
await writeFile(path.join(OUT, "guest-bold-navy.pdf"), b);

if (sameBytes) {
  console.log(
    "FAIL: PDFs are byte-identical; chosen template did not change output.",
  );
  process.exit(1);
}

console.log("PASS: guest PDFs differ between classic-teal and bold-navy.");
process.exit(0);
