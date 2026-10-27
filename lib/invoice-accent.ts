/** Accent colour presets and CSS variable computation (no color-mix). */

export const ACCENT_PRESETS = [
  { id: "teal", name: "Teal", hex: "#0E9BA6" },
  { id: "emerald", name: "Emerald", hex: "#047857" },
  { id: "green", name: "Green", hex: "#15803D" },
  { id: "olive", name: "Olive", hex: "#4D7C0F" },
  { id: "amber", name: "Amber", hex: "#B45309" },
  { id: "orange", name: "Orange", hex: "#C2410C" },
  { id: "red", name: "Red", hex: "#B91C1C" },
  { id: "rose", name: "Rose", hex: "#BE123C" },
  { id: "pink", name: "Pink", hex: "#BE185D" },
  { id: "violet", name: "Violet", hex: "#6D28D9" },
  { id: "indigo", name: "Indigo", hex: "#4338CA" },
  { id: "blue", name: "Blue", hex: "#1D4ED8" },
  { id: "sky", name: "Sky", hex: "#0369A1" },
  { id: "cyan", name: "Cyan", hex: "#0E7490" },
  { id: "slate", name: "Slate", hex: "#334155" },
  { id: "charcoal", name: "Charcoal", hex: "#1F2937" },
] as const;

export const DEFAULT_ACCENT_HEX = "#0E9BA6";
export const ACCENT_SESSION_KEY = "ss_accent";

export type AccentVars = {
  "--inv-accent": string;
  "--inv-accent-text": string;
  "--inv-accent-soft": string;
  "--inv-accent-softer": string;
  "--inv-accent-dark": string;
  "--inv-accent-mid": string;
  "--inv-accent-light": string;
  "--inv-accent-pale": string;
  "--inv-on-accent": string;
  "--inv-primary": string;
  "--inv-teal": string;
  "--inv-teal-deep": string;
  "--inv-primary-soft": string;
  "--inv-accent-soft-legacy": string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function toHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((c) => clamp(c).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function mixWithWhite(hex: string, whitePct: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return "#FFFFFF";
  const t = whitePct / 100;
  return toHex(
    rgb.r * (1 - t) + 255 * t,
    rgb.g * (1 - t) + 255 * t,
    rgb.b * (1 - t) + 255 * t,
  );
}

export function mixWithBlack(hex: string, blackPct: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return "#000000";
  const t = blackPct / 100;
  return toHex(rgb.r * (1 - t), rgb.g * (1 - t), rgb.b * (1 - t));
}

function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 1;
  const lin = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

/** Darken until text on white reaches 4.5:1 (or give up after steps). */
export function ensureTextOnWhite(hex: string, min = 4.5): string {
  let current = hex;
  if (contrastRatio(current, "#FFFFFF") >= min) return current;
  const rgb = parseHex(hex);
  if (!rgb) return DEFAULT_ACCENT_HEX;
  for (let i = 0; i < 24; i++) {
    rgb.r *= 0.92;
    rgb.g *= 0.92;
    rgb.b *= 0.92;
    current = toHex(rgb.r, rgb.g, rgb.b);
    if (contrastRatio(current, "#FFFFFF") >= min) return current;
  }
  return "#0F172A";
}

export function onAccentText(fillHex: string): string {
  if (contrastRatio("#FFFFFF", fillHex) >= 4.5) return "#FFFFFF";
  return "#0F172A";
}

export function normalizeHex(input: string): string | null {
  const rgb = parseHex(input);
  if (!rgb) return null;
  return toHex(rgb.r, rgb.g, rgb.b);
}

export function computeAccentVars(chosen: string): AccentVars {
  const fill = normalizeHex(chosen) ?? DEFAULT_ACCENT_HEX;
  const text = ensureTextOnWhite(fill);
  const onAccent = onAccentText(fill);
  const soft = mixWithWhite(fill, 92);
  const softer = mixWithWhite(fill, 96);
  const dark = mixWithBlack(fill, 38);
  const mid = mixWithBlack(fill, 32);
  const light = mixWithWhite(fill, 28);
  const pale = mixWithWhite(fill, 55);
  return {
    "--inv-accent": fill,
    "--inv-accent-text": text,
    "--inv-accent-soft": soft,
    "--inv-accent-softer": softer,
    "--inv-accent-dark": dark,
    "--inv-accent-mid": mid,
    "--inv-accent-light": light,
    "--inv-accent-pale": pale,
    "--inv-on-accent": onAccent,
    "--inv-primary": text,
    "--inv-teal": fill,
    "--inv-teal-deep": text,
    "--inv-primary-soft": soft,
    "--inv-accent-soft-legacy": soft,
  };
}

export function readSessionAccent(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = sessionStorage.getItem(ACCENT_SESSION_KEY);
    return v ? normalizeHex(v) ?? undefined : undefined;
  } catch {
    return undefined;
  }
}

export function writeSessionAccent(hex: string | undefined) {
  if (typeof window === "undefined") return;
  try {
    if (!hex) sessionStorage.removeItem(ACCENT_SESSION_KEY);
    else sessionStorage.setItem(ACCENT_SESSION_KEY, hex);
  } catch {
    // ignore
  }
}
