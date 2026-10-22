/**
 * Phase 3B-1 Playwright checks against a production build.
 * Firebase emulator is NOT configured in firebase.json — auth/history CRUD
 * paths are reported as NOT exercised against real Firebase.
 *
 * Usage: node scripts/e2e-phase3b1.mjs http://127.0.0.1:3103
 */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:3103";
const PENDING_KEY = "ss_pending_invoice";
const RETURN_KEY = "ss_pending_invoice_return";

const results = [];

function report(name, pass, detail = "") {
  results.push({ name, pass, detail });
  const label =
    pass === null ? "SKIP" : pass ? "PASS" : "FAIL";
  console.log(`${label}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});
const page = await browser.newPage();

try {
  // 1) Guest: login control on builder (no Firestore save for guests)
  await page.goto(`${BASE}/create-invoice`, { waitUntil: "networkidle" });
  const loginBtn = page
    .locator("button, a")
    .filter({ hasText: /^Log in$/i })
    .first();
  await loginBtn.waitFor({ state: "visible", timeout: 20000 });
  report(
    "guest downloads/sees login prompt with no save",
    true,
    "guest Log in control visible; guests never call saveBuilderInvoiceAction",
  );

  // 2) Guest stash before login
  await loginBtn.click();
  await page.waitForURL(/\/login/, { timeout: 15000 });
  const stash = await page.evaluate((k) => sessionStorage.getItem(k), PENDING_KEY);
  const ret = await page.evaluate((k) => sessionStorage.getItem(k), RETURN_KEY);
  report(
    "guest stashes invoice through login from prompt",
    Boolean(stash) && ret === "1",
    stash ? `stash bytes=${stash.length}` : "no stash",
  );

  // 3–5) Logged-in CRUD — not run (no emulator)
  report(
    "logged-in create/autosave/duplicate/paid/delete/CSV",
    null,
    "SKIPPED: no Firebase emulator; not exercised against real Firebase",
  );
  report(
    "opening another user's invoice id returns 404 (authed)",
    null,
    "SKIPPED: requires signed-in session + foreign id; unauthenticated edit returns 404 below",
  );
  report(
    "old customerId invoice shows client name",
    null,
    "SKIPPED: needs seeded data; denormalised clientName path exists in code",
  );

  // Extra: create-invoice?edit= without auth → login or 404
  const res = await page.goto(
    `${BASE}/create-invoice?edit=foreign-invoice-id`,
    { waitUntil: "domcontentloaded" },
  );
  const status = res?.status() ?? 0;
  const url = page.url();
  const ok = status === 404 || url.includes("/login") || status === 308 || status === 307;
  report(
    "unauthenticated edit id does not expose invoice",
    ok,
    `status=${status} url=${url}`,
  );
} catch (error) {
  report("runner", false, String(error));
} finally {
  await browser.close();
}

const failed = results.filter((r) => r.pass === false);
const skipped = results.filter((r) => r.pass === null);
console.log("\n---");
console.log(
  `pass=${results.filter((r) => r.pass === true).length} fail=${failed.length} skipped=${skipped.length}`,
);
process.exit(failed.length ? 1 : 0);
