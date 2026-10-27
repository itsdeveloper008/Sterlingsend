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
  { name: "ink on mint-surface", fg: "#0F172A", bg: "#F0FDFA", level: "aa" },
  { name: "ink on hero-tint", fg: "#0F172A", bg: "#E6FAF6", level: "aa" },
  { name: "body on white", fg: "#334155", bg: "#FFFFFF", level: "aa" },
  { name: "body on mint-surface", fg: "#334155", bg: "#F0FDFA", level: "aa" },
  { name: "secondary on white", fg: "#475569", bg: "#FFFFFF", level: "aa" },
  { name: "secondary on mint-surface", fg: "#475569", bg: "#F0FDFA", level: "aa" },
  { name: "placeholder on white", fg: "#64748B", bg: "#FFFFFF", level: "aa" },
  { name: "white on brand-700 (small button)", fg: "#FFFFFF", bg: "#0F766E", level: "aa" },
  { name: "white on brand-800 (pressed)", fg: "#FFFFFF", bg: "#115E59", level: "aa" },
  { name: "white on brand-600 large", fg: "#FFFFFF", bg: "#0D9488", level: "large" },
  { name: "brand-700 text on white", fg: "#0F766E", bg: "#FFFFFF", level: "aa" },
  { name: "brand-700 text on mint", fg: "#0F766E", bg: "#F0FDFA", level: "aa" },
  { name: "brand-700 text on glass-mint", fg: "#0F766E", bg: "#E8F8F4", level: "aa" },
  { name: "brand-600 large on white", fg: "#0D9488", bg: "#FFFFFF", level: "large" },
  { name: "success-text on white", fg: "#047857", bg: "#FFFFFF", level: "aa" },
  { name: "warning-text on white", fg: "#B45309", bg: "#FFFFFF", level: "aa" },
  { name: "destructive-text on white", fg: "#B91C1C", bg: "#FFFFFF", level: "aa" },
  { name: "ink on glass-strong", fg: "#0F172A", bg: "#F0F4F8", level: "aa" },
  { name: "body on glass-strong", fg: "#334155", bg: "#F0F4F8", level: "aa" },
  { name: "muted on glass-strong", fg: "#475569", bg: "#F0F4F8", level: "aa" },
  { name: "ink on glass-mint", fg: "#0F172A", bg: "#E8F8F4", level: "aa" },
  { name: "body on glass-mint", fg: "#334155", bg: "#E8F8F4", level: "aa" },
  { name: "ink on clay-mint", fg: "#0F172A", bg: "#CCFBF1", level: "aa" },
  { name: "body on clay-mint", fg: "#334155", bg: "#CCFBF1", level: "aa" },
  { name: "brand-700 on clay-mint", fg: "#0F766E", bg: "#CCFBF1", level: "aa" },
  { name: "light on dark-band", fg: "#F8FAFC", bg: "#07111F", level: "aa" },
  { name: "muted on dark-band", fg: "#94A3B8", bg: "#07111F", level: "aa" },
  { name: "teal on dark-band", fg: "#5EEAD4", bg: "#07111F", level: "aa" },
  { name: "focus ring vs white", fg: "#0D9488", bg: "#FFFFFF", level: "large" },
  { name: "control border vs white", fg: "#64748B", bg: "#FFFFFF", level: "large" },
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
