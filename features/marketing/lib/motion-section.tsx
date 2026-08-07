"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MotionSection({
  children,
  className,
  id,
  "aria-labelledby": ariaLabelledby,
  markHero = false,
}: React.ComponentPropsWithoutRef<"section"> & { markHero?: boolean }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <section
        id={id}
        aria-labelledby={ariaLabelledby}
        className={className}
        {...(markHero ? { "data-marketing-hero": true } : {})}
      >
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn(className)}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      {...(markHero ? { "data-marketing-hero": true } : {})}
    >
      {children}
    </motion.section>
  );
}
