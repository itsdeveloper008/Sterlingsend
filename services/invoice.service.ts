import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import {
  calculateInvoiceTotals,
  calculateItemsFromForm,
  generateInvoiceNumber,
} from "@/lib/invoice/calculations";
import { assertStatusTransition } from "@/lib/invoice/status-transitions";
import { docToData, withTimestamps, withUpdatedAt } from "@/lib/firestore-utils";
import { businessService } from "@/services/business.service";
import { customerService } from "@/services/customer.service";
import type {
  CreateInvoiceInput,
  CurrencyCode,
  Invoice,
  InvoiceFormLineItem,
  InvoiceListResult,
  InvoiceStatus,
  UpdateInvoiceInput,
} from "@/types";
import { INVOICE_PAYMENT_STATUSES } from "@/types/public-invoice";
import { INVOICE_STATUSES } from "@/types";

export interface GetInvoicesOptions {
  businessId: string;
  status?: InvoiceStatus;
  limit?: number;
  cursor?: string | null;
  sortBy?: "createdAt" | "issueDate" | "total";
  sortDirection?: "asc" | "desc";
}

const DEFAULT_LIMIT = 50;
const SEARCH_SCAN_LIMIT = 500;

function sortField(sortBy: GetInvoicesOptions["sortBy"]) {
  if (sortBy === "issueDate") return "issueDate";
  if (sortBy === "total") return "totals.total";
  return "createdAt";
}

export class InvoiceService {
  private get db() {
    return getAdminDb();
  }

  async getInvoice(
    invoiceId: string,
    businessId: string,
  ): Promise<Invoice | null> {
    const snap = await this.db
      .collection(COLLECTIONS.INVOICES)
      .doc(invoiceId)
      .get();

    const invoice = docToData<Invoice>(snap.id, snap.data());
    if (!invoice || invoice.businessId !== businessId || invoice.deletedAt) {
      return null;
    }

    return invoice;
  }

  async getInvoices(options: GetInvoicesOptions): Promise<InvoiceListResult> {
    const limit = options.limit ?? DEFAULT_LIMIT;
    const sortBy = options.sortBy ?? "createdAt";
    const sortDirection = options.sortDirection ?? "desc";
    const field = sortField(sortBy);

    let query = this.db
      .collection(COLLECTIONS.INVOICES)
      .where("businessId", "==", options.businessId)
      .where("deletedAt", "==", null);

    if (options.status) {
      query = query.where("status", "==", options.status);
    }

    query = query.orderBy(field, sortDirection);

    if (options.cursor) {
      const cursorDoc = await this.db
        .collection(COLLECTIONS.INVOICES)
        .doc(options.cursor)
        .get();

      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snap = await query.limit(limit + 1).get();
    const docs = snap.docs;
    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;

    const invoices = pageDocs.map((doc) =>
      docToData<Invoice>(doc.id, doc.data())!,
    );

    return {
      invoices,
      nextCursor: hasMore ? pageDocs[pageDocs.length - 1]!.id : null,
      hasMore,
    };
  }

  async searchInvoices(
    businessId: string,
    searchTerm: string,
  ): Promise<Invoice[]> {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      const result = await this.getInvoices({ businessId, limit: SEARCH_SCAN_LIMIT });
      return result.invoices;
    }

    const snap = await this.db
      .collection(COLLECTIONS.INVOICES)
      .where("businessId", "==", businessId)
      .where("deletedAt", "==", null)
      .orderBy("createdAt", "desc")
      .limit(SEARCH_SCAN_LIMIT)
      .get();

    return snap.docs
      .map((doc) => docToData<Invoice>(doc.id, doc.data())!)
      .filter((invoice) => {
        return (
          invoice.invoiceNumberLower.includes(term) ||
          invoice.clientName.toLowerCase().includes(term) ||
          invoice.clientEmail?.toLowerCase().includes(term)
        );
      });
  }

  async generateInvoiceNumber(businessId: string): Promise<string> {
    const businessRef = this.db.collection(COLLECTIONS.BUSINESSES).doc(businessId);

    return this.db.runTransaction(async (transaction) => {
      const businessSnap = await transaction.get(businessRef);
      if (!businessSnap.exists) {
        throw new Error("Business not found");
      }

      const business = businessSnap.data()!;
      const prefix = business.invoicePrefix as string;
      const nextNumber =
        (business.invoiceNextNumber as number | undefined) ??
        (business.invoiceStartingNumber as number);

      const invoiceNumber = generateInvoiceNumber(prefix, nextNumber);

      transaction.update(businessRef, {
        invoiceNextNumber: nextNumber + 1,
        updatedAt: Timestamp.now(),
      });

      return invoiceNumber;
    });
  }

