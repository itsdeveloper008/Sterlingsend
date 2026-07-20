import { z } from "zod";

export const customerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .max(120, "Name is too long"),
  companyName: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  addressLine1: z.string().max(200).optional().or(z.literal("")),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  postcode: z.string().max(20).optional().or(z.literal("")),
  country: z.string().min(1, "Country is required"),
  vatNumber: z.string().max(30).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

export const defaultCustomerFormValues: CustomerFormData = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  vatNumber: "",
  notes: "",
};

export function customerToFormData(customer: {
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  vatNumber?: string;
  notes?: string;
}): CustomerFormData {
  return {
    name: customer.name ?? "",
    companyName: customer.companyName ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    addressLine1: customer.addressLine1 ?? "",
    addressLine2: customer.addressLine2 ?? "",
    city: customer.city ?? "",
    postcode: customer.postcode ?? "",
    country: customer.country ?? "United Kingdom",
    vatNumber: customer.vatNumber ?? "",
    notes: customer.notes ?? "",
  };
}
