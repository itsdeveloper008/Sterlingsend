"use client";

import { jsPDF } from "jspdf";
import { getCurrencySymbol } from "@/config/currencies";
import { hasPaymentDetails } from "@/features/invoice-builder/lib/defaults";
import type { BuilderInvoice } from "@/features/invoice-builder/types";
import { getDisplayVatRate } from "@/features/invoices/lib/invoice-document-utils";
import {
  calculateInvoiceTotals,
  calculateItemsFromForm,
} from "@/lib/invoice/calculations";
import { getInvoicePdfFilename } from "@/pdf/utils/filename";

/**
 * Vector invoice PDF. Text is drawn with real PDF fonts (not a rasterised
 * screenshot) so every glyph stays sharp and selectable at any zoom.
 */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 46;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LEFT = MARGIN;
const RIGHT = MARGIN + CONTENT_WIDTH;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN;

type Rgb = [number, number, number];

const INK: Rgb = [15, 23, 42];
const MUTED: Rgb = [100, 116, 139];
const FAINT: Rgb = [148, 163, 184];
const TEAL: Rgb = [13, 148, 136];
const TEAL_DEEP: Rgb = [15, 118, 110];
const RED: Rgb = [220, 38, 38];
const PANEL: Rgb = [248, 250, 252];
const TEAL_PANEL: Rgb = [240, 253, 250];
const BORDER: Rgb = [226, 232, 240];
const BORDER_LIGHT: Rgb = [241, 245, 249];

type FontWeight = "normal" | "bold" | "italic";

type TextOptions = {
  size?: number;
  weight?: FontWeight;
  color?: Rgb;
  align?: "left" | "right";
  charSpace?: number;
};

/** WinAnsi covers the standard PDF font encoding. Anything else falls back to the code. */
const WIN_ANSI = /^[\u0020-\u007E\u00A0-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]+$/;

function pdfCurrencySymbol(code: string) {
  const symbol = getCurrencySymbol(code);
  return symbol && WIN_ANSI.test(symbol) ? symbol : `${code} `;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function sanitize(value: string) {
  return value
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00A0/g, " ");
}

class InvoiceDoc {
  readonly doc: jsPDF;
  y = MARGIN;

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      compress: true,
    });
    this.doc.setLineJoin("round");
  }

  private applyText(options: TextOptions) {
    const { size = 9, weight = "normal", color = INK, charSpace = 0 } = options;
    this.doc.setFont("helvetica", weight);
    this.doc.setFontSize(size);
    this.doc.setTextColor(color[0], color[1], color[2]);
    this.doc.setCharSpace(charSpace);
  }

  /** Draws a single line and returns the baseline used. */
  text(value: string, x: number, y: number, options: TextOptions = {}) {
    const clean = sanitize(value ?? "");
    if (!clean) return y;
    this.applyText(options);
    this.doc.text(clean, x, y, {
      align: options.align === "right" ? "right" : "left",
      baseline: "alphabetic",
    });
    this.doc.setCharSpace(0);
    return y;
  }

  /** Wraps text to a width and returns the y position after the block. */
  paragraph(
    value: string,
    x: number,
    y: number,
    width: number,
    options: TextOptions & { lineHeight?: number } = {},
  ) {
    const clean = sanitize(value ?? "").trim();
    if (!clean) return y;

    const lineHeight = options.lineHeight ?? (options.size ?? 9) * 1.45;
    this.applyText(options);

    const paragraphs = clean.split(/\n/);
    let cursor = y;

    for (const paragraph of paragraphs) {
      const lines: string[] = paragraph.trim()
        ? (this.doc.splitTextToSize(paragraph, width) as string[])
        : [""];

      for (const line of lines) {
        this.ensureSpace(lineHeight);
        this.applyText(options);
        if (line) {
          this.doc.text(line, x, cursor, {
            align: options.align === "right" ? "right" : "left",
            baseline: "alphabetic",
          });
        }
        cursor += lineHeight;
      }
    }

    this.doc.setCharSpace(0);
    return cursor;
  }

  measure(value: string, width: number, size: number, weight: FontWeight = "normal") {
    const clean = sanitize(value ?? "").trim();
    if (!clean) return 0;
    this.doc.setFont("helvetica", weight);
    this.doc.setFontSize(size);
    return (this.doc.splitTextToSize(clean, width) as string[]).length;
  }

  rect(x: number, y: number, width: number, height: number, fill: Rgb, radius = 8) {
    this.doc.setFillColor(fill[0], fill[1], fill[2]);
    this.doc.roundedRect(x, y, width, height, radius, radius, "F");
  }

  line(y: number, color: Rgb = BORDER, width = 0.7) {
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.setLineWidth(width);
    this.doc.line(LEFT, y, RIGHT, y);
  }

  ensureSpace(height: number) {
    if (this.y + height <= BOTTOM_LIMIT) return false;
    this.doc.addPage();
    this.y = MARGIN;
    return true;
  }
}

