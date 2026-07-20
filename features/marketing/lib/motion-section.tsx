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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      {...(markHero ? { "data-marketing-hero": true } : {})}
    >
      {children}
    </motion.section>
  );
}
