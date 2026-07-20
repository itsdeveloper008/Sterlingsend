import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Terms of Service - ${siteConfig.name}`,
  description: `Terms of service for ${siteConfig.name}, UK invoicing software.`,
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-[#64748B]">Last updated: 9 July 2026</p>
        <div className="prose prose-slate mt-10 max-w-none text-[#64748B]">
          <p>
            By using {siteConfig.name}, you agree to these terms. This page will
            be updated with full terms covering account usage, invoicing features,
            payment processing via Stripe, and acceptable use of Guest Mode.
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
