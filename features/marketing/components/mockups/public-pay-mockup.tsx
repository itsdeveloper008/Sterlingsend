"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function focusOn(highlight: string | undefined, keys: string[]) {
  if (!highlight) return false;
  const h = highlight.toLowerCase();
  return keys.some((k) => h.includes(k));
}

export function PublicPayMockup({ highlight }: { highlight?: string }) {
  const reduceMotion = useReducedMotion();
  const focusAmount = focusOn(highlight, ["amount", "due", "overdue", "paid"]);
  const focusPay = focusOn(highlight, ["payment", "pay link", "stripe", "invoicing"]);
  const focusStripe = focusOn(highlight, ["stripe"]);
  const focusBank = focusOn(highlight, ["bank"]);

  return (
    <div className="p-5 text-center">
      <motion.div
        className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white"
        initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
      >
        B
      </motion.div>
      <p className="text-xs font-semibold text-slate-900">Bright Studio Ltd</p>
      <motion.p
        className={cn(
          "mt-1 text-[10px] text-slate-500",
          focusOn(highlight, ["invoicing"]) && "font-semibold text-teal-700",
        )}
      >
        Invoice INV-2026-0042
      </motion.p>

      <motion.p
        className={cn(
          "mt-4 text-2xl font-bold tracking-tight text-slate-900",
          focusAmount && "rounded-lg bg-teal-50 px-2 py-1 ring-2 ring-teal-400/40",
        )}
        key={focusAmount ? "amount-on" : "amount-off"}
        initial={reduceMotion ? false : { opacity: 0.6, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        £8,150.00
      </motion.p>
      <p
        className={cn(
          "mt-1 text-[10px] text-slate-400",
          focusBank && "font-medium text-slate-600",
        )}
      >
        Due 24 Jul 2026
      </p>

      <motion.div
        className={cn(
          "mx-auto mt-4 h-9 w-full max-w-[180px] rounded-lg bg-teal-600",
          focusPay && "shadow-lg shadow-teal-600/35",
        )}
        animate={
          reduceMotion
            ? undefined
            : focusPay
              ? { scale: [1, 1.04, 1] }
              : { scale: 1 }
        }
        transition={
          focusPay
            ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />
      <motion.p
        className={cn(
          "mt-3 text-[9px] text-slate-400",
          focusStripe && "font-semibold text-teal-700",
        )}
        animate={
          reduceMotion || !focusStripe
            ? undefined
            : { opacity: [0.7, 1, 0.7] }
        }
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        Secured by Stripe
      </motion.p>
    </div>
  );
}
