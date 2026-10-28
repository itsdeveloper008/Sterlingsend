import type { Business } from "@/types";

/** Fields every account must fill in after sign-up (see /onboarding). */
export function isBusinessProfileComplete(
  business: Pick<Business, "businessName" | "businessType" | "phone" | "city"> | null | undefined,
): boolean {
  return Boolean(
    business?.businessName?.trim() &&
      business.businessType?.trim() &&
      business.phone?.trim() &&
      business.city?.trim(),
  );
}
