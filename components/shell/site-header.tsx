"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LogOut, Menu, Search, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/shell/theme-toggle";

const NAV = [
  { href: routes.createInvoice, label: "Create invoice" },
  { href: routes.tools, label: "PDF tools" },
  { href: routes.templates, label: "Templates" },
] as const;

export function SiteHeader({
  onOpenSearch,
}: {
  onOpenSearch?: () => void;
}) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent transition-[background-color,box-shadow,border-color] duration-[var(--duration-200)] ease-[var(--ease)]",
        scrolled
          ? "glass border-border-subtle shadow-[var(--shadow-1)]"
          : "bg-background",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 md:h-16 sm:px-6">
        <Logo href={routes.home} size={44} />

        <nav
          className="ml-4 hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "ss-link-underline rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-[color,background-color] duration-[var(--duration-150)]",
                  active
                    ? "text-[var(--brand-700)]"
                    : "text-muted-foreground hover-fine:hover:bg-muted hover-fine:hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Search"
            onClick={() => onOpenSearch?.()}
          >
            <Search className="h-4 w-4" />
          </Button>
          <ThemeToggle />

          {!loading && user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <ButtonLink variant="ghost" href={routes.invoices} size="sm">
                History
              </ButtonLink>
              <ButtonLink variant="ghost" href={routes.settings} size="sm">
                Account
              </ButtonLink>
              <Button type="button" variant="ghost" size="sm" onClick={() => signOut()}>
                Log out
              </Button>
            </div>
          ) : (
            <ButtonLink
              variant="outline"
              href={routes.login}
              size="sm"
              className="hidden sm:inline-flex"
            >
              Log in
            </ButtonLink>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                />
              }
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
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
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-left text-sm font-medium hover:bg-muted"
                  onClick={() => {
                    setMobileOpen(false);
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
                      onClick={() => setMobileOpen(false)}
                    >
                      <History className="h-4 w-4" aria-hidden />
                      History
                    </Link>
                    <Link
                      href={routes.settings}
                      className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium hover:bg-muted"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Settings className="h-4 w-4" aria-hidden />
                      Account
                    </Link>
                    <button
                      type="button"
                      className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-left text-sm font-medium hover:bg-muted"
                      onClick={() => {
                        setMobileOpen(false);
                        void signOut();
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
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in
                  </ButtonLink>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
