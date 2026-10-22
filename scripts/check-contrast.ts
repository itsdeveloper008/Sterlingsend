/**
 * Contrast gate for design tokens.
 * Fails if text pairs are below 4.5:1 (normal) or 3:1 (large / UI).
 */
type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: Rgb) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string) {
  const l1 = luminance(hexToRgb(a));
  const l2 = luminance(hexToRgb(b));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

type Pair = {
  name: string;
  fg: string;
  bg: string;
  level: "aa" | "large";
};

const GATE: Pair[] = [
  { name: "ink on white", fg: "#0F172A", bg: "#FFFFFF", level: "aa" },
  { name: "ink on slate-50", fg: "#0F172A", bg: "#F8FAFC", level: "aa" },
  { name: "ink on slate-100", fg: "#0F172A", bg: "#F1F5F9", level: "aa" },
  { name: "body on white", fg: "#334155", bg: "#FFFFFF", level: "aa" },
  { name: "body on slate-50", fg: "#334155", bg: "#F8FAFC", level: "aa" },
  { name: "secondary on white", fg: "#475569", bg: "#FFFFFF", level: "aa" },
  { name: "secondary on slate-50", fg: "#475569", bg: "#F8FAFC", level: "aa" },
  { name: "placeholder on white", fg: "#64748B", bg: "#FFFFFF", level: "aa" },
  { name: "secondary on slate-100", fg: "#475569", bg: "#F1F5F9", level: "aa" },
  { name: "white on brand-700 (button)", fg: "#FFFFFF", bg: "#0F766E", level: "aa" },
  { name: "brand-700 text on white", fg: "#0F766E", bg: "#FFFFFF", level: "aa" },
  { name: "brand-700 text on slate-50", fg: "#0F766E", bg: "#F8FAFC", level: "aa" },
  { name: "brand-700 text on glass-light", fg: "#0F766E", bg: "#F8FAFC", level: "aa" },
  { name: "brand-600 large on white", fg: "#0D9488", bg: "#FFFFFF", level: "large" },
  { name: "success-text on white", fg: "#047857", bg: "#FFFFFF", level: "aa" },
  { name: "warning-text on white", fg: "#B45309", bg: "#FFFFFF", level: "aa" },
  { name: "destructive-text on white", fg: "#B91C1C", bg: "#FFFFFF", level: "aa" },
  { name: "dark fg on navy bg", fg: "#F8FAFC", bg: "#0F172A", level: "aa" },
  { name: "dark fg on surface", fg: "#F8FAFC", bg: "#1E293B", level: "aa" },
  { name: "muted on navy", fg: "#94A3B8", bg: "#0F172A", level: "aa" },
  { name: "muted on surface", fg: "#94A3B8", bg: "#1E293B", level: "aa" },
  { name: "brand-500 accent on navy", fg: "#14B8A6", bg: "#0F172A", level: "aa" },
  { name: "brand-500 accent on surface", fg: "#14B8A6", bg: "#1E293B", level: "aa" },
  { name: "white on brand-700 dark", fg: "#FFFFFF", bg: "#0F766E", level: "aa" },
  { name: "border vs white", fg: "#64748B", bg: "#FFFFFF", level: "large" },
  { name: "input border vs white", fg: "#64748B", bg: "#FFFFFF", level: "large" },
  { name: "dark border vs navy", fg: "#94A3B8", bg: "#0F172A", level: "large" },
  { name: "dark input vs navy", fg: "#94A3B8", bg: "#0F172A", level: "large" },
];

console.log("White text on brand shades (verification):");
for (const [label, bg] of [
  ["brand-500 #14B8A6", "#14B8A6"],
  ["brand-600 #0D9488", "#0D9488"],
  ["brand-700 #0F766E", "#0F766E"],
] as const) {
  const r = contrast("#FFFFFF", bg);
  console.log(`  ${label}: ${r.toFixed(2)}:1  ${r >= 4.5 ? "AA text OK" : r >= 3 ? "large/UI only" : "FAIL even large"}`);
}

let failures = 0;
console.log("\n=== Gate pairs ===");
for (const pair of GATE) {
  const ratio = contrast(pair.fg, pair.bg);
  const min = pair.level === "aa" ? 4.5 : 3;
  const ok = ratio >= min;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2)}:1 (need ${min})  ${pair.name}`,
  );
  if (!ok) failures += 1;
}

if (failures > 0) {
  console.error(`\nContrast gate failed: ${failures} pair(s)`);
  process.exit(1);
}

console.log("\nContrast gate passed.");
