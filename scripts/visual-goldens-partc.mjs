/**
 * Capture / update golden screenshots for 12 layouts + default sheet.
 * Usage:
 *   node scripts/visual-goldens-partc.mjs http://127.0.0.1:3103
 *   node scripts/visual-goldens-partc.mjs http://127.0.0.1:3103 --update
 *
 * How to update goldens: re-run with --update after intentional sheet changes.
 * PDF baselines follow the shorter sheet on purpose — regenerate together.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const UPDATE = process.argv.includes("--update");
const OUT = path.join(process.cwd(), "tests", "visual", "golden");
mkdirSync(OUT, { recursive: true });

const LAYOUTS = [
  "classic",
  "ledger",
  "editorial",
  "receipt",
  "statement",
  "split",
  "corporate",
  "compact",
  "ribbon",
  "fold",
  "stack",
  "pillar",
  "clay",
  "cube",
  "tab",
  "emboss",
  "seal",
  "noir",
];

const CASES = [
  { name: "default-sheet", url: "/create-invoice" },
  ...LAYOUTS.map((id) => ({
    name: `layout-${id}`,
    url: `/dev/template-thumb?id=${id}`,
  })),
];

const TOLERANCE_PCT = 1.5;

const chromePath =
  process.env.CHROME_PATH ||
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  undefined;
const browser = await chromium.launch({
  headless: true,
  ...(chromePath ? { executablePath: chromePath } : {}),
});
const page = await browser.newPage({
  viewport: { width: 1100, height: 1400 },
  deviceScaleFactor: 1,
});

let fail = 0;
for (const c of CASES) {
  await page.goto(`${BASE}${c.url}`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-invoice-builder-card]");
  await page.addStyleTag({
    content:
      ".builder-logo-box,.builder-add-item,.builder-row-remove,.builder-discount-toggle,.builder-action-bar,.builder-login-banner,.builder-mobile-bar,.builder-optional-chip{display:none!important}",
  });
  const buf = await page.locator("[data-invoice-builder-card]").screenshot({
    type: "png",
  });
  const goldenPath = path.join(OUT, `${c.name}.png`);
  if (UPDATE || !existsSync(goldenPath)) {
    writeFileSync(goldenPath, buf);
    console.log(`${UPDATE ? "UPDATE" : "CREATE"} ${c.name}`);
    continue;
  }
  const img1 = PNG.sync.read(readFileSync(goldenPath));
  const img2 = PNG.sync.read(buf);
  const w = Math.min(img1.width, img2.width);
  const h = Math.min(img1.height, img2.height);
  const a = new PNG({ width: w, height: h });
  const b = new PNG({ width: w, height: h });
  const diff = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (w * y + x) << 2;
      const i1 = (img1.width * y + x) << 2;
      const i2 = (img2.width * y + x) << 2;
      for (let k = 0; k < 4; k++) {
        a.data[i + k] = img1.data[i1 + k];
        b.data[i + k] = img2.data[i2 + k];
      }
    }
  }
  const mismatched = pixelmatch(a.data, b.data, diff.data, w, h, {
    threshold: 0.12,
  });
  const pct = (mismatched / (w * h)) * 100;
  if (pct > TOLERANCE_PCT) {
    writeFileSync(path.join(OUT, `${c.name}.diff.png`), PNG.sync.write(diff));
    console.log(`FAIL ${c.name} mismatched=${pct.toFixed(2)}%`);
    fail++;
  } else {
    console.log(`PASS ${c.name} mismatched=${pct.toFixed(2)}%`);
  }
}

await browser.close();
console.log(fail ? `\n${fail} failed` : "\nAll goldens within tolerance");
process.exitCode = fail ? 1 : 0;
