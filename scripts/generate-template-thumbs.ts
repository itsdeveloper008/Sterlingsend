/**
 * Capture all 88 template thumbs from the live sheet at /dev/template-thumb?id=
 * Requires a running production build (default http://127.0.0.1:3103).
 *
 * Usage: npx tsx scripts/generate-template-thumbs.ts [baseUrl]
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { INVOICE_TEMPLATES } from "../pdf/templates/catalog";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const OUT_DIR = path.join(process.cwd(), "public", "templates");
const WIDTH = 720;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const chromePath =
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });
  const page = await browser.newPage({
    viewport: { width: WIDTH + 80, height: 1100 },
    deviceScaleFactor: 1,
  });

  let bytes = 0;
  for (const template of INVOICE_TEMPLATES) {
    await page.goto(`${BASE}/dev/template-thumb?id=${template.id}`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector("[data-invoice-builder-card]");
    // Hide interactive chrome that may still paint
    await page.addStyleTag({
      content: `
        .builder-logo-box, .builder-add-item, .builder-row-remove,
        .builder-discount-toggle { display: none !important; }
        body { background: #e2e8f0 !important; }
      `,
    });
    const card = page.locator("[data-invoice-builder-card]");
    const buffer = await card.screenshot({ type: "webp", quality: 78 });
    const filePath = path.join(OUT_DIR, `${template.id}.webp`);
    await writeFile(filePath, buffer);
    bytes += buffer.byteLength;
    console.log(`wrote ${template.id}.webp (${buffer.byteLength} bytes)`);
  }

  await browser.close();
  console.log(
    `\nDone: ${INVOICE_TEMPLATES.length} thumbs, ${(bytes / 1024).toFixed(1)} KB total (${(bytes / 1024 / 1024).toFixed(2)} MB)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