  async createInvoice(
    businessId: string,
    input: {
      customerId: string;
      issueDate: string;
      dueDate: string;
      status?: InvoiceStatus;
      notes?: string;
      items: InvoiceFormLineItem[];
      currency: CurrencyCode;
      reserveNumber?: boolean;
      invoiceNumber?: string;
    },
  ): Promise<Invoice> {
    const customer = await customerService.getCustomer(input.customerId, businessId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const items = calculateItemsFromForm(input.items);
    const totals = calculateInvoiceTotals(items);
    const invoiceNumber =
      input.invoiceNumber ??
      (input.reserveNumber === false
        ? ""
        : await this.generateInvoiceNumber(businessId));

    if (!invoiceNumber) {
      throw new Error("Invoice number is required");
    }

    const ref = this.db.collection(COLLECTIONS.INVOICES).doc();
    const payload = withTimestamps({
      businessId,
      customerId: input.customerId,
      invoiceNumber,
      invoiceNumberLower: invoiceNumber.toLowerCase(),
      status: input.status ?? INVOICE_STATUSES.DRAFT,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      clientName: customer.name,
      clientEmail: customer.email,
      items,
      notes: input.notes?.trim() || undefined,
      currency: input.currency,
      totals,
      paymentEnabled: false,
      paymentStatus: INVOICE_PAYMENT_STATUSES.UNPAID,
      deletedAt: null,
    });

    await ref.set(payload);
    return { id: ref.id, ...payload } as Invoice;
  }

  async updateInvoice(
    invoiceId: string,
    businessId: string,
    input: {
      customerId?: string;
      issueDate?: string;
      dueDate?: string;
      status?: InvoiceStatus;
      notes?: string;
      items?: InvoiceFormLineItem[];
    },
  ): Promise<Invoice> {
    const existing = await this.getInvoice(invoiceId, businessId);
    if (!existing) {
      throw new Error("Invoice not found");
    }

    if (
      input.status &&
      input.status !== existing.status
    ) {
      assertStatusTransition(existing.status, input.status);
    }

    const updates: Record<string, unknown> = {};

    if (input.customerId && input.customerId !== existing.customerId) {
      const customer = await customerService.getCustomer(
        input.customerId,
        businessId,
      );
      if (!customer) {
        throw new Error("Customer not found");
      }
      updates.customerId = input.customerId;
      updates.clientName = customer.name;
      updates.clientEmail = customer.email;
    }

    if (input.issueDate !== undefined) updates.issueDate = input.issueDate;
    if (input.dueDate !== undefined) updates.dueDate = input.dueDate;
    if (input.notes !== undefined) {
      updates.notes = input.notes.trim() || undefined;
    }
    if (input.status !== undefined) {
      updates.status = input.status;
      if (input.status === INVOICE_STATUSES.SENT && !existing.sentAt) {
        updates.sentAt = Timestamp.now();
      }
      if (input.status === INVOICE_STATUSES.VIEWED && !existing.viewedAt) {
        updates.viewedAt = Timestamp.now();
      }
      if (input.status === INVOICE_STATUSES.PAID && !existing.paidAt) {
        updates.paidAt = Timestamp.now();
      }
    }

    if (input.items) {
      const items = calculateItemsFromForm(input.items);
      updates.items = items;
      updates.totals = calculateInvoiceTotals(items);
    }

    await this.db
      .collection(COLLECTIONS.INVOICES)
      .doc(invoiceId)
      .update(withUpdatedAt(updates));

    const updated = await this.getInvoice(invoiceId, businessId);
    if (!updated) {
      throw new Error("Invoice not found after update");
    }

    return updated;
  }

  async updateInvoiceStatus(
    invoiceId: string,
    businessId: string,
    status: InvoiceStatus,
  ): Promise<Invoice> {
    return this.updateInvoice(invoiceId, businessId, { status });
  }

  async deleteInvoice(invoiceId: string, businessId: string): Promise<void> {
    const existing = await this.getInvoice(invoiceId, businessId);
    if (!existing) {
      throw new Error("Invoice not found");
    }

    await this.db
      .collection(COLLECTIONS.INVOICES)
      .doc(invoiceId)
      .update(
        withUpdatedAt({
          deletedAt: Timestamp.now(),
        }),
      );
  }

  async duplicateInvoice(
    invoiceId: string,
    businessId: string,
  ): Promise<Invoice> {
    const existing = await this.getInvoice(invoiceId, businessId);
    if (!existing) {
      throw new Error("Invoice not found");
    }

    const business = await businessService.getById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    return this.createInvoice(businessId, {
      customerId: existing.customerId,
      issueDate: existing.issueDate,
      dueDate: existing.dueDate,
      status: INVOICE_STATUSES.DRAFT,
      notes: existing.notes,
      items: existing.items.map((item) => ({
        id: crypto.randomUUID(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        discountRate: item.discountRate,
      })),
      currency: business.currency,
      reserveNumber: true,
    });
  }

  /** @deprecated Use getInvoices */
  async list(options: GetInvoicesOptions): Promise<Invoice[]> {
    const result = await this.getInvoices(options);
    return result.invoices;
  }

  /** @deprecated Use getInvoice */
  async getById(invoiceId: string): Promise<Invoice | null> {
    const snap = await this.db
      .collection(COLLECTIONS.INVOICES)
      .doc(invoiceId)
      .get();
    const invoice = docToData<Invoice>(snap.id, snap.data());
    if (!invoice || invoice.deletedAt) return null;
    return invoice;
  }

  /** @deprecated Use createInvoice */
  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const ref = this.db.collection(COLLECTIONS.INVOICES).doc();
    const payload = withTimestamps({
      ...input,
      invoiceNumberLower: input.invoiceNumber.toLowerCase(),
      deletedAt: null,
    });
    await ref.set(payload);
    return { id: ref.id, ...payload } as Invoice;
  }

  /** @deprecated Use updateInvoice */
  async update(invoiceId: string, input: UpdateInvoiceInput): Promise<void> {
    await this.db
      .collection(COLLECTIONS.INVOICES)
      .doc(invoiceId)
      .update(withUpdatedAt(input));
  }

  /** @deprecated Use deleteInvoice */
  async softDelete(invoiceId: string): Promise<void> {
    await this.db
      .collection(COLLECTIONS.INVOICES)
      .doc(invoiceId)
      .update(
        withUpdatedAt({
          deletedAt: Timestamp.now(),
        }),
      );
  }
}

export const invoiceService = new InvoiceService();
