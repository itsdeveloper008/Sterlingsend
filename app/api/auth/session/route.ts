import { NextResponse } from "next/server";
import {
  createSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_EXPIRES_IN_MS,
} from "@/firebase/session";
import { getAdminAuth } from "@/firebase/admin";
import { userService } from "@/services/user.service";
import { routes } from "@/config/routes";
import type { DecodedIdToken } from "firebase-admin/auth";

function isRetriableNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket disconnected|network|TLS|UNAVAILABLE|deadline/i.test(
    message,
  );
}

async function verifyIdTokenWithRetry(
  idToken: string,
  attempts = 3,
): Promise<DecodedIdToken> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await getAdminAuth().verifyIdToken(idToken);
    } catch (error) {
      lastError = error;
      if (!isRetriableNetworkError(error) || attempt === attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}

function sessionErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Failed to create session";
  if (isRetriableNetworkError(error)) {
    return "Could not reach Firebase to start your session. Check your connection and try again.";
  }
  if (message.includes("Firebase Admin is not configured")) {
    return message;
  }
  if (/argument-error|invalid|id.?token/i.test(message)) {
    return "Sign-in token was invalid or expired. Please try Google sign-in again.";
  }
  return message;
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await verifyIdTokenWithRetry(idToken);
    const sessionCookie = await createSessionCookie(idToken);

    const user = await userService.getById(decoded.uid);
    if (!user) {
      await userService.create({
        id: decoded.uid,
        email: decoded.email ?? "",
        displayName: decoded.name ?? "",
      });
    }

    // Always land on the marketing home after login — never the dashboard.
    // Login/signup can still honor a `?redirect=` query param client-side.
    const redirectTo = routes.home;

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
    const message = sessionErrorMessage(error);
    const status = message.includes("Firebase Admin is not configured")
      ? 503
      : message.includes("Could not reach Firebase")
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
