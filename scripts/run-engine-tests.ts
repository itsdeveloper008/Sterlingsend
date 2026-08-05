/**
 * Bundle the PDF tool engine for browser smoke tests, then run every tool.
 * This exercises the same processTool code the website uses.
 */
import * as esbuild from "esbuild";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const OUT = join(ROOT, ".tmp-tool-test");
const FIX = join(OUT, "fixtures");
const DIST = join(OUT, "harness");
mkdirSync(DIST, { recursive: true });

async function bundle() {
  await esbuild.build({
    entryPoints: [join(ROOT, "features/pdf-tools/lib/engine/process.ts")],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    outfile: join(DIST, "process.js"),
    sourcemap: true,
    logLevel: "warning",
    alias: {
      "@": ROOT,
    },
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    // Keep heavy optional deps external-ish via dynamic import paths that
    // resolve inside the bundle when possible.
    loader: {
      ".ts": "ts",
      ".tsx": "tsx",
      ".css": "empty",
    },
  });
}

function htmlPage() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>SterlingSend Tool Harness</title>
</head>
<body>
  <h1>Tool harness</h1>
  <pre id="log">loading…</pre>
  <script type="module">
    import { processTool } from "./process.js";
    window.__processTool = processTool;
    document.getElementById("log").textContent = "ready";
    window.__ready = true;
  </script>
