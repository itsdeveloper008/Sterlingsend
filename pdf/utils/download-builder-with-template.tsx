"use client";

import { downloadInvoicePdf } from "@/pdf/utils/download";
import type { BuilderInvoice } from "@/features/invoice-builder/types";

/**
 * Capture the live builder sheet so Download PDF matches what the user sees
 * (layout, colour, sidebar, totals) — same document as Print.
 */
export async function downloadBuilderInvoicePdf(invoice: BuilderInvoice) {
  const card = document.querySelector(
    "[data-invoice-builder-card]",
  ) as HTMLElement | null;

  if (!card) {
    throw new Error("Invoice sheet not found on the page");
  }

  document.body.classList.add("builder-pdf-export");
  try {
    // Let hide-chrome styles apply before clone/capture
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await downloadInvoicePdf(card, invoice.invoiceNumber || "invoice");
  } finally {
    document.body.classList.remove("builder-pdf-export");
  }
}
