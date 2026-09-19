"use client";

import { LOCAL_STORE_KEYS } from "@/lib/local-store/keys";
import {
  clearLocalCustomers,
  peekAllLocalCustomersIncludingDeleted,
} from "@/lib/local-store/customers.local";
import {
  clearLocalInvoices,
  peekAllLocalInvoicesIncludingDeleted,
} from "@/lib/local-store/invoices.local";
import {
  clearLocalSettings,
  peekLocalSettings,
  type LocalSettings,
} from "@/lib/local-store/settings.local";
import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";
import { removeKey, writeJson } from "@/lib/local-store/storage";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import type { SerializedInvoice } from "@/features/invoices/lib/format";

export type LocalWorkspaceSnapshot = {
  customers: SerializedCustomer[];
  invoices: SerializedInvoice[];
  settings: LocalSettings | null;
};

export function hasLocalWorkspaceData(): boolean {
  const customers = peekAllLocalCustomersIncludingDeleted().filter(
    (c) => !c.deletedAt,
  );
  const invoices = peekAllLocalInvoicesIncludingDeleted().filter(
    (invoice) => !invoice.deletedAt,
  );
  const settings = peekLocalSettings();
  const hasCustomTemplate =
    Boolean(settings) &&
    settings!.branding.templateId !== DEFAULT_INVOICE_TEMPLATE_ID;
  return customers.length > 0 || invoices.length > 0 || hasCustomTemplate;
}

export function getLocalWorkspaceSnapshot(): LocalWorkspaceSnapshot {
  return {
    customers: peekAllLocalCustomersIncludingDeleted().filter((c) => !c.deletedAt),
    invoices: peekAllLocalInvoicesIncludingDeleted().filter(
      (invoice) => !invoice.deletedAt,
    ),
    settings: peekLocalSettings(),
  };
}

export function clearLocalWorkspace() {
  clearLocalCustomers();
  clearLocalInvoices();
  clearLocalSettings();
  removeKey(LOCAL_STORE_KEYS.pendingMigration);
}

export function markPendingMigration() {
  writeJson(LOCAL_STORE_KEYS.pendingMigration, {
    markedAt: Date.now(),
  });
}

export function clearPendingMigrationFlag() {
  removeKey(LOCAL_STORE_KEYS.pendingMigration);
}

export function isPendingMigration(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(LOCAL_STORE_KEYS.pendingMigration));
}
