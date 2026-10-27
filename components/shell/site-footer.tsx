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
    <footer
      className="mt-auto bg-[var(--surface-muted)]"
      style={{ borderTop: "1px solid var(--border-decorative)" }}
    >
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-4 pb-12 pt-24 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo href={routes.home} size={40} showMark={false} />
          <p className="ss-measure mt-4 text-[15px] leading-[1.7] text-[var(--secondary-text)]">
            Free invoice maker and PDF tools. Log in only if you want saved
            history.
          </p>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-4 inline-block break-all text-[15px] font-semibold text-[var(--brand-700)] hover:underline"
          >
            {siteConfig.supportEmail}
          </a>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Product</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link
                href={routes.createInvoice}
                className="text-[15px] text-[var(--secondary-text)] hover:text-[var(--ink)]"
              >
                Create invoice
              </Link>
            </li>
            <li>
              <Link
                href={routes.templates}
                className="text-[15px] text-[var(--secondary-text)] hover:text-[var(--ink)]"
              >
                Templates
              </Link>
            </li>
            <li>
              <Link
                href={routes.tools}
                className="text-[15px] text-[var(--secondary-text)] hover:text-[var(--ink)]"
              >
                PDF tools
              </Link>
            </li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Popular tools
          </h2>
          <ul className="mt-4 space-y-2.5">
            {popularTools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={routes.tool(tool.slug)}
                  className="text-[15px] text-[var(--secondary-text)] hover:text-[var(--ink)]"
                >
                  {tool.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Legal</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link
                href={routes.privacy}
                className="text-[15px] text-[var(--secondary-text)] hover:text-[var(--ink)]"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href={routes.terms}
                className="text-[15px] text-[var(--secondary-text)] hover:text-[var(--ink)]"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href={routes.cookies}
                className="text-[15px] text-[var(--secondary-text)] hover:text-[var(--ink)]"
              >
                Cookies
              </Link>
            </li>
            <li>
              <CookieSettingsButton />
            </li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-decorative)" }}>
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-5 text-[13px] text-[var(--secondary-text)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {siteConfig.name}
          </p>
          <p>Made for UK invoicing and browser PDF tools.</p>
        </div>
      </div>
    </footer>
  );
}
