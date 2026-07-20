"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/design-system/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import { downloadInvoicePdf } from "@/pdf/utils/download";
import { routes } from "@/config/routes";
import "@/features/invoice-builder/styles/invoice-builder.css";

export function InvoiceBuilderPage() {
  const { invoice, hydrated, dispatch, setLogoFromFile, resetInvoice } =
    useInvoiceBuilder();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleDownloadPdf() {
    const card = cardRef.current?.querySelector(
      "[data-invoice-builder-card]",
    ) as HTMLElement | null;

    if (!card) {
      toast.error("Invoice card not ready");
      return;
    }

    try {
      setBusy(true);
      document.body.classList.add("builder-pdf-export");
      await downloadInvoicePdf(card, invoice.invoiceNumber || "invoice");
      toast.success("PDF downloaded");
      resetInvoice();
    } catch (error) {
      console.error("[builder-pdf]", error);
      toast.error("Failed to generate PDF");
    } finally {
      document.body.classList.remove("builder-pdf-export");
      setBusy(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (!hydrated) {
    return (
      <div className="builder-page">
        <div className="mx-auto max-w-[1100px] space-y-4 px-4 py-10">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-[720px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page">
      <div className="builder-action-bar no-print">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo href={routes.home} size={48} />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              disabled={busy}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              type="button"
              onClick={() => void handleDownloadPdf()}
              disabled={busy}
              className="bg-[#14B8A6] hover:bg-[#0D9488]"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10" ref={cardRef}>
        <EditableInvoiceCard
          invoice={invoice}
          dispatch={dispatch}
          onLogoFile={setLogoFromFile}
        />

        <p className="builder-login-hint no-print mt-6">
          Want to save this invoice and reuse client details next time?{" "}
          <Link href={routes.login}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
