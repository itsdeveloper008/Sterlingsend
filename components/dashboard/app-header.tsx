"use client";

import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { UserMenu } from "@/components/dashboard/user-menu";
import { routes } from "@/config/routes";

export function AppHeader({ businessName }: { businessName: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Breadcrumbs />
        <span className="hidden h-4 w-px bg-border lg:block" aria-hidden />
        <span className="hidden truncate text-sm text-muted-foreground lg:inline">
          {businessName}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ButtonLink
          href={routes.invoicesNew}
          size="sm"
          className="hidden shadow-xs sm:inline-flex"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New invoice
        </ButtonLink>
        <UserMenu />
      </div>
    </header>
  );
}
