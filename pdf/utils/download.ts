"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { PDF_PAGE_WIDTH_PX } from "@/pdf/constants";
import { getInvoicePdfFilename } from "@/pdf/utils/filename";

const COLOR_PROPS = [
  "color",
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "columnRuleColor",
  "caretColor",
  "fill",
  "stroke",
] as const;

/** Minimum raster width across the A4 page (CSS width × scale). */
export const PDF_CAPTURE_MIN_WIDTH_PX = 2400;
const JPEG_QUALITY = 0.82;

/**
 * html2canvas cannot parse modern CSS color functions (oklab/oklch/color-mix)
 * that Tailwind v4 emits. Clone the node off-DOM and rewrite colors to rgb().
 */
function prepareElementForCanvas(source: HTMLElement): {
  clone: HTMLElement;
  cleanup: () => void;
} {
  const clone = source.cloneNode(true) as HTMLElement;
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-pdf-clone-root", "true");
  wrapper.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:" + Math.max(source.offsetWidth, PDF_PAGE_WIDTH_PX) + "px",
    "background:#ffffff",
    "pointer-events:none",
    "z-index:-1",
  ].join(";");

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const sourceNodes = [source, ...Array.from(source.querySelectorAll("*"))];
  const cloneNodes = [clone, ...Array.from(clone.querySelectorAll("*"))];

  for (let i = 0; i < sourceNodes.length; i++) {
    const srcEl = sourceNodes[i] as HTMLElement;
    const dstEl = cloneNodes[i] as HTMLElement | undefined;
    if (!dstEl || !(srcEl instanceof HTMLElement) || !(dstEl instanceof HTMLElement)) {
      continue;
    }

    const computed = window.getComputedStyle(srcEl);

    const unparseable = /oklab|oklch|color-mix|lab\(|lch\(/i;
    const safeColor = (value: string, fallback: string) => {
      if (!value || value === "rgba(0, 0, 0, 0)") return fallback;
      const srgb = value.match(
        /color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i,
      );
      if (srgb) {
        return `rgb(${Math.round(Number(srgb[1]) * 255)}, ${Math.round(Number(srgb[2]) * 255)}, ${Math.round(Number(srgb[3]) * 255)})`;
      }
      if (unparseable.test(value)) return fallback;
      return value;
    };

    const resolvedBg = computed.backgroundColor;

    for (const prop of COLOR_PROPS) {
      const value = computed[prop as keyof CSSStyleDeclaration];
      if (typeof value === "string" && value && value !== "rgba(0, 0, 0, 0)") {
        const cssName = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        const fallback =
          prop === "backgroundColor"
            ? resolvedBg && !unparseable.test(resolvedBg)
              ? resolvedBg
              : "#ffffff"
            : "#0f172a";
        dstEl.style.setProperty(cssName, safeColor(value, fallback));
      }
    }

    const shadow = computed.boxShadow;
    dstEl.style.boxShadow =
      !shadow || shadow === "none" || unparseable.test(shadow)
        ? "none"
        : shadow;

    dstEl.style.borderTop = `${computed.borderTopWidth} ${computed.borderTopStyle} ${safeColor(computed.borderTopColor, computed.borderTopColor)}`;
    dstEl.style.borderRight = `${computed.borderRightWidth} ${computed.borderRightStyle} ${safeColor(computed.borderRightColor, computed.borderRightColor)}`;
    dstEl.style.borderBottom = `${computed.borderBottomWidth} ${computed.borderBottomStyle} ${safeColor(computed.borderBottomColor, computed.borderBottomColor)}`;
    dstEl.style.borderLeft = `${computed.borderLeftWidth} ${computed.borderLeftStyle} ${safeColor(computed.borderLeftColor, computed.borderLeftColor)}`;
    dstEl.style.borderRadius = computed.borderRadius;

    const bgImage = computed.backgroundImage;
    if (!bgImage || bgImage === "none") {
      dstEl.style.backgroundImage = "none";
    } else if (unparseable.test(bgImage)) {
      dstEl.style.backgroundImage = "none";
    } else {
      dstEl.style.backgroundImage = bgImage;
    }

    for (const style of Array.from(dstEl.style)) {
      const val = dstEl.style.getPropertyValue(style);
      if (unparseable.test(val) || /color\(\s*srgb/i.test(val)) {
        dstEl.style.setProperty(
          style,
          safeColor(val, style.includes("background") ? "#ffffff" : "#0f172a"),
        );
      }
    }

    if (
      dstEl.classList.contains("no-print") ||
      dstEl.classList.contains("builder-row-remove") ||
      dstEl.classList.contains("builder-add-item") ||
      dstEl.classList.contains("builder-empty-print") ||
      dstEl.classList.contains("builder-discount-toggle") ||
      dstEl.classList.contains("builder-logo-box")
    ) {
      dstEl.style.display = "none";
    }

    if (
      dstEl instanceof HTMLInputElement ||
      dstEl instanceof HTMLTextAreaElement ||
      dstEl instanceof HTMLSelectElement
    ) {
      if (dstEl instanceof HTMLInputElement && dstEl.type === "checkbox") {
        const mark = document.createElement("span");
        mark.textContent = dstEl.checked ? "✓" : "-";
        mark.style.cssText =
          "display:inline-block;width:100%;text-align:center;font-weight:700;color:#0f172a;";
        dstEl.replaceWith(mark);
        continue;
      }

      const text = document.createElement("div");
      const value =
        dstEl instanceof HTMLSelectElement
          ? dstEl.options[dstEl.selectedIndex]?.text || dstEl.value
          : dstEl.value;
      text.textContent = value || "";

      const color =
        typeof computed.color === "string" && computed.color
          ? computed.color
          : "#0f172a";
      text.style.cssText = [
        "display:block",
        "width:100%",
        "box-sizing:border-box",
        "white-space:pre-wrap",
        "word-break:break-word",
        `color:${color}`,
        `font-family:${computed.fontFamily}`,
        `font-size:${computed.fontSize}`,
        `font-weight:${computed.fontWeight}`,
        `font-style:${computed.fontStyle}`,
        `letter-spacing:${computed.letterSpacing}`,
        `line-height:${computed.lineHeight === "normal" ? "1.45" : computed.lineHeight}`,
        `text-align:${computed.textAlign}`,
        `margin:${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
        `padding:${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
        "border:0",
        "box-shadow:none",
        "background:transparent",
        "text-decoration:none",
      ].join(";");

      if (dstEl instanceof HTMLTextAreaElement || dstEl.tagName === "TEXTAREA") {
        text.style.minHeight = "1.5em";
      }

      dstEl.replaceWith(text);
    }
  }

  clone.style.backgroundColor = "#ffffff";
  clone.style.color = "#0f172a";
  clone.style.boxShadow = "none";

  const sourceStyle = window.getComputedStyle(source);
  for (const key of [
    "--inv-primary",
    "--inv-accent",
    "--inv-teal",
    "--inv-teal-deep",
    "--inv-primary-soft",
    "--inv-accent-soft",
  ]) {
    const value = sourceStyle.getPropertyValue(key).trim();
    if (value) clone.style.setProperty(key, value);
  }

  return {
    clone,
    cleanup: () => {
      wrapper.remove();
    },
  };
}

type TextRun = {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
};

function collectTextRuns(root: HTMLElement): TextRun[] {
  const rootBox = root.getBoundingClientRect();
  const runs: TextRun[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node) {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (text) {
      const parent = node.parentElement;
      if (parent) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const style = window.getComputedStyle(parent);
          const fontSize = Number.parseFloat(style.fontSize) || 12;
          runs.push({
            text,
            x: rect.left - rootBox.left,
            y: rect.top - rootBox.top + fontSize * 0.85,
            fontSize,
            fontFamily: style.fontFamily || "helvetica",
          });
        }
      }
    }
    node = walker.nextNode();
  }
  return runs;
}

/** Prefer breaks just after table rows / avoid-break blocks. */
function computePageBreakYs(
  clone: HTMLElement,
  pageCssHeight: number,
  totalCssHeight: number,
): number[] {
  const rootTop = clone.getBoundingClientRect().top;
  const candidates = new Set<number>([0]);

  const selectors = [
    ".builder-table tbody tr",
    ".builder-header",
    ".builder-billed",
    ".builder-totals",
    ".builder-section",
    ".builder-footer",
  ];
  for (const sel of selectors) {
    for (const el of Array.from(clone.querySelectorAll(sel))) {
      const box = (el as HTMLElement).getBoundingClientRect();
      const bottom = box.bottom - rootTop;
      if (bottom > 8 && bottom < totalCssHeight - 8) {
        candidates.add(Math.round(bottom));
      }
    }
  }

  const sorted = [...candidates].sort((a, b) => a - b);
  const breaks: number[] = [0];
  let pageStart = 0;

  while (pageStart + pageCssHeight < totalCssHeight - 2) {
    const limit = pageStart + pageCssHeight;
    let best = pageStart;
    for (const y of sorted) {
      if (y > pageStart + 40 && y <= limit) best = y;
    }
    if (best <= pageStart) best = limit;
    breaks.push(best);
    pageStart = best;
  }

  return breaks;
}

function cropCanvas(
  source: HTMLCanvasElement,
  y0: number,
  y1: number,
): HTMLCanvasElement {
  const h = Math.max(1, Math.round(y1 - y0));
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = h;
  const ctx = out.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(
      source,
      0,
      Math.round(y0),
      source.width,
      h,
      0,
      0,
      source.width,
      h,
    );
  }
  return out;
}

