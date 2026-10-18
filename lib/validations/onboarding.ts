import { z } from "zod";

export const onboardingSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name is too long"),
  email: z.string().email("Enter a valid email address"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingFormData = {
  businessName: "",
  email: "",
};

/** Applied server-side when creating the business  -  not collected in the UI. */
export const ONBOARDING_BUSINESS_DEFAULTS = {
  addressLine1: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  currency: "GBP" as const,
  invoicePrefix: "INV",
  invoiceStartingNumber: 1001,
};
