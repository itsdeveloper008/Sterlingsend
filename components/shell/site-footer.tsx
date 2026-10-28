import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";
import { CookieSettingsButton } from "@/components/shell/cookie-settings-button";

const popularTools = PDF_TOOLS.filter((t) => t.status === "ready").slice(0, 6);

const linkClass =
  "text-[15px] text-slate-300 transition-colors hover:text-white";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#06222a] text-slate-300">
      {/* Closing call to action: plain and direct. */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-20 sm:px-6">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[2.5rem]">
              Your next invoice, done in two minutes.
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-400">
              Free to use. No account needed until you want to keep a history.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href={routes.createInvoice}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3FC1C9] px-6 py-3 text-[15px] font-semibold text-[#06222a] transition-colors hover:bg-[#6FD9DD]"
            >
              Create an invoice
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={routes.tools}
              className="inline-flex items-center rounded-lg px-4 py-3 text-[15px] font-semibold text-white underline-offset-4 hover:underline"
            >
              PDF tools
            </Link>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 pb-14 pt-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo href={routes.home} size={40} showMark={false} tone="onDark" />
          <p className="mt-4 max-w-xs text-[15px] leading-[1.7] text-slate-400">
            Free invoice maker and PDF tools for UK freelancers and small
            businesses. Log in only if you want saved history.
          </p>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-5 inline-flex items-center gap-2 break-all rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-teal-200 ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {siteConfig.supportEmail}
          </a>
        </div>

        <nav aria-label="Product">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
            Product
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href={routes.createInvoice} className={linkClass}>
                Create invoice
              </Link>
            </li>
            <li>
              <Link href={routes.templates} className={linkClass}>
                Templates
              </Link>
            </li>
            <li>
              <Link href={routes.tools} className={linkClass}>
                PDF tools
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Popular tools">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
            Popular tools
          </h2>
          <ul className="mt-5 space-y-3">
            {popularTools.map((tool) => (
              <li key={tool.slug}>
                <Link href={routes.tool(tool.slug)} className={linkClass}>
                  {tool.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
            Legal
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href={routes.privacy} className={linkClass}>
                Privacy
              </Link>
            </li>
            <li>
              <Link href={routes.terms} className={linkClass}>
                Terms
              </Link>
            </li>
            <li>
              <Link href={routes.cookies} className={linkClass}>
                Cookies
              </Link>
            </li>
            <li>
              <CookieSettingsButton className="text-[15px] text-slate-300 hover-fine:hover:text-white" />
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-6 text-[13px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Made for UK invoicing and browser PDF tools.</p>
        </div>
      </div>
    </footer>
  );
}
