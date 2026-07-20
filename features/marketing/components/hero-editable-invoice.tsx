"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import { downloadInvoicePdf } from "@/pdf/utils/download";
import { routes } from "@/config/routes";
import "@/features/invoice-builder/styles/invoice-builder.css";

/** Landing hero - editable invoice in the clean sheet format. */
export function HeroEditableInvoice() {
  const { invoice, hydrated, dispatch, setLogoFromFile, resetInvoice } =
    useInvoiceBuilder({ seed: "empty" });
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
      console.error("[hero-pdf]", error);
      toast.error("Failed to generate PDF");
    } finally {
      document.body.classList.remove("builder-pdf-export");
      setBusy(false);
    }
  }

  if (!hydrated) {
    return <Skeleton className="mx-auto h-[720px] w-full max-w-6xl rounded-xl" />;
  }

  return (
    <div id="try-invoice" className="mx-auto w-full max-w-6xl" ref={cardRef}>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#6B7280]">
          Click any field to edit - then download your PDF.
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            disabled={busy}
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Print
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleDownloadPdf()}
            disabled={busy}
            className="bg-[#0D9488] hover:bg-[#0F766E]"
          >
            {busy ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      <EditableInvoiceCard
        invoice={invoice}
        dispatch={dispatch}
        onLogoFile={setLogoFromFile}
      />

      <p className="builder-login-hint no-print mt-4">
        Want to save this invoice and reuse client details next time?{" "}
        <Link href={routes.login}>Log in</Link>
      </p>
    </div>
  );
}
