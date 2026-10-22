/**
 * Mobile Lighthouse, 3 runs per page, median metrics.
 * Usage:
 *   node scripts/perf-lighthouse.mjs --base http://127.0.0.1:3103 --label baseline
 *   SKIP_SESSION_LOADER=1 node scripts/perf-lighthouse.mjs --base http://127.0.0.1:3103 --label noloader
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
}

const BASE = flag("base", "http://127.0.0.1:3103");
const LABEL = flag("label", "run");
const RUNS = Number(flag("runs", "3"));
const PAGES = [
  "/",
  "/tools",
  "/tools/merge-pdf",
  "/templates",
  "/create-invoice",
  "/login",
  "/privacy",
];

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

function runLh(url, outFile) {
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "lighthouse",
      url,
      "--only-categories=performance",
      "--form-factor=mobile",
      "--screenEmulation.mobile=true",
      "--throttling-method=simulate",
      "--output=json",
      `--output-path=${outFile}`,
      "--quiet",
      "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
    ],
    {
      encoding: "utf8",
      env: { ...process.env, npm_config_devdir: undefined },
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`Lighthouse failed for ${url}`);
  }
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
  const lcpEl =
    node?.nodeLabel ||
    node?.snippet ||
    node?.selector ||
    audits["largest-contentful-paint-element"]?.details?.items?.[0]?.node
      ?.snippet ||
    "";
  const net = audits["network-requests"]?.details?.items || [];
  const jsBytes = net
    .filter(
      (i) =>
        i.resourceType === "Script" ||
        (typeof i.url === "string" && i.url.includes("/_next/static/chunks/")),
    )
    .reduce((sum, i) => sum + (i.transferSize || 0), 0);
  const fontBytes = net
    .filter(
      (i) =>
        i.resourceType === "Font" ||
        (typeof i.url === "string" && /\.(woff2?|ttf)(\?|$)/i.test(i.url)),
    )
    .reduce((sum, i) => sum + (i.transferSize || 0), 0);
  const cssBytes = net
    .filter((i) => i.resourceType === "Stylesheet")
    .reduce((sum, i) => sum + (i.transferSize || 0), 0);

  return {
    performance: Math.round((report.categories.performance?.score || 0) * 100),
    fcp: Math.round(audits["first-contentful-paint"]?.numericValue || 0),
    lcp: Math.round(audits["largest-contentful-paint"]?.numericValue || 0),
    tbt: Math.round(audits["total-blocking-time"]?.numericValue || 0),
    cls: Number((audits["cumulative-layout-shift"]?.numericValue || 0).toFixed(3)),
    si: Math.round(audits["speed-index"]?.numericValue || 0),
    jsTransferred: jsBytes,
    fontBytes,
    cssBytes,
    lcpElement: String(lcpEl).replace(/\s+/g, " ").slice(0, 120),
    lcpSelector: node?.selector || "",
    lcpTtfb: parts.timeToFirstByte || 0,
    lcpResourceDelay: parts.resourceLoadDelay || 0,
    lcpResourceDuration: parts.resourceLoadDuration || 0,
    lcpElementDelay: parts.elementRenderDelay || 0,
  };
}

const summary = [];

for (const page of PAGES) {
  const runs = [];
  for (let i = 1; i <= RUNS; i++) {
    const file = path.join(OUT, `${slug(page)}-run${i}.json`);
    console.error(`LH ${LABEL} ${page} run ${i}/${RUNS}`);
    runLh(`${BASE}${page}`, file);
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
    lcpElement: mid.lcpElement,
    lcpSelector: mid.lcpSelector,
    lcpTtfb: median(runs.map((r) => r.lcpTtfb)),
    lcpResourceDelay: median(runs.map((r) => r.lcpResourceDelay)),
    lcpResourceDuration: median(runs.map((r) => r.lcpResourceDuration)),
    lcpElementDelay: median(runs.map((r) => r.lcpElementDelay)),
    runs,
  };
  summary.push(med);
  writeFileSync(
    path.join(OUT, `${slug(page)}-median.json`),
    JSON.stringify(med, null, 2),
  );
}

writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));

console.log(
  `| page | Perf | FCP | LCP | TBT | CLS | SI | JS xfer | fonts | CSS | LCP element |`,
);
console.log(
  `|------|-----:|----:|----:|----:|----:|---:|--------:|------:|----:|-------------|`,
);
for (const r of summary) {
  console.log(
    `| ${r.page} | ${r.performance} | ${r.fcp} | ${r.lcp} | ${r.tbt} | ${r.cls} | ${r.si} | ${r.jsTransferred} | ${r.fontBytes} | ${r.cssBytes} | ${r.lcpElement || r.lcpSelector} |`,
  );
}
console.log(`\n| page | TTFB | res delay | res dur | el render |`);
console.log(`|------|-----:|----------:|--------:|----------:|`);
for (const r of summary) {
  console.log(
    `| ${r.page} | ${r.lcpTtfb} | ${r.lcpResourceDelay} | ${r.lcpResourceDuration} | ${r.lcpElementDelay} |`,
  );
}
