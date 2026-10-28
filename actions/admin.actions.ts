"use server";

import { getServerSession } from "@/firebase/session";
import { getAdminPanelPath } from "@/config/admin";
import { isAdminSession } from "@/services/admin.service";

/** The admin panel's secret path for the signed-in admin; null for everyone else. */
export async function getAdminPanelLink(): Promise<string | null> {
  const session = await getServerSession();
  if (!session || !isAdminSession(session)) return null;
  return getAdminPanelPath();
}
