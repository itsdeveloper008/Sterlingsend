/**
 * Same as perf-lighthouse but pre-seeds ss_loader_seen so SessionLoader never shows.
 * Isolates loader cost without a separate build.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const LABEL = "noloader";
const RUNS = 3;
const PAGES = ["/", "/tools", "/tools/merge-pdf", "/templates", "/create-invoice", "/login", "/privacy"];
const OUT = path.join(process.cwd(), ".perf", LABEL);
mkdirSync(OUT, { recursive: true });

function slug(p) {
  return p === "/" ? "home" : p.replace(/^\//, "").replaceAll("/", "_");
}
function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function extract(report) {
  const audits = report.audits;
  return {
    performance: Math.round((report.categories.performance?.score || 0) * 100),
    fcp: Math.round(audits["first-contentful-paint"]?.numericValue || 0),
    lcp: Math.round(audits["largest-contentful-paint"]?.numericValue || 0),
    tbt: Math.round(audits["total-blocking-time"]?.numericValue || 0),
  };
}

// Warm pages with loader already marked seen (Playwright), then LH as usual
const browser = await chromium.launch({ headless: true });
for (const pagePath of PAGES) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem("ss_loader_seen", "1");
  });
  await page.goto(`${BASE}${pagePath}`, { waitUntil: "domcontentloaded" });
  await context.close();
}
await browser.close();

const summary = [];
for (const pagePath of PAGES) {
  const runs = [];
  for (let i = 1; i <= RUNS; i++) {
    const file = path.join(OUT, `${slug(pagePath)}-run${i}.json`);
    console.error(`LH ${LABEL} ${pagePath} run ${i}/${RUNS}`);
    const result = spawnSync(
      "npx",
      [
        "--yes",
        "lighthouse",
        `${BASE}${pagePath}`,
        "--only-categories=performance",
        "--form-factor=mobile",
        "--screenEmulation.mobile=true",
        "--throttling-method=simulate",
        "--output=json",
        `--output-path=${file}`,
        "--quiet",
        "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
      ],
      { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    if (result.status !== 0) throw new Error(result.stderr || "lh failed");
    runs.push(extract(JSON.parse(readFileSync(file, "utf8"))));
  }
  summary.push({
    page: pagePath,
    performance: median(runs.map((r) => r.performance)),
    fcp: median(runs.map((r) => r.fcp)),
    lcp: median(runs.map((r) => r.lcp)),
    tbt: median(runs.map((r) => r.tbt)),
  });
}
writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
console.log("| page | Perf | FCP | LCP | TBT |");
console.log("|------|-----:|----:|----:|----:|");
for (const r of summary) {
  console.log(`| ${r.page} | ${r.performance} | ${r.fcp} | ${r.lcp} | ${r.tbt} |`);
}
