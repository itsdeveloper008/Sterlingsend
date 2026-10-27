import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck, Zap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";
import { CookieSettingsButton } from "@/components/shell/cookie-settings-button";
import { TemplateMiniPreview } from "@/features/templates/components/template-mini-preview";
import "@/features/templates/styles/template-preview.css";

const popularTools = PDF_TOOLS.filter((t) => t.status === "ready").slice(0, 6);

const linkClass =
  "text-[15px] text-slate-300 transition-colors hover:text-white";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#071a19] text-slate-300">
      {/* CTA card: real photo with a live template preview floating over it */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[var(--brand-700)] via-[var(--brand-800)] to-[#0b2b29] shadow-[0_30px_80px_-30px_rgba(13,148,136,0.55)]">
          <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                Free · No signup needed
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[2.6rem]">
                Get paid faster with invoices that look the part.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-teal-50/80">
                Pick a template, add your details and download a polished PDF in
                under a minute.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={routes.createInvoice}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[var(--brand-800)] shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Create an invoice
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href={routes.templates}
                  className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Browse templates
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-teal-50/80">
                <li className="inline-flex items-center gap-2">
                  <Zap className="h-4 w-4 text-teal-200" aria-hidden />
                  PDF in seconds
                </li>
                <li className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-200" aria-hidden />
                  Files stay in your browser
                </li>
              </ul>
            </div>

            <div className="relative hidden min-h-[320px] sm:block">
              <div className="absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-white/15">
                <Image
                  src="/marketing/footer-team.jpg"
                  alt="Two colleagues celebrating at a desk with a laptop and paperwork"
                  fill
                  sizes="(min-width: 1024px) 520px, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a19]/60 via-transparent to-transparent" />
              </div>
              {/* Preview renders at a readable width, then scales down into a small card. */}
              <div className="absolute -bottom-4 -left-4 h-[200px] w-[204px] rotate-[-4deg] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
                <div className="w-[340px] origin-top-left scale-[0.6]">
                  <TemplateMiniPreview layoutId="banner" accent="#0D9488" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 pb-14 pt-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo href={routes.home} size={40} showMark={false} tone="onDark" />
          <p className="mt-4 max-w-xs text-[15px] leading-[1.7] text-slate-400">
            Free invoice maker and PDF tools for UK freelancers and small
            businesses. Log in only if you want saved history.
          </p>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-5 inline-flex items-center gap-2 break-all rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-teal-200 ring-1 ring-white/10 transition-colors hover:bg-white/10"
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
