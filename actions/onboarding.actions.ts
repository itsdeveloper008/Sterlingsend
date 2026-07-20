"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { withTimestamps } from "@/lib/firestore-utils";
import {
  onboardingSchema,
  type OnboardingFormData,
} from "@/lib/validations/onboarding";
import { businessService } from "@/services/business.service";
import { userService } from "@/services/user.service";
import { routes } from "@/config/routes";

export type OnboardingActionResult =
  | { success: true; businessId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function ensureUserDocument(): Promise<OnboardingActionResult | { success: true; userId: string }> {
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
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const user = await userService.getById(session.uid);
  if (!user) {
    return { success: false, error: "User profile not found. Please sign in again." };
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
    phone: values.phone?.trim() || undefined,
    website: values.website?.trim() || undefined,
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2?.trim() || undefined,
    city: values.city.trim(),
    postcode: values.postcode.trim(),
    country: values.country.trim(),
    vatNumber: undefined,
    logoUrl: undefined,
    currency: values.currency,
    invoicePrefix: values.invoicePrefix.trim(),
    invoiceStartingNumber: values.invoiceStartingNumber,
  });

  try {
    await db.runTransaction(async (transaction) => {
      transaction.set(businessRef, businessPayload);
      transaction.update(userRef, {
        businessId: businessRef.id,
        updatedAt: businessPayload.updatedAt,
      });
    });

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

  const user = await userService.getById(session.uid);
  if (user?.businessId) {
    const business = await businessService.getById(user.businessId);
    if (business) {
      redirect(routes.dashboard);
    }
  }
}
