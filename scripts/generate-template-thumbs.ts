/**
 * Renders each invoice template preview and saves WebP thumbs (~480px wide).
 *
 * Usage: npx tsx scripts/generate-template-thumbs.ts
 * Requires Playwright Chromium: npx playwright install chromium
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import {
  INVOICE_TEMPLATES,
  type InvoiceTemplateDefinition,
} from "../pdf/templates/catalog";

const OUT_DIR = path.join(process.cwd(), "public", "templates");
const WIDTH = 480;
const HEIGHT = 640;

function previewHtml(template: InvoiceTemplateDefinition) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    background: linear-gradient(160deg, ${template.accent}33, ${template.primary}22);
    padding: 28px;
  }
  .sheet {
    height: 100%;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    flex-direction: column;
  }
  .bar { height: 10px; width: 96px; border-radius: 3px; background: ${template.primary}; }
  .title { margin-top: 20px; font-size: 22px; font-weight: 700; color: #0f172a; }
  .line { margin-top: 10px; height: 8px; border-radius: 3px; background: #e2e8f0; }
  .line.short { width: 55%; }
  .line.mid { width: 72%; }
  .rows { margin-top: auto; display: grid; gap: 8px; }
  .row { height: 8px; border-radius: 3px; background: #f1f5f9; }
  .footer { margin-top: 18px; font-size: 12px; color: #64748b; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="bar"></div>
    <div class="title">${escapeHtml(template.name)}</div>
    <div class="line mid"></div>
    <div class="line short"></div>
    <div class="rows">
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
      <div class="row"></div>
    </div>
    <div class="footer">${escapeHtml(template.layout)} · ${escapeHtml(template.palette)}</div>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  let bytes = 0;
  for (const template of INVOICE_TEMPLATES) {
    await page.setContent(previewHtml(template), { waitUntil: "load" });
    const buffer = await page.screenshot({ type: "webp", quality: 72 });
    const filePath = path.join(OUT_DIR, `${template.id}.webp`);
    await writeFile(filePath, buffer);
    bytes += buffer.byteLength;
    console.log(`wrote ${template.id}.webp (${buffer.byteLength} bytes)`);
  }

  await browser.close();
  console.log(
    `\nDone: ${INVOICE_TEMPLATES.length} thumbs, ${(bytes / 1024).toFixed(1)} KB total`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
