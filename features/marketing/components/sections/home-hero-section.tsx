"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { HeroEditableInvoice } from "@/features/marketing/components/hero-editable-invoice";
import { usePointerEffects } from "@/features/marketing/lib/use-pointer-effects";

export function HomeHeroSection() {
  usePointerEffects(true);

  return (
    <section className="ss-section relative border-b border-border-subtle bg-background">
      <div
        className="ss-float pointer-events-none absolute left-6 top-24 size-20 rounded-[28%] clay opacity-60 sm:left-10"
        aria-hidden
      />
      <div
        className="ss-float pointer-events-none absolute bottom-28 right-8 size-14 rounded-[32%] clay opacity-45 [animation-delay:1.2s] sm:right-16"
        aria-hidden
      />

      <div className="bonsai-container relative grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="flex flex-col justify-center lg:col-span-5">
          <h1 className="bonsai-h1">Free invoice maker and PDF tools</h1>
          <p className="bonsai-lead mt-5 max-w-md text-[1.125rem]">
            Create UK invoices with VAT and download a PDF. Use PDF tools in
            your browser with no signup needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={routes.createInvoice} className="bonsai-btn-primary">
              Create an invoice
            </Link>
            <Link href={routes.tools} className="bonsai-btn-secondary">
              Browse PDF tools
            </Link>
          </div>
          <p className="mt-4 text-[0.9375rem] text-[var(--secondary-text)]">
            No signup needed. Log in only if you want your invoices saved.
          </p>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <HeroEditableInvoice />
        </div>
      </div>
    </section>
  );
}
