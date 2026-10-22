/**
 * Keyboard / reduced-motion / touch smoke for History entry paths.
 * /invoices requires auth → expects login redirect when guest.
 * Usage: node scripts/phase3b1-invoices-a11y.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const results = [];

function consentInit() {
  return () => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
  };
}

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});

// prefers-reduced-motion: /invoices → login (guest) + /create-invoice
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.addInitScript(consentInit());

  await page.goto(`${BASE}/invoices`, { waitUntil: "domcontentloaded" });
  const invoicesUrl = page.url();
  const onLogin = /\/login/i.test(invoicesUrl);
  const loginUi =
    (await page.getByRole("heading", { level: 1 }).count()) > 0 ||
    (await page.locator('input[type="email"], input[type="password"]').count()) >
      0;
  results.push({
    check: "reduced-motion-invoices-guest",
    path: "/invoices",
    result: onLogin && loginUi ? "PASS" : "FAIL",
    detail: `url=${invoicesUrl} login=${onLogin} ui=${loginUi}`,
  });

  await page.goto(`${BASE}/create-invoice`, { waitUntil: "domcontentloaded" });
  const builderH1 = await page.getByRole("heading", { level: 1 }).count();
  results.push({
    check: "reduced-motion-create-invoice",
    path: "/create-invoice",
    result: builderH1 >= 1 ? "PASS" : "FAIL",
    detail: `h1=${builderH1}`,
  });

  await context.close();
}

// Touch emulation: /invoices guest redirect + create-invoice
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.addInitScript(consentInit());

  await page.goto(`${BASE}/invoices`, { waitUntil: "domcontentloaded" });
  const invoicesUrl = page.url();
  const fineHoverLogin = await page.evaluate(() =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  const loginOk = /\/login/i.test(invoicesUrl);
  results.push({
    check: "touch-emulation",
    path: "/invoices",
    result: loginOk && !fineHoverLogin ? "PASS" : "FAIL",
    detail: `url=${invoicesUrl} finePointer=${fineHoverLogin}`,
  });

  await page.goto(`${BASE}/create-invoice`, { waitUntil: "domcontentloaded" });
  const fineHoverBuilder = await page.evaluate(() =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  const builderH1 = await page.getByRole("heading", { level: 1 }).count();
  results.push({
    check: "touch-emulation",
    path: "/create-invoice",
    result: builderH1 >= 1 && !fineHoverBuilder ? "PASS" : "FAIL",
    detail: `h1=${builderH1} finePointer=${fineHoverBuilder}`,
  });

  await context.close();
}

// Keyboard: login from /invoices guest + template dialog on create-invoice
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  await page.addInitScript(consentInit());

  await page.goto(`${BASE}/invoices`, { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const loginFocus = await page.evaluate(() => {
    const el = document.activeElement;
    return el
      ? `${el.tagName}:${el.getAttribute("type") || el.getAttribute("href") || el.getAttribute("aria-label") || el.textContent?.slice(0, 40)}`
      : "none";
  });
  const hasLoginUi =
    (await page.getByRole("button", { name: /google|log in|sign in|continue/i }).count()) >
      0 ||
    (await page.locator('input[type="email"], input[type="password"]').count()) > 0;
  results.push({
    check: "keyboard-invoices-guest-login",
    path: "/invoices→login",
    result: hasLoginUi ? "PASS" : "FAIL",
    detail: `focus=${loginFocus}`,
  });

  await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
  const templateBtn = page.getByRole("button", { name: /Template/i });
  if (await templateBtn.count()) {
    await templateBtn.click();
    await page.waitForTimeout(300);
    const dialogOpen = await page.getByRole("dialog").count();
    await page.keyboard.press("Tab");
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
  } else {
    results.push({
      check: "keyboard-template-dialog",
      path: "/create-invoice",
      result: "FAIL",
      detail: "Template button missing",
    });
  }

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
