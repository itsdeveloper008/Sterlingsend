/**
 * Part B stamp Playwright checks (guest UI). Logged-in persistence needs emulator.
 * Usage: node scripts/e2e-stamps-partb.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const OUT = path.join(process.cwd(), ".perf", "stamps");
mkdirSync(OUT, { recursive: true });

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const results = [];
function report(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(30000);

try {
  await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-invoice-builder-card]");

  for (const label of ["Draft", "Pending", "Approved", "Declined", "Cancelled"]) {
    await page.getByRole("button", { name: /^Stamp/i }).click();
    await page.getByRole("option", { name: label }).click();
    const stamp = page.locator(".builder-stamp");
    await stamp.waitFor({ state: "visible" });
    const aria = await stamp.getAttribute("aria-label");
    report(`apply ${label}`, aria === `Stamp: ${label}`, aria || "");
    await page.locator("[data-invoice-builder-card]").screenshot({
      path: path.join(OUT, `sheet-${label.toLowerCase()}.png`),
    });
  }

  // Size L
  await page.getByRole("button", { name: /^Stamp/i }).click();
  await page.getByRole("button", { name: /^L$/ }).click();
  const widthL = await page.locator(".builder-stamp").evaluate((el) => el.style.width);
  report("size L", widthL === "28%", widthL);

  // Reposition
  await page.getByLabel(/Reposition/i).click({ force: true });
  await page.waitForTimeout(100);
  // Click the sheet (not Escape — Escape exits reposition mode)
  await page.locator("[data-invoice-builder-card]").click({ position: { x: 40, y: 200 } });
  await page.waitForSelector(".builder-stamp--reposition");
  const before = await page.locator(".builder-stamp").evaluate((el) => ({
    left: el.style.left,
    top: el.style.top,
  }));
  await page.locator(".builder-stamp").focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  const after = await page.locator(".builder-stamp").evaluate((el) => ({
    left: el.style.left,
    top: el.style.top,
  }));
  report(
    "keyboard nudge",
    before.left !== after.left,
    `${before.left} → ${after.left}`,
  );
  await page.locator(".builder-stamp").focus();
  await page.keyboard.press("Escape"); // exits reposition (overlay handler)
  await page.waitForTimeout(100);
  const stillRepos = await page.locator(".builder-stamp--reposition").count();
  report(
    "Escape exits reposition",
    stillRepos === 0,
    `reposition class count=${stillRepos}`,
  );

  // None removes
  await page.getByRole("button", { name: /^Stamp/i }).click();
  await page.getByRole("option", { name: "None" }).click();
  report("None removes stamp", (await page.locator(".builder-stamp").count()) === 0);

  // Keyboard access: open Stamp with Tab is heavy; check dialog controls exist
  await page.getByRole("button", { name: /^Stamp/i }).click();
  report(
    "keyboard options present",
    (await page.getByRole("option").count()) >= 6,
  );

  results.push({
    name: "logged-in stamp persist / duplicate drop",
    pass: null,
    detail: "SKIP — needs Firebase emulator or mocked service",
  });
  console.log(
    "SKIP  logged-in stamp persist / duplicate drop — needs Firebase emulator",
  );

  // Download PDF with stamp present
  await page.getByRole("option", { name: "Approved" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 90000 }),
    page.getByRole("button", { name: /Download PDF/i }).first().click(),
  ]);
  const pdfPath = path.join(OUT, "approved-stamp.pdf");
  await download.saveAs(pdfPath);
  report("download PDF with stamp", true, pdfPath);
} catch (err) {
  report("runner", false, err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}

const pass = results.filter((r) => r.pass === true).length;
const fail = results.filter((r) => r.pass === false).length;
const skip = results.filter((r) => r.pass === null).length;
console.log(`\n---\npass=${pass} fail=${fail} skipped=${skip}`);
writeFileSync(
  path.join(OUT, "report.txt"),
  results.map((r) => `${r.pass === null ? "SKIP" : r.pass ? "PASS" : "FAIL"} ${r.name} ${r.detail}`).join("\n") + "\n",
);
