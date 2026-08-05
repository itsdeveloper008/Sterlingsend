/**
 * End-to-end smoke test for every PDF tool on the live site.
 * Run: npx tsx scripts/test-all-tools.ts
 */
import { chromium, type Page } from "playwright";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.TOOL_TEST_BASE || "http://localhost:3001";
const FIX = join(process.cwd(), ".tmp-tool-test", "fixtures");
const OUT = join(process.cwd(), ".tmp-tool-test", "results");
mkdirSync(OUT, { recursive: true });

type Result = {
  slug: string;
  title: string;
  ok: boolean;
  detail: string;
  ms: number;
};

const TOOLS: {
  slug: string;
  title: string;
  files: string[];
  setup?: (page: Page) => Promise<void>;
  timeoutMs?: number;
}[] = [
  { slug: "compress-pdf", title: "Compress PDF", files: ["sample-a.pdf"], timeoutMs: 90000 },
  { slug: "repair-pdf", title: "Repair PDF", files: ["sample-a.pdf"], timeoutMs: 60000 },
  {
    slug: "ocr-pdf",
    title: "OCR PDF",
    files: ["sample-a.pdf"],
    timeoutMs: 180000,
  },
  { slug: "pdf-to-word", title: "PDF to Word", files: ["sample-a.pdf"], timeoutMs: 60000 },
  {
    slug: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    files: ["sample-a.pdf"],
    timeoutMs: 120000,
  },
  { slug: "pdf-to-excel", title: "PDF to Excel", files: ["sample-a.pdf"], timeoutMs: 60000 },
  { slug: "pdf-to-jpg", title: "PDF to JPG", files: ["sample-a.pdf"], timeoutMs: 90000 },
  { slug: "jpg-to-pdf", title: "JPG to PDF", files: ["sample.jpg", "sample.png"] },
  {
    slug: "word-to-pdf",
    title: "Word to PDF",
    files: ["sample.docx"],
    timeoutMs: 90000,
  },
  {
    slug: "html-to-pdf",
    title: "HTML to PDF",
    files: [],
    setup: async (page) => {
      await page.fill(
        "#html-content",
        "<h1>Hello SterlingSend</h1><p>HTML to PDF test.</p>",
      );
    },
    timeoutMs: 90000,
  },
  { slug: "pdf-to-pdfa", title: "PDF to PDF/A", files: ["sample-a.pdf"] },
  { slug: "pdf-to-markdown", title: "PDF to Markdown", files: ["sample-a.pdf"], timeoutMs: 60000 },
  { slug: "merge-pdf", title: "Merge PDF", files: ["sample-a.pdf", "sample-b.pdf"] },
  { slug: "split-pdf", title: "Split PDF", files: ["sample-a.pdf"] },
  {
    slug: "remove-pages",
    title: "Remove pages",
    files: ["sample-a.pdf"],
    setup: async (page) => {
      await page.fill("#pdf-pages", "2");
    },
  },
  {
    slug: "extract-pages",
    title: "Extract pages",
    files: ["sample-a.pdf"],
    setup: async (page) => {
      await page.fill("#pdf-pages", "1,3");
    },
  },
  {
    slug: "organize-pdf",
    title: "Organize PDF",
    files: ["sample-a.pdf"],
    setup: async (page) => {
      // Wait for page order to populate after file load
      await page.waitForTimeout(1500);
    },
    timeoutMs: 60000,
  },
  {
    slug: "edit-pdf",
    title: "Edit PDF",
    files: ["sample-a.pdf"],
    setup: async (page) => {
      await page.fill("#edit-text", "Approved");
    },
  },
  { slug: "rotate-pdf", title: "Rotate PDF", files: ["sample-a.pdf"] },
  { slug: "crop-pdf", title: "Crop PDF", files: ["sample-a.pdf"] },
  { slug: "page-numbers", title: "Page numbers", files: ["sample-a.pdf"] },
  { slug: "watermark", title: "Watermark", files: ["sample-a.pdf"] },
  {
    slug: "pdf-forms",
    title: "PDF Forms",
    files: ["sample-a.pdf"],
    setup: async (page) => {
      await page.fill("#form-name", "Test User");
      await page.fill("#form-email", "test@example.com");
    },
  },
  {
    slug: "unlock-pdf",
    title: "Unlock PDF",
    files: ["protected.pdf"],
    setup: async (page) => {
      await page.fill("#pdf-password", "test123");
    },
  },
  {
    slug: "protect-pdf",
    title: "Protect PDF",
    files: ["sample-b.pdf"],
    setup: async (page) => {
      await page.fill("#pdf-password", "secret99");
    },
  },
  {
    slug: "sign-pdf",
    title: "Sign PDF",
    files: ["sample-b.pdf"],
    setup: async (page) => {
      // Draw a signature on the canvas
      const canvas = page.locator("canvas").first();
      await canvas.waitFor({ state: "visible", timeout: 10000 });
      const box = await canvas.boundingBox();
      if (!box) throw new Error("No signature canvas");
      await page.mouse.move(box.x + 20, box.y + 40);
      await page.mouse.down();
      await page.mouse.move(box.x + 120, box.y + 60);
      await page.mouse.move(box.x + 180, box.y + 35);
      await page.mouse.up();
      await page.waitForTimeout(300);
    },
  },
  { slug: "redact-pdf", title: "Redact PDF", files: ["sample-a.pdf"] },
  {
    slug: "compare-pdf",
    title: "Compare PDF",
    files: ["sample-a.pdf", "sample-b.pdf"],
    timeoutMs: 90000,
  },
  {
    slug: "translate-pdf",
    title: "Translate PDF",
    files: ["sample-b.pdf"],
    timeoutMs: 120000,
  },
];

