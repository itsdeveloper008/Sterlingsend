import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { routes } from "@/config/routes";
import { HeroInvoicePreview } from "@/features/marketing/components/hero-invoice-preview";
import { HomeHeroGuestLine } from "@/features/marketing/components/home-hero-guest-line";
import "@/features/marketing/styles/hero-sheet.css";

/** Server hero — static invoice preview (no editable sheet JS). */
export function HomeHeroSection() {
  return (
    <section className="home-hero relative overflow-x-hidden">
      <div className="home-hero-inner mx-auto flex w-full max-w-[980px] flex-col items-center px-4 pb-24 pt-[88px] sm:px-6">
        <p className="home-hero-brand" aria-label="SterlingSend">
          Sterling<span>Send</span>
        </p>
        <p className="home-hero-chip">Invoicing and PDF toolkit</p>
        <h1 className="home-hero-h1">
          Invoices and every PDF tool you need, in one place
        </h1>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={routes.createInvoice}
            className="home-hero-btn-primary clay-teal clay-teal-lg text-[19px] font-bold"
          >
            Start invoicing
            <ArrowRight className="h-4 w-4" aria-hidden strokeWidth={1.5} />
          </Link>
          <Link
            href={routes.tools}
            className="home-hero-btn-secondary clay-secondary"
          >
            <Wrench className="h-4 w-4" aria-hidden strokeWidth={1.5} />
            Explore PDF tools
          </Link>
        </div>

        <div className="home-hero-sheet-wrap mt-16 w-full">
          <HeroInvoicePreview />
        </div>

        <HomeHeroGuestLine />
      </div>
    </section>
  );
}
