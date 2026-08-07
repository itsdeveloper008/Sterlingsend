/**
 * Smoke test: Translate PDF → Hindi must not emit ?????? and must draw Devanagari.
 * Run: node scripts/test-translate-hindi.mjs
 */
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, ".tmp-tool-test");
const BUNDLE = join(OUT, "engine-bundle.mjs");

function bundle() {
  mkdirSync(OUT, { recursive: true });
  const r = spawnSync(
    "npx",
    [
      "esbuild",
      "features/pdf-tools/lib/engine/process.ts",
      "--bundle",
      "--format=esm",
      "--platform=browser",
      "--outfile=" + BUNDLE,
      "--external:pdfjs-dist/build/pdf.worker.min.mjs",
    ],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error("esbuild failed");
  }
}

function startServer() {
  const html = `<!doctype html><html><body>
<script type="module">
  import { processTool } from "/engine-bundle.mjs";
  window.__processTool = processTool;
  window.__ready = true;
</script>
</body></html>`;
  const server = createServer((req, res) => {
    if (req.url === "/" || req.url?.startsWith("/?")) {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(html);
      return;
    }
    if (req.url === "/engine-bundle.mjs") {
      res.writeHead(200, { "content-type": "text/javascript" });
      res.end(readFileSync(BUNDLE));
      return;
    }
    res.writeHead(404);
    res.end("no");
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

async function main() {
  console.log("Bundling…");
  bundle();
  const { server, port } = await startServer();
  const base = `http://127.0.0.1:${port}`;
  console.log("Harness", base);

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") console.log("[console.error]", m.text());
  });
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));

  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__ready === true);

  const result = await page.evaluate(async () => {
    const { PDFDocument, StandardFonts } = await import(
      "https://cdn.jsdelivr.net/npm/@cantoo/pdf-lib@2.2.3/+esm"
    );
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const p = doc.addPage([595, 842]);
    const lines = [
      "PropertyLedger - Monthly Summary",
      "Date range: 2026-08-01 to 2026-08-31",
      "Total collections PKR 32,848,300",
      "Occupancy 90%",
      "Efficiency 48%",
    ];
    let y = 780;
    for (const line of lines) {
      p.drawText(line, { x: 50, y, size: 14, font });
      y -= 24;
    }
    const bytes = await doc.save();
    const file = new File([bytes], "ledger.pdf", { type: "application/pdf" });

    const out = await window.__processTool({
      slug: "translate-pdf",
      files: [file],
      options: { targetLang: "hi" },
    });

    const first = out.files[0];
    const pdfjs = await import(
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs"
    );
    pdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
    const copy = new Uint8Array(first.bytes);
    const pdf = await pdfjs.getDocument({ data: copy }).promise;
    const page1 = await pdf.getPage(1);
    const viewport = page1.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page1.render({ canvasContext: ctx, viewport, canvas }).promise;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let dark = 0;
    for (let i = 0; i < data.length; i += 16) {
      if (data[i] < 180 && data[i + 1] < 180 && data[i + 2] < 180) dark += 1;
    }

    // Probe Devanagari font + canvas ink for a known Hindi string
    const face = new FontFace(
      "Noto Sans Devanagari",
      'url(https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari@5.2.5/files/noto-sans-devanagari-devanagari-400-normal.woff) format("woff")',
    );
    document.fonts.add(await face.load());
    const probe = document.createElement("canvas");
    probe.width = 400;
    probe.height = 80;
    const pctx = probe.getContext("2d");
    pctx.fillStyle = "#fff";
    pctx.fillRect(0, 0, 400, 80);
    pctx.fillStyle = "#000";
    pctx.font = '28px "Noto Sans Devanagari"';
    pctx.fillText("मासिक सारांश", 20, 50);
    const pdata = pctx.getImageData(0, 0, 400, 80).data;
    let hindiInk = 0;
    for (let i = 0; i < pdata.length; i += 4) {
      if (pdata[i] < 200) hindiInk += 1;
    }

    let b64 = "";
    {
      let binary = "";
      for (let i = 0; i < first.bytes.length; i++) {
        binary += String.fromCharCode(first.bytes[i]);
      }
      b64 = btoa(binary);
    }

    return {
      name: first.name,
      size: first.bytes.byteLength,
      pages: pdf.numPages,
      darkPixels: dark,
      hindiInk,
      questionMarksInPdf: binaryQuestionCount(first.bytes),
      b64,
    };

    function binaryQuestionCount(bytes) {
      let n = 0;
      let run = 0;
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 63) {
          run += 1;
          if (run === 4) n += 1;
        } else run = 0;
      }
      return n;
    }
  });

  mkdirSync(join(OUT, "results"), { recursive: true });
  if (result.b64) {
    writeFileSync(
      join(OUT, "results", result.name),
      Buffer.from(result.b64, "base64"),
    );
  }

  console.log(JSON.stringify(result, null, 2));

  const fails = [];
  if (result.size < 5000) fails.push("output too small");
  if (result.darkPixels < 50) fails.push("translated page looks blank");
  if (result.hindiInk < 80) fails.push("Devanagari font did not paint");
  if (result.questionMarksInPdf > 2)
    fails.push(`too many ???? runs in PDF (${result.questionMarksInPdf})`);

  await browser.close();
  server.close();

  if (fails.length) {
    console.error("FAIL:", fails.join("; "));
    process.exit(1);
  }
  console.log("PASS: Hindi translate smoke");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
