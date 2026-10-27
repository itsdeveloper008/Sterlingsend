/**
 * Guest + cookie-hint crawl of every public/app route.
 * Usage (after build):
 *   PORT=3103 npm run start &
 *   npx tsx scripts/crawl-site-map.ts http://127.0.0.1:3103
 *
 * Writes .perf/site-crawl.json
 */
import { chromium, type Page, type BrowserContext } from "playwright";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PDF_TOOLS } from "../features/pdf-tools/catalog";

const BASE = (process.argv[2] || "http://127.0.0.1:3103").replace(/\/$/, "");
const OUT_DIR = path.join(process.cwd(), ".perf");
const OUT = path.join(OUT_DIR, "site-crawl.json");
mkdirSync(OUT_DIR, { recursive: true });

const TOOL_SLUGS = PDF_TOOLS.map((t) => t.slug);

/** Routes to visit (excludes /dev/*). Dynamic examples use placeholders. */
const GUEST_ROUTES = [
  "/",
  "/create-invoice",
  "/templates",
  "/tools",
  ...TOOL_SLUGS.map((s) => `/tools/${s}`),
  "/guides/what-must-be-on-a-uk-invoice",
  "/calculators/vat",
  "/calculators/late-payment-interest",
  "/privacy",
  "/terms",
  "/cookies",
  "/login",
  "/signup",
  "/forgot-password",
  "/invoice-preview",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/this-page-does-not-exist-404-check",
  "/i/example-public-token",
  "/pay/example-invoice-id",
];

const AUTH_HINT_ROUTES = [
  "/invoices",
  "/files",
  "/account",
  "/onboarding",
  "/settings",
  "/settings/business",
  "/invoices/new",
];

type PageResult = {
  url: string;
  path: string;
  session: "guest" | "auth-hint";
  status: number | null;
  finalUrl: string;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  h1Count: number;
  h1Texts: string[];
  internalLinks: string[];
  brokenLinks: { href: string; status: number | null; error?: string }[];
  error?: string;
};

function toPath(href: string): string | null {
  try {
    const u = new URL(href, BASE);
    if (u.origin !== new URL(BASE).origin) return null;
    return u.pathname;
  } catch {
    return null;
  }
}

