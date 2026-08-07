"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function focusOn(highlight: string | undefined, keys: string[]) {
  if (!highlight) return false;
  const h = highlight.toLowerCase();
  return keys.some((k) => h.includes(k));
}

/** Classic invoice preview — marketing showcase + auth side panel. */
export function InvoiceEditorMockup({
  highlight,
  compact = false,
}: {
  highlight?: string;
  /** Flatter chrome when nested inside BrowserFrame */
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const focusLines = focusOn(highlight, ["line"]);
  const focusVat = focusOn(highlight, ["vat"]);
  const focusDisc = focusOn(highlight, ["discount"]);
  const focusTotal = focusOn(highlight, ["pdf", "export", "guest"]);
  const focusBrand = focusOn(highlight, ["brand"]);
  const focusNotes = focusOn(highlight, ["note"]);
  const focusBank = focusOn(highlight, ["bank"]);

  return (
    <div
      className={cn(
        "mx-auto w-full overflow-hidden bg-white",
        compact
          ? "max-w-none rounded-none border-0 shadow-none"
          : "max-w-[440px] rounded-2xl border border-slate-200 shadow-[0_28px_70px_-18px_rgba(15,23,42,0.5)]",
      )}
    >
      <div className={cn("space-y-5", compact ? "p-4 sm:p-5" : "p-6")}>
        <header
          className={cn(
            "flex items-start justify-between gap-4 rounded-xl transition-shadow duration-300",
            focusBrand && "ring-2 ring-teal-400/45 ring-offset-2",
          )}
        >
          <div className="min-w-0">
            <Image
              src="/brand/sterlingsend-logo.png"
              alt="SterlingSend"
              width={compact ? 36 : 44}
              height={compact ? 36 : 44}
              className={cn(
                "object-contain",
                compact ? "h-9 w-9" : "h-11 w-11",
              )}
            />
            <p
              className={cn(
                "mt-3 font-bold tracking-tight text-slate-900",
                compact ? "text-xl" : "text-2xl",
              )}
            >
              INVOICE
            </p>
            <p className="mt-0.5 text-sm font-semibold text-teal-600">SS-1092</p>
          </div>
          <div className="max-w-[52%] text-right text-xs leading-relaxed text-slate-500">
            <p className="font-semibold text-slate-800">Sterlingsend</p>
            <p>Sterlingsend@gmail.com</p>
            <p>+44 7700 900123</p>
            <p>VAT: GB123456789</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-100">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Billed To
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">Onixs.ai</p>
            <p className="text-xs text-slate-500">onixs@gmail.com</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Issue Date
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">2026-08-05</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Due Date
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">2026-08-19</p>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-xl ring-1 ring-slate-100 transition-shadow duration-300",
            focusLines && "ring-2 ring-teal-400/50",
          )}
        >
          <div className="grid grid-cols-[1.5fr_0.4fr_0.8fr_0.5fr_0.45fr_0.85fr] gap-1.5 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Price</span>
            <span className="text-right">Disc</span>
            <span className="text-right">VAT</span>
            <span className="text-right">Total</span>
          </div>
          {[
            ["web development", "1", "8,000.00", "10%", "8%", "£7,776.00"],
            ["Digital marketing", "1", "7,800.00", "10%", "8%", "£7,581.60"],
          ].map((row, i) => (
            <motion.div
              key={row[0]}
              className="grid grid-cols-[1.5fr_0.4fr_0.8fr_0.5fr_0.45fr_0.85fr] gap-1.5 border-t border-slate-100 px-3 py-2.5 text-xs text-slate-700"
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.3 }}
            >
              <span className="font-medium text-slate-900">{row[0]}</span>
              <span className="text-right">{row[1]}</span>
              <span className="text-right">{row[2]}</span>
              <span className="text-right">{row[3]}</span>
              <span className="text-right">{row[4]}</span>
              <span className="text-right font-semibold text-slate-900">
                {row[5]}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="ml-auto w-full max-w-[240px] space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">£14,220.00</span>
          </div>
          <motion.div
            className={cn(
              "flex justify-between text-rose-500 rounded-md px-1.5 py-0.5",
              focusDisc && "bg-rose-50 ring-2 ring-rose-300/50",
            )}
            animate={
              reduceMotion || !focusDisc
                ? undefined
                : { scale: [1, 1.03, 1] }
            }
            transition={{ duration: 0.6 }}
          >
            <span>Discount</span>
            <span className="font-medium">- £1,580.00</span>
          </motion.div>
          <motion.div
            className={cn(
              "flex justify-between text-teal-600 rounded-md px-1.5 py-0.5",
              focusVat && "bg-teal-50 ring-2 ring-teal-400/50",
            )}
            animate={
              reduceMotion || !focusVat
                ? undefined
                : { scale: [1, 1.03, 1] }
            }
            transition={{ duration: 0.6 }}
          >
            <span>VAT (8%)</span>
            <span className="font-medium">+ £1,137.60</span>
          </motion.div>
          <motion.div
            className={cn(
              "mt-2 flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2.5 ring-1 ring-teal-100",
              focusTotal && "ring-2 ring-teal-500/60 shadow-md shadow-teal-500/15",
            )}
            animate={
              reduceMotion || !focusTotal
                ? undefined
                : { scale: [1, 1.02, 1] }
            }
            transition={{ duration: 0.65 }}
          >
            <span className="text-xs font-semibold text-slate-800">GBP (£)</span>
            <span className="text-base font-bold text-teal-700">£15,357.60</span>
          </motion.div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div
            className={cn(
              "rounded-lg transition-shadow duration-300",
              focusNotes && "bg-slate-50 p-2 ring-2 ring-teal-400/40",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Notes
            </p>
            <p className="mt-1.5 text-xs text-slate-600">
              Thank you for your business!
            </p>
          </div>
          <div
            className={cn(
              "rounded-lg transition-shadow duration-300",
              focusBank && "bg-slate-50 p-2 ring-2 ring-teal-400/40",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Payment Details
            </p>
            <div className="mt-1.5 space-y-1 text-xs text-slate-600">
              <p>
                <span className="text-slate-400">Account Holder:</span> Falak
                Sher
              </p>
              <p>
                <span className="text-slate-400">Bank Name:</span> Bank of
                Scotland
              </p>
              <p className="break-all">
                <span className="text-slate-400">IBAN:</span>{" "}
                BOS29NWBK60161331926819
              </p>
            </div>
          </div>
        </div>

        {!compact ? (
          <div className="flex items-end justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <Image
                src="/brand/sterlingsend-logo.png"
                alt=""
                width={22}
                height={22}
                className="h-5 w-5 object-contain opacity-80"
              />
              <p className="text-[11px] text-slate-400">Sterlingsend@gmail.com</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Invoice No.
              </p>
              <p className="text-sm font-bold text-teal-600">SS-1092</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
