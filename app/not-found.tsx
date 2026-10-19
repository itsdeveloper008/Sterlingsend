import Link from "next/link";
import { routes } from "@/config/routes";
import { SkipLink, SiteFooter, SiteHeader } from "@/components/shell";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold text-[var(--brand-700)]">404</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          That URL does not match a SterlingSend page. Create an invoice, browse
          PDF tools, or search the site.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={routes.createInvoice}>Create an invoice</ButtonLink>
          <ButtonLink href={routes.tools} variant="outline">
            Browse PDF tools
          </ButtonLink>
          <ButtonLink href={routes.home} variant="ghost">
            Home
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Tip: press{" "}
          <kbd className="rounded border border-border-ui px-1.5 py-0.5 text-xs">
            /
          </kbd>{" "}
          or{" "}
          <kbd className="rounded border border-border-ui px-1.5 py-0.5 text-xs">
            Cmd
          </kbd>
          +
          <kbd className="rounded border border-border-ui px-1.5 py-0.5 text-xs">
            K
          </kbd>{" "}
          to search. Or go to{" "}
          <Link href={routes.home} className="font-medium underline-offset-2 hover:underline">
            the homepage
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
