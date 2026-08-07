"use client";

import Link from "next/link";
import { ArrowRight, FileStack, Sparkles } from "lucide-react";
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
            className="bonsai-brand-mark"
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Sterling<span>Send</span>
          </motion.p>

          <motion.p
            className="bonsai-eyebrow mt-5"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Invoicing + PDF toolkit
          </motion.p>

          <motion.h1
            className="bonsai-h1 mt-5"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            Invoices and every PDF tool
            <br className="hidden sm:block" /> you need, in one place
          </motion.h1>

          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
          >
            <Link href={routes.createInvoice} className="bonsai-btn-primary">
              Start invoicing
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href={routes.tools} className="bonsai-btn-secondary">
              <FileStack className="h-4 w-4 text-teal-600" aria-hidden />
              Explore PDF tools
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="bonsai-hero-visual mx-auto mt-14"
          initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.75,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <HeroEditableInvoice />
        </motion.div>
      </div>
    </MotionSection>
  );
}
