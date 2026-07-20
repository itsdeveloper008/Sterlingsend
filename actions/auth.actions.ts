"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { userService } from "@/services/user.service";
import { businessService } from "@/services/business.service";
import { routes } from "@/config/routes";

export async function getCurrentUserContext() {
  const session = await getServerSession();
  if (!session) return null;

  const user = await userService.getById(session.uid);
  if (!user) return null;

  const business = user.businessId
    ? await businessService.getById(user.businessId)
    : await businessService.getByOwnerId(session.uid);

  return { session, user, business };
}

export async function requireAuth() {
  const context = await getCurrentUserContext();
  if (!context) {
    redirect(routes.login);
  }
  return context;
}

export async function requireOnboarding() {
  const context = await requireAuth();

  let business = context.business;

  if (!business && context.user.businessId) {
    business = await businessService.getById(context.user.businessId);
  }

  if (!business) {
    business = await businessService.getByOwnerId(context.session.uid);
  }

  if (!business) {
    redirect(routes.onboarding);
  }

  return {
    ...context,
    business,
  };
}
