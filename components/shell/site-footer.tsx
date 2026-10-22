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
    <footer className="mt-auto border-t border-[#E2E8F0] bg-[#F8FAFC] dark:border-[#1E293B] dark:bg-[#0F1A28]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo href={routes.home} size={48} showMark={false} />
          <p className="mt-3 max-w-xs text-[15px] text-[#475569] dark:text-[#CBD5E1]">
            Free invoice maker and PDF tools. Log in only if you want saved
            history.
          </p>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-3 inline-block break-all text-[15px] font-semibold text-[#0F766E] hover:underline"
          >
            {siteConfig.supportEmail}
          </a>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">
            Product
          </h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href={routes.createInvoice}
                className="text-[15px] text-[#475569] hover:text-[#0F172A] dark:text-[#CBD5E1]"
              >
                Create invoice
              </Link>
            </li>
            <li>
              <Link
                href={routes.templates}
                className="text-[15px] text-[#475569] hover:text-[#0F172A] dark:text-[#CBD5E1]"
              >
                Templates
              </Link>
            </li>
            <li>
              <Link
                href={routes.tools}
                className="text-[15px] text-[#475569] hover:text-[#0F172A] dark:text-[#CBD5E1]"
              >
                PDF tools
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">
            Popular tools
          </h2>
          <ul className="mt-3 space-y-2">
            {popularTools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={routes.tool(tool.slug)}
                  className="text-[15px] text-[#475569] hover:text-[#0F172A] dark:text-[#CBD5E1]"
                >
                  {tool.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">
            Legal
          </h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href={routes.privacy}
                className="text-[15px] text-[#475569] hover:text-[#0F172A] dark:text-[#CBD5E1]"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href={routes.terms}
                className="text-[15px] text-[#475569] hover:text-[#0F172A] dark:text-[#CBD5E1]"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href={routes.cookies}
                className="text-[15px] text-[#475569] hover:text-[#0F172A] dark:text-[#CBD5E1]"
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

      <div className="border-t border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-[#475569] sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-[#94A3B8]">
          <p>
            © {year} {siteConfig.name}
          </p>
          <p>Made for UK invoicing and browser PDF tools.</p>
        </div>
      </div>
    </footer>
  );
}
