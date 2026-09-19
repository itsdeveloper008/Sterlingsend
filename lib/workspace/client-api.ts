"use client";

import {
  createCustomerAction,
  deleteCustomerAction,
  searchCustomersAction,
  updateCustomerAction,
} from "@/actions/customer.actions";
import {
  autosaveInvoiceAction,
  createInvoiceAction,
  deleteInvoiceAction,
  duplicateInvoiceAction,
  searchInvoicesAction,
  updateInvoiceAction,
} from "@/actions/invoice.actions";
import { updateInvoiceTemplateAction } from "@/actions/settings.actions";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import type { CustomerFormData } from "@/lib/validations/customer";
import type { InvoiceFormData } from "@/lib/validations/invoice";
import {
  createLocalCustomer,
  deleteLocalCustomer,
  listLocalCustomers,
  searchLocalCustomers,
  updateLocalCustomer,
} from "@/lib/local-store/customers.local";
import {
  createLocalInvoice,
  deleteLocalInvoice,
  duplicateLocalInvoice,
  listLocalInvoices,
  searchLocalInvoices,
  updateLocalInvoice,
} from "@/lib/local-store/invoices.local";
import { getLocalSettings, updateLocalBranding } from "@/lib/local-store/settings.local";
import type { WorkspaceSource } from "@/lib/workspace/resolve-source";
import { siteConfig } from "@/config/site";

export async function workspaceSearchCustomers(
  source: WorkspaceSource,
  term: string,
): Promise<SerializedCustomer[]> {
  if (source === "local") {
    return searchLocalCustomers(term);
  }
  const result = await searchCustomersAction(term);
  if (!result.success) throw new Error(result.error);
  return result.data ?? [];
}

export async function workspaceListCustomers(
  source: WorkspaceSource,
  initial?: SerializedCustomer[],
): Promise<SerializedCustomer[]> {
  if (source === "local") return listLocalCustomers();
  return initial ?? [];
}

export async function workspaceCreateCustomer(
  source: WorkspaceSource,
  data: CustomerFormData,
) {
  if (source === "local") {
    return { success: true as const, data: createLocalCustomer(data) };
  }
  return createCustomerAction(data);
}

export async function workspaceUpdateCustomer(
  source: WorkspaceSource,
  customerId: string,
  data: CustomerFormData,
) {
  if (source === "local") {
    const updated = updateLocalCustomer(customerId, data);
    if (!updated) return { success: false as const, error: "Customer not found" };
    return { success: true as const, data: updated };
  }
  return updateCustomerAction(customerId, data);
}

export async function workspaceDeleteCustomer(
  source: WorkspaceSource,
  customerId: string,
) {
  if (source === "local") {
    const ok = deleteLocalCustomer(customerId);
    return ok
      ? { success: true as const }
      : { success: false as const, error: "Customer not found" };
  }
  return deleteCustomerAction(customerId);
}

export async function workspaceSearchInvoices(
  source: WorkspaceSource,
  term: string,
): Promise<SerializedInvoice[]> {
  if (source === "local") return searchLocalInvoices(term);
  const result = await searchInvoicesAction(term);
  if (!result.success) throw new Error(result.error);
  return result.data ?? [];
}

export async function workspaceListInvoices(
  source: WorkspaceSource,
  initial?: SerializedInvoice[],
): Promise<SerializedInvoice[]> {
  if (source === "local") return listLocalInvoices();
  return initial ?? [];
}

export async function workspaceCreateInvoice(
  source: WorkspaceSource,
  data: InvoiceFormData,
  currency: string = siteConfig.defaultCurrency,
) {
  if (source === "local") {
    return { success: true as const, data: createLocalInvoice(data, currency) };
  }
  return createInvoiceAction(data);
}

export async function workspaceUpdateInvoice(
  source: WorkspaceSource,
  invoiceId: string,
  data: InvoiceFormData,
) {
  if (source === "local") {
    const updated = updateLocalInvoice(invoiceId, data);
    if (!updated) return { success: false as const, error: "Invoice not found" };
    return { success: true as const, data: updated };
  }
  return updateInvoiceAction(invoiceId, data);
}

export async function workspaceAutosaveInvoice(
  source: WorkspaceSource,
  invoiceId: string | null,
  data: InvoiceFormData,
  currency: string = siteConfig.defaultCurrency,
) {
  if (source === "local") {
    if (!data.customerId) {
      return { success: false as const, error: "Select a customer to save draft" };
    }
    if (invoiceId) {
      const updated = updateLocalInvoice(invoiceId, data);
      if (!updated) return { success: false as const, error: "Invoice not found" };
      return { success: true as const, data: updated };
    }
    return { success: true as const, data: createLocalInvoice(data, currency) };
  }
  return autosaveInvoiceAction(invoiceId, data);
}

export async function workspaceDeleteInvoice(
  source: WorkspaceSource,
  invoiceId: string,
) {
  if (source === "local") {
    const ok = deleteLocalInvoice(invoiceId);
    return ok
      ? { success: true as const }
      : { success: false as const, error: "Invoice not found" };
  }
  return deleteInvoiceAction(invoiceId);
}

export async function workspaceDuplicateInvoice(
  source: WorkspaceSource,
  invoiceId: string,
) {
  if (source === "local") {
    const copy = duplicateLocalInvoice(invoiceId);
    if (!copy) return { success: false as const, error: "Invoice not found" };
    return { success: true as const, data: copy };
  }
  return duplicateInvoiceAction(invoiceId);
}

export async function workspaceSaveTemplate(
  source: WorkspaceSource,
  templateId: string,
) {
  if (source === "local") {
    updateLocalBranding({ templateId });
    return { success: true as const, templateId };
  }
  return updateInvoiceTemplateAction(templateId);
}

export function workspaceGetLocalTemplateId() {
  return getLocalSettings().branding.templateId;
}
