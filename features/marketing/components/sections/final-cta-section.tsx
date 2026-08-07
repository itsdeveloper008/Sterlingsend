"use client";

import Link from "next/link";
import { ArrowRight, FileStack } from "lucide-react";
import { routes } from "@/config/routes";
import { MotionSection } from "@/features/marketing/lib/motion-section";

export function FinalCtaSection() {
  return (
    <MotionSection className="bonsai-cta-band py-20 sm:py-28">
      <div className="bonsai-container relative z-10 text-center">
        <p className="bonsai-eyebrow border-teal-400/20 bg-teal-400/10 text-teal-200">
          Free to start
        </p>
        <h2 className="bonsai-h2 mt-4">Ready when your clients are.</h2>
        <p className="bonsai-lead mx-auto mt-4 max-w-xl">
          Create invoices and use every PDF tool free, no login needed. Sign up
          only when you want to save your work.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={routes.createInvoice} className="bonsai-btn-primary">
            Create a free invoice
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={routes.tools}
            className="bonsai-btn-secondary border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
          >
            <FileStack className="h-4 w-4" aria-hidden />
            Open PDF Tools
          </Link>
        </div>
      </div>
    </MotionSection>
  );
}
