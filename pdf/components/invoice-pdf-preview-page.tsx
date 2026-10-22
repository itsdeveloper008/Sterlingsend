"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  InvoiceSheetPreview,
  downloadSheetPreviewPdf,
  printSheetPreview,
} from "@/pdf/components/invoice-sheet-preview";
import type { InvoicePdfDocument, PdfActionState } from "@/pdf/types";
import { routes } from "@/config/routes";

export function InvoicePdfPreviewPage({
  document: pdfDocument,
}: {
  document: InvoicePdfDocument;
}) {
  const searchParams = useSearchParams();
  const sheetRootRef = useRef<HTMLDivElement>(null);
  const [actionState, setActionState] = useState<PdfActionState>("ready");
  const autoAction = searchParams.get("action");

  useEffect(() => {
    document.body.setAttribute("data-pdf-print", "true");
    return () => {
      document.body.removeAttribute("data-pdf-print");
    };
  }, []);

  async function handleDownload() {
    const root = sheetRootRef.current;
    if (!root) return;

    try {
      setActionState("generating");
      await downloadSheetPreviewPdf(root, pdfDocument.invoiceNumber);
      setActionState("ready");
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("[downloadInvoicePdf]", error);
      setActionState("error");
      toast.error("Failed to generate PDF");
    }
  }

  function handlePrint() {
    setActionState("generating");
    printSheetPreview();
    window.setTimeout(() => setActionState("ready"), 500);
  }

  useEffect(() => {
    if (autoAction === "download") {
      void handleDownload();
    }
    if (autoAction === "print") {
      handlePrint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAction]);

  return (
    <div className="pdf-preview-page mx-auto max-w-5xl space-y-6">
      <div className="pdf-preview-shell space-y-2 print:hidden">
        <Link
          href={routes.invoice(pdfDocument.invoiceId)}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to invoice
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Invoice preview
            </h1>
            <p className="text-sm text-muted-foreground">
              {pdfDocument.invoiceNumber} ·{" "}
              {pdfDocument.theme?.name ?? "SterlingSend Classic"}
            </p>
          </div>
        </div>
      </div>

      <div className="pdf-preview-toolbar flex flex-wrap gap-2 print:hidden">
        <Button
          onClick={() => void handleDownload()}
          disabled={actionState === "generating"}
        >
          {actionState === "generating" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF
        </Button>
        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={actionState === "generating"}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <ButtonLink
          href={routes.invoice(pdfDocument.invoiceId)}
          variant="outline"
        >
          Back to invoice
        </ButtonLink>
      </div>

      {actionState === "error" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive print:hidden">
          PDF generation failed. Try again or use Print instead.
        </div>
      ) : null}

      <div
        ref={sheetRootRef}
        className="invoice-pdf-preview-canvas rounded-xl bg-muted/30 p-4 md:p-8 print:bg-transparent print:p-0"
      >
        <InvoiceSheetPreview document={pdfDocument} />
      </div>
    </div>
  );
}
