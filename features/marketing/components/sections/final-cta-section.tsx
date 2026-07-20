"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { MotionSection } from "@/features/marketing/lib/motion-section";

export function FinalCtaSection() {
  return (
    <MotionSection className="bonsai-cta-band py-20 sm:py-24">
      <div className="bonsai-container text-center">
        <h2 className="bonsai-h2">Get started in 30 seconds.</h2>
        <p className="bonsai-lead mx-auto mt-4 max-w-xl">
          Streamline invoicing and consolidate clients and payments into one
          easy-to-use platform.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={routes.createInvoice} className="bonsai-btn-primary">
            Try SterlingSend for free
          </Link>
          <Link
            href={routes.login}
            className="bonsai-btn-secondary border-white/15 bg-transparent text-white hover:bg-white/5"
          >
            Login
          </Link>
        </div>
      </div>
    </MotionSection>
  );
}
