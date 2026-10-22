/**
 * Scan Phase 3A page sources for banned copy patterns.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANNED = [
  "seamless",
  "effortless",
  "streamline",
  "supercharge",
  "unlock",
  "empower",
  "elevate",
  "leverage",
  "powerful",
  "revolutionary",
  "game-changing",
  "all-in-one",
  "next-generation",
  "cutting-edge",
];
const TARGETS = [
  "app/(public)/page.tsx",
  "app/(public)/create-invoice/page.tsx",
  "app/(public)/templates",
  "app/(public)/tools",
  "features/marketing/components/home-page.tsx",
  "features/marketing/components/sections/home-hero-section.tsx",
  "features/marketing/components/sections/home-popular-tools-section.tsx",
  "features/marketing/components/sections/home-files-section.tsx",
  "features/marketing/components/sections/home-templates-section.tsx",
  "features/marketing/components/sections/home-faq-section.tsx",
  "features/templates",
  "features/pdf-tools/catalog.ts",
  "features/pdf-tools/catalog-content.ts",
  "features/pdf-tools/components/tools-catalog.tsx",
  "features/pdf-tools/components/tool-workspace.tsx",
  "features/invoice-builder/components/invoice-builder-page.tsx",
  "features/invoice-builder/components/template-picker-dialog.tsx",
];

function walk(p, out = []) {
  const abs = path.join(ROOT, p);
  let st;
  try {
    st = statSync(abs);
  } catch {
    return out;
  }
  if (st.isFile()) {
    if (/\.(tsx?|jsx?|md)$/.test(abs)) out.push(abs);
    return out;
  }
  for (const name of readdirSync(abs)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    walk(path.join(p, name), out);
  }
  return out;
}

const files = TARGETS.flatMap((t) => walk(t));
const hits = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  if (text.includes("—") || text.includes("–")) {
    hits.push({ file: rel, issue: "em/en dash" });
  }
  if (/[\u{1F300}-\u{1FAFF}]/u.test(text)) {
    hits.push({ file: rel, issue: "emoji" });
  }
  const lower = text.toLowerCase();
  for (const word of BANNED) {
    // Tool name / icon import "Unlock" is product naming, not marketing fluff
    if (word === "unlock") {
      const withoutTool = lower
        .replaceAll(/unlock-pdf/g, "")
        .replaceAll(/unlock pdf/g, "")
        .replaceAll(/"unlock"/g, "");
      if (!/\bunlock\b/.test(withoutTool)) continue;
    }
    const re = new RegExp(`\\b${word}\\b`, "i");
    if (re.test(lower)) hits.push({ file: rel, issue: `banned:${word}` });
  }
  if (/lorem ipsum|TODO:\s*copy|coming soon\.+|placeholder copy/i.test(text)) {
    hits.push({ file: rel, issue: "placeholder text" });
  }
}

console.log("| file | issue |");
console.log("|------|-------|");
if (!hits.length) {
  console.log("| (none) | clean |");
} else {
  for (const h of hits) console.log(`| ${h.file} | ${h.issue} |`);
}
console.log(`\n${hits.length} issue(s)`);
process.exit(hits.length ? 1 : 0);
