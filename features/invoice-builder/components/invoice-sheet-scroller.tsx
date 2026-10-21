"use client";

import { cn } from "@/lib/utils";

/**
 * Contains a wide invoice sheet so the page body never scrolls sideways.
 * Only this box scrolls horizontally when the sheet is wider than the viewport.
 */
export function InvoiceSheetScroller({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("invoice-sheet-scroller", className)}
      tabIndex={0}
      aria-label="Invoice sheet"
    >
      <div className="invoice-sheet-scroller-inner">{children}</div>
    </div>
  );
}
