"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Wrench } from "lucide-react";
import { routes } from "@/config/routes";
import { HeroEditableInvoice } from "@/features/marketing/components/hero-editable-invoice";
import { useAuth } from "@/hooks/use-auth";
import "@/features/marketing/styles/hero-sheet.css";

export function HomeHeroSection() {
  const { user, loading } = useAuth();
  const isGuest = !loading && !user;

  return (
    <section className="home-hero relative overflow-x-hidden">
      <div className="home-hero-inner mx-auto flex w-full max-w-[980px] flex-col items-center px-4 pb-20 pt-[72px] sm:px-6">
        <p className="home-hero-brand" aria-label="SterlingSend">
          Sterling<span>Send</span>
        </p>
        <p className="home-hero-chip">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Invoicing + PDF toolkit
        </p>
        <h1 className="home-hero-h1">
          Invoices and every PDF tool you need, in one place
        </h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={routes.createInvoice} className="home-hero-btn-primary">
            Start invoicing
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href={routes.tools} className="home-hero-btn-secondary">
            <Wrench className="h-4 w-4" aria-hidden />
            Explore PDF tools
          </Link>
        </div>

        <div className="home-hero-sheet-wrap mt-14 w-full">
          <HeroEditableInvoice />
        </div>

        {isGuest ? (
          <p className="mt-6 text-center text-sm text-[#475569]">
            Want to keep a history of invoices you create?{" "}
            <Link
              href={routes.login}
              className="font-bold text-[#0F766E] underline-offset-2 hover:underline"
            >
              Log in
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
