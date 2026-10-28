/**
 * Fails when any items-table number cell overflows (scrollWidth > clientWidth)
 * or when any two number cells in a row have overlapping bounding boxes.
 *
 * Usage: node scripts/line-item-table-overflow.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const WIDTHS = [320, 360, 390, 768, 1440];
const LAYOUTS = [
  "classic",
  "ledger",
  "corporate",
  "split",
  "compact",
  "ribbon",
];

const FIVE_LINE =
  "Line one of the description\nLine two with more detail\nLine three continues here\nLine four adds context\nLine five finishes the note";

async function stress(page, layoutId, mode) {
  await page.addInitScript((id) => {
    localStorage.setItem(
      "ss_consent",
      JSON.stringify({ value: "rejected", at: new Date().toISOString() }),
    );
    localStorage.removeItem("ss_guest_invoice");
    localStorage.removeItem("ss_guest_invoice_draft");
    localStorage.removeItem("ss_guest_invoice");
    try {
      sessionStorage.setItem("ss_template", id);
      sessionStorage.removeItem("ss_accent");
    } catch {
      /* ignore */
    }
  }, layoutId);

  await page.goto(`${BASE}/create-invoice`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".builder-table tbody tr", { timeout: 30000 });

  const opts = { force: true };
  await page.locator(".builder-table textarea").first().fill(FIVE_LINE, opts);
  await page.getByLabel("Quantity").first().fill("99999", opts);
  await page.getByLabel("Quantity").first().blur();

  const price = page.getByLabel("Price").first();
  await price.click(opts);
  await price.fill("1234567.89", opts);
  await price.blur();

  const suffix = page.locator(".builder-discount-suffix").first();
  let aria = (await suffix.getAttribute("aria-label")) || "";

  if (mode === "percent") {
    if (/switch to percent/i.test(aria)) {
      await suffix.evaluate((el) => el.click());
      await page.waitForTimeout(50);
    }
    await page.getByLabel("Discount percent").first().fill("100", opts);
    await page.getByLabel("Discount percent").first().blur();
  } else {
    if (/switch to pounds/i.test(aria) || /Discount type: percent/i.test(aria)) {
      await suffix.evaluate((el) => el.click());
      await page.waitForTimeout(50);
    }
    await page
      .getByLabel("Discount amount")
      .first()
      .waitFor({ state: "visible", timeout: 5000 });
    await page.getByLabel("Discount amount").first().fill("99999.99", opts);
    await page.getByLabel("Discount amount").first().blur();
  }

  await page.getByLabel("VAT percent").first().fill("20", opts);
  await page.getByLabel("VAT percent").first().blur();
  await page.waitForTimeout(100);
}

async function measure(page) {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const textOverflows = (el) => {
      const text =
        el instanceof HTMLInputElement ? el.value : (el.textContent || "");
      if (!text || !ctx) return el.scrollWidth > el.clientWidth + 1;
      const style = getComputedStyle(el);
      // Wrapped totals (narrow cards) are allowed; only fail if clipped.
      if (
        style.whiteSpace === "normal" ||
        style.wordBreak === "break-all" ||
        style.overflowWrap === "anywhere" ||
        style.overflowWrap === "break-word"
      ) {
        return (
          (style.overflow === "hidden" || style.overflowX === "hidden") &&
          el.scrollWidth > el.clientWidth + 1
        );
      }
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return ctx.measureText(text).width > el.clientWidth + 1;
    };

    const issues = [];
    const rows = [
      ...document.querySelectorAll(".builder-table tbody tr.builder-item-row"),
    ];
    for (const row of rows) {
      const numCells = [...row.querySelectorAll("td.num")];
      const boxes = [];
      for (const td of numCells) {
        const targets = [
          ...td.querySelectorAll(
            "input.builder-num-field, .builder-line-total",
          ),
        ];
        if (!targets.length) targets.push(td);
        for (const el of targets) {
          if (textOverflows(el)) {
            issues.push({
              type: "overflow",
              label: td.getAttribute("data-label") || td.className,
              tag: el.className,
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              text:
                el instanceof HTMLInputElement
                  ? el.value
                  : (el.textContent || "").trim(),
              fontSize: getComputedStyle(el).fontSize,
            });
          }
        }
        const r = td.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        boxes.push({
          label: td.getAttribute("data-label") || "num",
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
        });
      }
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          const overlapX = a.left < b.right - 0.5 && b.left < a.right - 0.5;
          const overlapY = a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
          if (overlapX && overlapY) {
            issues.push({ type: "overlap", a: a.label, b: b.label });
          }
        }
      }
      // Cells must stay inside their row (a fixed row height lets stacked
      // cards spill over the Add Item button and totals).
      const rowRect = row.getBoundingClientRect();
      for (const td of row.children) {
        const r = td.getBoundingClientRect();
        if (r.height < 1) continue;
        if (r.bottom > rowRect.bottom + 0.5) {
          issues.push({
            type: "cell-outside-row",
            cell: td.getAttribute("data-label") || td.className,
          });
        }
      }
    }
    const table = document.querySelector(".builder-table");
    const addItem = document.querySelector(".builder-add-item");
    if (
      table &&
      addItem &&
      table.getBoundingClientRect().bottom >
        addItem.getBoundingClientRect().top + 0.5
    ) {
      issues.push({ type: "table-overlaps-add-item" });
    }
    return issues;
  });
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

for (const width of WIDTHS) {
  for (const layout of LAYOUTS) {
    for (const mode of ["percent", "fixed"]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      try {
        await stress(page, layout, mode);
        const issues = await measure(page);
        if (issues.length) {
          failed += 1;
          console.error(
            `FAIL ${width}px ${layout} ${mode}`,
            JSON.stringify(issues),
          );
        } else {
          console.log(`PASS ${width}px ${layout} ${mode}`);
        }
      } catch (err) {
        failed += 1;
        console.error(`FAIL ${width}px ${layout} ${mode}`, err.message);
      }
      await context.close();
    }
  }
}

await browser.close();
console.log(failed ? `\n${failed} failing cases` : "\nAll overflow checks passed");
process.exit(failed ? 1 : 0);
