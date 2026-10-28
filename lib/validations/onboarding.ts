import { z } from "zod";
import { BUSINESS_TYPES } from "@/lib/business-types";

export const businessTypeSchema = z.enum(BUSINESS_TYPES, {
  error: "Choose your type of business",
});

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number");

export const onboardingSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name is too long"),
  email: z.string().email("Enter a valid email address"),
  businessType: businessTypeSchema,
  phone: phoneSchema,
  city: z
    .string()
    .trim()
    .min(2, "Enter your town or city")
    .max(80, "Town or city is too long"),
  postcode: z.string().trim().max(12, "Postcode is too long"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingFormData = {
  businessName: "",
  email: "",
  businessType: "" as OnboardingFormData["businessType"],
  phone: "",
  city: "",
  postcode: "",
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
