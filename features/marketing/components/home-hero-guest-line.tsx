"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";

export function HomeHeroGuestLine() {
  const { user, loading } = useAuth();
  if (loading || user) return null;

  return (
    <p className="mt-8 text-center text-[15px] text-[var(--secondary-text)]">
      Want to keep a history of invoices you create?{" "}
      <Link
        href={routes.login}
        className="font-semibold text-[var(--brand-700)] underline-offset-2 hover:underline"
      >
        Log in
      </Link>
    </p>
  );
}
