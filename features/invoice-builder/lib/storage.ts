import {
  BUILDER_INVOICE_VERSION,
  type BuilderInvoice,
} from "@/features/invoice-builder/types";
import { createDefaultBuilderInvoice } from "@/features/invoice-builder/lib/defaults";

const STORAGE_KEY = "ss_invoice_builder";
/** uid of the account the draft belongs to; absent for a guest draft. */
const OWNER_KEY = "ss_invoice_builder_owner";
const TTL_MS = 1000 * 60 * 60 * 24 * 30;

export function saveBuilderInvoice(invoice: BuilderInvoice) {
  if (typeof window === "undefined") return;

  const payload: BuilderInvoice = {
    ...invoice,
    version: BUILDER_INVOICE_VERSION,
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("[builder-storage] save failed", error);
  }
}

export function loadBuilderInvoice(): BuilderInvoice | null {
  if (typeof window === "undefined") return null;

  const raw =
    localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BuilderInvoice;
    if (parsed.version !== BUILDER_INVOICE_VERSION) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      clearBuilderInvoice();
      return null;
    }
    return {
      ...createDefaultBuilderInvoice(),
      ...parsed,
      business: {
        ...createDefaultBuilderInvoice().business,
        ...parsed.business,
      },
      customer: {
        ...createDefaultBuilderInvoice().customer,
        ...parsed.customer,
      },
      payment: {
        ...createDefaultBuilderInvoice().payment,
        ...parsed.payment,
      },
      items:
        parsed.items?.length > 0
          ? parsed.items
          : createDefaultBuilderInvoice().items,
    };
  } catch {
    return null;
  }
}

export function clearBuilderInvoice() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(OWNER_KEY);
}

export function readBuilderDraftOwner(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}

export function writeBuilderDraftOwner(uid: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OWNER_KEY, uid);
  } catch {
    // ignore
  }
}
