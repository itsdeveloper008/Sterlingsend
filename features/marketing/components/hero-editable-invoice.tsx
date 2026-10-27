"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Download, Loader2, Printer } from "lucide-react";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { InvoiceSheetScroller } from "@/features/invoice-builder/components/invoice-sheet-scroller";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import {
  getCurrenciesForSelect,
  getCurrencySymbol,
  isCurrencyCode,
} from "@/config/currencies";
import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";
import { downloadBuilderInvoicePdf } from "@/pdf/utils/download-builder-with-template";
import { routes } from "@/config/routes";
import "@/features/invoice-builder/styles/invoice-builder.css";
import "@/features/marketing/styles/hero-sheet.css";

/** Landing hero — centred Classic sheet, no side panel. */
export function HeroEditableInvoice() {
  const { invoice, dispatch, setLogoFromFile } = useInvoiceBuilder({
    seed: "empty",
    applySessionTemplate: false,
    persistGuestDraft: false,
  });
  const [busy, setBusy] = useState(false);
  const [downloadConfirm, setDownloadConfirm] = useState(false);
  const currencies = getCurrenciesForSelect();

  const displayInvoice =
    invoice.templateId === DEFAULT_INVOICE_TEMPLATE_ID
      ? { ...invoice, stamp: undefined }
      : { ...invoice, templateId: DEFAULT_INVOICE_TEMPLATE_ID, stamp: undefined };

  async function handleDownloadPdf() {
    try {
      setBusy(true);
      await downloadBuilderInvoicePdf(displayInvoice);
      toast.success("PDF downloaded");
      setDownloadConfirm(true);
      window.setTimeout(() => setDownloadConfirm(false), 4000);
    } catch (error) {
      console.error("[hero-pdf]", error);
      toast.error("Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  }

  const currencySelect = (
    <select
      className="builder-currency-select builder-currency-select--compact no-print"
      value={invoice.currency}
      onChange={(event) => {
        const next = event.target.value;
        if (!isCurrencyCode(next)) return;
        dispatch({ type: "patch", patch: { currency: next } });
      }}
      aria-label="Currency"
      disabled={busy}
    >
      {currencies.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} ({getCurrencySymbol(c.code)})
        </option>
      ))}
    </select>
  );

  return (
    <div
      id="try-invoice"
      className="home-hero-invoice w-full"
      data-lcp="hero-invoice"
    >
      <div className="home-hero-invoice-grid">
        <div className="home-hero-invoice-sheet">
          <div className="builder-stack">
            <div className="builder-stack-layer" aria-hidden />
            <div className="builder-stack-sheet">
              <InvoiceSheetScroller className="!overflow-visible">
                <EditableInvoiceCard
                  invoice={displayInvoice}
                  dispatch={dispatch}
                  onLogoFile={setLogoFromFile}
                  currencySelect={currencySelect}
                  className="hero-builder-card"
                />
              </InvoiceSheetScroller>
            </div>
          </div>
        </div>

        <div className="home-hero-actions no-print">
          <button
            type="button"
            className="inv-panel-btn-outline"
            onClick={() => window.print()}
            disabled={busy}
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print
          </button>
          <button
            type="button"
            className="inv-panel-btn-primary"
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
          {downloadConfirm ? (
            <p className="inv-panel-confirm w-full justify-center" role="status">
              <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
              PDF downloaded
            </p>
          ) : null}
        </div>

        <p className="home-hero-guest no-print">
          Want to keep a history of invoices you create?{" "}
          <Link href={routes.login}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
