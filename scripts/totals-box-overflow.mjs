/**
 * Fails when the TOTAL DUE amount wraps, is clipped, or when the amount/label
 * extend past the tinted total box.
 *
 * Usage: node scripts/totals-box-overflow.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const LAYOUTS = [
  "classic",
  "ledger",
  "editorial",
  "receipt",
  "statement",
  "split",
  "corporate",
  "compact",
  "ribbon",
  "fold",
  "stack",
  "pillar",
  "clay",
  "cube",
  "tab",
  "emboss",
  "seal",
  "noir",
];
const AMOUNTS = [0, 1837.2, 1234567.89, 999999999.99];
const CURRENCIES = ["GBP", "EUR", "USD", "CHF"];

async function open(page, layout) {
  await page.addInitScript((layoutId) => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
    localStorage.removeItem("ss_guest_invoice");
    localStorage.removeItem("ss_guest_invoice_draft");
    try {
      sessionStorage.setItem("ss_template", layoutId);
    } catch {
      /* ignore */
    }
  }, layout);
  await page.goto(`${BASE}/create-invoice`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".builder-total-final", { timeout: 30000 });
}

async function apply(page, currency, amount) {
  const f = { force: true };
  await page.locator(".builder-currency-select--compact").selectOption(currency);
  await page.getByLabel("Quantity").first().fill("1", f);
  await page.getByLabel("Quantity").first().blur();
  await page.getByLabel("VAT percent").first().fill("0", f);
  await page.getByLabel("VAT percent").first().blur();
  const suffix = page.locator(".builder-discount-suffix").first();
  const aria = (await suffix.getAttribute("aria-label")) || "";
  if (/switch to percent/i.test(aria)) await suffix.evaluate((el) => el.click());
  await page.getByLabel("Discount percent").first().fill("0", f);
  await page.getByLabel("Discount percent").first().blur();
  await page.getByLabel("Price").first().click(f);
  await page.getByLabel("Price").first().fill(String(amount), f);
  await page.getByLabel("Price").first().blur();
  await page.waitForTimeout(80);
}

async function measure(page) {
  return page.evaluate(() => {
    const box = document.querySelector(".builder-total-final");
    const amount = document.querySelector(".builder-total-final-amount");
    const label = document.querySelector(".builder-total-due-label");
    if (!box || !amount || !label) {
      return [{ type: "missing", box: !!box, amount: !!amount, label: !!label }];
    }
    const issues = [];
    const br = box.getBoundingClientRect();
    const ar = amount.getBoundingClientRect();
    const lr = label.getBoundingClientRect();
    const amountStyle = getComputedStyle(amount);
    const lineHeight = parseFloat(amountStyle.lineHeight) || ar.height;

    if (ar.height > lineHeight * 1.35 + 1) {
      issues.push({
        type: "wrap",
        height: ar.height,
        lineHeight,
        text: amount.textContent,
      });
    }

    const pad = 1;
    if (ar.right > br.right + pad || ar.left < br.left - pad) {
      issues.push({ type: "amount-outside" });
    }
    if (lr.right > br.right + pad || lr.left < br.left - pad) {
      issues.push({ type: "label-outside" });
    }
    if (amount.scrollWidth > amount.clientWidth + 1) {
      issues.push({
        type: "clipped",
        scrollWidth: amount.scrollWidth,
        clientWidth: amount.clientWidth,
        text: amount.textContent,
        fontSize: amountStyle.fontSize,
      });
    }

    for (const el of document.querySelectorAll(".builder-total-value")) {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      const lh = parseFloat(st.lineHeight) || r.height;
      if (r.height > lh * 1.35 + 1) {
        issues.push({ type: "row-wrap", text: el.textContent });
      }
      if (el.scrollWidth > el.clientWidth + 1) {
        issues.push({
          type: "row-clipped",
          text: el.textContent,
          sw: el.scrollWidth,
          cw: el.clientWidth,
        });
      }
    }
    return issues;
  });
}

const CASES = [];
for (const layout of LAYOUTS) {
  for (const amount of AMOUNTS) {
    CASES.push({ width: 1440, layout, currency: "GBP", amount });
  }
}
for (const currency of CURRENCIES) {
  for (const amount of [1837.2, 999999999.99]) {
    CASES.push({ width: 1440, layout: "classic", currency, amount });
  }
}
for (const width of [768, 390]) {
  for (const layout of LAYOUTS) {
    for (const amount of [1837.2, 999999999.99]) {
      CASES.push({ width, layout, currency: "GBP", amount });
    }
  }
}

const chromePath =
  process.env.CHROME_PATH ||
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  undefined;
const browser = await chromium.launch({
  headless: true,
  ...(chromePath ? { executablePath: chromePath } : {}),
});
let failed = 0;

for (const c of CASES) {
  const context = await browser.newContext({
    viewport: { width: c.width, height: 1000 },
  });
  const page = await context.newPage();
  const key = `${c.width}px ${c.layout} ${c.currency} ${c.amount}`;
  try {
    await open(page, c.layout);
    await apply(page, c.currency, c.amount);
    const issues = await measure(page);
    if (issues.length) {
      failed += 1;
      console.error(`FAIL ${key}`, JSON.stringify(issues));
    } else {
      console.log(`PASS ${key}`);
    }
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${key}`, err.message);
  }
  await context.close();
}

await browser.close();
console.log(
  failed ? `\n${failed} failing cases` : "\nAll totals-box checks passed",
);
process.exit(failed ? 1 : 0);
