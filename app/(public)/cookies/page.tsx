import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Cookie Policy - ${siteConfig.name}`,
  description: `Cookie policy for ${siteConfig.name}, UK invoicing software.`,
};

export default function CookiesPage() {
  return (
    <MarketingShell showScrollProgress>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="mt-4 text-sm text-[#64748B]">Last updated: 19 September 2026</p>
        <div className="prose prose-slate mt-10 max-w-none text-[#64748B]">
          <p>
            {siteConfig.name} always uses a session cookie ({`__session`}) to keep
            you signed in. Guest invoice drafts stay in your browser via
            localStorage.
          </p>
          <p className="mt-4">
            If you accept analytics in the cookie banner, we may keep marketing
            UTM parameters (utm_source, utm_medium, utm_campaign, utm_term,
            utm_content) in sessionStorage for the visit and attach them to your
            account when you sign up. Rejecting analytics skips that tracking.
          </p>
          <p className="mt-4">
            Change your choice any time with Cookie settings in the footer.
            Questions? Contact{" "}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="text-[#14B8A6] hover:underline"
            >
              {siteConfig.supportEmail}
            </a>
            .
          </p>
        </div>
      </article>
    </MarketingShell>
  );
}
