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

  if (user.businessId) {
    const existingBusiness = await businessService.getById(user.businessId);
    if (existingBusiness) {
      return { success: false, error: "Business profile already exists" };
    }
  }

  const existingByOwner = await businessService.getByOwnerId(session.uid);
  if (existingByOwner) {
    await userService.update(session.uid, { businessId: existingByOwner.id });
    return { success: true, businessId: existingByOwner.id };
  }

  const values = parsed.data;
  const db = getAdminDb();
  const businessRef = db.collection(COLLECTIONS.BUSINESSES).doc();
  const userRef = db.collection(COLLECTIONS.USERS).doc(session.uid);

  const businessPayload = withTimestamps({
    ownerId: session.uid,
    businessName: values.businessName.trim(),
    email: values.email.trim(),
    ...ONBOARDING_BUSINESS_DEFAULTS,
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

/**
 * Skip creates a minimal business from session name/email so History and
 * Account work without bouncing back to /onboarding. User can refine later.
 */
export async function skipOnboardingAction(): Promise<OnboardingActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const ensured = await ensureUserDocument();
  if (!ensured.success) {
    return ensured;
  }

  const user = await userService.getById(session.uid);
  if (!user) {
    return {
      success: false,
      error: "User profile not found. Please sign in again.",
    };
  }

  if (user.businessId) {
    const existingBusiness = await businessService.getById(user.businessId);
    if (existingBusiness) {
      return { success: true, businessId: existingBusiness.id };
    }
  }

  const existingByOwner = await businessService.getByOwnerId(session.uid);
  if (existingByOwner) {
    await userService.update(session.uid, { businessId: existingByOwner.id });
    return { success: true, businessId: existingByOwner.id };
  }

  const email = (session.email ?? user.email ?? "").trim();
  if (!email) {
    return {
      success: false,
      error: "Add an email to your account before skipping setup",
    };
  }

  const displayName = (session.name ?? user.displayName ?? "").trim();
  const local = email.split("@")[0]?.trim() ?? "";
  const businessName = displayName || local;
  if (!businessName || businessName.length < 2) {
    return {
      success: false,
      error: "Add a display name to your account before skipping setup",
    };
  }

  try {
    const business = await businessService.create({
      ownerId: session.uid,
      businessName,
      email,
      ...ONBOARDING_BUSINESS_DEFAULTS,
    });
    await userService.update(session.uid, { businessId: business.id });
    await settingsService.getByBusinessId(business.id);
    return { success: true, businessId: business.id };
  } catch (error) {
    console.error("[skipOnboardingAction]", error);
    return {
      success: false,
      error: "Could not skip setup. Please try again.",
    };
  }
}

export async function redirectIfOnboardingComplete() {
  const session = await getServerSession();
  if (!session) {
    redirect(routes.login);
  }

  const user = await userService.getById(session.uid);
  if (user?.businessId) {
    const business = await businessService.getById(user.businessId);
    if (business) {
      redirect(routes.home);
    }
  }
}
