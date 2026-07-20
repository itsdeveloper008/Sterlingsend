import { z } from "zod";

export const businessDetailsSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name is too long"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  website: z.union([z.literal(""), z.string().url("Enter a valid URL")]).optional(),
});

export const businessAddressSchema = z.object({
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.string().min(1, "Country is required"),
});

export const invoicePreferencesSchema = z.object({
  invoicePrefix: z
    .string()
    .min(1, "Invoice prefix is required")
    .max(10, "Prefix is too long"),
  invoiceStartingNumber: z.coerce
    .number()
    .int("Must be a whole number")
    .min(1, "Starting number must be at least 1"),
  currency: z.enum(["GBP", "EUR", "USD"]),
});

export const onboardingSchema = businessDetailsSchema
  .merge(businessAddressSchema)
  .merge(invoicePreferencesSchema);

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingFormData = {
  businessName: "",
  email: "",
  phone: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  invoicePrefix: "INV",
  invoiceStartingNumber: 1001,
  currency: "GBP",
};
