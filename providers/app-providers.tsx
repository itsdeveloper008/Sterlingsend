"use client";

import { Suspense } from "react";
import { AuthProvider } from "./auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteProgress, SessionLoader } from "@/components/shell";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <SessionLoader />
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
        {/* Bottom-right, clear of the page content and of the floating contact
            button (right-4), and above the cookie banner while it shows; on phones,
            above the builder's bottom bar. */}
        <Toaster
          richColors
          position="bottom-right"
          offset={{
            bottom: "calc(24px + var(--cookie-banner-h, 0px))",
            right: 76,
          }}
          mobileOffset={{ bottom: "calc(88px + var(--cookie-banner-h, 0px))" }}
          visibleToasts={3}
        />
      </TooltipProvider>
    </AuthProvider>
  );
}