function addInvisibleTextLayer(
  pdf: jsPDF,
  runs: TextRun[],
  cssToPt: number,
  pageY0: number,
  pageY1: number,
) {
  const gState = pdf.GState({ opacity: 0 });
  pdf.setGState(gState);

  for (const run of runs) {
    if (run.y < pageY0 || run.y > pageY1) continue;
    const x = run.x * cssToPt;
    const y = (run.y - pageY0) * cssToPt;
    const size = Math.max(6, run.fontSize * cssToPt);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(0, 0, 0);
    try {
      pdf.text(run.text, x, y, { baseline: "alphabetic" });
    } catch {
      // skip glyphs jsPDF cannot encode
    }
  }

  pdf.setGState(pdf.GState({ opacity: 1 }));
}

export type DownloadInvoicePdfResult = {
  blob: Blob;
  widthPx: number;
  scale: number;
  pageCount: number;
};

/**
 * Capture a live sheet element to a multi-page A4 PDF (JPEG raster + invisible text).
 * Returns the blob; also triggers a download unless `save` is false.
 */
export async function downloadInvoicePdf(
  element: HTMLElement,
  invoiceNumber: string,
  options?: { save?: boolean },
): Promise<DownloadInvoicePdfResult> {
  const { clone, cleanup } = prepareElementForCanvas(element);
  const save = options?.save !== false;

  try {
    const cssWidth = Math.max(clone.offsetWidth, element.offsetWidth, PDF_PAGE_WIDTH_PX);
    const scale = Math.max(
      2,
      Math.ceil(PDF_CAPTURE_MIN_WIDTH_PX / cssWidth),
    );

    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: cssWidth,
      onclone: (_doc, cloned) => {
        cloned.style.color = "#0f172a";
        cloned.style.backgroundColor = "#ffffff";
      },
    });

    const textRuns = collectTextRuns(clone);
    const totalCssHeight = clone.scrollHeight || clone.offsetHeight;
    const pageCssHeight = cssWidth * (841.89 / 595.28);
    const breakYs = computePageBreakYs(clone, pageCssHeight, totalCssHeight);
    if (breakYs[breakYs.length - 1] < totalCssHeight) {
      breakYs.push(totalCssHeight);
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const cssToPt = pageWidth / cssWidth;

    for (let i = 0; i < breakYs.length - 1; i++) {
      const y0 = breakYs[i];
      const y1 = breakYs[i + 1];
      if (i > 0) pdf.addPage();

      const slice = cropCanvas(canvas, y0 * scale, y1 * scale);
      const jpeg = slice.toDataURL("image/jpeg", JPEG_QUALITY);
      const drawH = (y1 - y0) * cssToPt;
      pdf.addImage(jpeg, "JPEG", 0, 0, pageWidth, Math.min(drawH, pageHeight));
      addInvisibleTextLayer(pdf, textRuns, cssToPt, y0, y1);
    }

    const blob = pdf.output("blob");
    if (save) {
      pdf.save(getInvoicePdfFilename(invoiceNumber));
    }

    return {
      blob,
      widthPx: canvas.width,
      scale,
      pageCount: Math.max(1, breakYs.length - 1),
    };
  } finally {
    cleanup();
  }
}
