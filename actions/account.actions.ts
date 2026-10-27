"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarding } from "@/actions/auth.actions";
import { businessService } from "@/services/business.service";
import { routes } from "@/config/routes";
import { z } from "zod";
import { businessTypeSchema, phoneSchema } from "@/lib/validations/onboarding";

const accountSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120),
  email: z.string().email("Enter a valid email"),
  businessType: businessTypeSchema,
  phone: phoneSchema,
  addressLine1: z.string().trim().max(160),
  city: z.string().trim().max(80),
  postcode: z.string().trim().max(12),
});

export type AccountInput = z.input<typeof accountSchema>;

export type AccountActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateAccountAction(
  input: AccountInput,
): Promise<AccountActionResult> {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const { business } = await requireOnboarding();
    await businessService.update(business.id, {
      businessName: parsed.data.businessName.trim(),
      email: parsed.data.email.trim(),
      businessType: parsed.data.businessType,
      phone: parsed.data.phone,
      addressLine1: parsed.data.addressLine1,
      city: parsed.data.city,
      postcode: parsed.data.postcode.toUpperCase(),
    });
    revalidatePath(routes.account);
    revalidatePath(routes.settings);
    return { success: true };
  } catch (error) {
    console.error("[updateAccountAction]", error);
    return { success: false, error: "Could not save account" };
  }
}
