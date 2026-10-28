"use client";

import { useEffect, useState } from "react";
import { getAdminPanelLink } from "@/actions/admin.actions";
import { useAuth } from "@/hooks/use-auth";

/** Admin panel link for the signed-in admin (asked once per user), else null. */
export function useAdminLink(): string | null {
  const { user } = useAuth();
  const uid = user?.uid;
  const [link, setLink] = useState<{ uid: string; href: string | null } | null>(
    null,
  );

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    void getAdminPanelLink()
      .then((href) => {
        if (!cancelled) setLink({ uid, href });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return uid && link?.uid === uid ? link.href : null;
}
