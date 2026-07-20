"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  Printer,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackPaymentEvent } from "@/lib/analytics/payments";
import { isClientStripeTestMode } from "@/lib/stripe/client";
import { InvoiceDocumentView } from "@/features/invoices/components/invoice-document-view";
import { shouldShowPayButton } from "@/features/payments/lib/public-invoice-utils";
import { StripeTestModeBanner } from "@/features/payments/components/stripe-test-mode-banner";
import { InvoicePDFTemplate } from "@/pdf/components/invoice-pdf-template";
import { buildPublicInvoicePdfDocument } from "@/pdf/utils/build-public-document";
import { downloadInvoicePdf } from "@/pdf/utils/download";
import type { PublicInvoiceView } from "@/types/public-invoice";
import { INVOICE_STATUSES } from "@/types";
import { INVOICE_PAYMENT_STATUSES } from "@/types/public-invoice";
import "@/features/invoices/styles/invoice-document.css";
import "@/pdf/styles/invoice-pdf.css";

export function PublicInvoicePage({
  invoice,
  paymentState,
}: {
  invoice: PublicInvoiceView;
  paymentState?: string | null;
}) {
  const [paying, setPaying] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const pdfDocument = buildPublicInvoicePdfDocument(invoice);
  const showPayButton = shouldShowPayButton(invoice);
  const isPaid =
    invoice.paymentStatus === INVOICE_PAYMENT_STATUSES.PAID ||
    invoice.status === INVOICE_STATUSES.PAID;

  useEffect(() => {
    trackPaymentEvent("invoice_viewed", {
      invoiceNumber: invoice.invoiceNumber,
      publicToken: invoice.publicToken,
    });
  }, [invoice.invoiceNumber, invoice.publicToken]);

  useEffect(() => {
    if (paymentState === "success") {
      trackPaymentEvent("payment_completed", {
        invoiceNumber: invoice.invoiceNumber,
      });
      toast.success("Payment received. Thank you!");
    }
    if (paymentState === "cancelled") {
      trackPaymentEvent("payment_failed", {
        invoiceNumber: invoice.invoiceNumber,
        reason: "cancelled",
      });
    }
  }, [paymentState, invoice.invoiceNumber]);

  async function handlePayNow() {
    setPaying(true);
    trackPaymentEvent("payment_started", {
      invoiceNumber: invoice.invoiceNumber,
    });

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicToken: invoice.publicToken }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }

      trackPaymentEvent("checkout_opened", {
        invoiceNumber: invoice.invoiceNumber,
      });
      window.location.href = data.url;
    } catch (error) {
      console.error("[pay-now]", error);
      toast.error("Unable to start payment. Please try again.");
      setPaying(false);
    }
  }

  async function handleDownloadPdf() {
    if (!pdfTemplateRef.current) return;

    try {
      setPdfBusy(true);
      await downloadInvoicePdf(pdfTemplateRef.current, invoice.invoiceNumber);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("[public-invoice-pdf]", error);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfBusy(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A]">
      <header className="border-b border-[#E2E8F0]/80 bg-white/90 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14B8A6]/10 text-[#14B8A6]">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0F172A]">
                {invoice.invoiceNumber}
              </p>
              <p className="truncate text-xs text-[#64748B]">
                From {invoice.business.name}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-[#E2E8F0] bg-white"
              onClick={() => void handleDownloadPdf()}
              disabled={pdfBusy}
              aria-label="Download PDF"
            >
              {pdfBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-[#E2E8F0] bg-white"
              onClick={handlePrint}
              aria-label="Print invoice"
            >
              <Printer className="h-4 w-4" />
            </Button>
            {showPayButton ? (
              <Button
                type="button"
                className="hidden h-10 rounded-xl bg-[#14B8A6] px-4 hover:bg-[#0D9488] sm:inline-flex"
                onClick={() => void handlePayNow()}
                disabled={paying}
              >
                {paying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Pay Invoice
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="bg-[#F3F4F6] print:bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          {paymentState === "success" ? (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 print:hidden">
              Payment successful. This invoice is now marked as paid.
            </div>
          ) : null}

          {paymentState === "cancelled" ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden">
              Payment was cancelled. You can try again when ready.
            </div>
          ) : null}

          {showPayButton && isClientStripeTestMode() ? (
            <div className="mb-6 print:hidden">
              <StripeTestModeBanner />
            </div>
          ) : null}

          <InvoiceDocumentView
            data={{
              invoiceNumber: invoice.invoiceNumber,
              issueDate: invoice.issueDate,
              dueDate: invoice.dueDate,
              status: invoice.status,
              currency: invoice.currency,
              items: invoice.items,
              totals: invoice.totals,
              notes: invoice.notes,
              business: invoice.business,
              customer: invoice.customer,
            }}
            amountDueLabel="Amount Due"
          />

          {showPayButton ? (
            <div className="mt-8 space-y-3 print:hidden sm:hidden">
              <Button
                className="h-12 w-full rounded-xl bg-[#14B8A6] text-base hover:bg-[#0D9488]"
                size="lg"
                onClick={() => void handlePayNow()}
                disabled={paying}
              >
                {paying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Pay Invoice
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
                <Shield className="h-3.5 w-3.5" aria-hidden />
                Secured by Stripe
              </p>
            </div>
          ) : null}

          {isPaid ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-800 print:hidden">
              This invoice has been paid. Thank you.
            </div>
          ) : null}
        </div>
      </main>

      <div
        className="pointer-events-none fixed left-[-9999px] top-0 opacity-0"
        aria-hidden
      >
        <div ref={pdfTemplateRef} id="public-invoice-pdf-root">
          <InvoicePDFTemplate document={pdfDocument} />
        </div>
      </div>
    </div>
  );
}
