"use client";

import { createRoot } from "react-dom/client";
import { InvoicePDFTemplate } from "@/pdf/components/invoice-pdf-template";
import { downloadInvoicePdf } from "@/pdf/utils/download";
import { buildBuilderPdfDocument } from "@/pdf/utils/build-builder-document";
import type { BuilderInvoice } from "@/features/invoice-builder/types";
import "@/pdf/styles/invoice-pdf.css";

/**
 * Renders the catalog template off-DOM and downloads via html2canvas.
 * Guests get the full 88-template look without an account.
 */
export async function downloadBuilderInvoicePdf(invoice: BuilderInvoice) {
  const documentModel = buildBuilderPdfDocument(invoice);

  const host = window.document.createElement("div");
  host.setAttribute("data-builder-pdf-host", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:794px",
    "background:#fff",
    "pointer-events:none",
    "z-index:-1",
  ].join(";");
  window.document.body.appendChild(host);

  const root = createRoot(host);
  await new Promise<void>((resolve) => {
    root.render(<InvoicePDFTemplate document={documentModel} />);
    // Allow layout/paint before capture
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const article = host.querySelector(
    ".invoice-pdf-template",
  ) as HTMLElement | null;

  try {
    if (!article) {
      throw new Error("PDF template failed to render");
    }
    await downloadInvoicePdf(article, documentModel.invoiceNumber);
  } finally {
    root.unmount();
    host.remove();
  }
}
