"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const RATES = [0, 5, 20] as const;

export function VatCalculator() {
  const [mode, setMode] = useState<"add" | "reverse">("add");
  const [amount, setAmount] = useState("100");
  const [rate, setRate] = useState<number>(20);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const n = Number.parseFloat(amount.replace(/,/g, ""));
    if (!Number.isFinite(n) || n < 0) return null;
    const r = rate / 100;
    if (mode === "add") {
      const vat = n * r;
      return { net: n, vat, gross: n + vat };
    }
    const gross = n;
    const net = gross / (1 + r);
    const vat = gross - net;
    return { net, vat, gross };
  }, [amount, rate, mode]);

  async function copyResult() {
    if (!result) return;
    const text = `Net £${result.net.toFixed(2)}; VAT (${rate}%) £${result.vat.toFixed(2)}; Gross £${result.gross.toFixed(2)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-10 space-y-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Calculation mode">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === "add" ? "bg-[var(--brand-tint)] text-[var(--brand-700)]" : "text-[var(--body-text)]"}`}
          onClick={() => setMode("add")}
        >
          Add VAT
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === "reverse" ? "bg-[var(--brand-tint)] text-[var(--brand-700)]" : "text-[var(--body-text)]"}`}
          onClick={() => setMode("reverse")}
        >
          Reverse VAT
        </button>
      </div>
      <label className="block text-sm font-medium text-foreground">
        {mode === "add" ? "Net amount (£)" : "Gross amount (£)"}
        <input
          className="mt-1.5 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-base"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <fieldset>
        <legend className="text-sm font-medium text-foreground">VAT rate</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {RATES.map((r) => (
            <button
              key={r}
              type="button"
              className={`rounded-md border px-3 py-1.5 text-sm ${rate === r ? "border-[var(--brand-700)] bg-[var(--brand-tint)] font-semibold" : "border-[var(--border)]"}`}
              onClick={() => setRate(r)}
            >
              {r}%
            </button>
          ))}
        </div>
      </fieldset>
      {result ? (
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--secondary-text)]">Net</dt>
            <dd className="text-lg font-semibold tabular-nums">
              £{result.net.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--secondary-text)]">VAT</dt>
            <dd className="text-lg font-semibold tabular-nums">
              £{result.vat.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--secondary-text)]">Gross</dt>
            <dd className="text-lg font-semibold tabular-nums">
              £{result.gross.toFixed(2)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-[var(--secondary-text)]">Enter a valid amount.</p>
      )}
      <Button type="button" variant="outline" onClick={() => void copyResult()} disabled={!result}>
        {copied ? "Copied" : "Copy result"}
      </Button>
    </div>
  );
}
