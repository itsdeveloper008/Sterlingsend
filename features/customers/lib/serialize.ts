import "server-only";

import { toDate } from "@/lib/firestore-utils";
import type { Customer } from "@/types";
import type { SerializedCustomer } from "@/features/customers/lib/format";

export function serializeCustomer(customer: Customer): SerializedCustomer {
  return {
    ...customer,
    createdAt: toDate(customer.createdAt).toISOString(),
    updatedAt: toDate(customer.updatedAt).toISOString(),
    deletedAt: customer.deletedAt
      ? toDate(customer.deletedAt).toISOString()
      : null,
  };
}

export function serializeCustomers(customers: Customer[]): SerializedCustomer[] {
  return customers.map(serializeCustomer);
}
