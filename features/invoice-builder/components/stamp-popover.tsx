"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  INVOICE_STAMPS,
  type InvoiceStamp,
  type InvoiceStampSize,
  type InvoiceStampType,
} from "@/features/invoice-builder/lib/stamps";
import { createStamp } from "@/features/invoice-builder/components/invoice-stamp-overlay";
import { cn } from "@/lib/utils";

export function StampPopover({
  stamp,
  repositioning,
  onStampChange,
  onRepositionToggle,
  disabled,
  triggerClassName,
}: {
  stamp: InvoiceStamp | undefined;
  repositioning: boolean;
  onStampChange: (next: InvoiceStamp | undefined) => void;
  onRepositionToggle: (on: boolean) => void;
  disabled?: boolean;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const liveId = useId();
  const [announce, setAnnounce] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if ((event.key === "Delete" || event.key === "Backspace") && open) {
        if (
          (event.target as HTMLElement)?.tagName !== "INPUT" &&
          (event.target as HTMLElement)?.tagName !== "TEXTAREA"
        ) {
          onStampChange(undefined);
          setAnnounce("Stamp removed");
          onRepositionToggle(false);
        }
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onStampChange, onRepositionToggle]);

  function selectType(type: InvoiceStampType | "none") {
    if (type === "none") {
      onStampChange(undefined);
      setAnnounce("Stamp removed");
      onRepositionToggle(false);
      setOpen(false);
      return;
    }
    const size = stamp?.size ?? "M";
    const next = stamp
      ? { ...stamp, type }
      : createStamp(type, size);
    onStampChange(next);
    setAnnounce(`Stamp: ${INVOICE_STAMPS.find((s) => s.type === type)?.label}`);
    setOpen(false);
  }

  function selectSize(size: InvoiceStampSize) {
    if (!stamp) {
      onStampChange(createStamp("draft", size));
      setAnnounce("Stamp: Draft");
      return;
    }
    onStampChange({ ...stamp, size });
  }

  return (
    <div className="relative" ref={rootRef}>
      <span id={liveId} className="sr-only" aria-live="polite">
        {announce}
      </span>
      {triggerClassName ? (
        <button
          type="button"
          className={triggerClassName}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <Stamp className="h-4 w-4" aria-hidden />
          Stamp
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <Stamp className="mr-2 h-4 w-4" />
          Stamp
          {stamp ? (
            <span className="ml-1 hidden text-[var(--secondary-text)] lg:inline">
              ({INVOICE_STAMPS.find((s) => s.type === stamp.type)?.label})
            </span>
          ) : null}
        </Button>
      )}
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Invoice stamp"
          className="builder-stamp-popover absolute right-0 z-50 mt-2 w-64 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-md"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--secondary-text)]">
            Stamp
          </p>
          <div className="flex flex-col gap-1" role="listbox" aria-label="Stamp type">
            <button
              type="button"
              role="option"
              aria-selected={!stamp}
              className={cn(
                "rounded px-2 py-1.5 text-left text-sm hover:bg-[var(--surface-2)]",
                !stamp && "bg-[var(--brand-tint)] font-semibold",
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
                  "rounded px-2 py-1.5 text-left text-sm hover:bg-[var(--surface-2)]",
                  stamp?.type === s.type && "bg-[var(--brand-tint)] font-semibold",
                )}
                onClick={() => selectType(s.type)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--secondary-text)]">
            Size
          </p>
          <div className="flex gap-1" role="group" aria-label="Stamp size">
            {(["S", "M", "L"] as const).map((size) => (
              <button
                key={size}
                type="button"
                className={cn(
                  "flex-1 rounded border px-2 py-1 text-sm",
                  (stamp?.size ?? "M") === size
                    ? "border-[var(--brand-700)] bg-[var(--brand-tint)] font-semibold"
                    : "border-[var(--border)]",
                )}
                onClick={() => selectSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
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
  );
}
