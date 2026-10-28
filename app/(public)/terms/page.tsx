import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using SterlingSend's invoice generator and PDF tools, covering guest use, accounts and acceptable use. Questions? Contact info@sterlingsend.com.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <MarketingShell showScrollProgress>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 print:py-8 lg:py-24">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 print:border-black print:bg-transparent">
          A solicitor must review this page before you rely on it for launch.
        </p>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-[var(--secondary-text)]">
          Last updated: 22 October 2026
        </p>
        <div className="mt-10 space-y-6 text-[var(--body-text)]">
          <p>
            By using {siteConfig.name} you agree to these terms. The service
            includes a free invoice builder, PDF tools, and optional accounts for
            saved invoice history.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Accounts</h2>
          <p>
            You must provide accurate details when you create an account. You are
            responsible for activity under your login. Google sign-in is offered
            through Firebase Authentication.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <p>
            Do not misuse the tools to harm others, break the law, or overload the
            service. Guest PDF generation may be rate limited.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Payments</h2>
          <p>Online payments are not currently offered on the product.</p>
          <h2 className="text-lg font-semibold text-foreground">Liability</h2>
          <p>
            The service is provided as available. Calculators and guides are
            information only, not legal or tax advice. Contact{" "}
            {siteConfig.supportEmail} with questions.
          </p>
        </div>
      </article>
    </MarketingShell>
  );
}
