"use client";

import { useCallback, useRef } from "react";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { pdfDocumentToBuilder } from "@/pdf/utils/pdf-document-to-builder";
import type { InvoicePdfDocument } from "@/pdf/types";
import type { BuilderInvoiceAction } from "@/features/invoice-builder/types";
import { downloadInvoicePdf } from "@/pdf/utils/download";
import { printInvoicePdf } from "@/pdf/utils/print";
import "@/features/invoice-builder/styles/invoice-builder.css";

/**
 * Read-only live sheet used by History PDF, guest preview, and public pages
 * so Download / Print match the builder renderer.
 */
export function InvoiceSheetPreview({
  document: pdfDocument,
  sheetRef,
}: {
  document: InvoicePdfDocument;
  sheetRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const invoice = pdfDocumentToBuilder(pdfDocument);
  const localRef = useRef<HTMLDivElement>(null);
  const noopDispatch = useCallback((_action: BuilderInvoiceAction) => {}, []);

  return (
    <div
      ref={(node) => {
        (localRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (sheetRef && "current" in sheetRef) {
          (sheetRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
        }
      }}
      className="invoice-sheet-preview ss-calm-zone"
      data-invoice-sheet-preview
    >
      <EditableInvoiceCard
        invoice={invoice}
        dispatch={noopDispatch}
        onLogoFile={() => {}}
        className="pointer-events-none"
      />
    </div>
  );
}

export async function downloadSheetPreviewPdf(
  root: HTMLElement,
  invoiceNumber: string,
) {
  const card = root.querySelector(
    "[data-invoice-builder-card]",
  ) as HTMLElement | null;
  if (!card) throw new Error("Invoice sheet not found");
  document.body.classList.add("builder-pdf-export");
  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    return await downloadInvoicePdf(card, invoiceNumber);
  } finally {
    document.body.classList.remove("builder-pdf-export");
  }
}

export function printSheetPreview() {
  printInvoicePdf();
}
