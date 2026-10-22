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

const chromePath = process.env.CHROME_PATH || chromium.executablePath();

const results = [];
function report(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function openStampSection(page) {
  // Desktop panel or mobile Options sheet
  const stampBtn = page.getByRole("button", { name: /^Stamp/i }).first();
  if ((await stampBtn.count()) === 0) {
    await page.getByRole("button", { name: /^Options$/i }).click();
  }
  const btn = page.getByRole("button", { name: /^Stamp/i }).first();
  const expanded = await btn.getAttribute("aria-expanded");
  if (expanded !== "true") await btn.click();
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
  await page.waitForSelector("[aria-label='Invoice options']");

  for (const label of ["Draft", "Pending", "Approved", "Declined", "Cancelled"]) {
    await openStampSection(page);
    await page.getByRole("option", { name: label }).click();
    const stamp = page.locator(".builder-stamp");
    await stamp.waitFor({ state: "visible" });
    const aria = await stamp.getAttribute("aria-label");
    report(`apply ${label}`, aria === `Stamp: ${label}`, aria || "");
    await page.locator("[data-invoice-builder-card]").screenshot({
      path: path.join(OUT, `sheet-${label.toLowerCase()}.png`),
    });
  }

  await openStampSection(page);
  await page.getByRole("button", { name: /^L$/ }).click();
  const widthL = await page.locator(".builder-stamp").evaluate((el) => el.style.width);
  report("size L", widthL === "28%", widthL);

  await page.getByLabel(/Reposition/i).click({ force: true });
  await page.waitForTimeout(100);
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
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  const stillRepos = await page.locator(".builder-stamp--reposition").count();
  report(
    "Escape exits reposition",
    stillRepos === 0,
    `reposition class count=${stillRepos}`,
  );

  await openStampSection(page);
  await page.getByRole("option", { name: "None" }).click();
  report("None removes stamp", (await page.locator(".builder-stamp").count()) === 0);

  await openStampSection(page);
  report(
    "keyboard options present",
    (await page.getByRole("option").count()) >= 6,
  );

  results.push({
    name: "logged-in stamp persist / duplicate drop",
    pass: null,
    detail: "SKIP — needs Firebase emulator or mocked service",
  });
} catch (error) {
  report("suite", false, String(error?.message || error));
} finally {
  await browser.close();
  const summary = results
    .map((r) => `${r.pass === null ? "SKIP" : r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` — ${r.detail}` : ""}`)
    .join("\n");
  writeFileSync(path.join(OUT, "report.txt"), summary + "\n");
  const failed = results.filter((r) => r.pass === false).length;
  console.log(`\n${failed} failed. Report: ${path.join(OUT, "report.txt")}`);
  process.exit(failed ? 1 : 0);
}
