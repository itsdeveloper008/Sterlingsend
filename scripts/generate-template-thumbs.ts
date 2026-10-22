/**
 * Renders each invoice template preview with realistic fixture data
 * and saves WebP thumbs (720px wide, A4 aspect).
 *
 * Usage: npx tsx scripts/generate-template-thumbs.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import {
  INVOICE_TEMPLATES,
  type InvoiceTemplateDefinition,
} from "../pdf/templates/catalog";

const OUT_DIR = path.join(process.cwd(), "public", "templates");
const WIDTH = 720;
const HEIGHT = Math.round(WIDTH * 1.414);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function previewHtml(template: InvoiceTemplateDefinition) {
  const p = template.primary;
  const a = template.accent;
  const layout = template.layout;

  const header =
    layout === "bold" || layout === "band"
      ? `<div style="background:${p};color:#fff;padding:18px 20px;margin:-24px -24px 18px">
           <div style="font-size:11px;opacity:.85">INVOICE</div>
           <div style="font-size:22px;font-weight:700;margin-top:4px">INV-1042</div>
         </div>`
      : layout === "sidebar"
        ? ""
        : layout === "framed"
          ? `<div style="border:2px solid ${p};border-radius:10px;padding:14px;margin-bottom:14px">
               <div style="height:8px;width:88px;background:${p};border-radius:3px"></div>
               <div style="margin-top:10px;font-size:20px;font-weight:700;color:#0f172a">INVOICE</div>
             </div>`
          : layout === "split"
            ? `<div style="display:grid;grid-template-columns:1.2fr 1fr;gap:16px;margin-bottom:16px">
                 <div>
                   <div style="height:8px;width:72px;background:${p};border-radius:3px"></div>
                   <div style="margin-top:10px;font-size:18px;font-weight:700">Northbridge Studio</div>
                   <div style="margin-top:6px;font-size:11px;color:#64748b">14 Quay Street, Bristol BS1 4AX</div>
                 </div>
                 <div style="text-align:right">
                   <div style="font-size:20px;font-weight:700;color:${p}">INVOICE</div>
                   <div style="margin-top:6px;font-size:11px;color:#64748b">INV-1042 · 22 Oct 2026</div>
                 </div>
               </div>`
            : `<div style="height:8px;width:96px;background:${p};border-radius:3px"></div>
               <div style="margin-top:14px;font-size:22px;font-weight:700;color:#0f172a">INVOICE</div>
               <div style="margin-top:4px;font-size:12px;color:#64748b">INV-1042</div>`;

  const bodyTop =
    layout === "sidebar"
      ? `<div style="display:grid;grid-template-columns:72px 1fr;gap:16px;min-height:100%">
           <div style="background:${p};border-radius:6px"></div>
           <div>`
      : "<div>";

  const bodyClose = layout === "sidebar" ? "</div></div>" : "</div>";

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
    background: #e2e8f0;
    padding: 28px;
  }
  .sheet {
    height: 100%;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: ${layout === "minimal" ? "0" : "10px"};
    padding: 24px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 24px rgba(15,23,42,.08);
  }
  table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12px; }
  th { text-align: left; color: #64748b; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
  td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .totals { margin-top: 14px; margin-left: auto; width: 200px; font-size: 12px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; color: #475569; }
  .totals .grand { margin-top: 6px; padding-top: 8px; border-top: 2px solid ${p}; color: #0f172a; font-weight: 700; font-size: 14px; }
</style>
</head>
<body>
  <div class="sheet">
    ${bodyTop}
    ${header}
    ${
      layout === "split"
        ? ""
        : `<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:12px">
             <div>
               <div style="color:#64748b;font-weight:600;margin-bottom:4px">From</div>
               <div style="font-weight:700;color:#0f172a">Northbridge Studio</div>
               <div style="color:#64748b;margin-top:4px">14 Quay Street<br/>Bristol BS1 4AX<br/>hello@northbridge.studio</div>
             </div>
             <div>
               <div style="color:#64748b;font-weight:600;margin-bottom:4px">Billed to</div>
               <div style="font-weight:700;color:#0f172a">Harbour & Co</div>
               <div style="color:#64748b;margin-top:4px">88 King Street<br/>Manchester M2 4WQ<br/>accounts@harbour.co</div>
             </div>
           </div>`
    }
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="num">Qty</th>
          <th class="num">Rate</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Brand identity workshop</td>
          <td class="num">1</td>
          <td class="num">£1,200.00</td>
          <td class="num">£1,200.00</td>
        </tr>
        <tr>
          <td>Website design (desktop + mobile)</td>
          <td class="num">1</td>
          <td class="num">£3,400.00</td>
          <td class="num">£3,400.00</td>
        </tr>
        <tr>
          <td>Content migration support</td>
          <td class="num">6</td>
          <td class="num">£85.00</td>
          <td class="num">£510.00</td>
        </tr>
      </tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>£5,110.00</span></div>
      <div><span>Discount (5%)</span><span>-£255.50</span></div>
      <div><span>VAT (20%)</span><span>£970.90</span></div>
      <div class="grand"><span>Total</span><span>£5,825.40</span></div>
    </div>
    <div style="margin-top:auto;padding-top:16px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0">
      Payment due within 30 days. Sort code 12-34-56 · Account 12345678.
      <div style="margin-top:6px;color:${a}">${escapeHtml(template.name)}</div>
    </div>
    ${bodyClose}
  </div>
</body>
</html>`;
}

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
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  let bytes = 0;
  for (const template of INVOICE_TEMPLATES) {
    await page.setContent(previewHtml(template), { waitUntil: "load" });
    const buffer = await page.screenshot({ type: "webp", quality: 78 });
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
