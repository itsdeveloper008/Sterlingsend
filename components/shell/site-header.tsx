"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/shell/theme-toggle";

const MobileNavSheet = dynamic(
  () =>
    import("@/components/shell/mobile-nav-sheet").then((m) => ({
      default: m.MobileNavSheet,
    })),
  { ssr: false },
);

const NAV = [
  { href: routes.createInvoice, label: "Create invoice" },
  { href: routes.tools, label: "PDF tools" },
  { href: routes.templates, label: "Templates" },
] as const;

function openSiteSearch() {
  window.dispatchEvent(new Event("ss-open-search"));
}

export function SiteHeader({
  onOpenSearch,
}: {
  onOpenSearch?: () => void;
} = {}) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileReady, setMobileReady] = useState(false);
  const openSearch = onOpenSearch ?? openSiteSearch;

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
            onClick={() => openSearch()}
          >
            <Search className="h-4 w-4" />
          </Button>
          <ThemeToggle />

          <div className="hidden min-w-[5.5rem] items-center justify-end gap-1 sm:flex">
            {!loading && user ? (
              <>
                <ButtonLink variant="ghost" href={routes.invoices} size="sm">
                  History
                </ButtonLink>
                <ButtonLink variant="ghost" href={routes.settings} size="sm">
                  Account
                </ButtonLink>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void signOut()}
                >
                  Log out
                </Button>
              </>
            ) : (
              <ButtonLink variant="outline" href={routes.login} size="sm">
                Log in
              </ButtonLink>
            )}
          </div>

          <div className="md:hidden">
            {mobileReady || mobileOpen ? (
              <MobileNavSheet
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                onOpenSearch={openSearch}
                user={user}
                loading={loading}
                onSignOut={() => void signOut()}
              />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                onClick={() => {
                  setMobileReady(true);
                  setMobileOpen(true);
                }}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
