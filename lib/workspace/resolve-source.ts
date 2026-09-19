import { getServerSession } from "@/firebase/session";
import { getCurrentUserContext } from "@/actions/auth.actions";

export type WorkspaceSource = "local" | "cloud";

/**
 * Server-side workspace mode for dashboard pages.
 * Guests and logged-in users without a business use localStorage.
 */
export async function resolveWorkspaceSource(): Promise<{
  source: WorkspaceSource;
  businessId?: string;
  currency?: string;
}> {
  const session = await getServerSession();
  if (!session) {
    return { source: "local" };
  }

  const context = await getCurrentUserContext();
  if (!context?.business) {
    return { source: "local" };
  }

  return {
    source: "cloud",
    businessId: context.business.id,
    currency: context.business.currency,
  };
}
