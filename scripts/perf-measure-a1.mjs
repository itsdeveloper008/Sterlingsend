/**
 * A1 loader on/off via npx lighthouse.
 * Loader-off: append ?ss_noloader=1 (SessionLoader must honour it) OR measure
 * a build with NEXT_PUBLIC_SKIP_SESSION_LOADER=1 on the same port.
 *
 * Usage:
 *   node scripts/perf-measure-a1.mjs http://127.0.0.1:3103 loader-on
 *   node scripts/perf-measure-a1.mjs http://127.0.0.1:3103 loader-off --skip-query
 *   node scripts/perf-measure-a1.mjs http://127.0.0.1:3103 loader-off
 *     (uses ?ss_noloader=1)
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const LABEL = process.argv[3] || "loader-on";
const USE_QUERY = !process.argv.includes("--skip-query") && LABEL !== "loader-on";
const RUNS = Number(
  process.argv.includes("--runs")
    ? process.argv[process.argv.indexOf("--runs") + 1]
    : "3",
);
const PAGES = [
  "/",
  "/tools",
  "/tools/merge-pdf",
  "/templates",
  "/create-invoice",
  "/login",
  "/privacy",
];
const OUT = path.join(process.cwd(), ".perf", "a1", LABEL);
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
  const items = audits["lcp-breakdown-insight"]?.details?.items || [];
  const table = items.find((i) => i.type === "table");
  const node = items.find((i) => i.type === "node");
  const parts = {};
  for (const row of table?.items || []) {
    parts[row.subpart] = Math.round(row.duration || 0);
  }
  const net = audits["network-requests"]?.details?.items || [];
  const sumType = (type) =>
    net
      .filter((i) => i.resourceType === type)
      .reduce((s, i) => s + (i.transferSize || 0), 0);
  const fontItems = net.filter(
    (i) =>
      i.resourceType === "Font" ||
      (typeof i.url === "string" && /\.(woff2?|ttf|otf)(\?|$)/i.test(i.url)),
  );
  return {
    performance: Math.round((report.categories.performance?.score || 0) * 100),
    fcp: Math.round(audits["first-contentful-paint"]?.numericValue || 0),
    lcp: Math.round(audits["largest-contentful-paint"]?.numericValue || 0),
    tbt: Math.round(audits["total-blocking-time"]?.numericValue || 0),
    cls: Number(
      (audits["cumulative-layout-shift"]?.numericValue || 0).toFixed(3),
    ),
    si: Math.round(audits["speed-index"]?.numericValue || 0),
    jsTransferred: sumType("Script"),
    fontBytes: fontItems.reduce((s, i) => s + (i.transferSize || 0), 0),
    cssBytes: sumType("Stylesheet"),
    fontsDetail: fontItems.map((i) => ({
      url: String(i.url).split("/").pop()?.split("?")[0]?.slice(0, 80),
      bytes: i.transferSize || 0,
    })),
    lcpElement: String(node?.nodeLabel || node?.snippet || "")
      .replace(/\s+/g, " ")
      .slice(0, 120),
    lcpSelector: node?.selector || "",
    lcpTtfb: parts.timeToFirstByte || 0,
    lcpResourceDelay: parts.resourceLoadDelay || 0,
    lcpResourceDuration: parts.resourceLoadDuration || 0,
    lcpElementDelay: parts.elementRenderDelay || 0,
  };
}

function runLh(url, outFile) {
  const lhBin = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    "lighthouse",
  );
  // Prefer system Chrome — Playwright's Chromium breaks TraceElements/LCP audits.
  const chromePath =
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const args = [
    url,
    "--only-categories=performance",
    "--form-factor=mobile",
    "--screenEmulation.mobile=true",
    "--throttling-method=simulate",
    "--output=json",
    `--output-path=${outFile}`,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
    `--chrome-path=${chromePath}`,
  ];
  const result = spawnSync(lhBin, args, {
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`Lighthouse failed for ${url}`);
  }
}

const summary = [];
for (const page of PAGES) {
  const runs = [];
  const qs = USE_QUERY ? (page.includes("?") ? "&" : "?") + "ss_noloader=1" : "";
  for (let i = 1; i <= RUNS; i++) {
    const file = path.join(OUT, `${slug(page)}-run${i}.json`);
    console.error(`LH ${LABEL} ${page}${qs} run ${i}/${RUNS}`);
    runLh(`${BASE}${page}${qs}`, file);
    runs.push(extract(JSON.parse(readFileSync(file, "utf8"))));
  }
  const mid = runs[Math.floor(runs.length / 2)];
  const med = {
    page,
    performance: median(runs.map((r) => r.performance)),
    fcp: median(runs.map((r) => r.fcp)),
    lcp: median(runs.map((r) => r.lcp)),
    tbt: median(runs.map((r) => r.tbt)),
    cls: median(runs.map((r) => r.cls)),
    si: median(runs.map((r) => r.si)),
    jsTransferred: median(runs.map((r) => r.jsTransferred)),
    fontBytes: median(runs.map((r) => r.fontBytes)),
    cssBytes: median(runs.map((r) => r.cssBytes)),
    fontsDetail: mid.fontsDetail,
    lcpElement: mid.lcpElement,
    lcpSelector: mid.lcpSelector,
    lcpTtfb: median(runs.map((r) => r.lcpTtfb)),
    lcpResourceDelay: median(runs.map((r) => r.lcpResourceDelay)),
    lcpResourceDuration: median(runs.map((r) => r.lcpResourceDuration)),
    lcpElementDelay: median(runs.map((r) => r.lcpElementDelay)),
  };
  summary.push(med);
  writeFileSync(
    path.join(OUT, `${slug(page)}-median.json`),
    JSON.stringify(med, null, 2),
  );
}
writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));

console.log(
  `| page | Perf | FCP | LCP | TBT | CLS | SI | JS | fonts | CSS | LCP el |`,
);
console.log(
  `|------|-----:|----:|----:|----:|----:|---:|---:|------:|----:|--------|`,
);
for (const r of summary) {
  console.log(
    `| ${r.page} | ${r.performance} | ${r.fcp} | ${r.lcp} | ${r.tbt} | ${r.cls} | ${r.si} | ${r.jsTransferred} | ${r.fontBytes} | ${r.cssBytes} | ${r.lcpElement || r.lcpSelector} |`,
  );
}
console.log(`\n| page | TTFB | res delay | res dur | el render |`);
for (const r of summary) {
  console.log(
    `| ${r.page} | ${r.lcpTtfb} | ${r.lcpResourceDelay} | ${r.lcpResourceDuration} | ${r.lcpElementDelay} |`,
  );
}
if (summary[0]?.fontsDetail) {
  console.log("\nFonts (first page):");
  for (const f of summary[0].fontsDetail) {
    console.log(`- ${f.url}: ${f.bytes} B`);
  }
}
