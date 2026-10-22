"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { InvoiceSheetScroller } from "@/features/invoice-builder/components/invoice-sheet-scroller";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import { routes } from "@/config/routes";
import type { InvoiceStamp } from "@/features/invoice-builder/lib/stamps";
import "@/features/invoice-builder/styles/invoice-builder.css";
import "@/features/marketing/styles/hero-sheet.css";

const SHEET_DESIGN_WIDTH = 720;

const DEMO_STAMP: InvoiceStamp = {
  type: "approved",
  x: 72,
  y: 14,
  size: "M",
};

/** Landing hero - editable invoice. CSS container scaling only (no JS measure). */
export function HeroEditableInvoice() {
  const { invoice, dispatch, setLogoFromFile } = useInvoiceBuilder({
    seed: "empty",
  });
  const [busy, setBusy] = useState(false);

  const displayInvoice = useMemo(
    () => ({
      ...invoice,
      stamp: invoice.stamp ?? DEMO_STAMP,
    }),
    [invoice],
  );

  async function handleDownloadPdf() {
    try {
      setBusy(true);
      const { downloadBuilderInvoicePdf } = await import(
        "@/pdf/utils/download-builder-with-template"
      );
      await downloadBuilderInvoicePdf(displayInvoice);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("[hero-pdf]", error);
      toast.error("Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="try-invoice" className="w-full space-y-4" data-lcp="hero-invoice">
      <div className="hero-sheet-frame relative w-full">
        <div className="hero-sheet-scaled ss-tilt-host" data-ss-tilt="hero">
          <div className="hero-sheet-design">
            <InvoiceSheetScroller className="!overflow-visible">
              <div style={{ width: SHEET_DESIGN_WIDTH }}>
                <EditableInvoiceCard
                  invoice={displayInvoice}
                  dispatch={dispatch}
                  onLogoFile={setLogoFromFile}
                  className="hero-builder-card"
                />
              </div>
            </InvoiceSheetScroller>
          </div>
        </div>
      </div>

      <div className="no-print flex flex-wrap items-center justify-center gap-3">
        <Link
          href={routes.createInvoice}
          className="bonsai-btn-primary hero-compact-cta"
        >
          Continue in the full builder
        </Link>
        <div className="hero-wide-actions flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="bonsai-btn-secondary bonsai-btn-secondary--sm"
            onClick={() => window.print()}
            disabled={busy}
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print
          </button>
          <button
            type="button"
            className="bonsai-btn-primary bonsai-btn-primary--sm"
            onClick={() => void handleDownloadPdf()}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