async function uploadFiles(page: Page, names: string[]) {
  if (!names.length) return;
  await page.getByRole("button", { name: /Select files|Add more files/i }).waitFor({
    state: "visible",
    timeout: 30000,
  });
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles(names.map((n) => join(FIX, n)));
  // Confirm React state picked up the first file name
  await page.getByText(names[0], { exact: false }).first().waitFor({
    state: "visible",
    timeout: 20000,
  });
}

async function readToastError(page: Page) {
  const toast = page.locator("[data-sonner-toast][data-type='error']").first();
  if (await toast.count()) {
    return ((await toast.innerText()) || "").trim();
  }
  return "";
}

async function waitForProcessEnabled(page: Page, timeoutMs = 20000) {
  const processBtn = page.getByRole("button", {
    name: /Process & download|Run again/i,
  });
  await processBtn.waitFor({ state: "visible", timeout: 15000 });
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!(await processBtn.isDisabled())) return processBtn;
    await page.waitForTimeout(250);
  }
  throw new Error("Process button stayed disabled (missing required input)");
}

async function runOne(
  page: Page,
  tool: (typeof TOOLS)[number],
): Promise<Result> {
  const started = Date.now();
  const url = `${BASE}/tools/${tool.slug}`;

  try {
    for (const f of tool.files) {
      if (!existsSync(join(FIX, f))) {
        throw new Error(`Missing fixture: ${f}`);
      }
    }

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.getByRole("heading", { name: tool.title }).waitFor({
      timeout: 30000,
    });

    await uploadFiles(page, tool.files);
    if (tool.setup) await tool.setup(page);

    const processBtn = await waitForProcessEnabled(page);

    const downloadPromise = page
      .waitForEvent("download", { timeout: tool.timeoutMs ?? 45000 })
      .catch(() => null);

    await processBtn.click();

    const download = await downloadPromise;
    if (download) {
      const suggested = download.suggestedFilename();
      const target = join(OUT, `${tool.slug}__${suggested}`);
      await download.saveAs(target);
      const size = readFileSync(target).byteLength;
      if (size < 10) throw new Error(`Download too small (${size} bytes)`);
      return {
        slug: tool.slug,
        title: tool.title,
        ok: true,
        detail: `Downloaded ${suggested} (${size} bytes)`,
        ms: Date.now() - started,
      };
    }

    // Maybe success without download event (multi-file zip still downloads)
    // Check for error toast
    await page.waitForTimeout(2000);
    const err = await readToastError(page);
    if (err) throw new Error(err);

    // Check if button shows "Run again" / Ready state
    const ready = await page.getByText(/Ready:/i).count();
    if (ready > 0) {
      return {
        slug: tool.slug,
        title: tool.title,
        ok: true,
        detail: "Completed (ready state, no download event captured)",
        ms: Date.now() - started,
      };
    }

    throw new Error("No download and no success indicator");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // Try to pull toast error for richer detail
    let toast = "";
    try {
      toast = await readToastError(page);
    } catch {
      /* ignore */
    }
    return {
      slug: tool.slug,
      title: tool.title,
      ok: false,
      detail: toast ? `${msg} | toast: ${toast}` : msg,
      ms: Date.now() - started,
    };
  }
}

async function main() {
  console.log(`Testing ${TOOLS.length} tools against ${BASE}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  const results: Result[] = [];
  for (const tool of TOOLS) {
    process.stdout.write(`→ ${tool.slug} ... `);
    const result = await runOne(page, tool);
    results.push(result);
    console.log(
      result.ok ? `PASS (${result.ms}ms)` : `FAIL (${result.ms}ms) ${result.detail}`,
    );
  }

  await browser.close();

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  const report = {
    base: BASE,
    at: new Date().toISOString(),
    total: results.length,
    passed,
    failed: failed.length,
    results,
  };
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));

  console.log("\n========== SUMMARY ==========");
  console.log(`Passed: ${passed}/${results.length}`);
  if (failed.length) {
    console.log("Failed:");
    for (const f of failed) {
      console.log(`  - ${f.slug}: ${f.detail}`);
    }
  }
  console.log(`Report: ${join(OUT, "report.json")}`);

  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
