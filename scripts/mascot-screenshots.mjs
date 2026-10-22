/**
 * Capture auth mascot states via ?mascotPreview=
 * Usage: node scripts/mascot-screenshots.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const OUT = path.join(process.cwd(), ".perf", "mascot");
mkdirSync(OUT, { recursive: true });

const states = [
  "idle",
  "email-focus",
  "password-focus",
  "password-visible",
  "password-error",
  "success",
];

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

for (const state of states) {
  const url = `${BASE}/login?mascotPreview=${state}`;
  await page.goto(url, { waitUntil: "networkidle" });
  // Eyes follow: move pointer for left/right variants of idle
  if (state === "idle") {
    await page.mouse.move(40, 400);
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT, "idle-eyes-left.png"),
      fullPage: false,
    });
    await page.mouse.move(1200, 400);
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT, "idle-eyes-right.png"),
      fullPage: false,
    });
  }
  await page.screenshot({
    path: path.join(OUT, `${state}.png`),
    fullPage: false,
  });
  console.log("captured", state);
}

await browser.close();
console.log("Wrote screenshots to", OUT);
