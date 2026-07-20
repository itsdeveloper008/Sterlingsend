"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const pills = [
  "Guest Mode",
  "Invoice builder",
  "Customers",
  "Line items",
  "VAT & discounts",
  "PDF export",
  "Public pay links",
  "Stripe payments",
  "Bank details",
  "Branding",
  "Saved services",
  "Tracking",
  "Dashboard",
  "Recurring-ready",
];

export function ProductPillsSection() {
  const [active, setActive] = useState(0);

  return (
    <MotionSection className="border-y border-[#E5E7EB] bg-[#F9FAFB] py-10 sm:py-12">
      <div className="bonsai-container">
        <MotionReveal>
          <div className="bonsai-pill-row">
            {pills.map((pill, index) => (
              <motion.button
                key={pill}
                type="button"
                className={cn("bonsai-pill", active === index && "bonsai-pill--active")}
                onClick={() => setActive(index)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                {pill}
              </motion.button>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-[#6B7280]">
            Explore{" "}
            <span className="font-semibold text-[#111827]">{pills[active]}</span>
            {" - "}
            <Link
              href={routes.features}
              className="font-semibold text-[#0D9488] underline-offset-2 hover:underline"
            >
              see all features
            </Link>
          </p>
        </MotionReveal>
      </div>
    </MotionSection>
  );
}
