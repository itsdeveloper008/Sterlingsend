import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How SterlingSend uses Firebase Authentication and Firestore, browser storage, and your rights under UK GDPR. Contact support@sterlingsend.com.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <MarketingShell showScrollProgress>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 print:py-8 lg:py-24">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 print:border-black print:bg-transparent">
          A solicitor must review this page before you rely on it for launch.
        </p>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[var(--secondary-text)]">
          Last updated: 22 October 2026
        </p>
        <div className="mt-10 space-y-6 text-[var(--body-text)]">
          <p>
            {siteConfig.name} is a UK invoice and PDF tools product hosted on
            Vercel. Contact:{" "}
            <a className="underline" href={`mailto:${siteConfig.supportEmail}`}>
              {siteConfig.supportEmail}
            </a>
            .
          </p>
          <h2 className="text-lg font-semibold text-foreground">Data we process</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Account data via Firebase Authentication (email, Google sign-in
              profile when you choose Google).
            </li>
            <li>
              Saved invoices and business details in Cloud Firestore when you are
              logged in.
            </li>
            <li>
              Browser storage keys under <code>ss_*</code> (and legacy{" "}
              <code>valix_*</code> read once then migrated): invoice drafts, theme,
              onboarding skip, guest PDF rate limits, pending invoice after login.
            </li>
            <li>
              Session cookie <code>__session</code> to keep you signed in.
            </li>
            <li>
              After cookie consent for analytics, UTM parameters may be stored in
              sessionStorage and attached on sign-up. We do not load a third-party
              analytics product today.
            </li>
            <li>
              Translate PDF and related tools may send files you choose to our
              server routes for processing. OCR language data may be downloaded in
              the browser when you use OCR.
            </li>
          </ul>
          <h2 className="text-lg font-semibold text-foreground">Payments</h2>
          <p>
            Online payments are not currently offered. Payment-related code may
            exist but stays off while payments are disabled.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Retention</h2>
          <p>
            Saved invoices stay until you delete them or ask us to delete your
            account data. There is no self-serve account deletion yet. Email{" "}
            {siteConfig.supportEmail} to request deletion.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>
            Under UK GDPR you can ask for access, correction, deletion, and
            restriction where applicable. You can complain to the Information
            Commissioner&apos;s Office (ICO).
          </p>
        </div>
      </article>
    </MarketingShell>
  );
}
