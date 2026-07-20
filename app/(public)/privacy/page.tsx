import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description: `Privacy policy for ${siteConfig.name}, UK invoicing software.`,
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-[#64748B]">Last updated: 9 July 2026</p>
        <div className="prose prose-slate mt-10 max-w-none text-[#64748B]">
          <p>
            {siteConfig.name} respects your privacy. This page will be updated with
            our full privacy policy covering data collection, Firebase authentication,
            Firestore storage, Stripe payment processing, and guest-mode localStorage
            usage.
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
