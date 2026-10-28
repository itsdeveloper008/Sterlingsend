"use server";

import { getServerSession } from "@/firebase/session";
import { isAdminSession } from "@/services/admin.service";

/** Whether the current session cookie belongs to an admin. */
export async function checkAdminSession(): Promise<boolean> {
  const session = await getServerSession();
  return Boolean(session && isAdminSession(session));
}
