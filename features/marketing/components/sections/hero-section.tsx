"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
            Invoicing + PDF toolkit
          </motion.p>
          <motion.h1
            className="bonsai-h1 mt-5"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Invoices and every PDF tool
            <br className="hidden sm:block" /> you need, in one place
          </motion.h1>
          <motion.p
            className="bonsai-lead mx-auto mt-5 max-w-2xl"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Create professional invoices and use every PDF tool right away, no
            account required. Log in only when you want to save customers,
            invoices, and payment history.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <Link href={routes.createInvoice} className="bonsai-btn-primary">
              Start invoicing
            </Link>
            <Link href={routes.tools} className="bonsai-btn-secondary">
              Explore PDF tools
            </Link>
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