async function collectPage(page: Page, routePath: string, session: PageResult["session"]): Promise<PageResult> {
  const url = `${BASE}${routePath}`;
  const result: PageResult = {
    url,
    path: routePath,
    session,
    status: null,
    finalUrl: url,
    title: null,
    metaDescription: null,
    canonical: null,
    h1Count: 0,
    h1Texts: [],
    internalLinks: [],
    brokenLinks: [],
  };

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    result.status = response?.status() ?? null;
    result.finalUrl = page.url();

    result.title = await page.title();
    result.metaDescription = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute("content")
      .catch(() => null);
    result.canonical = await page
      .locator('link[rel="canonical"]')
      .first()
      .getAttribute("href")
      .catch(() => null);

    const h1s = page.locator("h1");
    result.h1Count = await h1s.count();
    result.h1Texts = (
      await h1s.evaluateAll((els) =>
        els.map((el) => (el.textContent || "").trim()).filter(Boolean),
      )
    ).slice(0, 5);

    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => (a as HTMLAnchorElement).getAttribute("href") || "")
        .filter(Boolean),
    );

    const internal = new Set<string>();
    for (const href of hrefs) {
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) continue;
      const p = toPath(href);
      if (p) internal.add(p);
    }
    result.internalLinks = [...internal].sort();

    // Probe up to 25 unique internal links for broken status
    const toProbe = result.internalLinks.slice(0, 25);
    for (const p of toProbe) {
      try {
        const res = await page.request.get(`${BASE}${p}`, {
          maxRedirects: 5,
          timeout: 15000,
        });
        const status = res.status();
        if (status >= 400) {
          result.brokenLinks.push({ href: p, status });
        }
      } catch (err) {
        result.brokenLinks.push({
          href: p,
          status: null,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

async function withContext(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  authHint: boolean,
  fn: (ctx: BrowserContext, page: Page) => Promise<void>,
) {
  const ctx = await browser.newContext();
  if (authHint) {
    await ctx.addCookies([
      {
        name: "__session",
        value: "crawl-hint-session",
        url: BASE,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem("ss_auth", "1");
        localStorage.setItem(
          "ss_consent",
          JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
        );
      } catch {
        /* ignore */
      }
    });
  } else {
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem(
          "ss_consent",
          JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
        );
      } catch {
        /* ignore */
      }
    });
  }
  const page = await ctx.newPage();
  try {
    await fn(ctx, page);
  } finally {
    await ctx.close();
  }
}

async function main() {
  const chromePath =
    process.env.CHROME_PATH ||
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    undefined;
  const browser = await chromium.launch({
    headless: true,
    ...(chromePath ? { executablePath: chromePath } : {}),
  });
  const pages: PageResult[] = [];

  await withContext(browser, false, async (_ctx, page) => {
    for (const route of GUEST_ROUTES) {
      const row = await collectPage(page, route, "guest");
      pages.push(row);
      console.log(
        `guest ${row.status ?? "ERR"} ${route} h1=${row.h1Count} broken=${row.brokenLinks.length}`,
      );
    }
  });

  await withContext(browser, true, async (_ctx, page) => {
    for (const route of AUTH_HINT_ROUTES) {
      const row = await collectPage(page, route, "auth-hint");
      pages.push(row);
      console.log(
        `auth  ${row.status ?? "ERR"} ${route} final=${row.finalUrl.replace(BASE, "")}`,
      );
    }
  });

  await browser.close();

  const crawledPaths = new Set(pages.map((p) => p.path.split("?")[0]));
  const orphans = [...crawledPaths].filter((p) => {
    if (p === "/" || p.startsWith("/api") || p.includes("404")) return false;
    if (
      p === "/sitemap.xml" ||
      p === "/robots.txt" ||
      p === "/manifest.webmanifest"
    )
      return false;
    return !pages.some(
      (other) => other.path !== p && other.internalLinks.includes(p),
    );
  });

  const seoIssues: { path: string; issues: string[] }[] = [];
  for (const p of pages.filter(
    (x) => x.session === "guest" && (x.status ?? 0) < 400,
  )) {
    if (
      p.path.startsWith("/api") ||
      p.path.endsWith(".xml") ||
      p.path.endsWith(".txt") ||
      p.path.endsWith(".webmanifest") ||
      p.path.includes("404") ||
      p.path.startsWith("/i/") ||
      p.path.startsWith("/pay/")
    ) {
      continue;
    }
    const issues: string[] = [];
    if (p.h1Count !== 1) issues.push(`h1Count=${p.h1Count}`);
    const titleLen = (p.title || "").replace(/\s*\|\s*SterlingSend\s*$/, "").length;
    if (!p.title) issues.push("missing title");
    else if (titleLen > 60) issues.push(`titleLen=${titleLen}>60`);
    const descLen = (p.metaDescription || "").length;
    if (!p.metaDescription) issues.push("missing description");
    else if (descLen < 140 || descLen > 160)
      issues.push(`descriptionLen=${descLen} (want 140-160)`);
    if (!p.canonical) issues.push("missing canonical");
    else if (!p.canonical.includes("sterlingsend.com"))
      issues.push(`canonical not sterlingsend.com: ${p.canonical}`);
    if (issues.length) seoIssues.push({ path: p.path, issues });
  }

  const broken = pages.flatMap((p) =>
    p.brokenLinks.map((b) => ({ from: p.path, ...b })),
  );

  const report = {
    base: BASE,
    generatedAt: new Date().toISOString(),
    toolSlugCount: TOOL_SLUGS.length,
    toolSlugs: TOOL_SLUGS,
    summary: {
      pagesCrawled: pages.length,
      guestOk: pages.filter(
        (p) => p.session === "guest" && (p.status ?? 0) < 400,
      ).length,
      guestErrors: pages.filter(
        (p) =>
          p.session === "guest" && ((p.status ?? 500) >= 400 || p.error),
      ).length,
      brokenLinkCount: broken.length,
      orphanCandidateCount: orphans.length,
      seoIssueCount: seoIssues.length,
    },
    pages,
    brokenLinks: broken,
    orphanCandidates: orphans,
    seoIssues,
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${OUT}`);
  console.log(JSON.stringify(report.summary, null, 2));

  try {
    const sm = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
    const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const badBase = urls.filter((u) => u.includes("vercel.app"));
    writeFileSync(
      path.join(OUT_DIR, "sitemap-urls.json"),
      JSON.stringify({ count: urls.length, badBase, urls }, null, 2),
    );
    console.log(`sitemap urls=${urls.length} vercel.app=${badBase.length}`);
  } catch (err) {
    console.warn("sitemap fetch failed", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
