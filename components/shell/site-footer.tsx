import Link from "next/link";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";
import { CookieSettingsButton } from "@/components/shell/cookie-settings-button";

const popularTools = PDF_TOOLS.filter((t) => t.status === "ready").slice(0, 8);

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-subtle bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo href={routes.home} size={48} />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Free invoice maker and PDF tools. Log in only if you want saved
            history.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Popular tools</h2>
          <ul className="mt-3 space-y-2">
            {popularTools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={routes.tool(tool.slug)}
                  className="text-sm text-muted-foreground transition-colors hover-fine:hover:text-foreground"
                >
                  {tool.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Product</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href={routes.createInvoice}
                className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
              >
                Create invoice
              </Link>
            </li>
            <li>
              <Link
                href={routes.templates}
                className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
              >
                Templates
              </Link>
            </li>
            <li>
              <Link
                href={routes.tools}
                className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
              >
                PDF tools
              </Link>
            </li>
            <li>
              <Link
                href={routes.features}
                className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
              >
                Features
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Legal</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href={routes.privacy}
                className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href={routes.terms}
                className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href={routes.cookies}
                className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
              >
                Cookies
              </Link>
            </li>
            <li>
              <CookieSettingsButton />
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
              >
                {siteConfig.supportEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {siteConfig.name}
          </p>
          <p>Made for UK invoicing and browser PDF tools.</p>
        </div>
      </div>
    </footer>
  );
}
