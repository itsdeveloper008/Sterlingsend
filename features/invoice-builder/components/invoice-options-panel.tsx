"use client";

import { useEffect, useId, useState } from "react";
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
import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT_HEX,
  normalizeHex,
} from "@/lib/invoice-accent";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type PanelProps = {
  templateId: string;
  accent?: string;
  onAccentChange?: (hex: string | undefined) => void;
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

function LiveTemplateThumb({
  name,
  accent,
}: {
  name: string;
  accent: string;
}) {
  return (
    <div
      className="inv-panel-thumb"
      aria-hidden
      title={name}
      style={{ ["--thumb-accent" as string]: accent }}
    >
      <div className="inv-panel-thumb-preview">
        <div className="thumb-rule" />
        <div className="thumb-line" style={{ width: "70%" }} />
        <div className="thumb-line" style={{ width: "55%" }} />
        <div className="thumb-line" style={{ width: "90%", marginTop: 4 }} />
        <div className="thumb-line" style={{ width: "90%" }} />
        <div className="thumb-line" style={{ width: "90%" }} />
        <div className="thumb-total" />
      </div>
    </div>
  );
}

export function InvoiceOptionsPanel({
  templateId,
  accent,
  onAccentChange,
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
  onLogin,
  onSignup,
  onRetrySave,
  compact = false,
  className,
}: PanelProps) {
  const [stampOpen, setStampOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(accent ?? DEFAULT_ACCENT_HEX);
  const panelId = useId();
  const liveId = useId();
  const [announce, setAnnounce] = useState("");
  const template = getInvoiceTemplate(templateId);
  const currentAccent = accent ?? DEFAULT_ACCENT_HEX;
  const isPreset = ACCENT_PRESETS.some(
    (p) => p.hex.toUpperCase() === currentAccent.toUpperCase(),
  );

  useEffect(() => {
    setHexDraft(currentAccent);
  }, [currentAccent]);
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

  const statusLabel = (() => {
    if (isGuest) return "Not saved";
    if (saveStatus === "saving") return "Saving";
    if (saveStatus === "saved") return "Saved";
    if (saveStatus === "error") return "Could not save";
    return "Ready";
  })();

  if (compact) {
    return (
      <aside
        className={cn("inv-panel inv-panel--compact no-print", className)}
        aria-label="Invoice options"
      >
        <button
          type="button"
          className="inv-panel-btn-outline clay"
          onClick={onPrint}
          disabled={busy}
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print
        </button>
        <button
          type="button"
          className="inv-panel-btn-primary clay-teal mt-2"
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
        <span className="inv-panel-status-chip clay" aria-live="polite">
          {saveStatus === "saving" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          {saveStatus === "saved" ? (
            <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
          ) : null}
          {statusLabel}
          {saveStatus === "error" && onRetrySave ? (
            <button type="button" className="inv-panel-link ml-1" onClick={onRetrySave}>
              Retry
            </button>
          ) : null}
        </span>
      </div>

      <div className="inv-panel-divider" />

      <div className="inv-panel-section">
        <p className="inv-panel-kicker">Template</p>
        <div className="inv-panel-template">
          <LiveTemplateThumb name={template.name} accent={currentAccent} />
          <div className="min-w-0 flex-1 inv-panel-template-meta">
            <p className="inv-panel-template-name">{template.name}</p>
            <button type="button" className="inv-panel-link" onClick={onOpenTemplate}>
              Change
            </button>
          </div>
        </div>
        <button
          type="button"
          className="inv-panel-btn-outline clay inv-panel-template-rail mt-2 w-full"
          aria-label={`Change template, current ${template.name}`}
          title="Change template"
          onClick={onOpenTemplate}
        >
          <LayoutTemplate className="h-4 w-4" aria-hidden />
          Change
        </button>
      </div>

      <div className="inv-panel-divider" />

      <div className="inv-panel-section">
        <p className="inv-panel-kicker">Colour</p>
        <div className="inv-accent-grid" role="listbox" aria-label="Accent colour">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={currentAccent.toUpperCase() === p.hex.toUpperCase()}
              aria-label={p.name}
              title={p.name}
              className={cn(
                "inv-accent-swatch",
                currentAccent.toUpperCase() === p.hex.toUpperCase() &&
                  "is-selected",
              )}
              style={{ background: p.hex }}
              onClick={() => onAccentChange?.(p.hex)}
            />
          ))}
        </div>
        <div className="inv-accent-custom mt-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={normalizeHex(hexDraft) ?? DEFAULT_ACCENT_HEX}
              aria-label="Custom colour"
              className={cn("inv-accent-native", !isPreset && "is-selected")}
              onChange={(e) => {
                const hex = normalizeHex(e.target.value);
                if (!hex) return;
                setHexDraft(hex);
                onAccentChange?.(hex);
              }}
            />
            <input
              id={`${panelId}-hex`}
              className="inv-accent-hex"
              value={hexDraft}
              onChange={(e) => {
                setHexDraft(e.target.value);
                const hex = normalizeHex(e.target.value);
                if (hex) onAccentChange?.(hex);
              }}
              placeholder="#0F766E"
              aria-label="Accent hex"
            />
          </div>
          <button
            type="button"
            className="inv-panel-link mt-2"
            onClick={() => onAccentChange?.(undefined)}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="inv-panel-divider" />

      <div className="inv-panel-section">
        <button
          type="button"
          className="inv-panel-btn-outline clay w-full"
          aria-expanded={stampOpen}
          aria-controls={panelId}
          onClick={() => setStampOpen((v) => !v)}
        >
          <StampIcon className="h-4 w-4" aria-hidden />
          Stamp
          {stampLabel ? (
            <span className="ml-auto text-[13px] text-[#0F766E]">{stampLabel}</span>
          ) : null}
        </button>
        {stampOpen ? (
          <div id={panelId} className="inv-stamp-inline mt-3">
            <div className="inv-stamp-grid" role="listbox" aria-label="Stamp type">
              <button
                type="button"
                role="option"
                aria-selected={!stamp}
                className={cn(
                  "inv-stamp-chip clay",
                  !stamp && "clay-teal is-selected",
                )}
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
                    "inv-stamp-chip clay",
                    stamp?.type === s.type && "clay-teal is-selected",
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
                    "inv-stamp-size clay flex-1",
                    (stamp?.size ?? "M") === size && "clay-teal is-selected",
                  )}
                  onClick={() => selectSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <label className="inv-stamp-reposition mt-2 flex items-center gap-2 text-[13px] font-medium text-[#0f172a]">
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
        <button
          type="button"
          className="inv-panel-btn-outline clay w-full"
          onClick={onPrint}
          disabled={busy}
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print
        </button>
        <button
          type="button"
          className="inv-panel-btn-primary clay-teal mt-2 w-full"
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
          <div className="inv-panel-guest">
            <p>Log in or sign up to keep your invoices.</p>
            <div className="inv-panel-guest-links">
              <button type="button" className="inv-panel-link" onClick={onLogin}>
                Log in
              </button>
              <span aria-hidden>or</span>
              <button type="button" className="inv-panel-link" onClick={onSignup}>
                Sign up
              </button>
            </div>
          </div>
        </>
      ) : null}
    </aside>
  );
}
