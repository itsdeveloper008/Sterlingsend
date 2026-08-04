"use client";

import { usePathname } from "next/navigation";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { routes } from "@/config/routes";

export function AuthRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login uses its own full-bleed character layout.
  if (pathname === routes.login) {
    return <>{children}</>;
  }

  return <AuthLayout>{children}</AuthLayout>;
}
