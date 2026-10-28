import "server-only";

import { businessService } from "@/services/business.service";
import { userService } from "@/services/user.service";
import { isBusinessProfileComplete } from "@/lib/business-profile";
import type { Business } from "@/types";

export async function getBusinessForUser(uid: string): Promise<Business | null> {
  const user = await userService.getById(uid);
  return (
    (user?.businessId ? await businessService.getById(user.businessId) : null) ??
    (await businessService.getByOwnerId(uid))
  );
}

export async function hasCompleteBusinessProfile(uid: string): Promise<boolean> {
  return isBusinessProfileComplete(await getBusinessForUser(uid));
}
