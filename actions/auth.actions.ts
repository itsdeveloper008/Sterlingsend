"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { SESSION_COOKIE_NAME } from "@/config/routes";
import { userService } from "@/services/user.service";
import { businessService } from "@/services/business.service";
import { routes } from "@/config/routes";

export async function getCurrentUserContext() {
  const session = await getServerSession();
  if (!session) return null;

  let user = await userService.getById(session.uid);
  if (!user) {
    await userService.create({
      id: session.uid,
      email: session.email ?? "",
      displayName: session.name ?? "",
    });
    user = await userService.getById(session.uid);
  }

  if (!user) return null;

  const business = user.businessId
    ? await businessService.getById(user.businessId)
    : await businessService.getByOwnerId(session.uid);

  return { session, user, business };
}

export async function requireAuth() {
  const cookieStore = await cookies();
  const hasSessionCookie = Boolean(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
  );
  const context = await getCurrentUserContext();

  if (!context) {
    redirect(
      hasSessionCookie ? `${routes.login}?clearSession=1` : routes.login,
    );
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
