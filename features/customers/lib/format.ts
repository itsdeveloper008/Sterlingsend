import type { Customer } from "@/types";

export type SerializedCustomer = Omit<
  Customer,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function parseDateValue(value: string | Date | unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

export function formatCustomerDate(value: string | Date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parseDateValue(value));
  } catch {
    return "-";
  }
}

export function formatCustomerAddress(customer: Pick<
  SerializedCustomer,
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "postcode"
  | "country"
>) {
  const parts = [
    customer.addressLine1,
    customer.addressLine2,
    customer.city,
    customer.postcode,
    customer.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
}
