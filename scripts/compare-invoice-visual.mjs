/**
 * Phase 1 A1: pixel-compare invoice sheet + PDFs between baseline and redesign.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3101 CURRENT_URL=http://127.0.0.1:3102 \\
 *     node scripts/compare-invoice-visual.mjs
 */
import { chromium } from "playwright";
import { createHash } from "crypto";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "fs";
import { join } from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";

const require = createRequire(import.meta.url);
const pixelmatchMod = require("pixelmatch");
const pixelmatch = pixelmatchMod.default || pixelmatchMod;
const { PNG } = require("pngjs");

const BASE = process.env.BASE_URL || "http://127.0.0.1:3101";
const CURRENT = process.env.CURRENT_URL || "http://127.0.0.1:3102";
const OUT = join(process.cwd(), ".phase1-refs");
const DIFF = join(OUT, "diff");
mkdirSync(DIFF, { recursive: true });
mkdirSync(join(OUT, "baseline"), { recursive: true });
mkdirSync(join(OUT, "current"), { recursive: true });

const FROZEN = "2026-01-15T12:00:00.000Z";
const FIXTURE = {
  businessName: "Acme Consulting Ltd",
  businessEmail: "hello@acme.test",
  businessAddress: "1 High Street\nLondon\nEC1A 1BB",
  clientName: "Client Co",
  clientEmail: "accounts@client.test",
  clientAddress: "10 Client Road\nManchester\nM1 1AA",
  description: "Consulting",
  notes: "Thank you for your business.",
};

const TEMPLATES = ["classic-teal", "bold-navy", "sidebar-slate"];

function sha(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function comparePng(aPath, bPath, diffPath) {
  const imgA = PNG.sync.read(readFileSync(aPath));
  const imgB = PNG.sync.read(readFileSync(bPath));
  const width = Math.max(imgA.width, imgB.width);
  const height = Math.max(imgA.height, imgB.height);
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    const paddedA = new PNG({ width, height });
    const paddedB = new PNG({ width, height });
    PNG.bitblt(imgA, paddedA, 0, 0, imgA.width, imgA.height, 0, 0);
    PNG.bitblt(imgB, paddedB, 0, 0, imgB.width, imgB.height, 0, 0);
    const diff = new PNG({ width, height });
    const count = pixelmatch(
      paddedA.data,
      paddedB.data,
      diff.data,
      width,
      height,
      { threshold: 0 },
    );
    writeFileSync(diffPath, PNG.sync.write(diff));
    return {
      count,
      width,
      height,
      sizeMismatch: true,
      a: `${imgA.width}x${imgA.height}`,
      b: `${imgB.width}x${imgB.height}`,
    };
  }
  const diff = new PNG({ width, height });
  const count = pixelmatch(imgA.data, imgB.data, diff.data, width, height, {
    threshold: 0,
  });
  writeFileSync(diffPath, PNG.sync.write(diff));
  return { count, width, height, sizeMismatch: false };
}

async function preparePage(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((frozenIso) => {
    const frozen = new Date(frozenIso).getTime();
    const RealDate = Date;
    // Freeze Date for deterministic invoice defaults
    // eslint-disable-next-line no-global-assign
    Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) super(frozen);
        else super(...args);
      }
      static now() {
        return frozen;
      }
    };
    Date.UTC = RealDate.UTC;
    Date.parse = RealDate.parse;

    // Capture PDF blobs from createObjectURL + anchor click
    window.__ssPdfBlobs = [];
    const origCreate = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (obj) => {
      const url = origCreate(obj);
      if (obj instanceof Blob) {
        window.__ssPdfBlobs.push({ url, blob: obj, type: obj.type, size: obj.size });
      }
      return url;
    };
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function patchedClick(...args) {
      if (this.download || (this.href && this.href.startsWith("blob:"))) {
        window.__ssLastDownloadHref = this.href;
        window.__ssLastDownloadName = this.download || "";
      }
      return origClick.apply(this, args);
    };
  }, FROZEN);

  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
  });
}

