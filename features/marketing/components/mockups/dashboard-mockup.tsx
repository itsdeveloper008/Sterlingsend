"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function focusOn(highlight: string | undefined, keys: string[]) {
  if (!highlight) return false;
  const h = highlight.toLowerCase();
  return keys.some((k) => h.includes(k));
}

export function DashboardMockup({ highlight }: { highlight?: string }) {
  const reduceMotion = useReducedMotion();
  const focusStats = focusOn(highlight, ["reuse", "portal", "invoice"]);
  const focusList = focusOn(highlight, ["customer", "contact", "email", "address"]);
  const focusStatus = focusOn(highlight, ["status"]);

  const rows = [
    "INV-0042 · Oakfield",
    "INV-0041 · Meridian",
    "INV-0040 · Cedar Co",
  ];

  return (
    <div className="p-4">
      <motion.p
        className="text-xs font-semibold text-slate-900"
        animate={
          reduceMotion
            ? undefined
            : focusOn(highlight, ["email", "address"])
              ? { scale: [1, 1.02, 1] }
              : { scale: 1 }
        }
        transition={{ duration: 0.55 }}
      >
        Good morning, Bright Studio
      </motion.p>

      <div
        className={cn(
          "mt-3 grid grid-cols-3 gap-2 transition-shadow duration-300",
          focusStats && "rounded-xl ring-2 ring-teal-400/50 ring-offset-2",
        )}
      >
        {[
          ["Invoices", "24"],
          ["Paid", "£18.2k"],
          ["Pending", "3"],
        ].map(([label, value], i) => (
          <motion.div
            key={label}
            className="rounded-lg bg-slate-50 p-2.5 ring-1 ring-slate-100"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.35 }}
          >
            <p className="text-[9px] text-slate-400">{label}</p>
            <p className="text-sm font-bold text-slate-900">{value}</p>
          </motion.div>
        ))}
      </div>

      <div
        className={cn(
          "mt-3 space-y-1.5 rounded-lg transition-shadow duration-300",
          focusList && "p-1 ring-2 ring-teal-400/50 ring-offset-2",
        )}
      >
        {rows.map((row, i) => (
          <motion.div
            key={row}
            className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2 text-[10px] ring-1 ring-slate-100"
            initial={reduceMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.07, duration: 0.35 }}
          >
            <span className="font-medium text-slate-700">{row}</span>
            <motion.span
              className={cn(
                "rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700",
                focusStatus && "ring-2 ring-emerald-400/60",
              )}
              animate={
                reduceMotion || !focusStatus
                  ? undefined
                  : { scale: [1, 1.08, 1] }
              }
              transition={{ duration: 0.7, delay: i * 0.08 }}
            >
              Paid
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
