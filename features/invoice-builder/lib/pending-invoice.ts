import type { BuilderInvoice } from "@/features/invoice-builder/types";

/** Guest invoice stash when logging in from the builder “save” prompt only. */
export const PENDING_INVOICE_KEY = "ss_pending_invoice";

/** Marks that post-auth should return to the builder (not home). */
export const PENDING_INVOICE_RETURN_KEY = "ss_pending_invoice_return";

export function stashPendingInvoice(invoice: BuilderInvoice): void {
  try {
    sessionStorage.setItem(PENDING_INVOICE_KEY, JSON.stringify(invoice));
    sessionStorage.setItem(PENDING_INVOICE_RETURN_KEY, "1");
  } catch {
    // quota / private mode — login still works, restore may not
  }
}

export function readPendingInvoice(): BuilderInvoice | null {
  try {
    const raw = sessionStorage.getItem(PENDING_INVOICE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuilderInvoice;
    if (!parsed || typeof parsed !== "object" || !parsed.business) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingInvoice(): void {
  try {
    sessionStorage.removeItem(PENDING_INVOICE_KEY);
    sessionStorage.removeItem(PENDING_INVOICE_RETURN_KEY);
  } catch {
    // ignore
  }
}

export function shouldReturnToBuilderAfterAuth(): boolean {
  try {
    return sessionStorage.getItem(PENDING_INVOICE_RETURN_KEY) === "1";
  } catch {
    return false;
  }
}
