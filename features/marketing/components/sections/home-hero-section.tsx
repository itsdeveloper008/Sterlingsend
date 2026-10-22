"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/button-link";
import { HeroEditableInvoice } from "@/features/marketing/components/hero-editable-invoice";
import { usePointerEffects } from "@/features/marketing/lib/use-pointer-effects";

export function HomeHeroSection() {
  usePointerEffects(true);

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-background">
      <div
        className="ss-float ss-parallax-clay pointer-events-none absolute -left-8 top-16 size-24 rounded-[28%] clay opacity-70"
        aria-hidden
      />
      <div
        className="ss-float ss-parallax-clay pointer-events-none absolute -right-6 bottom-20 size-16 rounded-[32%] clay opacity-50 [animation-delay:1.2s]"
        aria-hidden
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-16">
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {siteConfig.name}
          </p>
          <h1 className="mt-3 type-h1 text-foreground">
            Free invoice maker and PDF tools
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Make UK invoices with VAT, download a PDF, and run PDF tools in your
            browser. No signup needed to create an invoice or use the tools.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span data-ss-magnetic className="inline-block">
              <ButtonLink href={routes.createInvoice} size="lg">
                Create an invoice
              </ButtonLink>
            </span>
            <ButtonLink href={routes.tools} variant="outline" size="lg">
              Browse PDF tools
            </ButtonLink>
          </div>
        </div>
        <div className="min-w-0">
          <div
            data-ss-tilt="hero"
            className="ss-tilt-host rounded-[var(--radius-lg)]"
          >
            <HeroEditableInvoice />
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Try the live sheet, then{" "}
            <Link
              href={routes.createInvoice}
              className="ss-link-underline font-medium"
            >
              open the full builder
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
