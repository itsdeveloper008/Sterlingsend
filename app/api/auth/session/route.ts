import { NextResponse } from "next/server";
import {
  createSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_EXPIRES_IN_MS,
} from "@/firebase/session";
import { getAdminAuth } from "@/firebase/admin";
import { userService } from "@/services/user.service";
import { businessService } from "@/services/business.service";
import { routes } from "@/config/routes";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const sessionCookie = await createSessionCookie(idToken);

    let user = await userService.getById(decoded.uid);
    if (!user) {
      await userService.create({
        id: decoded.uid,
        email: decoded.email ?? "",
        displayName: decoded.name ?? "",
      });
      user = await userService.getById(decoded.uid);
    }

    const business = user?.businessId
      ? await businessService.getById(user.businessId)
      : await businessService.getByOwnerId(decoded.uid);

    const redirectTo = business ? routes.dashboard : routes.onboarding;

    const response = NextResponse.json({ success: true, redirectTo });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });

    return response;
  } catch (error) {
    console.error("[auth/session] POST failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to create session";
    const status = message.includes("Firebase Admin is not configured")
      ? 503
      : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
