"use client";

import { createId } from "@/lib/id";
import {
  calculateInvoiceTotals,
  calculateItemsFromForm,
} from "@/lib/invoice/calculations";
import { LOCAL_BUSINESS_ID, LOCAL_STORE_KEYS } from "@/lib/local-store/keys";
import { readJson, writeJson } from "@/lib/local-store/storage";
import type { InvoiceFormData } from "@/lib/validations/invoice";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import type { InvoiceStatus } from "@/types";
import { INVOICE_PAYMENT_STATUSES, INVOICE_STATUSES } from "@/types";
import { siteConfig } from "@/config/site";
import { getLocalCustomer } from "@/lib/local-store/customers.local";

function nowIso() {
  return new Date().toISOString();
}

function loadAll(): SerializedInvoice[] {
  return readJson<SerializedInvoice[]>(LOCAL_STORE_KEYS.invoices, []).filter(
    (invoice) => !invoice.deletedAt,
  );
}

function saveAll(invoices: SerializedInvoice[]) {
  writeJson(LOCAL_STORE_KEYS.invoices, invoices);
}

function nextInvoiceNumber(): string {
  const all = readJson<SerializedInvoice[]>(LOCAL_STORE_KEYS.invoices, []);
  const seq = all.length + 1;
  return `INV-LOCAL-${String(seq).padStart(4, "0")}`;
}

export function listLocalInvoices(): SerializedInvoice[] {
  return loadAll().sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}

export function searchLocalInvoices(term: string): SerializedInvoice[] {
  const q = term.trim().toLowerCase();
  if (!q) return listLocalInvoices();
  return listLocalInvoices().filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(q) ||
      invoice.clientName.toLowerCase().includes(q) ||
      (invoice.clientEmail ?? "").toLowerCase().includes(q),
  );
}

export function getLocalInvoice(id: string): SerializedInvoice | null {
  return loadAll().find((invoice) => invoice.id === id) ?? null;
}

export function createLocalInvoice(
  data: InvoiceFormData,
  currency: string = siteConfig.defaultCurrency,
): SerializedInvoice {
  const customer = getLocalCustomer(data.customerId);
  const items = calculateItemsFromForm(data.items);
  const totals = calculateInvoiceTotals(items);
  const stamp = nowIso();
  const invoiceNumber = nextInvoiceNumber();

  const invoice: SerializedInvoice = {
    id: createId(),
    businessId: LOCAL_BUSINESS_ID,
    customerId: data.customerId,
    invoiceNumber,
    invoiceNumberLower: invoiceNumber.toLowerCase(),
    status: (data.status as InvoiceStatus) || INVOICE_STATUSES.DRAFT,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    clientName: customer?.name ?? "Customer",
    clientEmail: customer?.email,
    items,
    notes: data.notes?.trim() || undefined,
    currency: currency as SerializedInvoice["currency"],
    totals,
    paymentEnabled: false,
    paymentStatus: INVOICE_PAYMENT_STATUSES.UNPAID,
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
    sentAt: null,
    viewedAt: null,
    paidAt: null,
  };

  const all = readJson<SerializedInvoice[]>(LOCAL_STORE_KEYS.invoices, []);
  all.unshift(invoice);
  saveAll(all);
  return invoice;
}

export function updateLocalInvoice(
  id: string,
  data: InvoiceFormData,
): SerializedInvoice | null {
  const all = readJson<SerializedInvoice[]>(LOCAL_STORE_KEYS.invoices, []);
  const index = all.findIndex((invoice) => invoice.id === id && !invoice.deletedAt);
  if (index < 0) return null;

  const customer = getLocalCustomer(data.customerId);
  const items = calculateItemsFromForm(data.items);
  const totals = calculateInvoiceTotals(items);

  const updated: SerializedInvoice = {
    ...all[index],
    customerId: data.customerId,
    status: data.status as InvoiceStatus,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    clientName: customer?.name ?? all[index].clientName,
    clientEmail: customer?.email ?? all[index].clientEmail,
    items,
    notes: data.notes?.trim() || undefined,
    totals,
    updatedAt: nowIso(),
  };
  all[index] = updated;
  saveAll(all);
  return updated;
}

export function deleteLocalInvoice(id: string): boolean {
  const all = readJson<SerializedInvoice[]>(LOCAL_STORE_KEYS.invoices, []);
  const index = all.findIndex((invoice) => invoice.id === id);
  if (index < 0) return false;
  all[index] = {
    ...all[index],
    deletedAt: nowIso(),
    updatedAt: nowIso(),
  };
  saveAll(all);
  return true;
}

export function duplicateLocalInvoice(id: string): SerializedInvoice | null {
  const source = getLocalInvoice(id);
  if (!source) return null;
  const stamp = nowIso();
  const invoiceNumber = nextInvoiceNumber();
  const copy: SerializedInvoice = {
    ...source,
    id: createId(),
    invoiceNumber,
    invoiceNumberLower: invoiceNumber.toLowerCase(),
    status: INVOICE_STATUSES.DRAFT,
    paymentStatus: INVOICE_PAYMENT_STATUSES.UNPAID,
    paymentEnabled: false,
    publicToken: undefined,
    publicUrl: undefined,
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
    sentAt: null,
    viewedAt: null,
    paidAt: null,
  };
  const all = readJson<SerializedInvoice[]>(LOCAL_STORE_KEYS.invoices, []);
  all.unshift(copy);
  saveAll(all);
  return copy;
}

export function peekAllLocalInvoicesIncludingDeleted(): SerializedInvoice[] {
  return readJson<SerializedInvoice[]>(LOCAL_STORE_KEYS.invoices, []);
}

export function clearLocalInvoices() {
  writeJson(LOCAL_STORE_KEYS.invoices, []);
}
