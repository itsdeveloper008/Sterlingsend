/**
 * Assert documentElement.scrollWidth <= clientWidth across viewports/themes/pages.
 * Usage: node scripts/overflow-a1.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const WIDTHS = [320, 360, 390, 768, 1024, 1440];
const THEMES = ["light", "dark"];
const PAGES = [
  "/",
  "/tools",
  "/tools/merge-pdf",
  "/templates",
  "/login",
  "/signup",
  "/forgot-password",
  "/create-invoice",
  "/invoices",
  "/account",
  "/onboarding",
  "/privacy",
  "/cookies",
  "/not-a-real-page-404",
];

const rows = [];

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: theme === "dark" ? "dark" : "light",
    });
    const page = await context.newPage();
    await page.addInitScript((t) => {
      localStorage.setItem("ss_theme", t);
      localStorage.setItem(
        "ss_consent",
        JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
      );
      if (t === "dark") document.documentElement.classList.add("dark");
    }, theme);

    for (const path of PAGES) {
      const url = `${BASE}${path}`;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(250);
        const m = await page.evaluate(() => {
          const el = document.documentElement;
          return { sw: el.scrollWidth, cw: el.clientWidth };
        });
        const pass = m.sw <= m.cw;
        rows.push({
          theme,
          width,
          path,
          sw: m.sw,
          cw: m.cw,
          pass: pass ? "PASS" : "FAIL",
        });
      } catch (error) {
        rows.push({
          theme,
          width,
          path,
          sw: -1,
          cw: -1,
          pass: "FAIL",
          error: String(error.message || error),
        });
      }
    }
    await context.close();
  }
}
await browser.close();

console.log("| theme | width | path | sw | cw | result |");
console.log("|-------|------:|------|---:|---:|--------|");
for (const r of rows) {
  console.log(
    `| ${r.theme} | ${r.width} | ${r.path} | ${r.sw} | ${r.cw} | ${r.pass} |`,
  );
}
const fail = rows.filter((r) => r.pass !== "PASS").length;
console.log(`\n${rows.length - fail}/${rows.length} PASS`);
process.exit(fail ? 1 : 0);
