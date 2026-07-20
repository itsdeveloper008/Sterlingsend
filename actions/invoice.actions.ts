"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarding } from "@/actions/auth.actions";
import {
  invoiceFormSchema,
  type InvoiceFormData,
} from "@/lib/validations/invoice";
import { invoiceService } from "@/services/invoice.service";
import { routes } from "@/config/routes";
import {
  serializeInvoice,
  serializeInvoices,
} from "@/features/invoices/lib/serialize";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import type { InvoiceStatus } from "@/types";
import { INVOICE_STATUSES } from "@/types";

export type InvoiceActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function getBusinessContext() {
  const { business } = await requireOnboarding();
  return business;
}

function revalidateInvoicePaths(invoiceId?: string) {
  revalidatePath(routes.invoices);
  if (invoiceId) {
    revalidatePath(routes.invoice(invoiceId));
    revalidatePath(routes.invoiceEdit(invoiceId));
  }
}

export async function getInvoicesAction(options?: {
  cursor?: string | null;
  limit?: number;
  status?: InvoiceStatus;
  sortBy?: "createdAt" | "issueDate" | "total";
  sortDirection?: "asc" | "desc";
}): Promise<
  InvoiceActionResult<{
    invoices: SerializedInvoice[];
    nextCursor: string | null;
    hasMore: boolean;
  }>
> {
  try {
    const business = await getBusinessContext();
    const result = await invoiceService.getInvoices({
      businessId: business.id,
      cursor: options?.cursor,
      limit: options?.limit,
      status: options?.status,
      sortBy: options?.sortBy,
      sortDirection: options?.sortDirection,
    });
    return {
      success: true,
      data: {
        invoices: serializeInvoices(result.invoices),
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    };
  } catch (error) {
    console.error("[getInvoicesAction]", error);
    return { success: false, error: "Failed to load invoices" };
  }
}

export async function searchInvoicesAction(
  searchTerm: string,
): Promise<InvoiceActionResult<SerializedInvoice[]>> {
  try {
    const business = await getBusinessContext();
    const invoices = await invoiceService.searchInvoices(
      business.id,
      searchTerm,
    );
    return { success: true, data: serializeInvoices(invoices) };
  } catch (error) {
    console.error("[searchInvoicesAction]", error);
    return { success: false, error: "Failed to search invoices" };
  }
}

export async function getInvoiceAction(
  invoiceId: string,
): Promise<InvoiceActionResult<SerializedInvoice>> {
  try {
    const business = await getBusinessContext();
    const invoice = await invoiceService.getInvoice(invoiceId, business.id);
    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }
    return { success: true, data: serializeInvoice(invoice) };
  } catch (error) {
    console.error("[getInvoiceAction]", error);
    return { success: false, error: "Failed to load invoice" };
  }
}

export async function createInvoiceAction(
  data: InvoiceFormData,
): Promise<InvoiceActionResult<SerializedInvoice>> {
  const parsed = invoiceFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const business = await getBusinessContext();
    const invoice = await invoiceService.createInvoice(business.id, {
      ...parsed.data,
      currency: business.currency,
    });
    revalidateInvoicePaths(invoice.id);
    return { success: true, data: serializeInvoice(invoice) };
  } catch (error) {
    console.error("[createInvoiceAction]", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function autosaveInvoiceAction(
  invoiceId: string | null,
  data: InvoiceFormData,
): Promise<InvoiceActionResult<SerializedInvoice>> {
  if (data.status !== INVOICE_STATUSES.DRAFT) {
    return { success: false, error: "Autosave is only available for drafts" };
  }

  if (!data.customerId) {
    return { success: false, error: "Select a customer to save draft" };
  }

  const parsed = invoiceFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Draft could not be saved",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const business = await getBusinessContext();

    if (!invoiceId) {
      const invoice = await invoiceService.createInvoice(business.id, {
        ...parsed.data,
        currency: business.currency,
      });
      revalidateInvoicePaths(invoice.id);
      return { success: true, data: serializeInvoice(invoice) };
    }

    const invoice = await invoiceService.updateInvoice(
      invoiceId,
      business.id,
      parsed.data,
    );
    revalidateInvoicePaths(invoiceId);
    return { success: true, data: serializeInvoice(invoice) };
  } catch (error) {
    console.error("[autosaveInvoiceAction]", error);
    return { success: false, error: "Failed to autosave invoice" };
  }
}

export async function updateInvoiceAction(
  invoiceId: string,
  data: InvoiceFormData,
): Promise<InvoiceActionResult<SerializedInvoice>> {
  const parsed = invoiceFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const business = await getBusinessContext();
    const invoice = await invoiceService.updateInvoice(
      invoiceId,
      business.id,
      parsed.data,
    );
    revalidateInvoicePaths(invoiceId);
    return { success: true, data: serializeInvoice(invoice) };
  } catch (error) {
    console.error("[updateInvoiceAction]", error);
    return { success: false, error: "Failed to update invoice" };
  }
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
): Promise<InvoiceActionResult<SerializedInvoice>> {
  try {
    const business = await getBusinessContext();
    const invoice = await invoiceService.updateInvoiceStatus(
      invoiceId,
      business.id,
      status,
    );
    revalidateInvoicePaths(invoiceId);
    return { success: true, data: serializeInvoice(invoice) };
  } catch (error) {
    console.error("[updateInvoiceStatusAction]", error);
    return { success: false, error: "Failed to update invoice status" };
  }
}

export async function duplicateInvoiceAction(
  invoiceId: string,
): Promise<InvoiceActionResult<SerializedInvoice>> {
  try {
    const business = await getBusinessContext();
    const invoice = await invoiceService.duplicateInvoice(
      invoiceId,
      business.id,
    );
    revalidateInvoicePaths(invoice.id);
    return { success: true, data: serializeInvoice(invoice) };
  } catch (error) {
    console.error("[duplicateInvoiceAction]", error);
    return { success: false, error: "Failed to duplicate invoice" };
  }
}

export async function deleteInvoiceAction(
  invoiceId: string,
): Promise<InvoiceActionResult> {
  try {
    const business = await getBusinessContext();
    await invoiceService.deleteInvoice(invoiceId, business.id);
    revalidateInvoicePaths(invoiceId);
    return { success: true };
  } catch (error) {
    console.error("[deleteInvoiceAction]", error);
    return { success: false, error: "Failed to delete invoice" };
  }
}
