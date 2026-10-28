/**
 * Capture invoice sheet screenshots and three template PDF bytes for Phase 1 visual lock.
 * Usage: node scripts/capture-invoice-refs.mjs before|after
 */
import { chromium } from "playwright";
import { createHash } from "crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const phase = process.argv[2] === "after" ? "after" : "before";
const outDir = join(process.cwd(), ".phase1-refs", phase);
mkdirSync(outDir, { recursive: true });

const BASE = process.env.BASE_URL || "http://localhost:3000";
const TEMPLATES = ["classic-teal", "modern-navy", "bold-rose"];

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
const page = await browser.newPage();

for (const width of [1440, 390]) {
  await page.setViewportSize({
    width,
    height: width === 1440 ? 1200 : 844,
  });
  await page.goto(`${BASE}/create-invoice`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForSelector(".builder-card", { timeout: 30000 });
  // Sheet only (exclude action bar chrome)
  const target = page.locator(".builder-card").first();
  const path = join(outDir, `sheet-${width}.png`);
  await target.screenshot({ path, animations: "disabled" });
  const buf = readFileSync(path);
  writeFileSync(
    join(outDir, `sheet-${width}.sha256`),
    `${sha256(buf)}\n`,
  );
  console.log(`wrote ${path} (${buf.length} bytes)`);
}

// Generate PDFs via the download button for three templates by patching localStorage
for (const templateId of TEMPLATES) {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto(`${BASE}/create-invoice`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForSelector(".builder-card, .builder-sheet", { timeout: 30000 });

  await page.evaluate((id) => {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("ss_"),
    );
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if ("templateId" in parsed) parsed.templateId = id;
          if (parsed.invoice && typeof parsed.invoice === "object") {
            parsed.invoice.templateId = id;
          }
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }
    }
  }, templateId);

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".builder-card, .builder-sheet", { timeout: 30000 });

  // Intercept download if possible; otherwise screenshot PDF template offscreen
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 45000 }).catch(() => null),
    page
      .getByRole("button", { name: /download pdf/i })
      .click({ timeout: 10000 })
      .catch(() => null),
  ]);

  if (download) {
    const pdfPath = join(outDir, `pdf-${templateId}.pdf`);
    await download.saveAs(pdfPath);
    const buf = readFileSync(pdfPath);
    writeFileSync(join(outDir, `pdf-${templateId}.sha256`), `${sha256(buf)}\n`);
    console.log(`wrote ${pdfPath} (${buf.length} bytes)`);
  } else {
    // Fallback: capture the printable sheet as visual proxy
    const fallback = join(outDir, `pdf-${templateId}-fallback.png`);
    const card = page.locator(".builder-card").first();
    const target =
      (await card.count()) > 0 ? card : page.locator(".builder-sheet").first();
    await target.screenshot({ path: fallback, animations: "disabled" });
    const buf = readFileSync(fallback);
    writeFileSync(
      join(outDir, `pdf-${templateId}-fallback.sha256`),
      `${sha256(buf)}\n`,
    );
    console.log(`fallback screenshot ${fallback} (download not captured)`);
  }
}

await browser.close();

if (phase === "after" && existsSync(join(process.cwd(), ".phase1-refs", "before"))) {
  const beforeDir = join(process.cwd(), ".phase1-refs", "before");
  const names = [
    "sheet-1440.sha256",
    "sheet-390.sha256",
    ...TEMPLATES.flatMap((id) => [
      `pdf-${id}.sha256`,
      `pdf-${id}-fallback.sha256`,
    ]),
  ];
  console.log("\n=== DIFF vs before ===");
  for (const name of names) {
    const a = join(beforeDir, name);
    const b = join(outDir, name);
    if (!existsSync(a) || !existsSync(b)) {
      console.log(`${name}: missing (skip)`);
      continue;
    }
    const ha = readFileSync(a, "utf8").trim();
    const hb = readFileSync(b, "utf8").trim();
    console.log(`${name}: ${ha === hb ? "IDENTICAL" : "DIFFERENT"}`);
    if (ha !== hb) {
      console.log(`  before ${ha}`);
      console.log(`  after  ${hb}`);
    }
  }
}
