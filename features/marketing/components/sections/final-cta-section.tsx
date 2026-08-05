"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { MotionSection } from "@/features/marketing/lib/motion-section";

export function FinalCtaSection() {
  return (
    <MotionSection className="bonsai-cta-band py-20 sm:py-24">
      <div className="bonsai-container text-center">
        <h2 className="bonsai-h2">Ready when your clients are.</h2>
        <p className="bonsai-lead mx-auto mt-4 max-w-xl">
          Create invoices and use every PDF tool free, no login needed. Sign up
          only when you want to save your work.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={routes.createInvoice} className="bonsai-btn-primary">
            Create a free invoice
          </Link>
          <Link
            href={routes.tools}
            className="bonsai-btn-secondary border-white/15 bg-transparent text-white hover:bg-white/5"
          >
            Open PDF Tools
          </Link>
        </div>
      </div>
    </MotionSection>
  );
}
