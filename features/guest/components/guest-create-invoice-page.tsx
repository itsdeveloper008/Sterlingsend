"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GuestInvoiceForm } from "@/features/guest/components/guest-invoice-form";
import { GuestShell } from "@/features/guest/components/guest-shell";
import { useGuestInvoice } from "@/features/guest/hooks/use-guest-invoice";
import { guestInvoiceSchema } from "@/features/guest/lib/validation";
import { saveGuestInvoice } from "@/features/guest/lib/storage";
import { guestInvoiceToDocumentView } from "@/features/guest/lib/to-document-view";
import { InvoiceDocumentView } from "@/features/invoices/components/invoice-document-view";
import { routes } from "@/config/routes";
import { INVOICE_STATUSES } from "@/types";
import "@/features/invoices/styles/invoice-document.css";

export function GuestCreateInvoicePage() {
  const router = useRouter();
  const {
    invoice,
    hydrated,
    updateInvoice,
    addLineItem,
    removeLineItem,
    updateLineItem,
  } = useGuestInvoice();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function flattenZodErrors(error: z.ZodError) {
    const next: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".");
      if (!next[key]) next[key] = issue.message;
    }
    return next;
  }

  function handlePreview() {
    setSubmitting(true);
    setErrors({});

    const parsed = guestInvoiceSchema.safeParse({
      business: invoice.business,
      customer: invoice.customer,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      items: invoice.items,
    });

    if (!parsed.success) {
      setErrors(flattenZodErrors(parsed.error));
      toast.error("Please complete the required fields below");
      setSubmitting(false);
      document
        .getElementById("invoice-details")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    saveGuestInvoice(invoice);
    setSubmitting(false);
    router.push(routes.invoicePreview);
  }

  if (!hydrated) {
    return (
      <GuestShell step={1}>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-[720px] w-full" />
        </div>
      </GuestShell>
    );
  }

  const documentData = guestInvoiceToDocumentView(
    invoice,
    INVOICE_STATUSES.SENT,
  );

  return (
    <GuestShell step={1}>
      {/* Top action bar - matches public invoice chrome */}
      <div className="border-b border-[#E2E8F0]/80 bg-white/95 backdrop-blur-md">
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
                Fill in the details - your invoice updates live
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handlePreview}
            disabled={submitting}
            className="h-10 shrink-0 rounded-xl bg-[#14B8A6] px-4 hover:bg-[#0D9488]"
          >
            {submitting ? "Preparing..." : "Preview invoice"}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Invoice sheet front and center */}
      <div className="bg-[#F3F4F6]">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <InvoiceDocumentView data={documentData} showPlaceholders />
        </div>
      </div>

      {/* Edit details directly under the sheet */}
      <div
        id="invoice-details"
        className="scroll-mt-20 border-t border-[#E2E8F0] bg-white"
      >
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="mb-8">
            <h2 className="text-xl font-semibold tracking-tight text-[#0F172A]">
              Edit invoice details
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Changes appear on the sheet above instantly. No account needed.
            </p>
          </div>

          <GuestInvoiceForm
            invoice={invoice}
            errors={errors}
            onBusinessChange={(patch) =>
              updateInvoice({ business: { ...invoice.business, ...patch } })
            }
            onCustomerChange={(patch) =>
              updateInvoice({ customer: { ...invoice.customer, ...patch } })
            }
            onInvoiceChange={updateInvoice}
            onLineItemChange={updateLineItem}
            onAddLineItem={addLineItem}
            onRemoveLineItem={removeLineItem}
          />

          <div className="sticky bottom-0 -mx-4 mt-8 border-t border-[#E2E8F0] bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handlePreview}
                disabled={submitting}
                className="h-12 rounded-xl bg-[#14B8A6] px-8 hover:bg-[#0D9488]"
              >
                {submitting ? "Preparing preview..." : "Preview invoice"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </GuestShell>
  );
}
