import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description: `Privacy policy for ${siteConfig.name}, UK invoicing software.`,
};

export default function PrivacyPage() {
  return (
    <MarketingShell showScrollProgress>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-[#64748B]">Last updated: 19 September 2026</p>
        <div className="prose prose-slate mt-10 max-w-none text-[#64748B]">
          <p>
            A solicitor should review this policy before you rely on it. This draft
            describes how {siteConfig.name} handles data today.
          </p>
          <p className="mt-4">
            We use Firebase Authentication and Firestore to store accounts and
            saved invoices when you log in. Guest drafts and theme preference stay
            in your browser (localStorage). A session cookie keeps you signed in.
          </p>
          <p className="mt-4">
            If you accept analytics in the cookie banner, we may store marketing
            UTM parameters (utm_source, utm_medium, utm_campaign, utm_term,
            utm_content) in sessionStorage for the visit and attach them to your
            user record when you sign up. Rejecting analytics skips that tracking.
            We do not load a third-party analytics product.
          </p>
          <p className="mt-4">
            Online payment features are not currently offered. Stripe-related code
            may remain in the codebase but is not active while payments are off.
          </p>
          <p className="mt-4">
            Questions? Contact us at{" "}
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
