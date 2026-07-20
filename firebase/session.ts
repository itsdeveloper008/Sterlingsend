import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth } from "./admin";
import { SESSION_COOKIE_NAME } from "@/config/routes";

const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSessionCookie(idToken: string) {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });
}

export async function verifySessionCookie(sessionCookie: string) {
  return getAdminAuth().verifySessionCookie(sessionCookie, true);
}

export async function revokeSession(sessionCookie: string) {
  const decoded = await verifySessionCookie(sessionCookie);
  await getAdminAuth().revokeRefreshTokens(decoded.sub);
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    return null;
  }

  try {
    return await verifySessionCookie(session);
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRES_IN_MS };
