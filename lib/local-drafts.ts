/**
 * Everything the browser keeps for the signed-in person's work. Cleared on
 * sign-out so the next person on this browser starts with a blank sheet.
 */
const LOCAL_KEYS = [
  "ss_invoice_builder",
  "ss_invoice_builder_owner",
  "ss_guest_invoice",
  "ss_guest_invoice_draft",
  "ss_guest_onboarding_seed",
  "ss_onboarding_draft",
];

const SESSION_KEYS = [
  "ss_pending_invoice",
  "ss_pending_invoice_return",
  "ss_profile_ok",
];

export function clearLocalDrafts() {
  if (typeof window === "undefined") return;
  try {
    for (const key of LOCAL_KEYS) localStorage.removeItem(key);
    for (const key of SESSION_KEYS) sessionStorage.removeItem(key);
  } catch {
    // Storage blocked: nothing to clear.
  }
}