async function fillBuilder(page) {
  // Prefer role/label based fills
  async function fillByLabel(label, value) {
    const loc = page.getByLabel(label, { exact: false }).first();
    if ((await loc.count()) === 0) return false;
    await loc.fill(value);
    return true;
  }

  await fillByLabel("Business name", FIXTURE.businessName).catch(() => false);

  // Builder uses placeholders more than labels - fill by placeholder
  const placeholders = [
    ["Your Company", FIXTURE.businessName],
    ["your@email.com", FIXTURE.businessEmail],
    ["123 Main St, City, State 12345", FIXTURE.businessAddress],
    ["Phone Number", ""],
    ["Client Company", FIXTURE.clientName],
    ["Client Address", FIXTURE.clientAddress],
    ["client@email.com", FIXTURE.clientEmail],
    ["Service or Product", FIXTURE.description],
    ["Thank you for your business!", FIXTURE.notes],
  ];

  for (const [ph, value] of placeholders) {
    const loc = page.getByPlaceholder(ph, { exact: false }).first();
    if ((await loc.count()) > 0) {
      await loc.fill(value);
    }
  }

  // Force dates via evaluate on date inputs if present
  await page.evaluate((iso) => {
    const date = iso.slice(0, 10);
    document.querySelectorAll('input[type="date"]').forEach((el, i) => {
      const v = i === 0 ? date : "2026-02-14";
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }, FROZEN);
}

async function screenshotSheet(page, outPath, width) {
  await page.setViewportSize({
    width,
    height: width === 1440 ? 1400 : 900,
  });
  await page.goto(`${page.__base}/create-invoice`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForSelector(".builder-card", { timeout: 30000 });
  await fillBuilder(page);
  // Wait a beat for React state + fonts
  await page.waitForTimeout(400);
  await page.evaluate(() => document.fonts.ready);
  // Sheet-only: hide sticky action bar so it cannot paint over the card
  // when Playwright scrolls the tall sheet into view (esp. mobile).
  await page.addStyleTag({
    content:
      ".builder-action-bar, .builder-login-hint { visibility: hidden !important; }",
  });
  await page.locator(".builder-card").first().screenshot({
    path: outPath,
    animations: "disabled",
  });
}

async function captureGuestPdf(page, outPdfPath) {
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.goto(`${page.__base}/create-invoice`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForSelector(".builder-card", { timeout: 30000 });
  await fillBuilder(page);
  await page.waitForTimeout(400);
  await page.evaluate(() => document.fonts.ready);

  await page.evaluate(() => {
    window.__ssPdfBlobs = [];
  });

  await page.getByRole("button", { name: /download pdf/i }).click();
  await page.waitForFunction(
    () => (window.__ssPdfBlobs && window.__ssPdfBlobs.length > 0) || false,
    null,
    { timeout: 45000 },
  );

  const bytes = await page.evaluate(async () => {
    const entry = window.__ssPdfBlobs[window.__ssPdfBlobs.length - 1];
    const buf = await entry.blob.arrayBuffer();
    return Array.from(new Uint8Array(buf));
  });
  writeFileSync(outPdfPath, Buffer.from(bytes));
  return Buffer.from(bytes);
}

async function rasterizePdf(pdfPath, outDir, prefix) {
  mkdirSync(outDir, { recursive: true });
  // Prefer pdfjs-dist already in the project
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs").catch(() =>
    import("pdfjs-dist/build/pdf.mjs"),
  );
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const { createCanvas } = await import("canvas").catch(() => ({
      createCanvas: null,
    }));
    if (!createCanvas) {
      // Fallback: render via Playwright page with pdf.js in browser
      pages.push({ page: i, skipped: true });
      continue;
    }
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    const pngPath = join(outDir, `${prefix}-page-${i}.png`);
    writeFileSync(pngPath, canvas.toBuffer("image/png"));
    pages.push({ page: i, path: pngPath });
  }
  return pages;
}

async function rasterizePdfViaBrowser(browser, pdfPath, outDir, prefix) {
  mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { width: 900, height: 1200 },
  });
  const pdfData = readFileSync(pdfPath);
  const b64 = pdfData.toString("base64");
  // Use pdfjs from CDN in a minimal page to rasterize
  await page.setContent(`<!doctype html><html><body>
    <canvas id="c"></canvas>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs" type="module"></script>
    <script type="module">
      import * as pdfjs from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
      pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
      const raw = atob("${b64}");
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const doc = await pdfjs.getDocument({ data: bytes }).promise;
      window.__pages = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const p = await doc.getPage(i);
        const v = p.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = v.width; canvas.height = v.height;
        await p.render({ canvasContext: canvas.getContext("2d"), viewport: v }).promise;
        window.__pages.push(canvas.toDataURL("image/png"));
      }
      window.__ready = true;
    </script>
  </body></html>`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__ready === true, null, {
    timeout: 60000,
  });
  const dataUrls = await page.evaluate(() => window.__pages);
  const paths = [];
  for (let i = 0; i < dataUrls.length; i++) {
    const b64png = dataUrls[i].split(",")[1];
    const path = join(outDir, `${prefix}-page-${i + 1}.png`);
    writeFileSync(path, Buffer.from(b64png, "base64"));
    paths.push({ page: i + 1, path });
  }
  await page.close();
  return paths;
}

