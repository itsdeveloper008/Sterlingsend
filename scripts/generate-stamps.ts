/**
 * Build outlined SVG rubber-stamp assets into public/stamps/.
 * Font: Barlow Condensed Bold (OFL) — download if missing.
 *
 * Usage: npx tsx scripts/generate-stamps.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import path from "node:path";
import opentype from "opentype.js";

const ROOT = process.cwd();
const FONT_DIR = path.join(ROOT, "scripts", "fonts");
const FONT_PATH = path.join(FONT_DIR, "BarlowCondensed-Bold.ttf");
const OUT_DIR = path.join(ROOT, "public", "stamps");

const STAMPS = [
  { id: "draft", label: "DRAFT", color: "#475569", seed: 11 },
  { id: "pending", label: "PENDING", color: "#B45309", seed: 22 },
  { id: "approved", label: "APPROVED", color: "#15803D", seed: 33 },
  { id: "declined", label: "DECLINED", color: "#B91C1C", seed: 44 },
  { id: "cancelled", label: "CANCELLED", color: "#1F2937", seed: 55 },
] as const;

const FONT_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/BarlowCondensed-Bold.ttf";

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function downloadFont(): Promise<void> {
  if (existsSync(FONT_PATH)) {
    const head = readFileSync(FONT_PATH).subarray(0, 4).toString("binary");
    if (head.startsWith("\x00\x01\x00\x00") || head.startsWith("OTTO")) {
      return Promise.resolve();
    }
  }
  mkdirSync(FONT_DIR, { recursive: true });
  return new Promise((resolve, reject) => {
    get(FONT_URL, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        writeFileSync(FONT_PATH, Buffer.concat(chunks));
        resolve();
      });
    }).on("error", reject);
  });
}

function wearMask(seed: number, w: number, h: number): string {
  const rand = mulberry32(seed);
  const dots: string[] = [];
  for (let i = 0; i < 28; i++) {
    const cx = 8 + rand() * (w - 16);
    const cy = 8 + rand() * (h - 16);
    const r = 0.4 + rand() * 1.2;
    dots.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(2)}" fill="black"/>`);
  }
  // edge nicks
  for (let i = 0; i < 6; i++) {
    const side = Math.floor(rand() * 4);
    let x = 0;
    let y = 0;
    if (side === 0) {
      x = 10 + rand() * (w - 20);
      y = 2 + rand() * 4;
    } else if (side === 1) {
      x = w - 6 + rand() * 3;
      y = 10 + rand() * (h - 20);
    } else if (side === 2) {
      x = 10 + rand() * (w - 20);
      y = h - 6 + rand() * 3;
    } else {
      x = 2 + rand() * 4;
      y = 10 + rand() * (h - 20);
    }
    dots.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(1.5 + rand()).toFixed(1)}" height="${(1.2 + rand()).toFixed(1)}" fill="black"/>`,
    );
  }
  return dots.join("");
}

function buildSvg(
  font: opentype.Font,
  label: string,
  color: string,
  seed: number,
): string {
  const fontSize = 72;
  const tracking = 8; // wide tracking in font units-ish via letter spacing
  // Manual letter spacing: path each glyph with extra advance
  let x = 0;
  const paths: string[] = [];
  for (const ch of label) {
    const glyph = font.charToGlyph(ch);
    const gPath = glyph.getPath(x, 0, fontSize);
    paths.push(gPath.toPathData(2));
    x += (glyph.advanceWidth / font.unitsPerEm) * fontSize + tracking;
  }
  const textWidth = x - tracking;
  const asc = font.ascender / font.unitsPerEm * fontSize;
  const desc = Math.abs(font.descender / font.unitsPerEm * fontSize);
  const padX = 28;
  const padY = 22;
  const innerPad = 8;
  const w = Math.ceil(textWidth + padX * 2);
  const h = Math.ceil(asc + desc + padY * 2);
  const textY = padY + asc;
  // Re-path with final baseline
  const finalPaths: string[] = [];
  let cx = padX;
  for (const ch of label) {
    const glyph = font.charToGlyph(ch);
    const gPath = glyph.getPath(cx, textY, fontSize);
    finalPaths.push(gPath.toPathData(2));
    cx += (glyph.advanceWidth / font.unitsPerEm) * fontSize + tracking;
  }

  const maskId = `wear-${seed}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
  <defs>
    <mask id="${maskId}">
      <rect width="${w}" height="${h}" fill="white"/>
      ${wearMask(seed, w, h)}
    </mask>
  </defs>
  <g mask="url(#${maskId})" opacity="0.88">
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="10" ry="10" stroke="${color}" stroke-width="4" fill="none"/>
    <rect x="${2 + innerPad}" y="${2 + innerPad}" width="${w - 4 - innerPad * 2}" height="${h - 4 - innerPad * 2}" rx="6" ry="6" stroke="${color}" stroke-width="1.5" fill="none"/>
    <path d="${finalPaths.join(" ")}" fill="${color}"/>
  </g>
</svg>
`;
}

async function main() {
  await downloadFont();
  const buf = readFileSync(FONT_PATH);
  const font = opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
  mkdirSync(OUT_DIR, { recursive: true });
  for (const stamp of STAMPS) {
    const svg = buildSvg(font, stamp.label, stamp.color, stamp.seed);
    const out = path.join(OUT_DIR, `${stamp.id}.svg`);
    writeFileSync(out, svg);
    console.log("wrote", out);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