async function loadLogo(source: string) {
  return new Promise<{ data: string; ratio: number } | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const width = image.naturalWidth || 320;
      const height = image.naturalHeight || 200;
      // Render at high density so the logo stays sharp in print.
      const scale = Math.min(4, Math.max(1, 900 / Math.max(width, height)));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      try {
        resolve({ data: canvas.toDataURL("image/png"), ratio: width / height });
      } catch {
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = source;
  });
}

export async function buildBuilderInvoicePdf(invoice: BuilderInvoice) {
  const items = calculateItemsFromForm(invoice.items);
  const totals = calculateInvoiceTotals(items);
  const vatRate = getDisplayVatRate(items);
  const symbol = pdfCurrencySymbol(invoice.currency);
  const invoiceNumber = invoice.invoiceNumber.trim() || "INV-001";
  const businessName = invoice.business.name.trim() || "Your Company";
  const businessEmail = invoice.business.email.trim();

  const sheet = new InvoiceDoc();
  const { doc } = sheet;

  /* ---------- Header: logo + business block ---------- */

  let logoBottom = MARGIN;
  if (invoice.logoDataUrl && typeof document !== "undefined") {
    const logo = await loadLogo(invoice.logoDataUrl);
    if (logo) {
      const maxWidth = 132;
      const maxHeight = 64;
      let width = maxWidth;
      let height = width / (logo.ratio || 1.6);
      if (height > maxHeight) {
        height = maxHeight;
        width = height * (logo.ratio || 1.6);
      }
      doc.addImage(logo.data, "PNG", LEFT, MARGIN, width, height, undefined, "FAST");
      logoBottom = MARGIN + height;
    }
  }

  let metaY = MARGIN + 10;
  sheet.text(businessName, RIGHT, metaY, { size: 10, weight: "bold", align: "right" });
  metaY += 13.5;

  const businessLines = invoice.business.address
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of businessLines) {
    sheet.text(line, RIGHT, metaY, { size: 8.8, color: MUTED, align: "right" });
    metaY += 12;
  }

  for (const line of [businessEmail, invoice.business.phone.trim()]) {
    if (!line) continue;
    sheet.text(line, RIGHT, metaY, { size: 8.8, color: MUTED, align: "right" });
    metaY += 12;
  }

  if (invoice.business.vatNumber.trim()) {
    const value = invoice.business.vatNumber.trim();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.8);
    const valueWidth = doc.getTextWidth(value);
    sheet.text(value, RIGHT, metaY, { size: 8.8, color: FAINT, align: "right", weight: "italic" });
    sheet.text("VAT:", RIGHT - valueWidth - 3, metaY, {
      size: 8.8,
      color: FAINT,
      align: "right",
      weight: "italic",
    });
    metaY += 12;
  }

  /* ---------- Title + invoice number ---------- */

  const titleTop = Math.max(logoBottom, metaY) + 26;
  sheet.text("INVOICE", LEFT, titleTop, {
    size: 27,
    weight: "bold",
    charSpace: 0.5,
  });

  const numberBaseline = titleTop + 20;
  sheet.text(invoiceNumber, LEFT, numberBaseline, {
    size: 9.5,
    weight: "bold",
    color: MUTED,
    charSpace: 0.2,
  });

  /* ---------- Billed to / dates panel ---------- */

  const customerLines = invoice.customer.address
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);

  const panelTop = numberBaseline + 20;
  const panelPad = 16;
  const panelRows = 1 + customerLines.length + (invoice.customer.email.trim() ? 1 : 0);
  const panelHeight = panelPad * 2 + 14 + Math.max(panelRows, 3) * 12.5;

  sheet.rect(LEFT, panelTop, CONTENT_WIDTH, panelHeight, PANEL, 8);

  const colX = [
    LEFT + panelPad,
    LEFT + panelPad + CONTENT_WIDTH * 0.42,
    LEFT + panelPad + CONTENT_WIDTH * 0.68,
  ];
  const labelBaseline = panelTop + panelPad + 6;

  const labelStyle: TextOptions = {
    size: 7.4,
    weight: "bold",
    color: MUTED,
    charSpace: 0.6,
  };

  sheet.text("BILLED TO", colX[0], labelBaseline, labelStyle);
  sheet.text("ISSUE DATE", colX[1], labelBaseline, labelStyle);
  sheet.text("DUE DATE", colX[2], labelBaseline, labelStyle);

  let customerY = labelBaseline + 16;
  sheet.text(invoice.customer.name.trim() || "Client Company", colX[0], customerY, {
    size: 9.5,
    weight: "bold",
  });
  customerY += 12.5;

  for (const line of customerLines) {
    sheet.text(line, colX[0], customerY, { size: 8.8, color: MUTED });
    customerY += 12.5;
  }

  if (invoice.customer.email.trim()) {
    sheet.text(invoice.customer.email.trim(), colX[0], customerY, {
      size: 8.8,
      color: MUTED,
    });
  }

  const dateBaseline = labelBaseline + 16;
  sheet.text(invoice.issueDate, colX[1], dateBaseline, { size: 9.5 });
  sheet.text(invoice.dueDate, colX[2], dateBaseline, { size: 9.5 });

  sheet.y = panelTop + panelHeight + 30;

  /* ---------- Line items ---------- */

  const cols = {
    description: LEFT,
    qty: LEFT + CONTENT_WIDTH * 0.4,
    price: LEFT + CONTENT_WIDTH * 0.54,
    discount: LEFT + CONTENT_WIDTH * 0.72,
    vat: LEFT + CONTENT_WIDTH * 0.85,
    total: RIGHT,
  };
  const descriptionWidth = CONTENT_WIDTH * 0.36;

  function drawTableHead() {
    const baseline = sheet.y;
    const headStyle: TextOptions = {
      size: 7.4,
      weight: "bold",
      color: FAINT,
      charSpace: 0.5,
    };
    sheet.text("DESCRIPTION", cols.description, baseline, headStyle);
    sheet.text("QTY", cols.qty, baseline, { ...headStyle, align: "right" });
    sheet.text("PRICE", cols.price, baseline, { ...headStyle, align: "right" });
    sheet.text("DISCOUNT (%)", cols.discount, baseline, { ...headStyle, align: "right" });
    sheet.text("VAT (%)", cols.vat, baseline, { ...headStyle, align: "right" });
    sheet.text("TOTAL", cols.total, baseline, { ...headStyle, align: "right" });
    sheet.y = baseline + 9;
    sheet.line(sheet.y, BORDER);
    sheet.y += 18;
  }

  drawTableHead();

  items.forEach((item, index) => {
    const source = invoice.items[index];
    const lineCount = Math.max(
      1,
      sheet.measure(source?.description ?? "", descriptionWidth, 9),
    );
    const rowHeight = Math.max(lineCount * 12, 14) + 14;

    if (sheet.ensureSpace(rowHeight + 12)) {
      drawTableHead();
    }

    const baseline = sheet.y;
    sheet.paragraph(
      source?.description?.trim() || "-",
      cols.description,
      baseline,
      descriptionWidth,
      { size: 9, lineHeight: 12 },
    );

    const numberStyle: TextOptions = { size: 9, align: "right" };
    sheet.text(String(source?.quantity ?? item.quantity), cols.qty, baseline, numberStyle);
    sheet.text(formatAmount(item.unitPrice), cols.price, baseline, numberStyle);
    sheet.text(String(item.discountRate), cols.discount, baseline, numberStyle);
    sheet.text(String(item.vatRate), cols.vat, baseline, numberStyle);
    sheet.text(`${symbol}${formatAmount(item.lineTotal)}`, cols.total, baseline, {
      ...numberStyle,
      weight: "bold",
    });

    sheet.y = baseline + rowHeight;
    sheet.line(sheet.y - 10, index === items.length - 1 ? BORDER : BORDER_LIGHT);
  });

  /* ---------- Totals ---------- */

  sheet.ensureSpace(120);
  sheet.y += 18;

  const totalsWidth = 250;
  const totalsLeft = RIGHT - totalsWidth;
  const rows: Array<{ label: string; value: string; color: Rgb }> = [
    {
      label: "Subtotal",
      value: `${symbol}${formatAmount(totals.subtotal)}`,
      color: INK,
    },
    {
      label: "Discount",
      value: `- ${symbol}${formatAmount(totals.discountTotal)}`,
      color: RED,
    },
    {
      label: `VAT (${vatRate}%)`,
      value: `+ ${symbol}${formatAmount(totals.vatTotal)}`,
      color: TEAL,
    },
  ];

  for (const row of rows) {
    sheet.text(row.label, totalsLeft, sheet.y, { size: 9, color: MUTED });
    sheet.text(row.value, RIGHT, sheet.y, {
      size: 9,
      color: row.color,
      align: "right",
    });
    sheet.y += 18;
  }

  const finalTop = sheet.y - 4;
  const finalHeight = 38;
  sheet.rect(totalsLeft, finalTop, totalsWidth, finalHeight, TEAL_PANEL, 8);
  sheet.text(
    `${invoice.currency} (${symbol.trim()})`,
    totalsLeft + 14,
    finalTop + finalHeight / 2 + 3.5,
    { size: 9.5, weight: "bold" },
  );
  sheet.text(
    `${symbol}${formatAmount(totals.total)}`,
    RIGHT - 14,
    finalTop + finalHeight / 2 + 5,
    { size: 15, weight: "bold", color: TEAL, align: "right" },
  );

  sheet.y = finalTop + finalHeight + 34;

  /* ---------- Notes ---------- */

  if (invoice.notes.trim()) {
    sheet.ensureSpace(70);
    sheet.line(sheet.y - 14, BORDER);
    sheet.text("Notes", LEFT, sheet.y + 4, { size: 10, weight: "bold" });
    sheet.y = sheet.paragraph(
      invoice.notes,
      LEFT,
      sheet.y + 20,
      CONTENT_WIDTH * 0.72,
      { size: 8.8, color: MUTED, lineHeight: 12.5 },
    );
    sheet.y += 22;
  }

  /* ---------- Payment details ---------- */

  if (hasPaymentDetails(invoice.payment)) {
    const paymentRows: Array<[string, string]> = [
      ["Account Holder", invoice.payment.accountHolder.trim()],
      ["Bank Name", invoice.payment.bankName.trim()],
      ["Account/IBAN", invoice.payment.accountIban.trim()],
      ["Sort Code/SWIFT", invoice.payment.sortSwift.trim()],
    ];

    sheet.ensureSpace(46 + paymentRows.length * 17);
    sheet.line(sheet.y - 14, BORDER);
    sheet.text("Payment Details", LEFT, sheet.y + 4, { size: 10, weight: "bold" });
    sheet.y += 24;

    for (const [label, value] of paymentRows) {
      if (!value) continue;
      sheet.text(label, LEFT, sheet.y, { size: 8.6, weight: "bold" });
      sheet.text(value, LEFT + 140, sheet.y, { size: 8.8, color: MUTED });
      sheet.y += 17;
    }

    sheet.y += 12;
  }

  /* ---------- Footer ---------- */

  sheet.ensureSpace(60);
  sheet.line(sheet.y, BORDER_LIGHT);
  sheet.y += 22;

  sheet.text(businessName, LEFT, sheet.y, { size: 9.5, weight: "bold" });
  if (businessEmail) {
    sheet.text(businessEmail, LEFT, sheet.y + 13, { size: 8.6, color: MUTED });
  }

  sheet.text("INVOICE NO.", RIGHT, sheet.y - 2, {
    size: 7.4,
    weight: "bold",
    color: MUTED,
    align: "right",
    charSpace: 0.6,
  });
  sheet.text(invoiceNumber, RIGHT, sheet.y + 15, {
    size: 12,
    weight: "bold",
    color: TEAL_DEEP,
    align: "right",
    charSpace: 0.4,
  });

  return { doc, filename: getInvoicePdfFilename(invoiceNumber) };
}

export async function downloadBuilderInvoicePdf(invoice: BuilderInvoice) {
  const { doc, filename } = await buildBuilderInvoicePdf(invoice);
  doc.save(filename);
}
