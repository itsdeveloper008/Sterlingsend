"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";
import { HeroEditableInvoice } from "@/features/marketing/components/hero-editable-invoice";
import { usePointerEffects } from "@/features/marketing/lib/use-pointer-effects";

export function HomeHeroSection() {
  usePointerEffects(true);
  const toolCount = PDF_TOOLS.length;

  return (
    <section className="home-hero relative overflow-x-hidden bg-[#F0FDFA] py-[88px] pb-24 dark:bg-[#0B1220]">
      <div className="bonsai-container relative grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="flex flex-col justify-center lg:col-span-5">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[#0F172A] dark:text-white">
            Free invoice maker and PDF tools
          </h1>
          <p className="mt-5 max-w-[480px] text-[19px] leading-relaxed text-[#334155] dark:text-[#CBD5E1]">
            Make a UK invoice with VAT, download it as a PDF, and use {toolCount}{" "}
            PDF tools without creating an account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={routes.createInvoice}
              className="inline-flex h-[52px] items-center justify-center rounded-xl bg-[#0F766E] px-6 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(15,118,110,.25)] transition-transform hover:-translate-y-0.5"
            >
              Create an invoice
            </Link>
            <Link
              href={routes.tools}
              className="inline-flex h-[52px] items-center justify-center rounded-xl border-[1.5px] border-[#94A3B8] bg-white px-6 text-[15px] font-bold text-[#0F172A] transition-transform hover:-translate-y-0.5 dark:bg-[#13202F] dark:text-[#F8FAFC]"
            >
              Browse PDF tools
            </Link>
          </div>
          <p className="mt-4 text-[15px] text-[#475569] dark:text-[#94A3B8]">
            No signup needed. Log in only if you want your invoices saved.
          </p>
        </div>

        <div className="relative min-w-0 lg:col-span-7">
          <div
            className="pointer-events-none absolute left-[8%] top-[6%] size-[150px] rounded-[32px] bg-[#CCFBF1] shadow-[0_18px_30px_rgba(15,23,42,.1),inset_0_4px_0_#fff,inset_0_-14px_24px_rgba(15,118,110,.18)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[10%] right-[4%] size-[110px] rounded-[32px] bg-[#A7F3D0] shadow-[0_18px_30px_rgba(15,23,42,.1),inset_0_4px_0_#fff,inset_0_-14px_24px_rgba(15,118,110,.18)]"
            aria-hidden
          />
          <HeroEditableInvoice />
        </div>
      </div>
    </section>
  );
}
