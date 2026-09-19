/**
 * Guest workspace persistence keys.
 * Do NOT rename or touch valix_invoice_builder / valix_guest_* builder draft keys.
 */
export const LOCAL_STORE_KEYS = {
  customers: "valix_local_customers",
  invoices: "valix_local_invoices",
  settings: "valix_local_settings",
  /** Set after login when migration is waiting on onboarding/business. */
  pendingMigration: "valix_local_pending_migration",
} as const;

export const LOCAL_BUSINESS_ID = "local";
