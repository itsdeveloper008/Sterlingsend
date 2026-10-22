"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { InvoiceSheetScroller } from "@/features/invoice-builder/components/invoice-sheet-scroller";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import { routes } from "@/config/routes";
import "@/features/invoice-builder/styles/invoice-builder.css";

const SHEET_DESIGN_WIDTH = 720;
const MIN_READABLE_SCALE = 12 / 16;

/** Landing hero - editable invoice in the clean sheet format. */
export function HeroEditableInvoice() {
  const { invoice, dispatch, setLogoFromFile } = useInvoiceBuilder({
    seed: "empty",
  });
  const frameRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState(1);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    function measure() {
      if (!frame) return;
      const width = frame.clientWidth;
      if (width <= 0) return;
      const next = Math.min(1, width / SHEET_DESIGN_WIDTH);
      setScale(next);
      setCompact(next < MIN_READABLE_SCALE);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  async function handleDownloadPdf() {
    try {
      setBusy(true);
      const { downloadBuilderInvoicePdf } = await import(
        "@/pdf/utils/download-builder-with-template"
      );
      await downloadBuilderInvoicePdf(invoice);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("[hero-pdf]", error);
      toast.error("Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  }

  const sheet = (
    <EditableInvoiceCard
      invoice={invoice}
      dispatch={dispatch}
      onLogoFile={setLogoFromFile}
    />
  );

  return (
    <div id="try-invoice" className="w-full space-y-4" data-lcp="hero-invoice">
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-[var(--surface-muted)] p-3 shadow-[var(--shadow-3)] sm:p-4"
      >
        {compact ? (
          <div className="relative">
            <div className="max-h-[420px] overflow-hidden">
              <div className="invoice-sheet-scroller-inner min-w-0">
                {sheet}
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--surface-muted)] to-transparent"
              aria-hidden
            />
          </div>
        ) : (
          <div
            data-ss-tilt="hero"
            className="ss-tilt-host"
            style={{
              height: `calc(${SHEET_DESIGN_WIDTH * 1.15}px * ${scale})`,
              overflow: "hidden",
            }}
          >
            <div
              className="origin-top-left"
              style={{
                width: SHEET_DESIGN_WIDTH,
                transform: `scale(${scale})`,
              }}
            >
              <InvoiceSheetScroller className="!overflow-visible">
                <div style={{ width: SHEET_DESIGN_WIDTH }}>{sheet}</div>
              </InvoiceSheetScroller>
            </div>
          </div>
        )}
      </div>

      <div className="no-print flex flex-wrap items-center justify-center gap-3">
        {compact ? (
          <Link href={routes.createInvoice} className="bonsai-btn-primary">
            Continue in the full builder
          </Link>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
