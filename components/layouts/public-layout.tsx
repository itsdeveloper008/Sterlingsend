import Link from "next/link";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/button-link";
import { Logo } from "@/components/design-system/logo";

const navLinks = [
  { href: routes.features, label: "Features" },
  { href: routes.pricing, label: "Pricing" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo href={routes.home} />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink
              variant="ghost"
              href={routes.createInvoice}
              className="hidden sm:inline-flex"
            >
              Create invoice
            </ButtonLink>
            <ButtonLink variant="ghost" href={routes.login}>
              Log in
            </ButtonLink>
            <ButtonLink href={routes.createInvoice} className="shadow-xs">
              Get started
            </ButtonLink>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo href={routes.home} className="text-sm" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
