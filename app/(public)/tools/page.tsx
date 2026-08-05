import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/features/marketing";
import { ToolsCatalog } from "@/features/pdf-tools";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "PDF Tools",
  description:
    "Merge, split, compress, convert, OCR, sign, and protect PDFs in your browser. No account required.",
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/tools",
  },
};

export default function PublicToolsPage() {
  return (
    <MarketingShell>
      <div className="border-b border-border/70 bg-gradient-to-b from-primary/5 to-background">
        <div className="bonsai-container py-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Free · No login required
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            PDF Tools
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            All 29 tools run privately in your browser. Create an account only
            if you want to save invoices, customers, and payment history.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Want to keep your work?{" "}
            <Link
              href={routes.signup}
              className="font-semibold text-primary hover:underline"
            >
              Create a free account
            </Link>{" "}
            or{" "}
            <Link
              href={routes.login}
              className="font-semibold text-primary hover:underline"
            >
              log in
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="bonsai-container py-8 sm:py-10">
        <ToolsCatalog />
      </div>
    </MarketingShell>
  );
}
