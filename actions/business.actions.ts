"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { requireOnboarding } from "@/actions/auth.actions";
import {
  bankDetailsSchema,
  normalizeBankDetails,
  type BankDetailsFormData,
} from "@/lib/validations/business";
import { businessService } from "@/services/business.service";
import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { routes } from "@/config/routes";

export type BusinessActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateBankDetailsAction(
  input: BankDetailsFormData,
): Promise<BusinessActionResult> {
  try {
    const { business } = await requireOnboarding();
    const parsed = bankDetailsSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const bankDetails = normalizeBankDetails(parsed.data);

    await businessService.update(business.id, { bankDetails });
    revalidatePath(routes.settingsPayments);
    revalidatePath(routes.settingsBranding);

    return { success: true };
  } catch (error) {
    console.error("[updateBankDetailsAction]", error);
    return { success: false, error: "Failed to save bank details" };
  }
}

export async function updateBusinessLogoAction(
  logoUrl: string,
): Promise<BusinessActionResult> {
  try {
    const { business } = await requireOnboarding();

    if (!logoUrl.trim() || !/^https?:\/\//i.test(logoUrl)) {
      return { success: false, error: "Invalid logo URL" };
    }

    await businessService.update(business.id, { logoUrl: logoUrl.trim() });
    revalidatePath(routes.settingsBranding);
    revalidatePath(routes.invoices);

    return { success: true };
  } catch (error) {
    console.error("[updateBusinessLogoAction]", error);
    return { success: false, error: "Failed to save logo" };
  }
}

export async function removeBusinessLogoAction(): Promise<BusinessActionResult> {
  try {
    const { business } = await requireOnboarding();

    await getAdminDb()
      .collection(COLLECTIONS.BUSINESSES)
      .doc(business.id)
      .update({
        logoUrl: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    revalidatePath(routes.settingsBranding);
    revalidatePath(routes.invoices);

    return { success: true };
  } catch (error) {
    console.error("[removeBusinessLogoAction]", error);
    return { success: false, error: "Failed to remove logo" };
  }
}
