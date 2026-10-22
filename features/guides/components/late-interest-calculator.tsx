"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

/** Statutory interest is BoE base rate + 8% (Late Payment Act). */
export function LateInterestCalculator() {
  const [principal, setPrincipal] = useState("1000");
  const [daysLate, setDaysLate] = useState("30");
  const [baseRate, setBaseRate] = useState("5.00");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const p = Number.parseFloat(principal.replace(/,/g, ""));
    const d = Number.parseInt(daysLate, 10);
    const b = Number.parseFloat(baseRate.replace(/,/g, ""));
    if (![p, d, b].every((n) => Number.isFinite(n)) || p < 0 || d < 0) {
      return null;
    }
    const annualRate = (b + 8) / 100;
    const interest = p * annualRate * (d / 365);
    // Fixed compensation bands (1998 Act, as commonly summarised)
    let compensation = 40;
    if (p >= 1000 && p <= 9999.99) compensation = 70;
    if (p >= 10000) compensation = 100;
    return { interest, compensation, total: interest + compensation, annualRate: b + 8 };
  }, [principal, daysLate, baseRate]);

  async function copyResult() {
    if (!result) return;
    const text = `Interest £${result.interest.toFixed(2)} (${result.annualRate}% a year for ${daysLate} days); fixed compensation £${result.compensation}; total £${result.total.toFixed(2)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-10 space-y-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <label className="block text-sm font-medium">
        Invoice amount (£)
        <input
          className="mt-1.5 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          inputMode="decimal"
        />
      </label>
      <label className="block text-sm font-medium">
        Days overdue
        <input
          className="mt-1.5 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2"
          value={daysLate}
          onChange={(e) => setDaysLate(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <label className="block text-sm font-medium">
        Bank of England base rate (%)
        <input
          className="mt-1.5 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2"
          value={baseRate}
          onChange={(e) => setBaseRate(e.target.value)}
          inputMode="decimal"
        />
      </label>
      <p className="text-sm text-[var(--secondary-text)]">
        Statutory interest uses the Bank of England reference rate that applied
        at the start of the six-month period when the debt became late, plus 8
        percentage points. Enter the rate that applies for your dates. Confirm
        on{" "}
        <a
          className="underline underline-offset-2"
          href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK late commercial payments
        </a>
        .
      </p>
      {result ? (
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--secondary-text)]">Interest</dt>
            <dd className="text-lg font-semibold tabular-nums">
              £{result.interest.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--secondary-text)]">Fixed compensation</dt>
            <dd className="text-lg font-semibold tabular-nums">
              £{result.compensation.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--secondary-text)]">Total claim</dt>
            <dd className="text-lg font-semibold tabular-nums">
              £{result.total.toFixed(2)}
            </dd>
          </div>
        </dl>
      ) : null}
      <Button type="button" variant="outline" onClick={() => void copyResult()} disabled={!result}>
        {copied ? "Copied" : "Copy result"}
      </Button>
    </div>
  );
}
