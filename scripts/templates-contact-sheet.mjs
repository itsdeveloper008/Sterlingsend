/**
 * Build an 8-layout contact sheet (one colour each) into .design-review/
 * Usage: node scripts/templates-contact-sheet.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const OUT = path.join(process.cwd(), ".design-review");
mkdirSync(OUT, { recursive: true });

const LAYOUTS = [
  "classic-teal",
  "modern-navy",
  "bold-emerald",
  "minimal-slate",
  "sidebar-rose",
  "band-amber",
  "framed-indigo",
  "split-cyan",
];

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
const page = await browser.newPage({
  viewport: { width: 1600, height: 2200 },
  deviceScaleFactor: 1,
});

const shots = [];
for (const id of LAYOUTS) {
  await page.goto(`${BASE}/dev/template-thumb?id=${id}`, {
    waitUntil: "networkidle",
  });
  await page.waitForSelector("[data-invoice-builder-card]");
  await page.addStyleTag({
    content:
      ".builder-logo-box,.builder-add-item,.builder-row-remove,.builder-discount-toggle{display:none!important}",
  });
  const buf = await page.locator("[data-invoice-builder-card]").screenshot({
    type: "png",
  });
  shots.push({ id, buf });
  console.log("captured", id);
}

// Compose 2×4 grid in browser
await page.setViewportSize({ width: 1480, height: 2100 });
const dataUris = shots.map(
  (s) => `data:image/png;base64,${s.buf.toString("base64")}`,
);
await page.setContent(`<!doctype html><html><body style="margin:0;background:#0f172a;padding:24px;font-family:system-ui">
<h1 style="color:#fff;font-size:18px;margin:0 0 16px">Template layouts contact sheet</h1>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
${shots
  .map(
    (s, i) => `<div style="background:#fff;border-radius:8px;overflow:hidden">
  <div style="padding:8px 10px;font-size:12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">${s.id}</div>
  <img src="${dataUris[i]}" style="width:100%;display:block"/>
</div>`,
  )
  .join("")}
</div>
</body></html>`);
await page.waitForTimeout(300);
await page.screenshot({
  path: path.join(OUT, "templates-contact-sheet.png"),
  fullPage: true,
});
console.log("wrote", path.join(OUT, "templates-contact-sheet.png"));
await browser.close();
