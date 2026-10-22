"use client";

import Link from "next/link";
import { History, LogOut, Menu, Search, Settings, X } from "lucide-react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import type { AuthUser } from "@/providers/auth-provider";

const NAV = [
  { href: routes.createInvoice, label: "Create invoice" },
  { href: routes.tools, label: "PDF tools" },
  { href: routes.templates, label: "Templates" },
] as const;

export function MobileNavSheet({
  open,
  onOpenChange,
  onOpenSearch,
  user,
  loading,
  onSignOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSearch?: () => void;
  user: AuthUser | null;
  loading: boolean;
  onSignOut: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          />
        }
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm p-0">
        <SheetHeader className="border-b border-border-subtle px-4 py-4">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center rounded-[var(--radius-md)] px-3 text-sm font-medium text-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-left text-sm font-medium hover:bg-muted"
            onClick={() => {
              onOpenChange(false);
              onOpenSearch?.();
            }}
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
          <div className="flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <div className="my-2 h-px bg-border-subtle" />
          {!loading && user ? (
            <>
              <Link
                href={routes.invoices}
                className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium hover:bg-muted"
                onClick={() => onOpenChange(false)}
              >
                <History className="h-4 w-4" aria-hidden />
                History
              </Link>
              <Link
                href={routes.account}
                className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium hover:bg-muted"
                onClick={() => onOpenChange(false)}
              >
                <Settings className="h-4 w-4" aria-hidden />
                Account
              </Link>
              <button
                type="button"
                className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-left text-sm font-medium hover:bg-muted"
                onClick={() => {
                  onOpenChange(false);
                  onSignOut();
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Log out
              </button>
            </>
          ) : (
            <ButtonLink
              href={routes.login}
              className="mt-1"
              onClick={() => onOpenChange(false)}
            >
              Log in
            </ButtonLink>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
