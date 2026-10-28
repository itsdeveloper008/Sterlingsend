"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { withTimestamps } from "@/lib/firestore-utils";
import {
  ONBOARDING_BUSINESS_DEFAULTS,
  onboardingSchema,
  type OnboardingFormData,
} from "@/lib/validations/onboarding";
import { businessService } from "@/services/business.service";
import { userService } from "@/services/user.service";
import { settingsService } from "@/services/settings.service";
import {
  getBusinessForUser,
  hasCompleteBusinessProfile,
} from "@/services/business-profile.service";
import { isAdminSession } from "@/services/admin.service";
import { routes } from "@/config/routes";

export type OnboardingActionResult =
  | { success: true; businessId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function ensureUserDocument(): Promise<
  OnboardingActionResult | { success: true; userId: string }
> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const existing = await userService.getById(session.uid);
    if (existing) {
      return { success: true, userId: session.uid };
    }

    await userService.create({
      id: session.uid,
      email: session.email ?? "",
      displayName: session.name ?? "",
    });

    return { success: true, userId: session.uid };
  } catch (error) {
    console.error("[ensureUserDocument]", error);
    return { success: false, error: "Failed to create user profile" };
  }
}

export async function completeOnboarding(
  data: OnboardingFormData,
): Promise<OnboardingActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = onboardingSchema.safeParse(data);
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

  const user = await userService.getById(session.uid);
  if (!user) {
    return {
      success: false,
      error: "User profile not found. Please sign in again.",
    };
  }

  const values = parsed.data;
  const details = {
    businessName: values.businessName.trim(),
    email: values.email.trim(),
    businessType: values.businessType,
    phone: values.phone,
    city: values.city,
    postcode: values.postcode,
  };

  // Accounts that skipped setup earlier already have a business: fill it in.
  const existing = await getBusinessForUser(session.uid);
  if (existing) {
    try {
      await businessService.update(existing.id, details);
      if (user.businessId !== existing.id) {
        await userService.update(session.uid, { businessId: existing.id });
      }
      return { success: true, businessId: existing.id };
    } catch (error) {
      console.error("[completeOnboarding]", error);
      return {
        success: false,
        error: "Could not save your business profile. Please try again.",
      };
    }
  }

  const db = getAdminDb();
  const businessRef = db.collection(COLLECTIONS.BUSINESSES).doc();
  const userRef = db.collection(COLLECTIONS.USERS).doc(session.uid);

  const businessPayload = withTimestamps({
    ownerId: session.uid,
    ...ONBOARDING_BUSINESS_DEFAULTS,
    ...details,
  });

  try {
    await db.runTransaction(async (transaction) => {
      transaction.set(businessRef, businessPayload);
      transaction.update(userRef, {
        businessId: businessRef.id,
        updatedAt: businessPayload.updatedAt,
      });
    });

    await settingsService.getByBusinessId(businessRef.id);

    return { success: true, businessId: businessRef.id };
  } catch (error) {
    console.error("[completeOnboarding]", error);
    return {
      success: false,
      error: "Could not save your business profile. Please try again.",
    };
  }
}

export async function redirectIfOnboardingComplete() {
  const session = await getServerSession();
  if (!session) {
    redirect(routes.login);
  }

  if (await hasCompleteBusinessProfile(session.uid)) {
    redirect(routes.home);
  }
}

/** True when the signed-in user still has to fill in their business details. */
export async function needsBusinessProfile(): Promise<boolean> {
  const session = await getServerSession();
  if (!session || isAdminSession(session)) return false;
  return !(await hasCompleteBusinessProfile(session.uid));
}
