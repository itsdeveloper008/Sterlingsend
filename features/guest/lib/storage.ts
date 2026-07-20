import {
  GUEST_INVOICE_VERSION,
  type GuestInvoice,
  type GuestOnboardingSeed,
} from "@/features/guest/types";

const GUEST_INVOICE_KEY = "valix_guest_invoice";
const GUEST_ONBOARDING_SEED_KEY = "valix_guest_onboarding_seed";
const GUEST_INVOICE_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export function saveGuestInvoice(invoice: GuestInvoice) {
  if (typeof window === "undefined") return;

  const payload: GuestInvoice = {
    ...invoice,
    version: GUEST_INVOICE_VERSION,
    savedAt: Date.now(),
  };

  localStorage.setItem(GUEST_INVOICE_KEY, JSON.stringify(payload));
}

export function loadGuestInvoice(): GuestInvoice | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(GUEST_INVOICE_KEY);
  if (!raw) return null;

  try {
    const invoice = JSON.parse(raw) as GuestInvoice;
    if (Date.now() - invoice.savedAt > GUEST_INVOICE_TTL_MS) {
      clearGuestInvoice();
      return null;
    }
    if (invoice.version !== GUEST_INVOICE_VERSION) {
      return null;
    }
    return invoice;
  } catch {
    return null;
  }
}

export function clearGuestInvoice() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_INVOICE_KEY);
}

export function saveGuestOnboardingSeed(invoice: GuestInvoice) {
  if (typeof window === "undefined") return;

  const addressLines = invoice.business.address
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const seed: GuestOnboardingSeed = {
    businessName: invoice.business.name,
    email: invoice.business.email,
    phone: invoice.business.phone || undefined,
    addressLine1: addressLines[0] ?? "",
    addressLine2: addressLines[1],
    city: addressLines[2] ?? addressLines[1] ?? "",
    postcode: addressLines[addressLines.length - 2] ?? "",
    country: addressLines[addressLines.length - 1] ?? "United Kingdom",
    vatNumber: invoice.business.vatNumber || undefined,
    currency: invoice.currency,
  };

  localStorage.setItem(GUEST_ONBOARDING_SEED_KEY, JSON.stringify(seed));
}

export function loadGuestOnboardingSeed(): GuestOnboardingSeed | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(GUEST_ONBOARDING_SEED_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GuestOnboardingSeed;
  } catch {
    return null;
  }
}
