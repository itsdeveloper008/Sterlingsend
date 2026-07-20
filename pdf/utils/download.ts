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

    for (const prop of COLOR_PROPS) {
      const value = computed[prop as keyof CSSStyleDeclaration];
      if (typeof value === "string" && value && value !== "rgba(0, 0, 0, 0)") {
        const cssName = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        dstEl.style.setProperty(cssName, value);
      }
    }

    // Flatten shadows / borders that may still reference oklab via Tailwind
    const shadow = computed.boxShadow;
    dstEl.style.boxShadow =
      !shadow || shadow === "none" || /oklab|oklch|color-mix/i.test(shadow)
        ? "none"
        : shadow;

    dstEl.style.borderTop = `${computed.borderTopWidth} ${computed.borderTopStyle} ${computed.borderTopColor}`;
    dstEl.style.borderRight = `${computed.borderRightWidth} ${computed.borderRightStyle} ${computed.borderRightColor}`;
    dstEl.style.borderBottom = `${computed.borderBottomWidth} ${computed.borderBottomStyle} ${computed.borderBottomColor}`;
    dstEl.style.borderLeft = `${computed.borderLeftWidth} ${computed.borderLeftStyle} ${computed.borderLeftColor}`;
    dstEl.style.borderRadius = computed.borderRadius;
    dstEl.style.backgroundImage = "none";

    for (const style of Array.from(dstEl.style)) {
      const val = dstEl.style.getPropertyValue(style);
      if (/oklab|oklch|color-mix|lab\(|lch\(/i.test(val)) {
        if (style.includes("background")) {
          dstEl.style.setProperty(style, "#ffffff");
        } else {
          dstEl.style.setProperty(style, "#0f172a");
        }
      }
    }

    // Hide interactive chrome in the clone
    if (
      dstEl.classList.contains("no-print") ||
      dstEl.classList.contains("builder-row-remove") ||
      dstEl.classList.contains("builder-add-item") ||
      dstEl.classList.contains("builder-empty-print")
    ) {
      dstEl.style.display = "none";
    }

    // Replace form controls with plain text for cleaner PDF
    if (
      dstEl instanceof HTMLInputElement ||
      dstEl instanceof HTMLTextAreaElement ||
      dstEl instanceof HTMLSelectElement
    ) {
      if (dstEl instanceof HTMLInputElement && dstEl.type === "checkbox") {
        const mark = document.createElement("span");
        mark.textContent = dstEl.checked ? "✓" : "–";
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
      text.style.cssText = [
        "white-space:pre-wrap",
        "word-break:break-word",
        "color:#0f172a",
        "font:inherit",
        "line-height:1.45",
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

  return {
    clone,
    cleanup: () => {
      wrapper.remove();
    },
  };
}

export async function downloadInvoicePdf(
  element: HTMLElement,
  invoiceNumber: string,
) {
  const { clone, cleanup } = prepareElementForCanvas(element);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: Math.max(element.offsetWidth, PDF_PAGE_WIDTH_PX),
      onclone: (_doc, cloned) => {
        cloned.style.color = "#0f172a";
        cloned.style.backgroundColor = "#ffffff";
      },
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    let heightLeft = imageHeight;
    let position = 0;

    pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imageHeight;
      pdf.addPage();
      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(getInvoicePdfFilename(invoiceNumber));
  } finally {
    cleanup();
  }
}
