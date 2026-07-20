"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { routes } from "@/config/routes";
import { MotionSection } from "@/features/marketing/lib/motion-section";
import { HeroEditableInvoice } from "@/features/marketing/components/hero-editable-invoice";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <MotionSection
      markHero
      className="bonsai-hero overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-16"
    >
      <div className="bonsai-container">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            className="bonsai-eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Welcome to SterlingSend
          </motion.p>
          <motion.h1
            className="bonsai-h1 mt-5"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            The unified platform
            <br className="hidden sm:block" /> for service businesses
          </motion.h1>
          <motion.p
            className="bonsai-lead mx-auto mt-5 max-w-2xl"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Consolidate your clients, invoices, and payments into one integrated,
            easy-to-use platform.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <a href="#try-invoice" className="bonsai-btn-primary">
              Edit this invoice
            </a>
            <Link href={routes.features} className="bonsai-btn-secondary">
              See product features
            </Link>
          </motion.div>
          <motion.div
            className="mt-6 flex items-center justify-center gap-2 text-sm text-[#6B7280]"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.22 }}
          >
            <span className="bonsai-stars" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            <span>Trusted by freelancers & growing teams</span>
          </motion.div>
        </div>

        <motion.div
          className="bonsai-hero-visual mx-auto mt-14"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0, 0, 0.2, 1] }}
        >
          <HeroEditableInvoice />
        </motion.div>
      </div>
    </MotionSection>
  );
}
