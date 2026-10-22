export {
  saveGuestInvoice,
  loadGuestInvoice,
  clearGuestInvoice,
  saveGuestOnboardingSeed,
  loadGuestOnboardingSeed,
} from "@/features/guest/lib/storage";

export type { GuestInvoice } from "@/features/guest/types";

const DRAFT_KEY = "ss_guest_invoice_draft";
const LEGACY_DRAFT_KEY = "valix_guest_invoice_draft";

/** @deprecated Use saveGuestInvoice */
export function saveGuestDraft(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({ version: 1, savedAt: Date.now(), payload }),
  );
  localStorage.removeItem(LEGACY_DRAFT_KEY);
}

/** @deprecated Use loadGuestInvoice */
export function loadGuestDraft() {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(DRAFT_KEY) ?? localStorage.getItem(LEGACY_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** @deprecated Use clearGuestInvoice */
export function clearGuestDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(LEGACY_DRAFT_KEY);
}
