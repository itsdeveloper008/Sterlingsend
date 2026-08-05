import { chromium } from "playwright";
import { join } from "node:path";

async function main() {
  const FIX = join(process.cwd(), ".tmp-tool-test/fixtures");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("CONSOLE", m.type(), m.text()));
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await page.goto("http://localhost:3001/tools/merge-pdf", {
    waitUntil: "networkidle",
  });
  console.log("title", await page.title());
  console.log("heading", await page.locator("h1").innerText());
  const inputs = await page.locator("input[type=file]").count();
  console.log("file inputs", inputs);
  const accept = await page
    .locator("input[type=file]")
    .first()
    .getAttribute("accept");
  console.log("accept", accept);
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles([join(FIX, "sample-a.pdf"), join(FIX, "sample-b.pdf")]);
  await page.waitForTimeout(2500);
  const text = await page.locator("body").innerText();
  console.log("has sample-a?", text.includes("sample-a.pdf"));
  console.log("disabled?", await page.getByRole("button", { name: /Process/ }).isDisabled());
  console.log(
    "snippet",
    text
      .split("\n")
      .filter((l) => /sample|Select|Process|Ready|Files/i.test(l))
      .slice(0, 20)
      .join(" | "),
  );
  await page.screenshot({
    path: ".tmp-tool-test/debug-merge.png",
    fullPage: true,
  });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
