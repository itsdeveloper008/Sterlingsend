"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import {
  Check,
  Download,
  LayoutTemplate,
  Loader2,
  Printer,
  Stamp as StampIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import {
  INVOICE_STAMPS,
  type InvoiceStamp,
  type InvoiceStampSize,
  type InvoiceStampType,
} from "@/features/invoice-builder/lib/stamps";
import { createStamp } from "@/features/invoice-builder/components/invoice-stamp-overlay";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type PanelProps = {
  templateId: string;
  stamp: InvoiceStamp | undefined;
  repositioning: boolean;
  onStampChange: (next: InvoiceStamp | undefined) => void;
  onRepositionToggle: (on: boolean) => void;
  onOpenTemplate: () => void;
  onPrint: () => void;
  onDownload: () => void;
  busy?: boolean;
  downloadConfirm?: boolean;
  saveStatus: SaveStatus;
  isGuest: boolean;
  isLoggedIn: boolean;
  onLogin: () => void;
  onSignup: () => void;
  onRetrySave?: () => void;
  compact?: boolean;
  className?: string;
};

export function InvoiceOptionsPanel({
  templateId,
  stamp,
  repositioning,
  onStampChange,
  onRepositionToggle,
  onOpenTemplate,
  onPrint,
  onDownload,
  busy = false,
  downloadConfirm = false,
  saveStatus,
  isGuest,
  isLoggedIn,
  onLogin,
  onSignup,
  onRetrySave,
  compact = false,
  className,
}: PanelProps) {
  const [stampOpen, setStampOpen] = useState(false);
  const panelId = useId();
  const liveId = useId();
  const [announce, setAnnounce] = useState("");
  const template = getInvoiceTemplate(templateId);
  const stampLabel = stamp
    ? INVOICE_STAMPS.find((s) => s.type === stamp.type)?.label
    : null;

  useEffect(() => {
    if (downloadConfirm) setAnnounce("PDF downloaded");
  }, [downloadConfirm]);

  function selectType(type: InvoiceStampType | "none") {
    if (type === "none") {
      onStampChange(undefined);
      setAnnounce("Stamp removed");
      onRepositionToggle(false);
      return;
    }
    const size = stamp?.size ?? "M";
    const next = stamp ? { ...stamp, type } : createStamp(type, size);
    onStampChange(next);
    setAnnounce(
      `Stamp: ${INVOICE_STAMPS.find((s) => s.type === type)?.label ?? type}`,
    );
  }

  function selectSize(size: InvoiceStampSize) {
    if (!stamp) {
      onStampChange(createStamp("draft", size));
      setAnnounce("Stamp: Draft");
      return;
    }
    onStampChange({ ...stamp, size });
  }

  if (compact) {
    return (
      <aside
        className={cn("inv-panel inv-panel--compact no-print", className)}
        aria-label="Invoice options"
      >
        <p className="inv-panel-kicker">Your invoice</p>
        <button
          type="button"
          className="inv-panel-btn-outline"
          onClick={onPrint}
          disabled={busy}
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print
        </button>
        <button
          type="button"
          className="inv-panel-btn-primary"
          onClick={onDownload}
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
          <p className="inv-panel-confirm" role="status">
            <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
            PDF downloaded
          </p>
        ) : null}
      </aside>
    );
  }

  return (
    <aside
      className={cn("inv-panel no-print", className)}
      aria-label="Invoice options"
    >
      <span id={liveId} className="sr-only" aria-live="polite">
        {announce}
      </span>

      <div className="inv-panel-section">
        <p className="inv-panel-kicker">Your invoice</p>
        <p className="inv-panel-status" aria-live="polite">
          {isGuest ? "Not saved" : null}
          {isLoggedIn && saveStatus === "idle" ? "Ready" : null}
          {isLoggedIn && saveStatus === "saving" ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Saving
            </span>
          ) : null}
          {isLoggedIn && saveStatus === "saved" ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
              Saved
            </span>
          ) : null}
          {isLoggedIn && saveStatus === "error" ? (
            <span>
              Could not save{" "}
              <button
                type="button"
                className="inv-panel-link"
                onClick={onRetrySave}
              >
                Retry
              </button>
            </span>
          ) : null}
        </p>
      </div>

      <div className="inv-panel-divider" />

      <div className="inv-panel-section">
        <p className="inv-panel-kicker">Template</p>
        <div className="inv-panel-template">
          <div className="inv-panel-thumb">
            <Image
              src={`/templates/${template.id}.webp`}
              alt=""
              width={72}
              height={102}
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="min-w-0 flex-1 inv-panel-template-meta">
            <p className="inv-panel-template-name">{template.name}</p>
            <button
              type="button"
              className="inv-panel-link"
              onClick={onOpenTemplate}
            >
              Change template
            </button>
          </div>
        </div>
        <button
          type="button"
          className="inv-panel-btn-outline inv-panel-template-rail mt-0 w-full"
          aria-label={`Change template, current ${template.name}`}
          title="Change template"
          onClick={onOpenTemplate}
        >
          <LayoutTemplate className="h-4 w-4" aria-hidden />
          Change template
        </button>
      </div>

      <div className="inv-panel-divider" />

      <div className="inv-panel-section">
        <p className="inv-panel-kicker">Stamp</p>
        <button
          type="button"
          className="inv-panel-btn-outline w-full"
          aria-expanded={stampOpen}
          aria-controls={panelId}
          onClick={() => setStampOpen((v) => !v)}
        >
          <StampIcon className="h-4 w-4" aria-hidden />
          Stamp
          {stampLabel ? (
            <span className="ml-auto text-[#5EEAD4]">{stampLabel}</span>
          ) : null}
        </button>
        {stampOpen ? (
          <div id={panelId} className="inv-stamp-inline mt-3">
            <div className="inv-stamp-grid" role="listbox" aria-label="Stamp type">
              <button
                type="button"
                role="option"
                aria-selected={!stamp}
                className={cn("inv-stamp-chip", !stamp && "is-selected")}
                onClick={() => selectType("none")}
              >
                None
              </button>
              {INVOICE_STAMPS.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  role="option"
                  aria-selected={stamp?.type === s.type}
                  className={cn(
                    "inv-stamp-chip",
                    stamp?.type === s.type && "is-selected",
                  )}
                  onClick={() => selectType(s.type)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="inv-panel-kicker mt-3">Size</p>
            <div className="inv-stamp-sizes" role="group" aria-label="Stamp size">
              {(["S", "M", "L"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={cn(
                    "inv-stamp-size",
                    (stamp?.size ?? "M") === size && "is-selected",
                  )}
                  onClick={() => selectSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <label className="inv-stamp-reposition">
              <input
                type="checkbox"
                checked={repositioning}
                disabled={!stamp}
                onChange={(e) => onRepositionToggle(e.target.checked)}
              />
              Reposition
            </label>
          </div>
        ) : null}
      </div>

      <div className="inv-panel-divider" />

      <div className="inv-panel-section">
        <p className="inv-panel-kicker">Export</p>
        <button
          type="button"
          className="inv-panel-btn-outline w-full"
          onClick={onPrint}
          disabled={busy}
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print
        </button>
        <button
          type="button"
          className="inv-panel-btn-primary mt-3 w-full"
          onClick={onDownload}
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
          <p className="inv-panel-confirm" role="status">
            <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
            PDF downloaded
          </p>
        ) : null}
      </div>

      {isGuest ? (
        <>
          <div className="inv-panel-divider" />
          <p className="inv-panel-guest">
            Log in to keep your invoices in a history.{" "}
            <button type="button" className="inv-panel-link" onClick={onLogin}>
              Log in
            </button>{" "}
            <button type="button" className="inv-panel-link" onClick={onSignup}>
              Sign up
            </button>
          </p>
        </>
      ) : null}
    </aside>
  );
}
