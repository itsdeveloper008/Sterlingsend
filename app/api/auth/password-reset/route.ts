import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase/admin";

import type { PasswordResetCheck } from "@/features/auth/lib/password-reset";

/**
 * Says whether a reset email can actually be sent. Firebase reports success
 * even when no account exists, which left people waiting for an email that
 * never came.
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    // fall through to the validation error
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const user = await getAdminAuth().getUserByEmail(email);
    const providers = user.providerData.map((p) => p.providerId);
    const status: PasswordResetCheck =
      providers.includes("password") || providers.length === 0
        ? "ok"
        : "google-only";
    return NextResponse.json({ status });
  } catch (error) {
    if ((error as { code?: string }).code === "auth/user-not-found") {
      return NextResponse.json({ status: "no-account" satisfies PasswordResetCheck });
    }
    console.error("[auth/password-reset]", error);
    return NextResponse.json(
      { error: "Could not check that email. Please try again." },
      { status: 503 },
    );
  }
}
