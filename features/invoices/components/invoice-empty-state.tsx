"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";

/** Calm-zone clay empty state for History. */
export function InvoiceEmptyState() {
  return (
    <div className="ss-calm-zone flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-border-subtle bg-card px-6 py-16 text-center">
      <div
        className="ss-float clay mb-6 size-16 rounded-[28%] opacity-80"
        aria-hidden
      />
      <h2 className="type-h3 text-foreground">No invoices yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create an invoice to start your history. Guests can still download PDFs
        without saving.
      </p>
      <ButtonLink href={routes.createInvoice} className="mt-6">
        Create invoice
      </ButtonLink>
    </div>
  );
}
