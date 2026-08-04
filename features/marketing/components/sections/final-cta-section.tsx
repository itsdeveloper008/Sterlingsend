"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const toolsLogin = `${routes.login}?redirect=${encodeURIComponent(routes.tools)}`;

export function FinalCtaSection() {
  return (
    <MotionSection className="bonsai-cta-band py-20 sm:py-24">
      <div className="bonsai-container text-center">
        <h2 className="bonsai-h2">Ready when your clients are.</h2>
        <p className="bonsai-lead mx-auto mt-4 max-w-xl">
          Start with a free invoice, or sign in to use the full PDF toolkit
          alongside your dashboard.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={routes.createInvoice} className="bonsai-btn-primary">
            Create a free invoice
          </Link>
          <Link
            href={toolsLogin}
            className="bonsai-btn-secondary border-white/15 bg-transparent text-white hover:bg-white/5"
          >
            Open PDF Tools
          </Link>
        </div>
      </div>
    </MotionSection>
  );
}
