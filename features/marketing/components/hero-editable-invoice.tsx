"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { InvoiceSheetScroller } from "@/features/invoice-builder/components/invoice-sheet-scroller";
import { InvoiceOptionsPanel } from "@/features/invoice-builder/components/invoice-options-panel";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import {
  getCurrenciesForSelect,
  getCurrencySymbol,
  isCurrencyCode,
} from "@/config/currencies";
import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";
import "@/features/invoice-builder/styles/invoice-builder.css";
import "@/features/marketing/styles/hero-sheet.css";

/** Landing hero - editable Teal Classic sheet. Never reads ss_template. */
export function HeroEditableInvoice() {
  const { invoice, dispatch, setLogoFromFile } = useInvoiceBuilder({
    seed: "empty",
    applySessionTemplate: false,
  });
  const [busy, setBusy] = useState(false);
  const [downloadConfirm, setDownloadConfirm] = useState(false);
  const currencies = getCurrenciesForSelect();

  // Lock hero to classic-teal even if state is patched somehow
  const displayInvoice =
    invoice.templateId === DEFAULT_INVOICE_TEMPLATE_ID
      ? { ...invoice, stamp: undefined }
      : { ...invoice, templateId: DEFAULT_INVOICE_TEMPLATE_ID, stamp: undefined };

  async function handleDownloadPdf() {
    try {
      setBusy(true);
      const { downloadBuilderInvoicePdf } = await import(
        "@/pdf/utils/download-builder-with-template"
      );
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
      className="builder-currency-select no-print"
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

        <InvoiceOptionsPanel
          className="home-hero-export-panel"
          compact
          templateId={DEFAULT_INVOICE_TEMPLATE_ID}
          stamp={undefined}
          repositioning={false}
          onStampChange={() => undefined}
          onRepositionToggle={() => undefined}
          onOpenTemplate={() => undefined}
          onPrint={() => window.print()}
          onDownload={() => void handleDownloadPdf()}
          busy={busy}
          downloadConfirm={downloadConfirm}
          saveStatus="idle"
          isGuest={false}
          isLoggedIn={false}
          onLogin={() => undefined}
          onSignup={() => undefined}
        />
      </div>
    </div>
  );
}
