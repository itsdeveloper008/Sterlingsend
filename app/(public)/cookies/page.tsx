import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How SterlingSend uses cookies and browser storage: the __session login cookie, ss_* settings in your browser, and optional UTM capture only after you consent.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <MarketingShell showScrollProgress>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 print:py-8 lg:py-24">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 print:border-black print:bg-transparent">
          A solicitor must review this page before you rely on it for launch.
        </p>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="mt-3 text-sm text-[var(--secondary-text)]">
          Last updated: 22 October 2026
        </p>
        <div className="mt-10 space-y-6 text-[var(--body-text)]">
          <p>
            {siteConfig.name} uses a session cookie named <code>__session</code>{" "}
            so you stay signed in. That cookie is needed for logged-in features.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Browser storage</h2>
          <p>
            Guest drafts, theme, onboarding skip, and similar preferences use{" "}
            <code>ss_*</code> keys in localStorage or sessionStorage.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Analytics choice</h2>
          <p>
            If you accept analytics in the cookie banner, we may keep marketing
            UTM parameters in sessionStorage for the visit and attach them when
            you sign up. Rejecting analytics skips that. We do not load a
            third-party analytics script today.
          </p>
          <p>
            Questions:{" "}
            <a className="underline" href={`mailto:${siteConfig.supportEmail}`}>
              {siteConfig.supportEmail}
            </a>
            .
          </p>
        </div>
      </article>
    </MarketingShell>
  );
}
