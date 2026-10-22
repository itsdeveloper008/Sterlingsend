/**
 * Part F screenshots: 1440/1024/768/390 × light/dark for key pages.
 * Usage: node scripts/design-review-shots.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const OUT = join(process.cwd(), ".design-review");
const WIDTHS = [1440, 1024, 768, 390];
const THEMES = ["light", "dark"];
const PAGES = [
  { path: "/", name: "home" },
  { path: "/create-invoice", name: "create-invoice" },
  { path: "/tools", name: "tools" },
  { path: "/templates", name: "templates" },
];

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});

const paths = [];

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: width <= 390 ? 844 : 900 },
      colorScheme: theme,
    });
    const page = await context.newPage();
    await page.addInitScript((t) => {
      localStorage.setItem("ss_theme", t);
      localStorage.setItem(
        "ss_consent",
        JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
      );
      if (t === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }, theme);

    for (const route of PAGES) {
      await page.goto(`${BASE}${route.path}`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await page.waitForTimeout(400);
      const file = join(OUT, `${route.name}-${width}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      paths.push(file);
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          overflowX: doc.scrollWidth > doc.clientWidth + 1,
        };
      });
      console.log(
        `${route.name} ${width} ${theme} overflowX=${overflow.overflowX} (${overflow.scrollWidth}/${overflow.clientWidth}) -> ${file}`,
      );
    }
    await context.close();
  }
}

await browser.close();
console.log(`\nWrote ${paths.length} screenshots under .design-review/`);