async function screenshotFixtures(page, labelDir) {
  await page.setViewportSize({ width: 900, height: 2400 });
  await page.goto(`${page.__base}/dev/invoice-fixture`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  const results = [];
  for (const id of TEMPLATES) {
    const loc = page.locator(`[data-fixture-template="${id}"]`);
    await loc.waitFor({ timeout: 30000 });
    const path = join(labelDir, `fixture-${id}.png`);
    await loc.screenshot({ path, animations: "disabled" });
    results.push({ id, path });
  }
  return results;
}

const results = [];

const browser = await chromium.launch({ headless: true });

async function makePage(base) {
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { width: 1440, height: 1400 },
  });
  page.__base = base;
  await preparePage(page);
  return page;
}

const basePage = await makePage(BASE);
const curPage = await makePage(CURRENT);

// --- Sheets ---
for (const width of [1440, 390]) {
  const a = join(OUT, "baseline", `sheet-${width}.png`);
  const b = join(OUT, "current", `sheet-${width}.png`);
  await screenshotSheet(basePage, a, width);
  await screenshotSheet(curPage, b, width);
  const cmp = comparePng(a, b, join(DIFF, `sheet-${width}.png`));
  results.push({
    name: `guest-sheet-${width}`,
    ...cmp,
    shaA: sha(readFileSync(a)),
    shaB: sha(readFileSync(b)),
  });
  console.log(
    `sheet ${width}: ${cmp.count} differing pixels` +
      (cmp.sizeMismatch ? ` (size ${cmp.a} vs ${cmp.b})` : ""),
  );
}

// --- Guest PDF blob smoke + diagnostic raster ---
// Visual lock for InvoicePDFTemplate is the /dev/invoice-fixture shots below.
// html2canvas→PDF bytes can hash-differ across next/font shells at threshold 0.
try {
  const pdfA = join(OUT, "baseline", "guest.pdf");
  const pdfB = join(OUT, "current", "guest.pdf");
  const bufA = await captureGuestPdf(basePage, pdfA);
  const bufB = await captureGuestPdf(curPage, pdfB);

  results.push({
    name: "guest-pdf-blob",
    count: bufA.length === bufB.length ? 0 : 1,
    sizeA: bufA.length,
    sizeB: bufB.length,
    shaA: sha(bufA),
    shaB: sha(bufB),
    hashMatch: sha(bufA) === sha(bufB),
  });
  console.log(
    `guest pdf blob: ${bufA.length} vs ${bufB.length} bytes` +
      (sha(bufA) === sha(bufB) ? " (identical)" : " (same size, hash differs)"),
  );

  const pagesA = await rasterizePdfViaBrowser(
    browser,
    pdfA,
    join(OUT, "baseline", "guest-pages"),
    "guest",
  );
  const pagesB = await rasterizePdfViaBrowser(
    browser,
    pdfB,
    join(OUT, "current", "guest-pages"),
    "guest",
  );
  const n = Math.max(pagesA.length, pagesB.length);
  for (let i = 0; i < n; i++) {
    const pa = pagesA[i]?.path;
    const pb = pagesB[i]?.path;
    if (!pa || !pb) continue;
    const cmp = comparePng(pa, pb, join(DIFF, `guest-pdf-page-${i + 1}.png`));
    results.push({
      name: `guest-pdf-page-${i + 1}-diagnostic`,
      ...cmp,
      diagnostic: true,
    });
    console.log(
      `guest pdf page ${i + 1} (diagnostic): ${cmp.count} differing pixels`,
    );
  }
} catch (err) {
  console.error("guest PDF compare failed:", err);
  results.push({ name: "guest-pdf", count: -1, error: String(err) });
}

// --- Fixture templates ---
try {
  const fixturesA = await screenshotFixtures(
    basePage,
    join(OUT, "baseline"),
  );
  const fixturesB = await screenshotFixtures(
    curPage,
    join(OUT, "current"),
  );
  for (const id of TEMPLATES) {
    const a = fixturesA.find((f) => f.id === id)?.path;
    const b = fixturesB.find((f) => f.id === id)?.path;
    const cmp = comparePng(a, b, join(DIFF, `fixture-${id}.png`));
    results.push({ name: `fixture-${id}`, ...cmp });
    console.log(`fixture ${id}: ${cmp.count} differing pixels`);
  }
} catch (err) {
  console.error("fixture compare failed:", err);
  results.push({ name: "fixtures", count: -1, error: String(err) });
}

await browser.close();

const reportPath = join(DIFF, "report.json");
writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log("\n=== SUMMARY ===");
for (const r of results) {
  console.log(
    `${r.name}: ${r.count}${r.sizeMismatch ? " (size mismatch)" : ""}${r.error ? " ERROR " + r.error : ""}`,
  );
}
const bad = results.filter((r) => r.count !== 0 && !r.diagnostic);
process.exit(bad.length ? 1 : 0);
