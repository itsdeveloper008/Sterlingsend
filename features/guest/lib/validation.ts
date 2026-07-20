import { z } from "zod";

export const guestLineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().max(500),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0).max(100),
  discountRate: z.coerce.number().min(0).max(100),
});

export const guestInvoiceSchema = z.object({
  business: z.object({
    name: z.string().min(1, "Business name is required"),
    email: z.string().email("Enter a valid business email"),
    phone: z.string().max(30).optional().or(z.literal("")),
    address: z.string().min(1, "Business address is required"),
    vatNumber: z.string().max(30).optional().or(z.literal("")),
    logoUrl: z.string().url().optional().or(z.literal("")),
    bankDetails: z
      .object({
        accountName: z.string().max(120).optional().or(z.literal("")),
        accountNumber: z.string().max(20).optional().or(z.literal("")),
        sortCode: z.string().max(10).optional().or(z.literal("")),
      })
      .optional(),
  }),
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.union([z.literal(""), z.string().email("Enter a valid customer email")]),
    address: z.string().optional().or(z.literal("")),
  }),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().max(5000).optional().or(z.literal("")),
  items: z.array(guestLineItemSchema).min(1, "Add at least one line item"),
});

export type GuestInvoiceFormData = z.infer<typeof guestInvoiceSchema>;
