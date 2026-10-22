/**
 * Part A A2: guest PDF noise floor + baseline vs current, plus fixture templates.
 *
 * BASE_URL=http://127.0.0.1:3101 CURRENT_URL=http://127.0.0.1:3102 \
 *   node scripts/compare-guest-pdf-a2.mjs
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
mkdirSync(join(OUT, "noise"), { recursive: true });

const FROZEN = "2026-01-15T12:00:00.000Z";
const TEMPLATES = ["classic-teal", "bold-navy", "sidebar-slate"];

function comparePng(aPath, bPath, diffPath) {
  const imgA = PNG.sync.read(readFileSync(aPath));
  const imgB = PNG.sync.read(readFileSync(bPath));
  const width = Math.max(imgA.width, imgB.width);
  const height = Math.max(imgA.height, imgB.height);
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
    sizeMismatch: imgA.width !== imgB.width || imgA.height !== imgB.height,
    a: `${imgA.width}x${imgA.height}`,
    b: `${imgB.width}x${imgB.height}`,
  };
}

async function preparePage(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((frozenIso) => {
    const frozen = new Date(frozenIso).getTime();
    const RealDate = Date;
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

    window.__ssPdfBlobs = [];
    const origCreate = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (obj) => {
      const url = origCreate(obj);
      if (obj instanceof Blob) {
        window.__ssPdfBlobs.push({ url, blob: obj, type: obj.type, size: obj.size });
      }
      return url;
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
  const placeholders = [
    ["Your Company", "Acme Consulting Ltd"],
    ["your@email.com", "hello@acme.test"],
    ["123 Main St, City, State 12345", "1 High Street\nLondon\nEC1A 1BB"],
    ["Client Company", "Client Co"],
    ["Client Address", "10 Client Road\nManchester\nM1 1AA"],
    ["client@email.com", "accounts@client.test"],
    ["Service or Product", "Consulting"],
    ["Thank you for your business!", "Thank you for your business."],
  ];
  for (const [ph, value] of placeholders) {
    const loc = page.getByPlaceholder(ph, { exact: false }).first();
    if ((await loc.count()) > 0) await loc.fill(value);
  }
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

async function captureGuestPdf(page, baseUrl, outPdfPath) {
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.goto(`${baseUrl}/create-invoice`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForSelector(".builder-card", { timeout: 30000 });
  await fillBuilder(page);
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    window.__ssPdfBlobs = [];
  });
  await page.getByRole("button", { name: /download pdf/i }).click();
  await page.waitForFunction(
    () => window.__ssPdfBlobs && window.__ssPdfBlobs.length > 0,
    null,
    { timeout: 60000 },
  );
  const bytes = await page.evaluate(async () => {
    const entry = window.__ssPdfBlobs[window.__ssPdfBlobs.length - 1];
    const buf = await entry.blob.arrayBuffer();
    return Array.from(new Uint8Array(buf));
  });
  const buf = Buffer.from(bytes);
  writeFileSync(outPdfPath, buf);
  return buf;
}

async function rasterizePdfViaBrowser(browser, pdfPath, outDir, prefix) {
  mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { width: 900, height: 1200 },
  });
  const b64 = readFileSync(pdfPath).toString("base64");
  await page.setContent(`<!doctype html><html><body>
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
  </body></html>`);
  await page.waitForFunction(() => window.__ready === true, null, {
    timeout: 90000,
  });
  const pages = await page.evaluate(() => window.__pages);
  const paths = [];
  for (let i = 0; i < pages.length; i++) {
    const data = pages[i].replace(/^data:image\/png;base64,/, "");
    const pngPath = join(outDir, `${prefix}-page-${i + 1}.png`);
    writeFileSync(pngPath, Buffer.from(data, "base64"));
    paths.push(pngPath);
  }
  await page.close();
  return paths;
}

async function screenshotFixtures(page, baseUrl, labelDir) {
  mkdirSync(labelDir, { recursive: true });
  await page.setViewportSize({ width: 900, height: 1200 });
  await page.goto(`${baseUrl}/dev/invoice-fixture`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.fonts.ready);
  const out = [];
  for (const id of TEMPLATES) {
    const loc = page.locator(`[data-fixture-template="${id}"]`);
    await loc.waitFor({ timeout: 30000 });
    const path = join(labelDir, `fixture-${id}.png`);
    await loc.screenshot({ path, animations: "disabled" });
    out.push({ id, path });
  }
  return out;
}

async function probeFont(page, baseUrl) {
  await page.goto(`${baseUrl}/create-invoice`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForSelector(".builder-card", { timeout: 30000 });
  // Trigger PDF host briefly via evaluate after download path uses off-DOM template
  // Probe invoice-pdf.css stack from a temporary render is hard; report CSS + onclone.
  return page.evaluate(() => {
    const el = document.querySelector(".builder-card");
    const cs = el ? getComputedStyle(el) : null;
    return {
      builderCardFont: cs?.fontFamily || null,
      htmlFont: getComputedStyle(document.documentElement).fontFamily,
      bodyFont: getComputedStyle(document.body).fontFamily,
    };
  });
}

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
const report = { fonts: {}, noise: [], guest: [], fixtures: [] };

const baseCtx = await browser.newContext({
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const curCtx = await browser.newContext({
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const basePage = await baseCtx.newPage();
const curPage = await curCtx.newPage();
await preparePage(basePage);
await preparePage(curPage);

report.fonts.baseline_runtime = await probeFont(basePage, BASE);
report.fonts.current_runtime = await probeFont(curPage, CURRENT);
report.fonts.notes = {
  baseline_guest_pdf_css: "Inter stack in pdf/styles/invoice-pdf.css; onclone did not force fonts",
  current_guest_pdf_css:
    "Inter stack in pdf/styles/invoice-pdf.css; Inter onclone lock removed (reverted to baseline behaviour)",
  previous_forced_lock:
    "Inter, ui-sans-serif, system-ui forced in onclone during Phase 1 Part A - removed in this close-out",
};

// Noise floor: two baseline PDFs
const noise1 = join(OUT, "noise", "guest-a.pdf");
const noise2 = join(OUT, "noise", "guest-b.pdf");
await captureGuestPdf(basePage, BASE, noise1);
await captureGuestPdf(basePage, BASE, noise2);
const noisePagesA = await rasterizePdfViaBrowser(
  browser,
  noise1,
  join(OUT, "noise"),
  "a",
);
const noisePagesB = await rasterizePdfViaBrowser(
  browser,
  noise2,
  join(OUT, "noise"),
  "b",
);
for (let i = 0; i < Math.max(noisePagesA.length, noisePagesB.length); i++) {
  const pa = noisePagesA[i];
  const pb = noisePagesB[i];
  if (!pa || !pb) {
    report.noise.push({ page: i + 1, error: "missing page" });
    continue;
  }
  const cmp = comparePng(pa, pb, join(DIFF, `noise-guest-page-${i + 1}.png`));
  report.noise.push({ page: i + 1, ...cmp });
  console.log(
    `NOISE guest page ${i + 1}: ${cmp.count} px (sizes ${cmp.a} vs ${cmp.b})`,
  );
}
const noiseFloor = Math.max(0, ...report.noise.map((n) => n.count || 0));
console.log(`NOISE_FLOOR=${noiseFloor}`);

// Baseline vs current guest PDF
const pdfA = join(OUT, "baseline", "guest.pdf");
const pdfB = join(OUT, "current", "guest.pdf");
const bufA = await captureGuestPdf(basePage, BASE, pdfA);
const bufB = await captureGuestPdf(curPage, CURRENT, pdfB);
console.log(
  `guest pdf bytes: baseline=${bufA.length} current=${bufB.length} shaA=${createHash("sha256").update(bufA).digest("hex").slice(0, 12)} shaB=${createHash("sha256").update(bufB).digest("hex").slice(0, 12)}`,
);
const pagesA = await rasterizePdfViaBrowser(
  browser,
  pdfA,
  join(OUT, "baseline"),
  "guest",
);
const pagesB = await rasterizePdfViaBrowser(
  browser,
  pdfB,
  join(OUT, "current"),
  "guest",
);
for (let i = 0; i < Math.max(pagesA.length, pagesB.length); i++) {
  const pa = pagesA[i];
  const pb = pagesB[i];
  if (!pa || !pb) {
    report.guest.push({ page: i + 1, error: "missing page" });
    continue;
  }
  const cmp = comparePng(pa, pb, join(DIFF, `guest-pdf-page-${i + 1}.png`));
  const within = cmp.count <= noiseFloor;
  report.guest.push({ page: i + 1, ...cmp, withinNoiseFloor: within });
  console.log(
    `GUEST page ${i + 1}: ${cmp.count} px ${within ? "WITHIN_NOISE" : "DIFF"} (noise=${noiseFloor}) -> ${join(DIFF, `guest-pdf-page-${i + 1}.png`)}`,
  );
}

// Fixture templates
const fixturesA = await screenshotFixtures(
  basePage,
  BASE,
  join(OUT, "baseline"),
);
const fixturesB = await screenshotFixtures(
  curPage,
  CURRENT,
  join(OUT, "current"),
);
for (const id of TEMPLATES) {
  const a = fixturesA.find((f) => f.id === id)?.path;
  const b = fixturesB.find((f) => f.id === id)?.path;
  const cmp = comparePng(a, b, join(DIFF, `fixture-${id}.png`));
  const within = cmp.count <= noiseFloor;
  report.fixtures.push({ id, ...cmp, withinNoiseFloor: within });
  console.log(
    `FIXTURE ${id}: ${cmp.count} px ${within ? "WITHIN_NOISE" : "DIFF"} -> ${join(DIFF, `fixture-${id}.png`)}`,
  );
}

writeFileSync(join(OUT, "a2-report.json"), JSON.stringify(report, null, 2));
console.log("Wrote", join(OUT, "a2-report.json"));
await browser.close();
process.exit(
  report.guest.some((g) => g.count > noiseFloor) ||
    report.fixtures.some((f) => f.count > noiseFloor)
    ? 1
    : 0,
);
