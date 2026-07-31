import { z } from "zod";
import { INVOICE_STATUSES } from "@/types";
import { createId } from "@/lib/id";

const invoiceStatusSchema = z.enum([
  INVOICE_STATUSES.DRAFT,
  INVOICE_STATUSES.SENT,
  INVOICE_STATUSES.VIEWED,
  INVOICE_STATUSES.PAID,
  INVOICE_STATUSES.OVERDUE,
  INVOICE_STATUSES.CANCELLED,
]);

export const invoiceLineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().max(500),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),
  vatRate: z.coerce.number().min(0).max(100),
  discountRate: z.coerce.number().min(0).max(100),
});

export const invoiceFormSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: invoiceStatusSchema,
  notes: z.string().max(5000).optional().or(z.literal("")),
  items: z
    .array(invoiceLineItemSchema)
    .min(1, "Add at least one line item"),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export function defaultInvoiceFormValues(
  issueDate: string,
  dueDate: string,
): InvoiceFormData {
  return {
    customerId: "",
    issueDate,
    dueDate,
    status: INVOICE_STATUSES.DRAFT,
    notes: "",
    items: [
      {
        id: createId(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        discountRate: 0,
      },
    ],
  };
}

export function invoiceToFormData(invoice: {
  customerId: string;
  issueDate: string;
  dueDate: string;
  status: string;
  notes?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    discountRate: number;
  }>;
}): InvoiceFormData {
  return {
    customerId: invoice.customerId,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status as InvoiceFormData["status"],
    notes: invoice.notes ?? "",
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      discountRate: item.discountRate,
    })),
  };
}
