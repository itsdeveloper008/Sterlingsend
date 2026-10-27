"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InvoiceSheetPreview,
  downloadSheetPreviewPdf,
  printSheetPreview,
} from "@/pdf/components/invoice-sheet-preview";
import { GuestConversionModal } from "@/features/guest/components/guest-conversion-modal";
import { GuestShell } from "@/features/guest/components/guest-shell";
import { buildGuestPdfDocument } from "@/features/guest/lib/pdf";
import {
  canGenerateGuestPdf,
  getGuestPdfRateLimitMessage,
  recordGuestPdfGeneration,
} from "@/features/guest/lib/rate-limit";
import { loadGuestInvoice, saveGuestInvoice } from "@/features/guest/lib/storage";
import { trackGuestEvent } from "@/features/guest/lib/analytics";
import type { GuestInvoice } from "@/features/guest/types";
import type { PdfActionState } from "@/pdf/types";
import { routes } from "@/config/routes";
import "@/features/guest/styles/guest-print.css";

export function GuestInvoicePreview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<GuestInvoice | null>(null);
  const [actionState, setActionState] = useState<PdfActionState>("loading");
  const [conversionOpen, setConversionOpen] = useState(false);
  const autoAction = searchParams.get("action");

  useEffect(() => {
    const saved = loadGuestInvoice();
    if (!saved) {
      router.replace(routes.createInvoice);
      return;
    }

    setInvoice(saved);
    setActionState("ready");
    trackGuestEvent("guest_invoice_completed", {
      invoiceNumber: saved.invoiceNumber,
    });

    document.body.setAttribute("data-guest-preview", "true");
    return () => {
      document.body.removeAttribute("data-guest-preview");
    };
  }, [router]);

  function openConversionModal() {
    window.setTimeout(() => setConversionOpen(true), 400);
  }

  async function handleDownload() {
    if (!templateRef.current || !invoice) return;

    if (!canGenerateGuestPdf()) {
      toast.error(getGuestPdfRateLimitMessage());
      return;
    }

    try {
      setActionState("generating");
      recordGuestPdfGeneration();
      await downloadSheetPreviewPdf(
        templateRef.current,
        invoice.invoiceNumber,
      );
      setActionState("ready");
      trackGuestEvent("guest_pdf_downloaded", {
        invoiceNumber: invoice.invoiceNumber,
      });
      toast.success("PDF downloaded");
      openConversionModal();
    } catch (error) {
      console.error("[guest-download]", error);
      setActionState("error");
      toast.error("Failed to generate PDF");
    }
  }

  function handlePrint() {
    if (!invoice) return;

    if (!canGenerateGuestPdf()) {
      toast.error(getGuestPdfRateLimitMessage());
      return;
    }

    recordGuestPdfGeneration();
    setActionState("generating");
    printSheetPreview();
    trackGuestEvent("guest_pdf_printed", {
      invoiceNumber: invoice.invoiceNumber,
    });
    window.setTimeout(() => {
      setActionState("ready");
      openConversionModal();
    }, 500);
  }

  useEffect(() => {
    if (!invoice || actionState !== "ready") return;
    if (autoAction === "download") void handleDownload();
    if (autoAction === "print") handlePrint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAction, invoice, actionState]);

  if (!invoice) {
    return (
      <GuestShell step={2}>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[640px] w-full" />
        </div>
      </GuestShell>
    );
  }

  const pdfDocument = buildGuestPdfDocument(invoice);

  return (
    <GuestShell step={2}>
      <div className="border-b border-[#E2E8F0]/80 bg-white/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <Link
              href={routes.createInvoice}
              className="inline-flex items-center text-sm text-[#64748B] hover:text-[#0F172A]"
              onClick={() => saveGuestInvoice(invoice)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Edit invoice
            </Link>
            {/* Page heading; utilities undo the global display h1 style. */}
            <h1 className="mt-1 truncate font-sans text-sm leading-5 font-semibold tracking-normal text-[#0F172A]">
              {invoice.invoiceNumber}
            </h1>
          </div>
          <div className="guest-preview-toolbar flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-[#E2E8F0]"
              onClick={handlePrint}
              disabled={actionState === "generating"}
              aria-label="Print invoice"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => void handleDownload()}
              disabled={actionState === "generating"}
              className="h-10 rounded-xl bg-[#16C2C6] px-4 hover:bg-[#0E9BA6]"
            >
              {actionState === "generating" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[#F3F4F6]">
        <div
          ref={templateRef}
          id="guest-invoice-pdf-root"
          className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14"
        >
          {actionState === "error" ? (
            <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive print:hidden">
              PDF generation failed. Try again or use Print instead.
            </div>
          ) : null}

          <InvoiceSheetPreview document={pdfDocument} />

          <GuestConversionModal
            open={conversionOpen}
            onOpenChange={setConversionOpen}
            invoice={invoice}
          />
        </div>
      </div>
    </GuestShell>
  );
}
