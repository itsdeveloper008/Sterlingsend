import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSessionCookie,
  revokeSession,
  SESSION_COOKIE_NAME,
  SESSION_EXPIRES_IN_MS,
} from "@/firebase/session";
import { ensureUserDocument } from "@/actions/onboarding.actions";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const sessionCookie = await createSessionCookie(idToken);
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });

    try {
      await ensureUserDocument();
    } catch (ensureError) {
      console.error("[auth/session] ensureUserDocument failed", ensureError);
    }

    return response;
  } catch (error) {
    console.error("[auth/session] POST failed", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const response = NextResponse.json({ success: true });

  if (session) {
    try {
      await revokeSession(session);
    } catch (error) {
      console.error("[auth/session] revoke failed", error);
    }
  }

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