</body>
</html>`;
}

function startServer() {
  writeFileSync(join(DIST, "index.html"), htmlPage());
  const mime = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".map": "application/json",
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".htmlf": "text/html",
  };
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = (req.url || "/").split("?")[0];
      let filePath = join(DIST, url === "/" ? "index.html" : url);
      if (url.startsWith("/fixtures/")) {
        filePath = join(FIX, url.slice("/fixtures/".length));
      }
      if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end("missing");
        return;
      }
      const ext = filePath.slice(filePath.lastIndexOf("."));
      res.writeHead(200, {
        "Content-Type": mime[ext] || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(readFileSync(filePath));
    });
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") throw new Error("no port");
      resolve({ server, port: addr.port });
    });
  });
}

const CASES = [
  { slug: "compress-pdf", files: ["sample-a.pdf"], timeout: 90000 },
  { slug: "repair-pdf", files: ["sample-a.pdf"], timeout: 60000 },
  { slug: "ocr-pdf", files: ["sample-a.pdf"], options: { ocrLang: "eng" }, timeout: 180000 },
  { slug: "pdf-to-word", files: ["sample-a.pdf"], timeout: 60000 },
  { slug: "pdf-to-powerpoint", files: ["sample-a.pdf"], timeout: 120000 },
  { slug: "pdf-to-excel", files: ["sample-a.pdf"], timeout: 60000 },
  { slug: "pdf-to-jpg", files: ["sample-a.pdf"], timeout: 90000 },
  { slug: "jpg-to-pdf", files: ["sample.jpg", "sample.png"] },
  { slug: "word-to-pdf", files: ["sample.docx"], timeout: 90000 },
  {
    slug: "html-to-pdf",
    files: [],
    options: { htmlContent: "<h1>Hello</h1><p>HTML fixture</p>" },
    timeout: 90000,
  },
  { slug: "pdf-to-pdfa", files: ["sample-a.pdf"] },
  { slug: "pdf-to-markdown", files: ["sample-a.pdf"], timeout: 60000 },
  { slug: "merge-pdf", files: ["sample-a.pdf", "sample-b.pdf"] },
  { slug: "split-pdf", files: ["sample-a.pdf"] },
  { slug: "remove-pages", files: ["sample-a.pdf"], options: { pages: "2" } },
  { slug: "extract-pages", files: ["sample-a.pdf"], options: { pages: "1,3" } },
  {
    slug: "organize-pdf",
    files: ["sample-a.pdf"],
    options: { pageOrder: [2, 0, 1] },
  },
  {
    slug: "edit-pdf",
    files: ["sample-a.pdf"],
    options: { editText: "Approved", editPage: 1, editX: 72, editY: 72, editFontSize: 14 },
  },
  { slug: "rotate-pdf", files: ["sample-a.pdf"], options: { rotation: 90 } },
  { slug: "crop-pdf", files: ["sample-a.pdf"], options: { cropMargin: 36 } },
  { slug: "page-numbers", files: ["sample-a.pdf"] },
  { slug: "watermark", files: ["sample-a.pdf"], options: { watermarkText: "CONFIDENTIAL" } },
  {
    slug: "pdf-forms",
    files: ["sample-a.pdf"],
    options: { formName: "Test User", formEmail: "test@example.com", formDate: "2026-08-05" },
  },
  { slug: "unlock-pdf", files: ["protected.pdf"], options: { password: "test123" } },
  { slug: "protect-pdf", files: ["sample-b.pdf"], options: { password: "secret99" } },
  {
    slug: "sign-pdf",
    files: ["sample-b.pdf"],
    options: {
      signerName: "Tester",
      signPage: 1,
      // 10x10 black PNG
      signatureDataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADvcGqiPAAAAAElFTkSuQmCC",
    },
  },
  { slug: "redact-pdf", files: ["sample-a.pdf"], options: { redactBand: "middle" } },
  { slug: "compare-pdf", files: ["sample-a.pdf", "sample-b.pdf"], timeout: 90000 },
  {
    slug: "translate-pdf",
    files: ["sample-b.pdf"],
    options: { targetLang: "es" },
    timeout: 120000,
  },
];

async function main() {
  console.log("Bundling engine…");
  await bundle();
  const { server, port } = await startServer();
  const base = `http://127.0.0.1:${port}`;
  console.log("Harness at", base);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(180000);
  mkdirSync(join(OUT, "results"), { recursive: true });
  page.on("console", (m) => {
    if (m.type() === "error") console.log("  [console.error]", m.text());
  });
  page.on("pageerror", (e) => console.log("  [pageerror]", e.message));

  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__ready === true, null, {
    timeout: 30000,
  });

  const results = [];
  for (const test of CASES) {
    process.stdout.write(`→ ${test.slug} ... `);
    const started = Date.now();
    try {
      const result = await page.evaluate(
        async ({ slug, files, options, fixtureBase }) => {
          const fileObjs = [];
          for (const name of files) {
            const res = await fetch(`${fixtureBase}/fixtures/${name}`);
            if (!res.ok) throw new Error(`Fixture fetch failed: ${name}`);
            const blob = await res.blob();
            fileObjs.push(
              new File([blob], name, {
                type: blob.type || "application/octet-stream",
              }),
            );
          }
          const out = await window.__processTool({
            slug,
            files: fileObjs,
            options: options || {},
          });
          const first = out.files[0];
          let b64 = "";
          if (first && first.bytes.byteLength <= 2_000_000) {
            let binary = "";
            const bytes = first.bytes;
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            b64 = btoa(binary);
          }
          return {
            count: out.files.length,
            names: out.files.map((f) => f.name),
            sizes: out.files.map((f) => f.bytes.byteLength),
            mimes: out.files.map((f) => f.mime),
            firstName: first?.name || "",
            firstB64: b64,
          };
        },
        {
          slug: test.slug,
          files: test.files,
          options: test.options || {},
          fixtureBase: base,
        },
      );

      if (result.firstB64 && result.firstName) {
        writeFileSync(
          join(OUT, "results", `${test.slug}__${result.firstName}`),
          Buffer.from(result.firstB64, "base64"),
        );
      }

      if (!result.count) throw new Error("No output files");
      if (result.sizes.some((s) => s < 10)) throw new Error("Output too small");

      const ms = Date.now() - started;
      console.log(`PASS (${ms}ms) → ${result.names.join(", ")}`);
      results.push({ slug: test.slug, ok: true, detail: result, ms });
    } catch (error) {
      const ms = Date.now() - started;
      const detail = error instanceof Error ? error.message : String(error);
      console.log(`FAIL (${ms}ms) ${detail}`);
      results.push({ slug: test.slug, ok: false, detail, ms });
    }
  }

  await browser.close();
  server.close();

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  const report = {
    at: new Date().toISOString(),
    mode: "engine-harness",
    total: results.length,
    passed,
    failed: failed.length,
    results,
  };
  mkdirSync(join(OUT, "results"), { recursive: true });
  writeFileSync(join(OUT, "results", "report.json"), JSON.stringify(report, null, 2));

  console.log("\n========== SUMMARY ==========");
  console.log(`Passed: ${passed}/${results.length}`);
  if (failed.length) {
    console.log("Failed:");
    for (const f of failed) console.log(`  - ${f.slug}: ${f.detail}`);
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
