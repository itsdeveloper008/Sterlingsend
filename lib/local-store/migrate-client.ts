"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { migrateLocalWorkspaceAction } from "@/actions/migrate-local.actions";
import { routes } from "@/config/routes";
import {
  clearLocalWorkspace,
  clearPendingMigrationFlag,
  getLocalWorkspaceSnapshot,
  hasLocalWorkspaceData,
  isPendingMigration,
  markPendingMigration,
} from "@/lib/local-store";

/**
 * Runs after a successful session cookie is created.
 * Auto-merges local guest data into Firestore (never overwrites existing docs).
 * If the account has no business yet, marks pending migration and returns onboarding path.
 */
export async function runLocalWorkspaceMigration(): Promise<{
  redirectHint?: string;
  migrated: boolean;
}> {
  if (typeof window === "undefined") {
    return { migrated: false };
  }

  if (!hasLocalWorkspaceData() && !isPendingMigration()) {
    return { migrated: false };
  }

  const snapshot = getLocalWorkspaceSnapshot();
  const result = await migrateLocalWorkspaceAction(snapshot);

  if (!result.success) {
    toast.error(result.error);
    return { migrated: false };
  }

  if (result.needsOnboarding) {
    markPendingMigration();
    return { redirectHint: routes.onboarding, migrated: false };
  }

  clearLocalWorkspace();
  clearPendingMigrationFlag();

  const { customers, invoices, branding } = result.migrated;
  if (customers || invoices || branding) {
    toast.success(
      `Saved to your account: ${customers} customer(s), ${invoices} invoice(s)`,
    );
  }

  return { migrated: true };
}

/** Call after onboarding creates a business so pending local data can import. */
export async function flushPendingLocalMigration() {
  if (typeof window === "undefined") return;
  if (!isPendingMigration() && !hasLocalWorkspaceData()) return;
  await runLocalWorkspaceMigration();
}

/** Hook: after auth becomes available, flush pending migration once. */
export function useFlushPendingMigration(enabled: boolean) {
  const ran = useRef(false);
  const flush = useCallback(async () => {
    if (ran.current) return;
    if (!enabled) return;
    if (!isPendingMigration() && !hasLocalWorkspaceData()) return;
    ran.current = true;
    await runLocalWorkspaceMigration();
  }, [enabled]);

  useEffect(() => {
    void flush();
  }, [flush]);
}
