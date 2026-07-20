import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { docToData, withTimestamps, withUpdatedAt } from "@/lib/firestore-utils";
import type {
  CreateCustomerInput,
  Customer,
  CustomerListResult,
  UpdateCustomerInput,
} from "@/types";

export interface GetCustomersOptions {
  businessId: string;
  limit?: number;
  cursor?: string | null;
  sortBy?: "createdAt" | "name";
  sortDirection?: "asc" | "desc";
}

const DEFAULT_LIMIT = 50;
const SEARCH_SCAN_LIMIT = 500;

export class CustomerService {
  private get db() {
    return getAdminDb();
  }

  async getCustomer(
    customerId: string,
    businessId: string,
  ): Promise<Customer | null> {
    const customer = await this.getById(customerId);
    if (!customer || customer.businessId !== businessId || customer.deletedAt) {
      return null;
    }
    return customer;
  }

  async getById(customerId: string): Promise<Customer | null> {
    const snap = await this.db
      .collection(COLLECTIONS.CUSTOMERS)
      .doc(customerId)
      .get();
    return docToData<Customer>(snap.id, snap.data());
  }

  async getCustomers(options: GetCustomersOptions): Promise<CustomerListResult> {
    const limit = options.limit ?? DEFAULT_LIMIT;
    const sortBy = options.sortBy ?? "createdAt";
    const sortDirection = options.sortDirection ?? "desc";

    let query = this.db
      .collection(COLLECTIONS.CUSTOMERS)
      .where("businessId", "==", options.businessId)
      .where("deletedAt", "==", null)
      .orderBy(sortBy, sortDirection);

    if (options.cursor) {
      const cursorDoc = await this.db
        .collection(COLLECTIONS.CUSTOMERS)
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

    const customers = pageDocs.map((doc) =>
      docToData<Customer>(doc.id, doc.data())!,
    );

    return {
      customers,
      nextCursor: hasMore ? pageDocs[pageDocs.length - 1]!.id : null,
      hasMore,
    };
  }

  async searchCustomers(
    businessId: string,
    searchTerm: string,
    limit = DEFAULT_LIMIT,
  ): Promise<Customer[]> {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      const result = await this.getCustomers({ businessId, limit });
      return result.customers;
    }

    const snap = await this.db
      .collection(COLLECTIONS.CUSTOMERS)
      .where("businessId", "==", businessId)
      .where("deletedAt", "==", null)
      .orderBy("createdAt", "desc")
      .limit(SEARCH_SCAN_LIMIT)
      .get();

    return snap.docs
      .map((doc) => docToData<Customer>(doc.id, doc.data())!)
      .filter((customer) => {
        return (
          customer.nameLower.includes(term) ||
          customer.emailLower.includes(term) ||
          customer.companyName?.toLowerCase().includes(term) ||
          customer.phone?.toLowerCase().includes(term) ||
          customer.city?.toLowerCase().includes(term) ||
          customer.postcode?.toLowerCase().includes(term)
        );
      })
      .slice(0, limit);
  }

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const ref = this.db.collection(COLLECTIONS.CUSTOMERS).doc();
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    const payload = withTimestamps({
      businessId: input.businessId,
      name,
      nameLower: name.toLowerCase(),
      email,
      emailLower: email,
      companyName: input.companyName?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      addressLine1: input.addressLine1?.trim() || undefined,
      addressLine2: input.addressLine2?.trim() || undefined,
      city: input.city?.trim() || undefined,
      postcode: input.postcode?.trim() || undefined,
      country: input.country?.trim() || "United Kingdom",
      vatNumber: input.vatNumber?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      deletedAt: null,
    });

    await ref.set(payload);
    return { id: ref.id, ...payload } as Customer;
  }

  async updateCustomer(
    customerId: string,
    businessId: string,
    input: UpdateCustomerInput,
  ): Promise<void> {
    const existing = await this.getCustomer(customerId, businessId);
    if (!existing) {
      throw new Error("Customer not found");
    }

    const updates: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      updates.name = name;
      updates.nameLower = name.toLowerCase();
    }
    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase();
      updates.email = email;
      updates.emailLower = email;
    }
    if (input.companyName !== undefined) {
      updates.companyName = input.companyName.trim() || undefined;
    }
    if (input.phone !== undefined) {
      updates.phone = input.phone.trim() || undefined;
    }
    if (input.addressLine1 !== undefined) {
      updates.addressLine1 = input.addressLine1.trim() || undefined;
    }
    if (input.addressLine2 !== undefined) {
      updates.addressLine2 = input.addressLine2.trim() || undefined;
    }
    if (input.city !== undefined) {
      updates.city = input.city.trim() || undefined;
    }
    if (input.postcode !== undefined) {
      updates.postcode = input.postcode.trim() || undefined;
    }
    if (input.country !== undefined) {
      updates.country = input.country.trim() || "United Kingdom";
    }
    if (input.vatNumber !== undefined) {
      updates.vatNumber = input.vatNumber.trim() || undefined;
    }
    if (input.notes !== undefined) {
      updates.notes = input.notes.trim() || undefined;
    }

    await this.db
      .collection(COLLECTIONS.CUSTOMERS)
      .doc(customerId)
      .update(withUpdatedAt(updates));
  }

  async deleteCustomer(customerId: string, businessId: string): Promise<void> {
    const existing = await this.getCustomer(customerId, businessId);
    if (!existing) {
      throw new Error("Customer not found");
    }

    await this.db
      .collection(COLLECTIONS.CUSTOMERS)
      .doc(customerId)
      .update(
        withUpdatedAt({
          deletedAt: Timestamp.now(),
        }),
      );
  }

  /** @deprecated Use getCustomers */
  async listByBusiness(businessId: string): Promise<Customer[]> {
    const result = await this.getCustomers({ businessId });
    return result.customers;
  }

  /** @deprecated Use createCustomer */
  async create(input: CreateCustomerInput): Promise<Customer> {
    return this.createCustomer(input);
  }

  /** @deprecated Use deleteCustomer */
  async softDelete(customerId: string, businessId: string): Promise<void> {
    return this.deleteCustomer(customerId, businessId);
  }
}

export const customerService = new CustomerService();
