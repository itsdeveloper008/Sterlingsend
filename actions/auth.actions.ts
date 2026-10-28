"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { PATHNAME_HEADER, SESSION_COOKIE_NAME } from "@/config/routes";
import { userService } from "@/services/user.service";
import { businessService } from "@/services/business.service";
import { routes } from "@/config/routes";
import { isBusinessProfileComplete } from "@/lib/business-profile";

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
    const back = (await headers()).get(PATHNAME_HEADER);
    const params = new URLSearchParams();
    if (hasSessionCookie) params.set("clearSession", "1");
    if (back) params.set("redirect", back);
    const query = params.toString();
    redirect(query ? `${routes.login}?${query}` : routes.login);
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

  if (!business || !isBusinessProfileComplete(business)) {
    const back = (await headers()).get(PATHNAME_HEADER);
    redirect(
      back
        ? `${routes.onboarding}?redirect=${encodeURIComponent(back)}`
        : routes.onboarding,
    );
  }

  return {
    ...context,
    business,
  };
}
