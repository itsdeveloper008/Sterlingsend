"use client";

import Link from "next/link";
import { ArrowRight, FileStack, FileText } from "lucide-react";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const products = [
  {
    icon: FileText,
    title: "Invoicing",
    description:
      "Create branded invoices free. Log in later if you want saved customers, status tracking, and payments.",
    href: routes.createInvoice,
    cta: "Start invoicing",
  },
  {
    icon: FileStack,
    title: "PDF Toolkit",
    description:
      "Merge, split, compress, protect, convert, OCR, sign, and more, free in your browser with no login.",
    href: routes.tools,
    cta: "Explore PDF tools",
  },
];

export function ProductSwitcherSection() {
  return (
    <MotionSection className="border-y border-[#E2E8F0] bg-[#F8FAFC] py-16 sm:py-20">
      <div className="bonsai-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="bonsai-eyebrow">Two products. Login optional.</p>
          <h2 className="bonsai-h2 mt-4">Pick your workflow</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <MotionReveal key={product.title} delay={index * 0.08}>
                <Link href={product.href} className="bonsai-product-card group">
                  <span className="bonsai-product-card-icon">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="bonsai-h3 mt-5">{product.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#64748B]">
                    {product.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 transition group-hover:gap-2.5">
                    {product.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}
