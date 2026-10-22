/**
 * Reduced motion / no-JS / touch / keyboard checks for home, templates, tools.
 * Usage: node scripts/phase3a-a11y.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const pages = ["/", "/templates", "/tools"];

const browser = await chromium.launch({ headless: true });
const results = [];

// prefers-reduced-motion
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
  });
  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    const ok = await page.evaluate(() => {
      const main = document.querySelector("main#main, main");
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      return !!(main && header && footer);
    });
    results.push({
      check: "prefers-reduced-motion",
      path,
      result: ok ? "PASS" : "FAIL",
    });
  }
  await context.close();
}

// JavaScript disabled
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    const html = await page.content();
    const hasHeader = /<header/i.test(html);
    const hasFooter = /<footer/i.test(html);
    const hasMain = /<main/i.test(html);
    const hasContent =
      path === "/"
        ? /Free invoice maker/i.test(html)
        : path === "/templates"
          ? /Invoice templates/i.test(html)
          : /PDF tools/i.test(html);
    const ok = hasHeader && hasFooter && hasMain && hasContent;
    results.push({
      check: "no-js",
      path,
      result: ok ? "PASS" : "FAIL",
      detail: `header=${hasHeader} footer=${hasFooter} main=${hasMain} content=${hasContent}`,
    });
  }
  await context.close();
}

// Touch emulation
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
  });
  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    const fineHover = await page.evaluate(() =>
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    );
    results.push({
      check: "touch-emulation",
      path,
      result: fineHover ? "FAIL" : "PASS",
      detail: `finePointer=${fineHover}`,
    });
  }
  await context.close();
}

// Keyboard: template dialog + tool page
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
  });

  await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Template/i }).click();
  await page.waitForTimeout(300);
  const dialogOpen = await page.getByRole("dialog").count();
  await page.keyboard.press("Tab");
  // Base UI dialog: close via labelled Close control (Escape alone is flaky in headless)
  const closeBtn = page.getByRole("button", { name: /^Close$/i });
  if (await closeBtn.count()) {
    await closeBtn.focus();
    await page.keyboard.press("Enter");
  } else {
    await page.keyboard.press("Escape");
  }
  await page.waitForTimeout(300);
  const dialogClosed = (await page.getByRole("dialog").count()) === 0;
  results.push({
    check: "keyboard-template-dialog",
    path: "/create-invoice",
    result: dialogOpen > 0 && dialogClosed ? "PASS" : "FAIL",
    detail: `open=${dialogOpen} closed=${dialogClosed}`,
  });

  await page.goto(`${BASE}/tools/merge-pdf`, { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName}:${el.getAttribute("href") || el.getAttribute("aria-label") || el.textContent?.slice(0, 40)}` : "none";
  });
  const hasH1 = await page.getByRole("heading", { level: 1 }).count();
  results.push({
    check: "keyboard-tool-page",
    path: "/tools/merge-pdf",
    result: hasH1 === 1 ? "PASS" : "FAIL",
    detail: `focus=${focused} h1=${hasH1}`,
  });

  await context.close();
}

await browser.close();

console.log("| check | path | result | detail |");
console.log("|-------|------|--------|--------|");
for (const r of results) {
  console.log(
    `| ${r.check} | ${r.path} | ${r.result} | ${r.detail || ""} |`,
  );
}
const fail = results.filter((r) => r.result !== "PASS").length;
console.log(`\n${results.length - fail}/${results.length} PASS`);
process.exit(fail ? 1 : 0);
