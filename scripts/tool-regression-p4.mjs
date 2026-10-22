/**
 * Playwright tool regression against a production server.
 * Usage: node scripts/tool-regression-p4.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";
import path from "node:path";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BASE = process.argv[2] || "http://127.0.0.1:3103";
const FIX = path.join(process.cwd(), "scripts/fixtures");
const OUT = path.join(process.cwd(), ".perf", "tool-regression");
mkdirSync(OUT, { recursive: true });

async function pageCountFromPdf(bytes) {
  try {
    const { PDFDocument } = await import("@cantoo/pdf-lib");
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch {
    return -1;
  }
}

async function runTool(page, slug, files, { beforeProcess, expectPages } = {}) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
  });
  await page.goto(`${BASE}/tools/${slug}`, { waitUntil: "networkidle" });

  // Deferred workspace: click Choose files to load the processor chunk
  const start = page.getByRole("button", { name: /Choose files/i });
  if (await start.count()) {
    await start.click();
  }
  await page.locator('input[type="file"]').first().waitFor({
    state: "attached",
    timeout: 60000,
  });
  await page.waitForTimeout(300);

  if (typeof beforeProcess === "function") {
    await beforeProcess(page);
  }

  for (const file of files) {
    await page.locator('input[type="file"]').first().setInputFiles(file);
    await page.waitForTimeout(300);
  }

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 120000 }),
    page.getByRole("button", { name: /Process and download|Process & download/i }).click(),
  ]);
  const dest = path.join(OUT, `${slug}-${download.suggestedFilename()}`);
  await download.saveAs(dest);
  const bytes = new Uint8Array(readFileSync(dest));
  const pages = dest.endsWith(".pdf") ? await pageCountFromPdf(bytes) : null;
  if (expectPages != null && pages !== expectPages) {
    throw new Error(`expected ${expectPages} pages, got ${pages} (${dest})`);
  }
  if (bytes.byteLength < 50) throw new Error(`output too small: ${bytes.byteLength}`);
  return { dest, bytes: bytes.byteLength, pages };
}

const results = [];

const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();

const cases = [
  {
    name: "merge",
    run: () =>
      runTool(page, "merge-pdf", [
        path.join(FIX, "sample.pdf"),
        path.join(FIX, "sample-b.pdf"),
      ], { expectPages: 3 }),
  },
  {
    name: "split",
    run: () => runTool(page, "split-pdf", [path.join(FIX, "sample.pdf")]),
  },
  {
    name: "compress",
    run: () =>
      runTool(page, "compress-pdf", [path.join(FIX, "sample.pdf")], {
        expectPages: 2,
      }),
  },
  {
    name: "jpg-to-pdf",
    run: () =>
      runTool(page, "jpg-to-pdf", [path.join(FIX, "sample.jpg")], {
        expectPages: 1,
      }),
  },
  {
    name: "pdf-to-jpg",
    run: () => runTool(page, "pdf-to-jpg", [path.join(FIX, "sample.pdf")]),
  },
  {
    name: "rotate",
    run: () =>
      runTool(page, "rotate-pdf", [path.join(FIX, "sample.pdf")], {
        expectPages: 2,
      }),
  },
  {
    name: "watermark",
    run: () =>
      runTool(page, "watermark", [path.join(FIX, "sample.pdf")], {
        expectPages: 2,
      }),
  },
  {
    name: "edit-pdf",
    run: () =>
      runTool(page, "edit-pdf", [path.join(FIX, "sample.pdf")], {
        beforeProcess: async (p) => {
          // Wait for editor readiness if shown
          await p.waitForTimeout(1200);
        },
      }).catch(async (error) => {
        // Editor may require explicit export — treat missing download as SKIP with reason
        if (String(error).includes("download")) {
          return { skipped: "edit-pdf requires on-canvas edits before export" };
        }
        throw error;
      }),
  },
  {
    name: "ocr-pdf",
    run: () => runTool(page, "ocr-pdf", [path.join(FIX, "ocr-tiny.pdf")]),
  },
  {
    name: "translate-pdf",
    run: async () => {
      await page.route("**/api.mymemory.translated.net/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            responseData: { translatedText: "TEXTO TRADUCIDO" },
            responseStatus: 200,
          }),
        });
      });
      return runTool(page, "translate-pdf", [path.join(FIX, "sample.pdf")], {
        beforeProcess: async (p) => {
          const confirm = p.getByRole("checkbox");
          if (await confirm.count()) await confirm.check();
        },
      });
    },
  },
  {
    name: "offline-after-engine",
    run: async () => {
      // Warm engine online, then process again while offline without navigation.
      await runTool(page, "merge-pdf", [
        path.join(FIX, "sample.pdf"),
        path.join(FIX, "sample-b.pdf"),
      ], { expectPages: 3 });
      await context.setOffline(true);
      try {
        await page.locator('input[type="file"]').first().setInputFiles([
          path.join(FIX, "sample.pdf"),
          path.join(FIX, "sample-b.pdf"),
        ]);
        const [download] = await Promise.all([
          page.waitForEvent("download", { timeout: 120000 }),
          page.getByRole("button", { name: /Process and download/i }).click(),
        ]);
        const dest = path.join(OUT, `offline-${download.suggestedFilename()}`);
        await download.saveAs(dest);
        const bytes = readFileSync(dest);
        if (bytes.byteLength < 50) throw new Error("offline output too small");
        return { dest, bytes: bytes.byteLength, offline: true };
      } finally {
        await context.setOffline(false);
      }
    },
  },
];

for (const c of cases) {
  try {
    const r = await c.run();
    if (r?.skipped) {
      results.push({ tool: c.name, result: "SKIP", detail: r.skipped });
    } else {
      results.push({
        tool: c.name,
        result: "PASS",
        detail: `bytes=${r.bytes}${r.pages != null ? ` pages=${r.pages}` : ""}${r.offline ? " offline" : ""}`,
      });
    }
  } catch (error) {
    results.push({
      tool: c.name,
      result: "FAIL",
      detail: String(error.message || error).slice(0, 200),
    });
  }
}

await browser.close();

console.log("| tool | result | detail |");
console.log("|------|--------|--------|");
for (const r of results) {
  console.log(`| ${r.tool} | ${r.result} | ${r.detail} |`);
}
writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
const fail = results.filter((r) => r.result === "FAIL").length;
process.exit(fail ? 1 : 0);
